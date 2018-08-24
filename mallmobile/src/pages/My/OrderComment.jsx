import React, { Component } from 'react'
import {connect} from 'react-redux'
import { Button, Toast, Modal, WhiteSpace, WingBlank, TextareaItem, Checkbox} from 'antd-mobile'
import TextHeader from '@components/Header/TextHeader'
import $ from 'jquery'
import {PhotoSwipe} from 'react-photoswipe'
import {baseUrl,imgUrl,getToken} from '@common/js/util.js'
import '@common/styles/orderdetail.scss'
import '@common/styles/ordercomment.scss'

class OrderComment extends Component {
    constructor(props){
        super(props)
        this.state = {
            orderId:props.match.params.orderId||null,
            order:[],
            orderInfo:{},
            ds:false
        }
    }
    //获取订单详细
    getOrderInfo(cb){
        let that=this
        $.ajax({
            type:'post',
            data:{
                token:getToken(),
                orderId:this.state.orderId
            },
            url:baseUrl+'/order/detail',
            success(res){
                console.log(res)
                if(res.code == 0){
                    let order=res.data.data.orderItems
                    let newOrder=order.map((item)=>{
                        return {
                            ...item,
                            isOpen:false,
                            eval:1,
                            content:'',
                            options:{
                                index: 0,
                                escKey: true,
                                shareEl: false,
                                shareButtons:[]
                            },
                            images:[]
                        }
                    })
                    that.setState({
                        order:newOrder,
                        orderInfo:res.data.data
                    })
                }else if(res.code==2){
                    Toast.info(res.message,1);
                }
                cb&&cb()
            }
        })
    }
    //选择图片
    selectFile(e,index){
        let self=this
        let maxFileSize=1500*1024;
        let files=e.currentTarget.files
        let dom=e.currentTarget;
        if(!files.length){
            return;
        }
        files = Array.prototype.slice.call(files);
        
        if(files.length>5||(this.state.order[index].images.length+files.length)>5){
            Toast.info("最多只能上传5张图片",1);
            return;
        }
        //循环图片
        files.forEach((file, i)=>{
            if(!/jpeg|jpg|png/.test(file.type)){
                Toast.info("仅支持上传jpg、jpeg、png格式的图片",1);
                return;
            }
            let fileReader = new FileReader();
            //获取图片大小
            let fileSize = file.size/1024>1024?(file.size/1024/1024).toFixed(2)+"MB":~~(file.size/1024)+"KB";
            //$(".progress").text(fileSize);
            //FILE API读取文件
            fileReader.onload=function () {
                let result = this.result;
                let image = new Image();
                image.src=result;
                //超出大小，压缩
                if(result.length>maxFileSize){
                    if(image.complete){
                        callback();
                    }else{
                        image.onload = callback;
                        compress(image);
                    }
                }else{
                    self.upload(result,file.type,index);
                    dom.value=""
                    return;
                }
                function callback(){
                    let data = compress(image);
                    self.upload(data,file.type,index);
                    dom.value=""
                }
            }
            fileReader.readAsDataURL(file);
        });
        //图片压缩
        function compress(image){
            let canvas = self.refs.canvans;
            let ctx = canvas.getContext("2d");
            let initImgSize = image.src.length;
            let width = image.width;
            let height = image.height;
            console.info(initImgSize+"/"+width+"/"+height);
            //如果图片大于200Kb,将图片压缩至200Kb以下
            let ration;//压缩比
            if(width*height>20000000){
                ration = Math.sqrt(width*height/20000000);
                width/=ration;
                height/=ration;
            }else{
                ration = 1;
            }
            canvas.width = width;
            canvas.height = height;
            //铺底色
            //ctx.fillStyle = "#fff";
            //ctx.fillRect(0, 0, canvas.width, canvas.height);
            //图片过大需要进行瓦片绘制，暂不做处理
            ctx.drawImage(image,0,0,canvas.width,canvas.height);
            //进行压缩
            let newdata = canvas.toDataURL("image/jpeg",0.3);
            console.info("before"+initImgSize);
            console.info("after"+newdata.length);
            console.info("rate"+(100*(initImgSize-newdata.length)/initImgSize)+"%");
            return newdata;
        }
    }
    //上传图片
    upload(basestr,type,index){
        let self = this
        let text = window.atob(basestr.split(",")[1]);
        let buffer = new Uint8Array(text.length);
        for (let i = 0; i < text.length; i++) {
            buffer[i] = text.charCodeAt(i);
        }
        let blob = getBlob([buffer], type);
        console.log(blob)
        let formData = new FormData();
        formData.append('fileType','image');
        formData.append('fileModule','product');
        formData.append('isZoom','0');
        formData.append('imgData',encodeURIComponent(basestr));
        // var link = document.createElement("a");
        // link.innerHTML = 'download file';
        // link.download = new Date().getTime()+'.jpg';
        // link.href = URL.createObjectURL(blob);
        // document.getElementsByTagName("body")[0].appendChild(link);
        $.ajax({
            type: 'post',
            url: baseUrl+'/fileUpload',
            data: formData,
            processData: false,
            contentType: false,
            success(res){
                if (res.code == 0) {
                    Toast.info("上传成功",1)
                    let order=self.state.order;
                    order[index].images=[...order[index].images,{
                        src:imgUrl+res.data,
                        id:new Date().getTime(),
                        w:500,
                        h:500
                    }]
                    self.setState({
                        order
                    })
                } else {
                    Toast.info("上传失败",1)
                }
            },
            error(err){
                Toast.info("上传失败",1)
            }
        })
        
        // console.log(basestr)
        // formdata.append('data', blob);
        /**
         * 获取blob对象的兼容性写法
         * @param buffer
         * @param format
         * @returns {*}
         */
        function getBlob(buffer, format) {
            try {
                return new Blob(buffer, {type: format});
            } catch (e) {
                var bb = new (window.BlobBuilder || window.WebKitBlobBuilder || window.MSBlobBuilder);
                buffer.forEach(function(buf) {
                    bb.append(buf);
                });
                return bb.getBlob(format);
            }
        }
    }
    //图片宽高
    imgLoad(e,index,j){
        let order=this.state.order;
        let newImages=order[index].images.concat()
        newImages[j].w=e.currentTarget.width;
        newImages[j].h=e.currentTarget.height;
        order[index].images=newImages;
        this.setState({
            order
        })
    }
    //移除图片
    deleteImg(id,index){
        let order=this.state.order;
        order[index].images=order[index].images.filter(v=>{
            if(v.id!==id){
                return v
            }
        });
        this.setState({
            order
        })
    }
    //关闭图片浏览
    handleClose(index){
        let order=this.state.order;
        order[index].isOpen=false;
        this.setState({
            order
        })
    }
    //提交
    submit(){
        let that=this
        var flag=false;
        this.state.order.forEach(v=>{
            if(v.content===""){
                flag=true;
            }
        })
        if(flag){
            Toast.info("评价不能为空",1)
        }else{
            this.setState({
                ds:true
            })
            var content = [];
            for (let i = 0; i < this.state.order.length; i++) {
                var contentItem = {};
                contentItem.productId = this.state.order[i].productId;
                contentItem.skuId = this.state.order[i].skuId;
                contentItem.starLevel = this.state.order[i].eval===1?5:this.state.order[i].eval===2?4:2;
                contentItem.memo = this.state.order[i].content || '';
                contentItem.fileList = this.state.order[i].images.map(v=>{
                    return v.src;
                });
                content.push(contentItem)
            }
            let params={
                token:getToken(),
                orderId:this.state.orderId,
                content:JSON.stringify(content)
            }
            console.log(params)
            $.ajax({
                type:'post',
                data:params,
                url:baseUrl+'/commentOrder',
                success(res){
                    console.log(res)
                    if(res.code == 0){
                        Toast.info('提交成功',1);
                        that.props.history.push('/my/orderlist')
                    }else if(res.code==2){
                        Toast.info(res.message,1);
                    }
                    that.setState({
                        ds:false
                    })
                }
            })
        }
    }
    //挂载组件
    componentDidMount(){
        //初始化
        this.getOrderInfo()
    }
    render() {
        return (
            <div className="orderDetail-page">
                <TextHeader returnbtn={true} title="评价订单" pathname="/my/orderlist"></TextHeader>
                <div className="orderDetail-main">
                    {
                        this.state.orderId?
                        this.state.order.length>0&&this.state.order.map((item,index)=>{
                                return (
                                    <div key={index} className="orderDetail">
                                        <div className="section border-top-none">
                                            <div className="inner-line">
                                                <span className="title">评价订单</span>
                                            </div>
                                            <div className="order-goods">
                                                <div className="goods-item">
                                                    <div className="goods-cover">
                                                        <img src={imgUrl+item.thumbnail} alt={item.name}/>
                                                    </div>
                                                    <div className="goods-cont">
                                                        <div className="goods-info">
                                                            <div className="info-desc">
                                                                <div className="goods-name">                              
                                                                    {item.name}
                                                                </div>
                                                            </div>
                                                            <div className="info-price">
                                                                <p className="price">¥{item.price.toFixed(2)}</p>
                                                                <p className="count">x{item.quantity}</p>
                                                            </div>
                                                        </div>
                                                        <div style={{fontSize:'12px',color:'#888'}}>{item.sku}</div>
                                                        <div className="goods-btns"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="border-top">
                                            <TextareaItem value={item.content} onChange={(val)=>{
                                                let order = this.state.order.concat();
                                                order[index].content=val;
                                                this.setState({order})
                                            }}  placeholder="收到货后用了一段时间了，评价一下吧！" rows={4}/>
                                            <div className="upload">
                                                <img src={require(`@common/images/upload.png`)} alt=""/>
                                                <span>上传图片</span>
                                                <input multiple accept="image/*" type="file" onChange={(e)=>{
                                                    this.selectFile(e,index)
                                                }}/>
                                            </div>
                                            <div className="images-prview">
                                                {
                                                    item.images.map((jtem,j)=>{
                                                        return (
                                                            <div data-id={j} key={j} className="img" style={{
                                                                backgroundSize:jtem.w>=jtem.h?'100% auto':'auto 100%',
                                                                backgroundImage:`url(${jtem.src})`,
                                                            }} onClick={()=>{
                                                                let order = this.state.order.concat();
                                                                order[index].isOpen=true;
                                                                order[index].options={
                                                                    ...order[index].options,
                                                                    index:j
                                                                };
                                                                this.setState({
                                                                    order
                                                                })
                                                            }}>
                                                                <span className="delete" onClick={(e)=>{
                                                                    e.stopPropagation()
                                                                    this.deleteImg(jtem.id,index)
                                                                }}>×</span>
                                                                <img src={jtem.src} style={{
                                                                    display:'none'
                                                                }} onLoad={(e)=>{
                                                                    this.imgLoad(e,index,j)
                                                                }} alt=""/>
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                            {
                                                item.isOpen?
                                                <PhotoSwipe isOpen={item.isOpen} items={item.images} options={item.options} onClose={()=>{
                                                    this.handleClose(index)
                                                }}/>
                                                :null
                                            }
                                            
                                        </div>
                                        <div className="section">
                                            <label>选择评价：</label>
                                            <div className="eval">
                                                <span>
                                                    <Checkbox onChange={()=>{
                                                        let order=this.state.order.concat()
                                                        order[index].eval=1;
                                                        this.setState({
                                                            order
                                                        })
                                                    }} checked={item.eval===1?true:false}/>
                                                    好评
                                                </span>
                                                <span>
                                                    <Checkbox onChange={()=>{
                                                        let order=this.state.order.concat()
                                                        order[index].eval=2;
                                                        this.setState({
                                                            order
                                                        })
                                                    }} checked={item.eval===2?true:false}/>
                                                    中评
                                                </span>
                                                <span>
                                                    <Checkbox onChange={()=>{
                                                        let order=this.state.order.concat()
                                                        order[index].eval=3;
                                                        this.setState({
                                                            order
                                                        })
                                                    }} checked={item.eval===3?true:false}/>
                                                    差评
                                                </span>
                                            </div>
                                        </div>
                                        
                                    </div>
                                )
                            })
                        :<div style={{padding:'10px',textAlign:'center'}}>缺少参数</div>
                    }
                    <WhiteSpace/>
                    <WingBlank>
                        <div className="section">
                            <Button disabled={this.state.ds} type="primary" onClick={()=>{
                                this.submit()
                            }}>提交评价</Button>
                        </div>
                    </WingBlank>
                    <canvas ref="canvans" style={{
                        width:0,
                        height:0
                    }}></canvas>
                </div>
            </div>
        )
    }
}
export default connect()(OrderComment)

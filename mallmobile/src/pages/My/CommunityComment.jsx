import React, { Component } from 'react'
import {connect} from 'react-redux'
import { Button, Toast, Modal, WhiteSpace, WingBlank, TextareaItem, Checkbox} from 'antd-mobile'
import TextHeader from '@components/Header/TextHeader'
import $ from 'jquery'
import {PhotoSwipe} from 'react-photoswipe'
import {baseUrl,imgUrl,getToken} from '@common/js/util.js'
import '@common/styles/orderdetail.scss'
import '@common/styles/ordercomment.scss'

class CommunityComment extends Component {
    constructor(props){
        super(props)
        this.state = {
            images:[],
            content:'',
            options:{
                index: 0,
                escKey: true,
                shareEl: false,
                shareButtons:[]
            },
            isOpen:false,
            ds:false
        }
    }
    //选择图片
    selectFile(e){
        let self=this
        let maxFileSize=1500*1024;
        let files=e.currentTarget.files
        let dom=e.currentTarget;
        if(!files.length){
            return;
        }
        files = Array.prototype.slice.call(files);
        
        if(files.length>9||(this.state.images.length+files.length)>9){
            Toast.info("最多只能上传9张图片",1);
            return;
        }
        //循环图片
        files.forEach((file, i)=>{
            setTimeout(()=>{
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
                        self.upload(result,file.type);
                        dom.value=""
                        return;
                    }
                    function callback(){
                        let data = compress(image);
                        self.upload(data,file.type);
                        dom.value=""
                    }
                }
                fileReader.readAsDataURL(file);
            },200)
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
    upload(basestr,type){
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
            url: baseUrl+'/fileUploadBase64',
            data: formData,
            processData: false,
            contentType: false,
            success(res){
                if (res.code == 0) {
                    Toast.info("上传成功",1) 
                    self.setState({
                        images:[...self.state.images,{
                            src:imgUrl+res.data.url,
                            id:new Date().getTime(),
                            w:500,
                            h:500
                        }]
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
    imgLoad(e,j){
        let images=this.state.images;
        images[j].w=e.currentTarget.width;
        images[j].h=e.currentTarget.height;
        this.setState({
            images
        })
    }
    //移除图片
    deleteImg(id){
        let images=this.state.images;
        this.setState({
            images:images.filter(v=>{
                if(v.id!==id){
                    return v
                }
            })
        })
    }
    //关闭图片浏览
    handleClose(){
        this.setState({
            isOpen:false
        })
    }
    //提交
    submit(){
        let that=this
        if(this.state.content===""){
            Toast.info("内容不能为空",1)
        }if(this.state.images<1){
            Toast.info("请选择图片",1)
        }else{
            this.setState({
                ds:true
            })
            let params = {
                token:getToken(),
                picture:this.state.images.map((v)=>{
                    return v.src.replace('http://exotic.gzfenzu.com','')
                }).join(','),
                content:this.state.content,
            }
            console.log(params)
            $.ajax({
                type:'post',
                data:params,
                url:baseUrl+'/durianCommunity/submit',
                success(res){
                    console.log(res)
                    if(res.code === 0){
                        Toast.info('发布成功',1);
                        that.props.history.push('/my/communityissue')
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
    }
    render() {
        return (
            <div className="orderDetail-page">
                <TextHeader returnbtn={true} title="发布" pathname="/my/community"></TextHeader>
                <div className="orderDetail-main">
                <div className="border-top">
                    <TextareaItem value={this.state.content} onChange={(val)=>{
                        this.setState({content:val})
                    }}  placeholder="请输入要发布的内容！" rows={4}/>
                    <div className="upload">
                        <img src={require(`@common/images/upload.png`)} alt=""/>
                        <span>上传图片</span>
                        <input multiple accept="image/*" type="file" onChange={(e)=>{
                            this.selectFile(e)
                        }}/>
                    </div>
                    <div style={{
                        margin:'10px',
                        fontSize:'14px',
                        color:'#333'
                    }}>最多可上传9张</div>
                    <div className="images-prview">
                        {
                            this.state.images.map((jtem,j)=>{
                                return (
                                    <div data-id={j} key={j} className="img" style={{
                                        backgroundSize:jtem.w>=jtem.h?'100% auto':'auto 100%',
                                        backgroundImage:`url(${jtem.src})`,
                                    }} onClick={()=>{
                                        this.setState({
                                            isOpen:true,
                                            options:{
                                                ...this.state.options,
                                                index:j
                                            }
                                        })
                                    }}>
                                        <span className="delete" onClick={(e)=>{
                                            e.stopPropagation()
                                            this.deleteImg(jtem.id)
                                        }}>×</span>
                                        <img src={jtem.src} style={{
                                            display:'none'
                                        }} onLoad={(e)=>{
                                            this.imgLoad(e,j)
                                        }} alt=""/>
                                    </div>
                                )
                            })
                        }
                    </div>
                    {
                        this.state.isOpen?
                        <PhotoSwipe isOpen={this.state.isOpen} items={this.state.images} options={this.state.options} onClose={()=>{
                            this.handleClose()
                        }}/>
                        :null
                    }
                </div>
                    <WhiteSpace/>
                    <WingBlank>
                        <div className="section">
                            <Button disabled={this.state.ds} type="primary" onClick={()=>{
                                this.submit()
                            }}>发布</Button>
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
export default connect()(CommunityComment)
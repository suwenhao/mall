import React, { Component } from 'react'
import {connect} from 'react-redux'
import TextHeader from '@components/Header/TextHeader'
import {Toast,PullToRefresh,Checkbox} from 'antd-mobile'
import Loading from '@base/Loading'
import {PhotoSwipe} from 'react-photoswipe'
import axios from 'axios'
import $ from 'jquery'
import {baseUrl,imgUrl,getToken,computingTime,formatTime} from '@common/js/util.js'

import '@common/styles/comments.scss'

class Comments extends Component {
    constructor(props){
        super(props)
        this.state={
            refreshing:false,
            goodId:this.props.match.params.id,
            down:false,
            height:document.documentElement.clientHeight-95,
            list:[],
            images:[],
            isOpen:false,
            tab:1,
            options:{
                index: 0,
                escKey: true,
                shareEl: false,
                shareButtons:[]
            },
            pageNumber:1,
            pageSize:10,
            loading:true,
            totalPage:1,
            tip:false,
            commentIndex:1,
        }
    }
    //内容适应窗口
    resize(){
        let self =this;
        $(window).on('resize',()=>{
            self.setState({
                height:document.documentElement.clientHeight-95
            })
        })
    }
     //获取商品信息详情
     getGoodsInfo(){
        (async ()=>{
          let goodId = this.state.goodId
          let params = {
            goodId,
            token:getToken()
          }
          let res = await axios.get(baseUrl+'/goodsInfo',{params}).then(res=>res);
          let {data} = res.data
          console.log(data)
          this.setState({
            data,
            loading:false
          })
          this.requestComment();
        })()
    }
      //评论切换
    checkComment (i) {
        this.setState({
            tab:i,
            pageNumber:1,
            pageSize:10,
            totalPage:1,
            loading:true,
            list:[]
        },()=>{
            this.requestComment()
        })
    }
    //获取列表
    requestComment(){
        let that = this
        let params = {
            productId: this.state.goodId,
            commentType: this.state.tab,
            pageSize: this.state.pageSize,
            pageNumber: this.state.pageNumber
        }
        $.ajax({
            type:'post',
            url:baseUrl+'/getCommentPage',
            data:params,
            dataType:'json',
            success(res){
                let list = res.data.data
                for (let i = 0; i < list.length; i++) {
                    //计算评论时间距离
                    list[i].productCommentImgs=list[i].productCommentImgs.map(v=>{
                      return {
                        ...v,
                        w:500,
                        h:500,
                        src:v.imgUrl
                      }
                    })
                    list[i].isOpen=false;
                    list[i].options={
                        index: 0,
                        escKey: true,
                        shareEl: false,
                        shareButtons:[]
                    }
                    list[i].distanceTime = computingTime(list[i].commentTime);
                    //处理评论日期
                    list[i].commentTime = formatTime(new Date(list[i].commentTime));
                }
                that.setState({
                    list:list,
                    totalPage:res.data.totalPages,
                    loading:false,
                    pageNumber:that.state.pageNumber+1,
                    pageSize:10,
                    tip:list.length>0?false:true,
                })
            },
            error(err){
                Toast.info('获取失败',1)
            }
        })
    }
    //加载更多
    getRefresh(cb){
        let that=this
        console.log()
        if(this.state.pageNumber>this.state.totalPage){
            this.setState({ refreshing: false });
            return;
        }else{
            let params = {
                productId: this.state.goodId,
                commentType: this.state.tab,
                pageSize: this.state.pageSize,
                pageNumber: this.state.pageNumber
            }
            $.ajax({
                type:'post',
                url:baseUrl+'/getCommentPage',
                data:params,
                dataType:'json',
                success(res){
                    let list = res.data.data
                    for (let i = 0; i < list.length; i++) {
                        //计算评论时间距离
                        list[i].productCommentImgs=list[i].productCommentImgs.map(v=>{
                          return {
                            ...v,
                            w:500,
                            h:500,
                            src:v.imgUrl
                          }
                        })
                        list[i].isOpen=false;
                        list[i].options={
                            index: 0,
                            escKey: true,
                            shareEl: false,
                            shareButtons:[]
                        }
                        list[i].distanceTime = computingTime(list[i].commentTime);
                        //处理评论日期
                        list[i].commentTime = formatTime(new Date(list[i].commentTime));
                    }
                    let newData=that.state.list.concat(list)
                    that.setState({
                        list:newData,
                        totalPage:res.data.totalPages,
                        loading:false,
                        pageNumber:that.state.pageNumber+1,
                        pageSize:10,
                        tip:newData.length>0?false:true,
                        refreshing: false 
                    })
                },
                error(err){
                    Toast.info('获取失败',1)
                }
            })
        }
    }
    //图片宽高
    imgLoad(e,index,j){
        let list=this.state.list;
        let productCommentImgs=list[index].productCommentImgs.concat()
        productCommentImgs[j].w=e.currentTarget.width;
        productCommentImgs[j].h=e.currentTarget.height;
        list[index].productCommentImgs=productCommentImgs;
        this.setState({
            list
        })
    }
    //关闭图片预览
    handleClose(){
        this.setState({
            isOpen:false
        })
    }
    //挂载组件
    componentDidMount(){
        this.getGoodsInfo()
        this.resize()
    }
    gh(){
        $('.pswp').height($(window).height())
    }
    render() {
        return (
            <div className="comments-page">
                <TextHeader returnbtn={true} title="商品评论" pathname={'/goods/'+this.state.goodId}></TextHeader>
                <div className="comments-main">
                <div className="info-wrap">
                    <div className="info-body">
                        <div className="info-body-top">
                            <div className="body-top-item">
                            <Checkbox checked={this.state.commentIndex===1?true:false} onChange={()=>{
                                this.setState({commentIndex:1},()=>{
                                this.checkComment(1)
                                })
                            }}/>
                            <span>好评({this.state.data&&this.state.data.commentTotal.goodNum})</span>
                            </div>
                            <div className="body-top-item">
                            <Checkbox checked={this.state.commentIndex===2?true:false} onChange={()=>{
                                this.setState({commentIndex:2},()=>{
                                this.checkComment(2)
                                })
                            }}/>
                            <span>中评({this.state.data&&this.state.data.commentTotal.mediumNum})</span>
                            </div>
                            <div className="body-top-item">
                            <Checkbox checked={this.state.commentIndex===3?true:false} onChange={()=>{
                                this.setState({commentIndex:3},()=>{
                                this.checkComment(3)
                                })
                            }}/>
                            <span>差评({this.state.data&&this.state.data.commentTotal.badNum})</span>
                            </div>
                            <div className="body-top-item">
                            <Checkbox checked={this.state.commentIndex===4?true:false} onChange={()=>{
                                this.setState({commentIndex:4},()=>{
                                this.checkComment(4)
                                })
                            }}/>
                            <span>有图({this.state.data&&this.state.data.commentTotal.imgNum})</span>
                            </div>
                        </div>
                        <div className="info-body-content">
                            <div>
                            <PullToRefresh
                                damping={60}
                                style={{
                                    height: this.state.height,
                                    overflow: 'auto',
                                    backgroundColor:'#fff'
                                }}
                                indicator={this.state.down ? {} : { deactivate: '上拉加载' }}
                                direction={this.state.down ? 'down' : 'up'}
                                refreshing={this.state.refreshing}
                                onRefresh={() => {
                                    this.setState({ refreshing: true });
                                    //上拉加载
                                    this.getRefresh()
                                }}
                            >
                            {
                                this.state.loading?
                                <Loading/>
                                :null
                            }
                            {
                                this.state.list.length>0?
                                this.state.list.map((item,i)=>{
                                return (
                                    <div className="li-item" key={i}>
                                        <div className="comment-top">
                                            <label>
                                                <img src={item.fansHeadImg} alt=""/>
                                            </label>
                                            <span className="comment-content">
                                                <div className="comment-name">
                                                    <span>{item.fansName}</span>
                                                    <span>{item.commentTime}</span>
                                                </div>
                                                <div className="comment-date">
                                                    <span>{item.distanceTime}</span>
                                                    <span>{item.skuValue}</span>
                                                </div>
                                                <p>不错不错</p>
                                            </span>
                                        </div>
                                        <div className="comment-img">
                                            {
                                            item.productCommentImgs.map((jtem,j)=>{
                                                return(
                                                <div key={j} style={{
                                                    backgroundImage:`url(${jtem.imgUrl}`,
                                                    backgroundSize:jtem.w>=jtem.h?'100% auto':'auto 100%',
                                                }} onClick={()=>{
                                                    let list = this.state.list.concat();
                                                    list[i].isOpen=true;
                                                    list[i].options={
                                                        ...list[i].options,
                                                        index:j
                                                    };
                                                    this.setState({
                                                        list,
                                                        isOpen:true,
                                                        options:{
                                                            ...this.state.options,
                                                            index:j
                                                        },
                                                        images:item.productCommentImgs
                                                    })
                                                }} className="img">
                                                    <img src={jtem.imgUrl} style={{
                                                        display:'none'
                                                    }} onLoad={(e)=>{
                                                        this.imgLoad(e,i,j)
                                                    }} alt=""/>
                                                </div>
                                                )
                                            })
                                            }    
                                        </div>
                                    </div>
                                )
                                })
                                :
                                this.state.tip?
                                <div className="order-tip">暂无数据</div>
                                :null
                            }
                            </PullToRefresh>
                            {
                                this.state.isOpen?
                                <PhotoSwipe isOpen={this.state.isOpen} items={this.state.images} options={this.state.options} onClose={()=>{
                                    this.handleClose()
                                }}/>
                                :null
                            }
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>
        )
    }
}
export default connect()(Comments)

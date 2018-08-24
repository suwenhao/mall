import React, { Component } from 'react'
import {connect} from 'react-redux'
import TextHeader from '@components/Header/TextHeader'
import {Toast,PullToRefresh,Checkbox} from 'antd-mobile'
import Loading from '@base/Loading'
import {PhotoSwipe} from 'react-photoswipe'
import axios from 'axios'
import $ from 'jquery'
import {baseUrl,getToken,computingTime,formatTime} from '@common/js/util.js'

import '@common/styles/comments.scss'

class Comments extends Component {
    constructor(props){
        super(props)
        this.state={
            refreshing:false,
            goodId:this.props.match.params.id,
            down:false,
            height:document.documentElement.clientHeight-95,
            comments:[],
            images:[],
            isOpen:false,
            options:{
                index: 0,
                escKey: true,
                shareEl: false,
                history:false,
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
        let that = this
        let params = {
        goodId:this.state.goodId,
        token:getToken()
        }
        $.ajax({
            type:'get',
            data:params,
            url:baseUrl+'/goodsInfo',
            success(res){
                let data = res.data
                
                //更新model
                that.setState({
                    data,
                    loading:false
                })
                //获取评论
                that.requestComment()
            },
            error(){
                that.setState({
                loading:false
                })
            }
        })
    }
      //评论切换
    checkComment (i) {
        this.setState({
            pageNumber:1,
            pageSize:10,
            totalPage:1,
            loading:true,
            comments:[]
        },()=>{
            this.requestComment()
        })
    }
    //获取列表
    requestComment(){
        let that = this
        let params = {
            productId: this.state.goodId,
            commentType: this.state.commentIndex,
            pageSize: this.state.pageSize,
            pageNumber: this.state.pageNumber
        }
        $.ajax({
            type:'post',
            url:baseUrl+'/getCommentPage',
            data:params,
            dataType:'json',
            success(res){
                let comments = res.data.data
                comments.forEach((ctem,c)=>{
                    //重整图片数据
                    ctem.productCommentImgs=ctem.productCommentImgs.map(v=>{
                        return {
                          ...v,
                          w:500,
                          h:500,
                          src:v.imgUrl
                        }
                    })
                    ctem.distanceTime = computingTime(ctem.commentTime);
                    //处理评论日期
                    ctem.commentTime = formatTime(new Date(ctem.commentTime));
                })
                that.setState({
                    comments:comments,
                    totalPage:res.data.totalPages,
                    loading:false,
                    pageNumber:that.state.pageNumber+1,
                    pageSize:10,
                    tip:comments.length>0?false:true,
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
                commentType: this.state.commentIndex,
                pageSize: this.state.pageSize,
                pageNumber: this.state.pageNumber
            }
            $.ajax({
                type:'post',
                url:baseUrl+'/getCommentPage',
                data:params,
                dataType:'json',
                success(res){
                    let comments = res.data.data
                    comments.forEach((ctem,c)=>{
                        //重整图片数据
                        ctem.productCommentImgs=ctem.productCommentImgs.map(v=>{
                            return {
                              ...v,
                              w:500,
                              h:500,
                              src:v.imgUrl
                            }
                        })
                        ctem.distanceTime = computingTime(ctem.commentTime);
                        //处理评论日期
                        ctem.commentTime = formatTime(new Date(ctem.commentTime));
                    })
                    let newData=that.state.comments.concat(comments)
                    that.setState({
                        comments:newData,
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
        let comments=this.state.comments;
        let productCommentImgs=comments[index].productCommentImgs.concat()
        productCommentImgs[j].w=e.currentTarget.width;
        productCommentImgs[j].h=e.currentTarget.height;
        comments[index].productCommentImgs=productCommentImgs;
        this.setState({
            comments
        })
    }
    //关闭图片预览
    handleClose(){
        this.setState({
            isOpen:false
        })
    }
    //打开预览图片
    openImgPrview(item,j){
        this.setState({
            isOpen:true,
            options:{
                ...this.state.options,
                index:j
            },
            images:item.productCommentImgs
        })
    }
    //挂载组件
    componentDidMount(){
        this.getGoodsInfo()
        this.resize()
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
                                this.state.loading?<Loading/>:null
                            }
                            {
                                this.state.comments.length>0?
                                this.state.comments.map((item,i)=>{
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
                                                <p>{item.content}</p>
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
                                                    this.openImgPrview(item,j)
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

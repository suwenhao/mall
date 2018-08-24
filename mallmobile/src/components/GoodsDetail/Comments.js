import React, { Component } from 'react'
import $ from 'jquery'
import PropTypes from 'prop-types'
import Loading from '@base/Loading'
import {PhotoSwipe} from 'react-photoswipe'
import {Toast, Checkbox} from 'antd-mobile'
import {baseUrl,computingTime,formatTime} from '@common/js/util.js'
import {withRouter} from 'react-router-dom'

class Comments extends Component {
    static propTypes={
        commentTotal: PropTypes.object,
        goodId:PropTypes.number
    }
    constructor(props){
        super(props)
        this.state = {
            commentTotal:props.commentTotal,
            goodId:props.goodId,
            commentIndex:1,
            loading:true,
            comments:[],
            isOpen:false,
            productCommentImgs:[],
            options:{
                index: 0,
                escKey: true,
                shareEl: false,
                history:false,
                shareButtons:[]
            }
        }
    }
    //评论切换
    checkComment (i) {
        this.setState({
            loading:true,
            comments:[]
        },()=>{
            this.requestComment(i)
        })
    }
    //获取评论
    requestComment(i){
        let that=this;
        let params = {
            productId: this.props.goodId,
            commentType: i,
            pageSize: 2,
            pageNumber: 1
        };
        $.ajax({
            type:"post",
            url:baseUrl+'/getCommentPage',//添加自己的接口链接
            timeOut:5000,
            data:params,
            dataType:'json',
            success(res){
                console.log(res)
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
                    //处理距离当前时间
                    ctem.distanceTime = computingTime(ctem.commentTime);
                    //处理评论日期
                    ctem.commentTime = formatTime(new Date(ctem.commentTime));
                })
                //更新model数据
                that.setState({
                    comments,
                    loading:false
                })
            },
            error(){
                Toast.info('请求出错',1)
            }
        })
    }
    //跳转到评论页
    gotoComment(){
        this.props.history.push('/comments/'+this.props.goodId)
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
    //打开图片浏览
    openImgPrview(i,j){
        let comments = this.state.comments.concat();
        this.setState({
            isOpen:true,
            productCommentImgs:comments[i].productCommentImgs,
            options:{
                ...this.state.options,
                index:j
            }
        })
    }
    componentDidMount(){
        this.requestComment(1)
    }
    render() {
        return (
            <div className="info-body">
                <div className="info-body-top">
                    <div className="body-top-item">
                        <Checkbox checked={
                            this.state.commentIndex===1?true:false
                        } onChange={()=>{
                            this.setState({commentIndex:1},()=>{
                                this.checkComment(1)
                            })
                        }}/>
                        <span>好评({this.state.commentTotal.goodNum})</span>
                    </div>
                    <div className="body-top-item">
                        <Checkbox checked={
                            this.state.commentIndex===2?true:false
                        } onChange={()=>{
                            this.setState({commentIndex:2},()=>{
                                this.checkComment(2)
                            })
                        }}/>
                        <span>中评({this.state.commentTotal.mediumNum})</span>
                    </div>
                    <div className="body-top-item">
                        <Checkbox checked={
                            this.state.commentIndex===3?true:false
                        } onChange={()=>{
                            this.setState({commentIndex:3},()=>{
                                this.checkComment(3)
                            })
                        }}/>
                        <span>差评({this.state.commentTotal.badNum})</span>
                    </div>
                    <div className="body-top-item">
                        <Checkbox checked={
                            this.state.commentIndex===4?true:false
                        } onChange={()=>{
                            this.setState({commentIndex:4},()=>{
                                this.checkComment(4)
                            })
                        }}/>
                        <span>有图({this.state.commentTotal.imgNum})</span>
                    </div>
                </div>
                <div className="info-body-content">
                    <ul>
                        {
                            this.state.loading?<Loading/>:null
                        }
                        {
                        this.state.comments.length>0?
                        this.state.comments.map((item,i)=>{
                            return (
                                <li key={i}>
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
                                                this.openImgPrview(i,j)
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
                                </li>
                            )
                        })
                        :
                        this.state.loading?null:<li className="order-tip">暂无评论</li>
                        }
                    </ul>
                    {
                        this.state.comments.length>0?
                        <div style={{
                            borderTop:'1px solid #eee',
                            lineHeight:'40px',
                            minHeight:'40px'
                        }} className="order-tip" onClick={()=>{
                            this.gotoComment()
                        }}>查看更多</div>
                        :null
                    }
                </div>
                {
                    this.state.isOpen?
                    <PhotoSwipe isOpen={this.state.isOpen} items={this.state.productCommentImgs} options={this.state.options} onClose={()=>{
                        this.handleClose()
                    }}/>
                    :null
                }
            </div>
        )
    }
}
export default withRouter(Comments)
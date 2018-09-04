import React, { Component } from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import * as routerAction from '@actions/routerAction'
import {Toast,PullToRefresh} from 'antd-mobile'
import TextHeader from '@components/Header/TextHeader'
import Loading from '@base/Loading'
import $ from 'jquery'
import {baseUrl,imgUrl,getToken} from '@common/js/util.js'

import '@common/styles/community.scss'

class CommunityDetail extends Component {
    constructor(props){
        super(props)
        this.state={
            id:props.match.params.id,
            height:document.documentElement.clientHeight-92,
            loading:true,
            tip:false,
            info:null,
            loading:true,
            pageNumber:1,
            totalPage:1,
            pageSize:20,
            allComment:0,
            comments:[],
            refreshing:false,
            down:false,
            content:'',
        }
    }
    //内容适应窗口
    resize(){
        let self =this;
        $(window).on('resize',()=>{
            self.setState({
                height:document.documentElement.clientHeight-92
            })
        })
    }
    //获取社区信息
    getCommunityDetail(cb){
        let that = this
        let params = {
            token:getToken()
        }
        let info=sessionStorage.getItem('__mall__community__');
        if(info){
            info=JSON.parse(info)
            info.images=info.picture.split(',').map(v=>{
                return imgUrl+v
            })
        }
        this.setState({
            loading:false,
            info
        },()=>{
            cb&&cb()
        })
    }
    //获取评论列表
    getCommentList(){
        let that = this
        let params = {
            token:getToken(),
            id:this.state.info.id,
            pageNumber:this.state.pageNumber,
            pageSize:this.state.pageSize
        }
        $.ajax({
            type:'get',
            url:baseUrl+'/durianCommunity/commentList',
            data:params,
            dataType:'json',
            success(res){
                if(res.code===0){
                    console.log(res)
                    that.setState({
                        comments:res.data.rows.map(v=>{
                            v.id=v.id+''
                            let y=v.id.substring(0,2);
                            let m=v.id.substring(2,4);
                            let d=v.id.substring(4,6);
                            return {
                                ...v,
                                time:'20'+y+'-'+m+'-'+d
                            }
                        }),
                        totalPage:res.data.totalPage,
                        pageNumber:that.state.pageNumber+1,
                        allComment:res.data.rows.length,
                        pageSize:20,
                    })
                }else{
                    Toast.info('获取失败',1)
                }
            },
            error(err){
                Toast.info('获取失败',1)
            }
        })
    }
    getRefresh(cb){
        let that=this
        console.log()
        if(this.state.pageNumber>this.state.totalPage){
            this.setState({ refreshing: false });
            return;
        }else{
            let params = {
                token:getToken(),
                pageNumber:this.state.pageNumber,
                id:this.state.id,
                pageSize:this.state.pageSize
            }
            $.ajax({
                type:'get',
                url:baseUrl+'/durianCommunity/commentList',
                data:params,
                dataType:'json',
                success(res){
                    if(res.code===0){
                        res.data.rows=res.data.rows.map(v=>{
                            v.id=v.id+''
                            let y=v.id.substring(0,2);
                            let m=v.id.substring(2,4);
                            let d=v.id.substring(4,6);
                            return {
                                ...v,
                                time:'20'+y+'-'+m+'-'+d
                            }
                        })
                        let newData=that.state.comments.concat(res.data.rows)
                        that.setState({
                            comments:newData,
                            pageNumber:that.state.pageNumber+1,
                            pageSize:20,
                            allComment:newData.length,
                            totalPage:res.data.totalPage,
                            refreshing: false 
                        },()=>{
                            cb&&cb()
                        })
                    }else{
                        Toast.info('获取失败',1)
                    }
                },
                error(err){
                    Toast.info('获取失败',1)
                }
            })
        }
    }
    //点赞
    handleLike(id){
        let that = this
        let params = {
            token:getToken(),
            id:id
        }
        $.ajax({
            type:'get',
            url:baseUrl+'/durianCommunity/like',
            data:params,
            success(res){
                let newInfo={
                    ...that.state.info,
                    like:that.state.info.isLike?that.state.info.like-1:that.state.info.isLike+1,
                    isLike:!that.state.info.isLike
                }
                that.setState({
                    info:newInfo
                })
                sessionStorage.setItem('__mall__community__',JSON.stringify(newInfo))
            }
        })
    }
    //评论
    submitComment(){
        let that = this
        let params = {
            token:getToken(),
            id:this.state.info.id,
            content:this.state.content
        }
        $.ajax({
            type:'post',
            url:baseUrl+'/durianCommunity/comment',
            data:params,
            success(res){
                console.log(res)
                if(res.code===0){
                    Toast.info("评论成功",1)
                    that.setState({
                        content:'',
                        totalPage:1,
                        pageNumber:1,
                        pageSize:20
                    },()=>{
                        that.getCommentList()
                    })
                }
            }
        })
    }
    //挂载组件
    componentDidMount(){
        this.getCommunityDetail(()=>{
            this.getCommentList()
        })
        this.resize()
    }
    render() {
        let info = this.state.info && this.state.info;
        let prev = sessionStorage.getItem('__search_prev_path__')
        return (
            <div className="community-page community-detail">
                <TextHeader returnbtn={true} title="内容详情" pathname={prev}></TextHeader>
                <div className="community-main" style={{
                    height:this.state.height,
                    overflowY:'auto'
                }}>
                    {
                        info?
                        <div className="community-item">
                            <div className="community-header">
                                <div className="c-left">
                                    <img src={require(`@common/images/avatar.jpg`)} alt=""/>
                                    <span>{info.nickname}</span>
                                </div>
                                <div className="c-right">{info.time}</div>
                            </div>
                            <div className="community-body">
                                <div className="ptext">{info.content}</div>
                                <div className="pictrues">
                                    {
                                        info.images.map((item,i)=>{
                                            return (
                                                <div key={i} className="img-item">
                                                    <img src={item} alt=""/>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                            <div className="c-footer">
                                <div className="all-comments">全部评论 <span>({this.state.allComment})</span></div>
                                <div className="comments-box">
                                <PullToRefresh
                                        damping={60}
                                        style={{
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
                                            this.state.comments.length>0?
                                            this.state.comments.map((item,i)=>{
                                                return(
                                                    <div className="comments-item">
                                                        <div className="left-avatar">
                                                            <img src={item.headimgurl} alt=""/>
                                                        </div>
                                                        <div className="right-msg">
                                                            <div className="r-m-t">
                                                                <span className="nickname">{item.nickname}</span>
                                                                <span className="time">{item.time}</span>
                                                            </div>
                                                            <p>{item.content}</p>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                            
                                            :
                                            <div style={{padding:'20px',textAlign:'center',color:'#333'}}>暂无数据</div>
                                        }
                                    </PullToRefresh>
                                </div>
                            </div>
                        </div>
                        :<Loading/>
                    }
                </div>
                <div className="community-page-footer">
                    {
                        this.state.info&&this.state.info.isLike?
                        <div className="cf-icon" onClick={()=>{
                            this.handleLike(this.state.info.id)
                        }}>
                            <img src={require(`@common/images/@zan.png`)} alt=""/>
                            <span style={{color:'#ff5b05'}}>{this.state.info&&this.state.info.like}</span>
                        </div>
                        :
                        <div className="cf-icon" onClick={()=>{
                            this.handleLike(this.state.info.id)
                        }}>
                            <img src={require(`@common/images/zan.png`)} alt=""/>
                            <span>{this.state.info&&this.state.info.like}</span>
                        </div>
                    }
                    <div className="input">
                        <input value={this.state.content} onChange={(e)=>{
                            this.setState({
                                content:e.currentTarget.value
                            })
                        }} type="text" placeholder="发表你的看法..."/>
                    </div>
                    <div className="btn"  onClick={()=>{
                        this.submitComment()
                    }}>
                        发送
                    </div>
                </div>
            </div>
        )
    }
}
export default connect(
    null,
    //跳转路由
    (dispatch)=>({
        router:bindActionCreators(routerAction,dispatch)
    })
)(CommunityDetail)

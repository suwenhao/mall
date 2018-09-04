import React, { Component } from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import * as routerAction from '@actions/routerAction'
import {Toast,PullToRefresh} from 'antd-mobile'
import TextHeader from '@components/Header/TextHeader'
import Loading from '@base/Loading'
import $ from 'jquery'
import {baseUrl,imgUrl,getToken,formatTime} from '@common/js/util.js'

import '@common/styles/community.scss'

class SchoolDetail extends Component {
    constructor(props){
        super(props)
        let ww=document.documentElement.clientWidth-20
        this.state={
            id:props.match.params.id,
            height:document.documentElement.clientHeight-92,
            imgWidth:ww,
            imgHeight:ww*20/35,
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
            tip:false,
        }
    }
    //内容适应窗口
    resize(){
        let self =this;
        $(window).on('resize',()=>{
            let ww=document.documentElement.clientWidth-20
            self.setState({
                imgWidth:ww,
                imgHeight:ww*20/35,
                height:document.documentElement.clientHeight-46
            })
        })
    }
    //获取学堂信息
    getSchoolDetail(){
        let that = this
        let params = {
            token:getToken(),
            id:this.state.id
        }
        $.ajax({
            type:'get',
            url:baseUrl+'/durianSchool/get',
            data:params,
            dataType:'json',
            success(res){
                if(res.code===0){
                    console.log(res)
                    var extname='';
                    if(res.data.content){
                        var index=res.data.content.lastIndexOf(".")
                        var fileLength = res.data.content.length;
                        extname=res.data.content.substring(index,fileLength)
                    }
                    if(extname==='.mp4'){
                        res.data.type='video'
                    }else{
                        res.data.type='text'
                    }
                    console.log(res.data)
                    that.setState({
                        info:res.data
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
    //获取评论列表
    getCommentList(){
        let that = this
        let params = {
            token:getToken(),
            id:this.state.id,
            pageNumber:this.state.pageNumber,
            pageSize:this.state.pageSize
        }
        $.ajax({
            type:'get',
            url:baseUrl+'/durianSchool/commentList',
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
                url:baseUrl+'/durianSchool/commentList',
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
            url:baseUrl+'/durianSchool/like',
            data:params,
            success(res){
                that.getSchoolDetail()
            }
        })
    }
    //评论
    submitComment(){
        let that = this
        let params = {
            token:getToken(),
            id:this.state.id,
            content:this.state.content
        }
        $.ajax({
            type:'post',
            url:baseUrl+'/durianSchool/comment',
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
        this.getSchoolDetail()
        this.getCommentList()
        this.resize()
    }
    render() {
        let info = this.state.info && this.state.info;
        return (
            <div className="community-page community-detail">
                <TextHeader returnbtn={true} title="内容详情" pathname="/my/school"></TextHeader>
                {
                    info?
                    <div className="community-main" style={{
                        height:this.state.height,
                        overflowY:'auto'
                    }}>
                        <div className="community-item">
                            {
                                info.type==='text'?
                                <div className="community-body">
                                    <div className="ptitle" style={{
                                        borderBottom:'1px solid #eee'
                                    }}>
                                        {info.title}
                                    </div>
                                    <div className="ptext" dangerouslySetInnerHTML = {{ __html:info.content!==""?info.content:"暂无详情" }}></div>
                                    <div className="video-controls">
                                        <span className="v-l">{info.label}</span>
                                        <span className="v-r">{formatTime(new Date(info.updateTime))}</span>
                                    </div>
                                </div>
                                :
                                <div className="community-body">
                                    <div className="ptitle">
                                        {info.title}
                                    </div>
                                    <div className="ptext">
                                        <video
                                        controls
                                        style={{
                                            backgroundColor:'#000'
                                        }} onClick={(e)=>{
                                            e.stopPropagation()
                                        }}  width={this.state.imgWidth} 
                                            height={this.state.imgHeight} >
                                            <source src={imgUrl+info.content} type="video/mp4"/>
                                            您的浏览器不支持 video 标签。
                                        </video>
                                    </div>
                                    <div className="video-controls">
                                        <span className="v-l">播放{info.see}次</span>
                                        <span className="v-r">{formatTime(new Date(info.updateTime))}</span>
                                    </div>
                                </div>
                            }
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
                    </div>
                    :
                    <Loading/>
                }
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
                    <div className="btn" onClick={()=>{
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
)(SchoolDetail)

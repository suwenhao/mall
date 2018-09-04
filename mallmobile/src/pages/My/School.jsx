import React, { Component } from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import * as routerAction from '@actions/routerAction'
import {Toast,PullToRefresh } from 'antd-mobile'
import TextHeader from '@components/Header/TextHeader'
import Loading from '@base/Loading'
import $ from 'jquery'
import {baseUrl,imgUrl,getToken,formatTime} from '@common/js/util.js'

import '@common/styles/community.scss'

class School extends Component {
    constructor(props){
        super(props)
        let ww=document.documentElement.clientWidth-20
        this.state={
            refreshing:false,
            down:false,
            height:document.documentElement.clientHeight-46,
            imgWidth:ww,
            imgHeight:ww*20/35,
            list:[],
            pageNumber:1,
            pageSize:10,
            loading:true,
            totalPage:1,
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
    //获取学堂列表
    getSchoolList(){
        let that = this
        let params = {
            token:getToken(),
            pageNumber:this.state.pageNumber,
            pageSize:this.state.pageSize,
        }
        $.ajax({
            type:'get',
            url:baseUrl+'/durianSchool/list',
            data:params,
            dataType:'json',
            success(res){
                console.log(res)
                setTimeout(()=>{
                    that.setState({
                        list:res.data.rows,
                        // list:[],
                        totalPage:res.data.totalPage,
                        loading:false,
                        pageNumber:that.state.pageNumber+1,
                        pageSize:10,
                        tip:res.data.rows.length>0?false:true,
                        // tip:true
                    })
                },50)
            },
            error(err){
                Toast.info('获取失败',1)
            }
        })
    }
    //加载更多
    getRefresh(cb){
        let that = this
        if(this.state.pageNumber>this.state.totalPage){
            this.setState({ refreshing: false });
            return;
        }else{
            let params = {
                token:getToken(),
                pageNumber:this.state.pageNumber,
                pageSize:this.state.pageSize
            }
            $.ajax({
                type:'get',
                url:baseUrl+'/durianSchool/list',
                data:params,
                dataType:'json',
                success(res){
                    if(res.code===0){
                        let newData=that.state.list.concat(res.data.rows)
                        that.setState({
                            list:newData,
                            loading:false,
                            pageNumber:that.state.pageNumber+1,
                            pageSize:10,
                            tip:newData.length>0?false:true,
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
    //跳转
    goto(path,id){
        if(id){
            this.props.history.push(path+id)
            this.props.router.changePath(path+id)
            sessionStorage.setItem('__search_prev_path__',this.props.location.pathname)
        }else{
            this.props.history.push(path)
            this.props.router.changePath(path)
        }
    }
    //挂载组件
    componentDidMount(){
        this.getSchoolList()
        this.resize()
    }
    render() {
        return (
        <div className="community-page">
            <TextHeader returnbtn={true} title="榴莲学堂" pathname="/my"></TextHeader>
            <div className="community-main">
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
                            return(
                                <div className="community-item" key={i} onClick={(e)=>{
                                    this.goto('/my/schooldetail/',item.id)
                                }}>
                                    <div className="community-body">
                                        <div className="c-b-title">{item.title}</div>
                                        <div className="pictrues">
                                            <div className="img-item">
                                                <img style={{
                                                        height:this.state.imgHeight,
                                                        width:this.state.imgWidth
                                                    }} src={item.cover?imgUrl+item.cover:require('@common/images/noimg.png')} onLoad={(e)=>{
                                                        let img =new Image();
                                                        let dom = e.currentTarget;
                                                        img.onload =()=>{
                                                            img.onload =null;
                                                            img.onerror = function() {
                                                                dom.src=require('@common/images/noimg.png')
                                                            };
                                                        }
                                                        img.src = imgUrl+item.cover;
                                                    }} alt=""/>
                                                {/* <video
                                                controls
                                                style={{
                                                    backgroundColor:'#000'
                                                }} onClick={(e)=>{
                                                    e.stopPropagation()
                                                }}  width={this.state.imgWidth} 
                                                    height={this.state.imgHeight} >
                                                    <source src={item.src} type="video/mp4"/>
                                                    您的浏览器不支持 video 标签。
                                                </video> */}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="community-footer">
                                        <div className="c-left">
                                            <div className="c-l-name">
                                                {item.label}
                                            </div>
                                            <div className="c-l-time">
                                                {formatTime(new Date(item.updateTime))}
                                            </div>
                                        </div>
                                        <div className="c-right">
                                            <div className="c-icon">
                                                <img src={require(`@common/images/msg@default.png`)}/>
                                                <span>{item.comment}</span>
                                            </div>
                                            <div className="c-icon">
                                                <img src={require(`@common/images/zan.png`)}/>
                                                <span>{item.like}</span>
                                            </div>
                                            
                                        </div>
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
)(School)

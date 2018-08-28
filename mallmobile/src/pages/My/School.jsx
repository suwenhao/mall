import React, { Component } from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import * as routerAction from '@actions/routerAction'
import {Toast,PullToRefresh } from 'antd-mobile'
import TextHeader from '@components/Header/TextHeader'
import Loading from '@base/Loading'
import $ from 'jquery'
import {baseUrl,getToken} from '@common/js/util.js'

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
            list:[
                {
                    id:1,
                    title:'吃榴莲对身体有什么好处，一起来爆料',
                    src:require('@common/images/test/1.mp4'),
                    type:'video',
                    author:'健康生活',
                    time:'2018-08-28',
                    zan:23,
                    comment:12
                },
                {
                    id:2,
                    title:'怎样挑榴莲，让您挑到满意的榴莲！！！',
                    src:require('@common/images/test/2.mp4'),
                    type:'video',
                    author:'健康生活',
                    time:'2018-08-28',
                    zan:45,
                    comment:23
                },
                {
                    id:3,
                    title:'榴莲不能和什么一起吃，一起来看看',
                    src:require('@common/images/test/u3314.jpg'),
                    type:'text',
                    author:'健康生活',
                    time:'2018-08-28',
                    zan:10,
                    comment:43
                }
            ],
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
            token:getToken()
        }
        this.setState({
            loading:false,
        })
        // $.ajax({
        //     type:'post',
        //     url:baseUrl+'/',
        //     data:params,
        //     dataType:'json',
        //     success(res){
        //         console.log(res)
        //         res.data.balance=res.data.balance.toFixed(2)
        //         that.setState({
        //             userInfo:res.data
        //         })
        //     },
        //     error(err){
        //         Toast.info('获取失败',1)
        //     }
        // })
    }
    //加载更多
    getRefresh(cb){

    }
    //跳转
    goto(path,id){
        if(id){
            this.props.history.push(path+id)
            this.props.router.changePath(path+id)
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
                                                {
                                                    item.type==="text"?
                                                    <img style={{
                                                        height:this.state.imgHeight,
                                                        width:this.state.imgWidth
                                                    }} src={item.src} alt=""/>
                                                    :
                                                    <video
                                                    controls
                                                    style={{
                                                        backgroundColor:'#000'
                                                    }} onClick={(e)=>{
                                                        e.stopPropagation()
                                                    }}  width={this.state.imgWidth} 
                                                        height={this.state.imgHeight} >
                                                        <source src={item.src} type="video/mp4"/>
                                                        您的浏览器不支持 video 标签。
                                                    </video>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <div className="community-footer">
                                        <div className="c-left">
                                            <div className="c-l-name">
                                                {item.author}
                                            </div>
                                            <div className="c-l-time">
                                                {item.time}
                                            </div>
                                        </div>
                                        <div className="c-right">
                                            <div className="c-icon" onClick={(e)=>{
                                                e.stopPropagation()
                                            }}>
                                                <img src={require(`@common/images/msg@default.png`)}/>
                                                <span>{item.comment}</span>
                                            </div>
                                            <div className="c-icon" onClick={(e)=>{
                                                e.stopPropagation()
                                            }}>
                                                <img src={require(`@common/images/zan.png`)}/>
                                                <span>{item.zan}</span>
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

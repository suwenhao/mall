import React, {Component} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import * as routerAction from '@actions/routerAction'
import {Modal, Toast } from 'antd-mobile';
import MyHeaderWrap from '@components/My/My/MyHeaderWrap'
import MyOrder from '@components/My/My/MyOrder'
import Header from '@components/Header/Header'
import $ from 'jquery'
import {baseUrl,getToken,getJSsdkParams} from '@common/js/util.js'
import '@common/styles/my.scss'
import QRCode from 'qrcode'
import wx from 'wechat-js-sdk'


class My extends Component {
    constructor(props) {
        super(props);
        this.state={
            userInfo:{},
            clicked: 'none',
            code:'',
            dataList:[
                // { url: 'apay.png', title: '支付宝' },
                // { url: 'weibo.png', title: '新浪微博' },
                { url: 'shenghuoquan.png', title: '朋友圈' },
                { url: 'weixin.png', title: '微信好友' },
                // { url: 'qq.png', title: 'QQ' }
            ].map(obj => ({
                icon: <img src={require(`@common/images/${obj.url}`)} alt={obj.title} style={{ width: 36 }} />,
                title: obj.title,
            })),
            jssdk:{},
            modal:false
        }
    }
    //跳转
    goto(path){
        this.props.history.push(path)
        this.props.router.changePath(path)
    }
    //弹起分享
    showShareActionSheet(){
        this.setState({
            modal:true
        })
    }
    //获取用户信息
    getUserInfo(cb){
        if(getToken()){
            let that = this
            let params = {
                token:getToken()
            }
            $.ajax({
                type:'post',
                url:baseUrl+'/getfocusUserMessage',
                data:params,
                dataType:'json',
                async:false,
                success(res){
                    if(res.code===0){
                        res.data.balance=res.data.balance.toFixed(2)
                        that.setState({
                            userInfo:res.data
                        },()=>{
                            cb&&cb()
                        })
                    }
                },
                error(err){
                    Toast.info('获取失败',1)
                }
            })
        }
    }
    codeImg(){
        let that = this
        QRCode.toDataURL('http://chaoliu.huibada.cn/mc-shopping/index.html?userId='+this.state.userInfo.fansId).then(url => {
            that.setState({
                code:url
            })
        })
    }
    getJSsdk(cb){
        let that = this
        getJSsdkParams((res)=>{
            that.setState({
                jssdk:res.data
            },()=>{
                cb&&cb()
            })
        })
    }
    onClose = key => () => {
        this.setState({
          [key]: false,
        });
    }
    //挂载组件
    componentDidMount(){
        let that=this
        this.getUserInfo(()=>{
            that.getJSsdk(()=>{
                wx.config({
                    debug: false,
                    appId: that.state.jssdk.appId, 
                    timestamp: that.state.jssdk.timestamp, 
                    nonceStr: that.state.jssdk.nonceStr, 
                    signature: that.state.jssdk.signature,
                    jsApiList: [
                        'checkJsApi',  
                        'onMenuShareTimeline',  
                        'onMenuShareAppMessage' 
                    ]
                })
                var fansId=that.state.userInfo.fansId;
                var img = 'http://exotic.gzfenzu.com/group1/M00/00/24/rBKok1rhP_iAKd7cAAO3P_-cEtk152.png'
                var link = `http://chaoliu.huibada.cn/mc-shopping/index.html?userId=${fansId}`;
                var desc = '榴莲商城 新鲜水果网购';
                wx.ready(()=>{
                    //分享到朋友圈接口
                    wx.onMenuShareTimeline({
                       imgUrl:img,
                       link:link,
                       desc:desc,
                       title:"榴莲商城",
                       success() {
                           $.ajax({
                               type:'post',
                               data:{
                                   token:getToken(),
                                   type:1,
                                   monetary:0,
                                   recommendId:''
                               },
                               url:baseUrl+'/point/share',
                               success(res){
                                   Toast.info('分享成功',);
                                   window.location.reload()
                               }
                           })
                       },
                       cancel() {
                           console.log("取消分享");
                       },
                       fail(res) {
                           console.log(JSON.stringify(res));
                       }
                   })
                    //分享到朋友
                   wx.onMenuShareAppMessage({
                    imgUrl:img,
                    link:link,
                    desc:desc,
                    title:"榴莲商城",
                    success() {
                        $.ajax({
                            type:'post',
                            data:{
                                token:getToken(),
                                type:1,
                                monetary:0,
                                recommendId:''
                            },
                            url:baseUrl+'/point/share',
                            success(res){
                                Toast.info('分享成功',);
                                window.location.reload()
                            }
                        })
                    },
                    cancel() {
                        console.log("取消分享");
                    },
                    fail(res) {
                        console.log(JSON.stringify(res));
                    }
                })
               })
            })
        })        
    }
    render() {
        return (
            <div className="my-page">
                <Modal
                visible={this.state.modal}
                transparent
                maskClosable={false}
                style={{width:'300px'}}
                onClose={this.onClose('modal')}
                title="提示"
                footer={[{ text: 'Ok', onPress: () => { this.onClose('modal')(); } }]}
                >
                    <img style={{width:'250px'}} src={require('@common/images/test/tipshare.jpg')} alt=""/>
                </Modal>
                <Header title="个人中心"></Header>
                <div className="my-main">
                    <MyHeaderWrap userInfo={this.state.userInfo} goto={this.goto.bind(this)}></MyHeaderWrap>
                    <MyOrder></MyOrder>
                    <div className="my-section">
                        <div className="my-more">
                            <a onClick={()=>{
                                this.goto('/my/browserecord');
                            }}>
                                <img src={require(`@common/images/browse.jpg`)} alt=""/>
                                <span>
                                    <div>浏览记录</div>
                                    <p>进入浏览</p>
                                </span>
                            </a>
                            <a onClick={()=>{
                                this.goto('/my/helpback');
                            }}>
                                <img src={require(`@common/images/feedback.jpg`)} alt=""/>
                                <span>
                                    <div>帮助反馈</div>
                                    <p>优化体验</p>
                                </span>
                            </a>
                            <a onClick={this.showShareActionSheet.bind(this)}>
                                <img src={require(`@common/images/share.jpg`)} alt=""/>
                                <span>
                                    <div>我要分享</div>
                                    <p>最好的朋友</p>
                                </span>
                            </a>
                            <a onClick={()=>{
                                window.location.href="tel:13726686145"
                            }}>
                                <img src={require(`@common/images/client.jpg`)} alt=""/>
                                <span>
                                    <div>客户服务</div>
                                    <p>真诚100,愉快购物</p>
                                </span>
                            </a>
                            <a onClick={()=>{
                                this.goto('/my/community');
                            }}>
                                <img src={require(`@common/images/community.jpg`)} alt=""/>
                                <span>
                                    <div>榴莲社区</div>
                                    <p>吃货分享</p>
                                </span>
                            </a>
                            <a onClick={()=>{
                                this.goto('/my/school')
                            }}>
                                <img src={require(`@common/images/school.jpg`)} alt=""/>
                                <span>
                                    <div>榴莲学堂</div>
                                    <p>玩爆榴莲知识</p>
                                </span>
                            </a>
                        </div>
                    </div>
                    {/* <div className="my-section">
                        <a  className="item">账号管理</a>
                    </div>
                    <div className="my-section">
                        <a  className="item">退出</a>
                    </div> */}
                    {/* <div className="my-section">
                        <a className="item_noleft">榴莲社区</a>
                    </div> */}
                    {/* <WingBlank size="lg">
                        <Card>
                            <Card.Header
                                title="This is title"
                                thumb="https://gw.alipayobjects.com/zos/rmsportal/MRhHctKOineMbKAZslML.jpg"
                                extra={<span>this is extra</span>}
                            />
                            <Card.Body>
                                <div>This is content of `Card`</div>
                            </Card.Body>
                            <Card.Footer content="footer content" extra={<div>extra footer content</div>} />
                        </Card>
                        <WhiteSpace size="lg" />
                    </WingBlank> */}
                </div>
            </div>
        )
    }
}

export default connect(
    null,
    (dispatch)=>{
        return {
            router:bindActionCreators(routerAction,dispatch)
        }
    }
)(My)
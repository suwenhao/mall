import React, {Component} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import * as routerAction from '@actions/routerAction'
import {ActionSheet, Toast } from 'antd-mobile';
import MyHeaderWrap from '@components/My/My/MyHeaderWrap'
import MyOrder from '@components/My/My/MyOrder'
import Header from '@components/Header/Header'
import $ from 'jquery'
import {baseUrl,getToken,WeixinApi} from '@common/js/util.js'
import '@common/styles/my.scss'
import QRCode from 'qrcode'

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
            }))
        }
    }
    //跳转
    goto(path){
        this.props.history.push(path)
        this.props.router.changePath(path)
    }
    //弹起分享
    showShareActionSheet(){
        var self = this;
        ActionSheet.showShareActionSheetWithOptions({
          options: self.state.dataList,
          message: '我要分享',
        },
        (buttonIndex) => {
            self.setState({ clicked: buttonIndex > -1 ? self.state.dataList[buttonIndex].title : 'cancel' });
            if(self.state.dataList[buttonIndex].title==='朋友圈'){
                // also support Promise
                self.shareToTimeline(()=>{
                    $.ajax({
                        type:'post',
                        data:{
                            token:getToken(),
                            type:1,
                            monetory:'',
                            recommendId:''
                        },
                        url:baseUrl+'/share',
                        success(res){
                            Toast.info('分享成功',);
                        }
                    })
                    
                })
            }else if(self.state.dataList[buttonIndex].title==='微信好友'){
                
                self.shareToFriend(()=>{
                    $.ajax({
                        type:'post',
                        data:{
                            token:getToken(),
                            type:1,
                            monetory:'',
                            recommendId:''
                        },
                        url:baseUrl+'/share',
                        success(res){
                            Toast.info('分享成功',);
                        }
                    })
                })
            }
            
        });
    }
    //获取用户信息
    getUserInfo(){
        let that = this
        let params = {
            token:getToken()
        }
        $.ajax({
            type:'post',
            url:baseUrl+'/getfocusUserMessage',
            data:params,
            dataType:'json',
            success(res){
                console.log(res)
                res.data.balance=res.data.balance.toFixed(2)
                that.setState({
                    userInfo:res.data
                })
            },
            error(err){
                Toast.info('获取失败',1)
            }
        })
    }
    tip(){
        Toast.info("正在努力开发中",1)
    }
    codeImg(){
        let that = this
        QRCode.toDataURL('http://chaoliu.huibada.cn/mc-shopping/index.html?userId=12345').then(url => {
            that.setState({
                code:url
            })
        })
    }
    // 点击分享给好友
    shareToFriend(cb){
        let that = this
        WeixinApi.ready((Api)=>{
            // 微信分享的数据
            var wxData = {
                "imgUrl":that.state.code,
                "link":'http://chaoliu.huibada.cn/mc-shopping/index.html?userId=12345',
                "desc":'榴莲商城 新鲜水果网购',
                "title":"榴莲商城"
            };
            // 分享的回调
            var wxCallbacks = {
                // 分享操作开始之前
                ready:function () {
                    Toast.info("正在分享")
                },
                // 分享失败了
                fail:function (resp) {
                    Toast.info("网络出错",1)
                },
                // 分享成功
                confirm:function (resp) {
                    cb&&cb()
                },
            };
            // 点击分享给好友，会执行下面这个代码
            WeixinApi.shareToFriend(wxData, wxCallbacks);
        }) 
    }
    // 点击分享到朋友圈
    shareToTimeline(cb){
        let that = this
        WeixinApi.ready((Api)=>{
            // 微信分享的数据
            var wxData = {
                "imgUrl":that.state.code,
                "link":'http://chaoliu.huibada.cn/mc-shopping/index.html?userId=12345',
                "desc":'榴莲商城 新鲜水果网购',
                "title":"榴莲商城"
            };
            // 分享的回调
            var wxCallbacks = {
                // 分享操作开始之前
                ready:function () {
                    Toast.info("正在分享",1)
                },
                // 分享失败了
                fail:function (resp) {
                    Toast.info("网络出错",1)
                },
                // 分享成功
                confirm:function (resp) {
                    // 分享成功了，我们是不是可以做一些分享统计呢？
                    cb&&cb()
                },
            };
            // 点击分享到朋友圈
            WeixinApi.shareToTimeline(wxData, wxCallbacks);
        }) 
    }
    //挂载组件
    componentDidMount(){
        this.getUserInfo()
        this.codeImg()
    }
    render() {
        return (
            <div className="my-page">
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
                                    <p>进入浏览5</p>
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
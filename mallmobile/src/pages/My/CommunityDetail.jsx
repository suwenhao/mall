import React, { Component } from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import * as routerAction from '@actions/routerAction'
import {Toast} from 'antd-mobile'
import TextHeader from '@components/Header/TextHeader'
import Loading from '@base/Loading'
import $ from 'jquery'
import {baseUrl,getToken} from '@common/js/util.js'

import '@common/styles/community.scss'

class CommunityDetail extends Component {
    constructor(props){
        super(props)
        this.state={
            id:props.match.params.id,
            height:document.documentElement.clientHeight-92,
            loading:true,
            tip:false,
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
    //获取社区列表
    getCommunityDetail(){
        let that = this
        let params = {
            token:getToken()
        }
        this.setState({
            loading:false,
        })
    }
    //加载更多
    getRefresh(cb){

    }
    //挂载组件
    componentDidMount(){
        this.getCommunityDetail()
        this.resize()
    }
    render() {
        return (
        <div className="community-page community-detail">
            <TextHeader returnbtn={true} title="内容详情" pathname="/my/community"></TextHeader>
            <div className="community-main" style={{
                height:this.state.height,
                overflowY:'auto'
            }}>
                <div className="community-item">
                    <div className="community-header">
                        <div className="c-left">
                            <img src={require(`@common/images/avatar.jpg`)} alt=""/>
                            <span>流连忘返</span>
                        </div>
                        <div className="c-right">2018-07-31</div>
                    </div>
                    <div className="community-body">
                        <div className="ptext">榴莲是我最爱的水果，没有之一，很多国家的榴莲都吃过，唯一最好吃的就是马来西亚榴莲，独特的香味透出一丝丝香气，油而不腻是这种榴莲的特征。</div>
                        <div className="pictrues">
                            <div className="img-item">
                                <img src={
                                    require(`@common/images/test/u3169.jpg`)
                                } alt=""/>
                            </div>
                        </div>
                    </div>
                    <div className="c-footer">
                        <div className="all-comments">全部评论 <span>(4)</span></div>
                        <div className="comments-box">
                            <div className="comments-item">
                                <div className="left-avatar">
                                    <img src={require('@common/images/avatar.jpg')} alt=""/>
                                </div>
                                <div className="right-msg">
                                    <div className="r-m-t">
                                        <span className="nickname">一杯清水</span>
                                        <span className="time">2018-07-28</span>
                                    </div>
                                    <p>原来吃榴莲对身体这么多好处，怪不得榴莲这么贵</p>
                                </div>
                            </div>
                            <div className="comments-item">
                                <div className="left-avatar">
                                    <img src={require('@common/images/avatar.jpg')} alt=""/>
                                </div>
                                <div className="right-msg">
                                    <div className="r-m-t">
                                        <span className="nickname">一杯清水</span>
                                        <span className="time">2018-07-28</span>
                                    </div>
                                    <p>原来吃榴莲对身体这么多好处，怪不得榴莲这么贵。</p>
                                </div>
                            </div>
                            <div className="comments-item">
                                <div className="left-avatar">
                                    <img src={require('@common/images/avatar.jpg')} alt=""/>
                                </div>
                                <div className="right-msg">
                                    <div className="r-m-t">
                                        <span className="nickname">一杯清水</span>
                                        <span className="time">2018-07-28</span>
                                    </div>
                                    <p>原来吃榴莲对身体这么多好处，怪不得榴莲这么贵。</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="community-page-footer">
                <div className="cf-icon">
                    <img src={require(`@common/images/zan.png`)} alt=""/>
                    <span>12</span>
                </div>
                <div className="input">
                    <input type="text" placeholder="发表你的看法..."/>
                </div>
                <div className="btn">
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

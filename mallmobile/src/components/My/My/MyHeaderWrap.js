import React, { Component } from 'react'
import {Toast} from 'antd-mobile'

class MyHeaderWrap extends Component {
    tip(){
        Toast.info('正在努力开发中',1)
    }
    render(){
        return (
            <div className="my-header-wrap">
                <div className="my-header">
                    <div className="my-header-main">
                        <div className="my-header-avatar">
                            <div className="my-header-avatar-img">
                                <img src={this.props.userInfo.headimgurl} alt="avatar"/>
                            </div>
                        </div>
                        <div className="my-header-msg">
                            <div className="name">
                            {this.props.userInfo.nickName}
                            </div>
                            <div className="pin">
                            等级：1
                            </div>
                        </div>
                        <a 
                            onClick={()=>{
                                this.props.goto('/my/address');
                                sessionStorage.setItem('__search_prev_path__','/my')
                                sessionStorage.removeItem('__address_prev_path__')
                            }}
                            style={{
                                backgroundImage:'url('+require('@common/images/address.png')+')',
                                backgroundRepeat:'no-repeat',
                                backgroundPosition:'center left'
                            }}
                            className="setting">
                            地址管理
                        </a>
                        <a 
                            onClick={()=>{
                                this.tip()
                            }}
                            style={{
                                top:'42px',
                                backgroundImage:'url('+require('@common/images/msg.png')+')',
                                backgroundRepeat:'no-repeat',
                                backgroundPosition:'center left'
                            }}
                            className="setting">
                            消息
                        </a>
                    </div>
                    <div className="my-section">
                        <div className="my-assets">
                            <a onClick={()=>{
                                // this.props.goto('/my/purse');
                                // sessionStorage.setItem('__search_prev_path__','/my')
                            }}>
                                <img src={require('@common/images/all@withe.png')} alt=""/>
                                <span>我的钱包</span>
                            </a>
                            <a onClick={()=>{
                                // this.props.goto('/my/purse');
                                // sessionStorage.setItem('__search_prev_path__','/my')
                            }}>
                                <b>￥{this.props.userInfo.balance}</b>
                                <span>余额</span>
                            </a>
                            <a onClick={()=>{
                                this.props.goto('/my/integral');
                                sessionStorage.setItem('__search_prev_path__','/my')
                            }}>
                                <b>{this.props.userInfo.integral}</b>
                                <span>积分</span>
                            </a>
                            {/* <a onClick={()=>{
                                this.props.goto('/my/integral');
                            }}>
                                <b>87454.00</b>
                                <span>分享积分</span>
                            </a> */}
                            {/* <a >
                                <img src={require('@common/images/recharge.png')} alt=""/>
                                <span>充值</span>
                            </a>
                            <a >
                                <img src={require('@common/images/withdraw.png')} alt=""/>
                                <span>提现</span>
                            </a> */}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default MyHeaderWrap
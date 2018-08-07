import React, { Component } from 'react'
import {connect} from 'react-redux'
//antd-mobile
import {List,InputItem,WingBlank,WhiteSpace,Button} from 'antd-mobile'

import Logo from '@/components/Logo'
import handleChange from '@/components/handleChange'

//css
import '@common/styles/login.scss'

class Login extends Component {
    render(){
        return (
            <div className="login-page">
                <Logo></Logo>
                <WingBlank>
                    <List className="form">
                        <InputItem
                        clear
                        placeholder="输入用户名"
                        value={this.props.state.user} 
                        onChange={v=>this.props.handleChange('user',v)}>用户名</InputItem>
                        <InputItem
                        clear
                        type="password"
                        placeholder="输入密码"
                        value={this.props.state.pwd} 
                        onChange={v=>this.props.handleChange('pwd',v)}>密码</InputItem>
                    </List>
                    <WhiteSpace/>
                    <Button type="primary">登录</Button>
                    <WhiteSpace/>
                    <Button type="primary">注册</Button>
                </WingBlank>
            </div>
        )
    }
}

export default connect()(handleChange(Login))


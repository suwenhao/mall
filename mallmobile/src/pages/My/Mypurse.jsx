import React, { Component } from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import * as routerAction from '@actions/routerAction'
import { WingBlank, WhiteSpace,Button,Toast } from 'antd-mobile'
import TextHeader from '@components/Header/TextHeader'
import $ from 'jquery'
import {baseUrl,getToken} from '@common/js/util.js'

import '@common/styles/mypurse.scss'

class Mypurse extends Component {
  constructor(props){
    super(props)
    this.state={
      userInfo:{}
    }
  }
  //获取余额
  getPurse(){
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
    Toast.info('正在努力开发中',1)
  }
  //挂载组件
  componentDidMount(){
    this.getPurse()
  }
  render() {
    
    return (
      <div className="purse-page">
        <TextHeader returnbtn={true} title="我的钱包" pathname="/my" >
          <div className="integraldetail" style={{
            paddingRight: '10px',
            fontSize: '14px',
          }} onClick={()=>{
              this.props.history.push('/my/pursedetail')
              this.props.router.changePath('/my/pursedetail')
              sessionStorage.setItem('__search_prev_path__','/my/pursedetail')
            }}>零钱详细</div>
        </TextHeader>
        <div className="purse-main">
          <WingBlank>
            <WhiteSpace/>
            <WhiteSpace/>
            <div className="mypurse">
              <img src={require(`@common/images/purse.png`)} alt=""/>
              <WhiteSpace/>
              <WhiteSpace/>
              <div className="tip">我的零钱</div>
              <WhiteSpace/>
              <div className="price"><span>￥</span>{this.state.userInfo.balance}</div>
              <WhiteSpace/>
              <WhiteSpace/>
              <div>
                <WhiteSpace/>
                <Button type="primary" onClick={()=>{
                  this.tip()
                }}>充值</Button>
                <WhiteSpace/>
                <WhiteSpace/>
                <Button onClick={()=>{
                  this.tip()
                }}>提现</Button>
              </div>
            </div>
          </WingBlank>
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
)(Mypurse)

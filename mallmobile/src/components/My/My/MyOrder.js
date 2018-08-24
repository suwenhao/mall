import React, { Component } from 'react'
import {Modal} from 'antd-mobile'
import {withRouter} from 'react-router-dom'
import {Toast} from 'antd-mobile'
import $ from 'jquery'
import {baseUrl,imgUrl,getToken} from '@common/js/util'

class MyOrder extends Component {
  constructor(props){
      super(props)
      this.state={
          data:{
            comment:0,
            paid:0,
            received:0,
            shipped:0,
          }
      }
  }
  //获取订单类型数
  getOrderNum(){
    let that = this 
    $.ajax({
        type:'post',
        data:{
            token:getToken()
        },
        url:baseUrl+'/order/getOrders',
        success(res){
            console.log(res)
            if(res.code===0){
                that.setState({
                    data:res.data
                })
            }
        },
        error(err){
            Toast.info('获取订单类型数失败',1)
        }
    })
  }
  //跳转到订单列表
  gotoOrder(index){
    sessionStorage.setItem('__session_order__',index);
    this.props.history.push('/my/orderlist')
    sessionStorage.setItem('__search_prev_path__','/my')
  }
  //组件挂载
  componentDidMount(){
    this.getOrderNum()
  }
  render() {
    return (
        <div className="my-section">
            <div className="my-order">
                <a onClick={()=>{
                    this.gotoOrder(1)
                }}>
                    {
                        this.state.data.paid>0?
                        <i>{this.state.data.paid}</i>
                        :null
                    }
                    <img src={require('@common/images/unpay.png')} alt=""/>
                    <span>待付款</span>
                </a>
                <a onClick={()=>{
                    this.gotoOrder(2)
                }}>
                    {
                        this.state.data.shipped>0?
                        <i>{this.state.data.shipped}</i>
                        :null
                    }
                    <img src={require('@common/images/wait.png')} alt=""/>
                    <span>待发货</span>
                </a>
                <a onClick={()=>{
                    this.gotoOrder(3)
                }}>
                    {
                        this.state.data.received>0?
                        <i>{this.state.data.received}</i>
                        :null
                    }
                    <img src={require('@common/images/unrecieve.png')} alt=""/>
                    <span>待收货</span>
                </a>
                <a onClick={()=>{
                    this.gotoOrder(6)
                }}>
                    {
                        this.state.data.comment>0?
                        <i>{this.state.data.comment}</i>
                        :null
                    }
                    <img src={require('@common/images/assess.png')} alt=""/>
                    <span>待评价</span>
                </a>
                <a onClick={()=>{
                    Modal.alert('提示', '请与店家联系', [
                        { text: '确定', onPress: () => console.log('cancel'), style: 'default' }
                    ])
                }}>
                    <img src={require('@common/images/consult.png')} alt=""/>
                    <span>退货/售后</span>
                </a>
                <a  className="type-orders" onClick={()=>{
                    this.gotoOrder(0)
                }}>
                    <img src={require('@common/images/orders.png')} alt=""/>
                    <span>全部订单</span>
                </a>
            </div>
        </div>
    )
  }
}
export default withRouter(MyOrder)

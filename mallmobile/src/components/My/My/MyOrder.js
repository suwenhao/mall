import React, { Component } from 'react'
import {Modal} from 'antd-mobile'
import {withRouter} from 'react-router-dom'

class MyOrder extends Component {
  gotoOrder(index){
    sessionStorage.setItem('__session_order__',index);
    this.props.history.push('/my/orderlist')
    sessionStorage.setItem('__search_prev_path__','/my')
  }
  render() {
    return (
        <div className="my-section">
            <div className="my-order">
                <a onClick={()=>{
                    this.gotoOrder(1)
                }}>
                    <img src={require('@common/images/unpay.png')} alt=""/>
                    <span>待付款</span>
                </a>
                <a onClick={()=>{
                    this.gotoOrder(2)
                }}>
                    <img src={require('@common/images/wait.png')} alt=""/>
                    <span>待发货</span>
                </a>
                <a onClick={()=>{
                    this.gotoOrder(3)
                }}>
                    <img src={require('@common/images/unrecieve.png')} alt=""/>
                    <span>待收货</span>
                </a>
                <a onClick={()=>{
                    this.gotoOrder(6)
                }}>
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

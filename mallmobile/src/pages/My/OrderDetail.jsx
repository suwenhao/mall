import React, { Component } from 'react'
import {connect} from 'react-redux'
import { Button, Toast, Modal,WhiteSpace  } from 'antd-mobile'
import TextHeader from '@components/Header/TextHeader'
import $ from 'jquery'
import {baseUrl,imgUrl,getToken} from '@common/js/util.js'
import '@common/styles/orderdetail.scss'

class OrderDetail extends Component {
    constructor(props){
        super(props)
        this.state = {
            orderId:props.match.params.orderId||null,
            trackingTxt:'暂无物流信息'
        }
    }
    //获取订单详细
    getOrderInfo(cb){
        let that=this
        $.ajax({
            type:'post',
            data:{
                token:getToken(),
                orderId:this.state.orderId
            },
            url:baseUrl+'/order/detail',
            success(res){
                console.log(res)
                if(res.code == 0){
                    let totalPrice = 0;
                    res.data.data.orderItems.forEach(v=>{
                    totalPrice += (v.price * v.quantity)
                    })
                    res.data.data.totalPrice = totalPrice
                    that.setState({
                        order:res.data.data
                    })
                    //获取物流详细信息
                    if(res.data.data.trackingNo){
                        that.gettrackingNo(res.data.data)
                    }
                }else if(res.code==2){
                    Toast.info(res.message,1);
                }
                cb&&cb()
            }
        })
    }
    setShare(money){
        let storage=localStorage.getItem('__mall__userId__')
        if(storage){
            $.ajax({
                type:'post',
                data:{
                    token:getToken(),
                    type:3,
                    monetary:money,
                    recommendId:storage
                },
                url:baseUrl+'/point/share',
                success(res){
                  console.log('获取点击积分')
                }
            })
        }else{
            return;
        }
    }
    //支付
    payment(){
        let that = this;
        let reqType = 1;  //请求类型 1-订单 2-卡券 3-团购 4-充值 5-其他
        let params = {
            token: getToken(),
            totalFee: this.state.order.orderMoney,
            outTradeNo: this.state.orderId,
            reqType: reqType,
            body:''
        };
        $.ajax({
            type:'post',
            data:params,
            url:baseUrl+'/getWxPrepayId',
            dataType:'json',
            success(res){
                if(res.code == 0){
                    var data=res.data
                    try {
                        if(window.WeixinJSBridge){
                            window.WeixinJSBridge.invoke(
                                'getBrandWCPayRequest', {
                                    "appId":data.appId,     //公众号名称，由商户传入     
                                    "timeStamp":data.timeStamp,         //时间戳，自1970年以来的秒数     
                                    "nonceStr":data.nonceStr, //随机串     
                                    "package":data.package,     
                                    "signType":data.signType,         //微信签名方式：     
                                    "paySign":data.paySign //微信签名 
                                },
                                function(res){     
                                    if(res.err_msg == "get_brand_wcpay_request:ok" ) {
                                        Toast.info("支付成功",1);
                                        that.setShare(that.state.order.orderMoney)
                                        that.props.history.push('/my/orderlist')
                                    }else{
                                        that.props.history.push('/my/orderlist')
                                    }     // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。 
                                }
                            );
                        }
                    } catch (error) {
                        
                    }
                }
            }
        })
    }
    //删除按钮
    deleteBtns(item){
        if(item.orderStatus==4||item.orderStatus==7){
            return <Button type="warning" size="small" onClick={()=>{
            this.removeOrder(item)
                return false;
            }}>删除订单</Button>
        }else if(item.orderStatus==1){
            return <Button type="warning" size="small" onClick={()=>{
                this.cancelOrder(item)
                    return false;
                }}>取消订单</Button>
        }
    }
    //取消订单
    cancelOrder(item){
        var that=this;
        Modal.alert('提示', '是否取消该订单？', [
        { text: '取消', onPress: () => console.log('cancel'), style: 'default' },
        { text: '确认', onPress: () => {
            $.ajax({
                type:'post',
                data:{
                    token:getToken(),
                    orderId:item.orderId,
                    cancelReason:7
                },
                url:baseUrl+'/order/cancelOrder',
                success(res){
                    Toast.info("取消订单成功",1);
                    that.getOrderInfo()
                },
                error(err){
                    Toast.info('取消订单失败',1)
                }
            })
        } },
        ])
    }
    //删除订单
    removeOrder(item){
        console.log(item)
        var that=this;
        Modal.alert('提示', '是否删除该订单？', [
            { text: '取消', onPress: () => console.log('cancel'), style: 'default' },
            { text: '确认', onPress: () => {
            $.ajax({
                type:'post',
                data:{
                    token:getToken(),
                    orderId:parseInt(item.orderId),
                    cancelReason:7
                },
                url:baseUrl+'/order/delete',
                success(res){
                    Toast.info("删除订单成功",1);
                    that.props.history.push('/my/orderlist')
                },
                error(err){
                    Toast.info('删除订单失败',1)
                }
            })
            } },
        ])
  }
  // 确认收货
  completeOrder (item) {
    let that=this;
    Modal.alert('提示', '请确认您已经收到货物', [
      { text: '取消', onPress: () => console.log('cancel'), style: 'default' },
      { text: '确认', onPress: () => {
        $.ajax({
          type:'post',
          data:{
              token:getToken(),
              orderId:parseInt(item.orderId)
          },
          url:baseUrl+'/order/completeOrder',
          success(res){
            Toast.info("收货成功",1);
            that.getOrderInfo()
          }
        })
      } },
    ])
  }
  //立即评论
  gotoComment(item) {
    var that = this;
    that.props.history.push('/my/ordercomment/'+item.orderId)
  }
  //获取物流信息
  gettrackingNo(order){
    let that=this
    $.ajax({
        type:'post',
        data:{
            token:getToken(),
            com:order.expressCode,
            num:order.trackingNo
        },
        url:baseUrl+'/order/query',
        success(res){
            var taeckArr=JSON.parse(res.data.result).data;
            that.setState({
                trackingTxt:taeckArr?taeckArr[0].context.substring(0,6):'查询无结果'
            })
        }
    })
  }
  //挂载组件
  componentDidMount(){
    //初始化
    this.getOrderInfo()
  }
  render() {
    return (
      <div className="orderDetail-page">
        <TextHeader returnbtn={true} title="订单详情" pathname="/my/orderlist"></TextHeader>
        <div className="orderDetail-main">
            {
                this.state.orderId?
                <div className="orderDetail">
                    <div className="logistics">
                        <img className="wuliu" src={require(`@common/images/unrecieve.png`)} alt=""/>
                        {
                            this.state.order&&this.state.order.trackingNo
                            ?
                            <div className="info">
                                <div className="desc">
                                    {this.state.trackingTxt}
                                </div>
                                {/* <div>2018-06-17 17:03:13</div> */}
                            </div>
                            :
                            <div className="info">
                                {this.state.trackingTxt}
                            </div>
                        }
                        <img className="next" src={require(`@common/images/next.png`)} alt=""/>
                    </div>
                    <div className="section">
                        <div className="inner-line">
                            <span className="title">订单状态：</span>
                            <div className="content">{this.state.order&&this.state.order.orderStatusTxt}</div>
                        </div>
                        <div className="inner-line">
                            <span className="title">订单编号：</span>
                            <div className="content">{this.state.orderId}</div>
                        </div>
                        <div className="inner-line">
                            <span className="title">下单时间：</span>
                            <div className="content">{this.state.order&&this.state.order.orderTime}</div>
                        </div>
                    </div>
                    <div className="section-btn">
                        {
                            this.state.order&&(this.state.order.orderStatus==1||this.state.order.orderStatus==0)
                            ?
                            <Button type="primary" style={{
                                    background: '#f19325',
                                    borderColor: '#f19325'
                            }} size="small" onClick={()=>{
                            this.payment()
                            }}>支付订单</Button>
                            :null
                        }
                        {
                            this.state.order&&(this.state.order.orderStatus==2)
                            ?
                             null
                            :null
                        }
                        {
                            this.state.order&&(this.state.order.orderStatus==3)
                            ?
                            <Button type="primary" size="small" onClick={()=>{
                                this.completeOrder(this.state.order)
                            }}>确认收货</Button>
                            :null
                        }
                        {
                            this.state.order&&(this.state.order.orderStatus==6)
                            ?
                            <Button type="primary" size="small" style={{
                                    background: '#3884ff',
                                    borderColor: '#3884ff'
                            }} onClick={()=>{
                                this.gotoComment(this.state.order)
                            }}>评价</Button>
                            :null
                        }
                        <WhiteSpace/>
                        {
                            this.state.order?
                            this.deleteBtns(this.state.order)
                            :null
                        }
                    </div>
                    <div className="section section-top">
                        {/* <div className="inner-line">
                            <span className="title">商品金额：</span>
                            <div className="content">¥{this.state.order&&this.state.order.orderMoney.toFixed(2)}</div>
                        </div> */}
                        <div className="inner-line">
                            <span className="title">收货地址：</span>
                            <div className="content">{this.state.order&&this.state.order.address}</div>
                        </div>
                        <div className="inner-line">
                            <span className="title">收货人：</span>
                            <div className="content">{this.state.order&&this.state.order.consignee}</div>
                        </div>
                        {/* <div className="inner-line">
                            <span className="title">配送方式：</span>
                            <div className="content">京东快递</div>
                        </div> */}
                        <div className="order-goods">
                            {
                                this.state.order&&this.state.order.orderItems.map((item,i)=>{
                                    return (
                                        <div key={i} className="goods-item">
                                            <div className="goods-cover">
                                                <img src={imgUrl+item.thumbnail} alt={item.name}/>
                                            </div>
                                            <div className="goods-cont">
                                                <div className="goods-info">
                                                    <div className="info-desc">
                                                        <div className="goods-name">                              
                                                            {item.name}
                                                        </div>
                                                    </div>
                                                    <div className="info-price">
                                                        <p className="price">¥{item.price.toFixed(2)}</p>
                                                        <p className="count">x{item.quantity}</p>
                                                    </div>
                                                </div>
                                                <div style={{fontSize:'12px',color:'#888'}}>{item.sku}</div>
                                                <div className="goods-btns"></div>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                    <div className="order_total">
                        <ul>
                            <li>商品总额<span className="price">¥ {this.state.order&&this.state.order.totalPrice.toFixed(2)}</span></li>
                            <li>优惠金额<span className="price">- ¥ {this.state.order&&this.state.order.discountMoney.toFixed(2)}</span></li>
                            <li>运费<span className="price">+ ¥ {this.state.order&&this.state.order.freight.toFixed(2)}</span></li>
                        </ul> 
                        <p className="total">实付金额：<span>¥ {this.state.order&&(this.state.order.orderMoney+this.state.order.freight).toFixed(2)}</span></p>
                    </div>
                </div>
                :<div style={{padding:'10px',textAlign:'center'}}>缺少参数</div>
            }
        </div>
      </div>
    )
  }
}
export default connect()(OrderDetail)

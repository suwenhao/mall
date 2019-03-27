import React, { Component } from 'react'
import {connect} from 'react-redux'
import { Button, Toast, Picker, List, TextareaItem, Modal } from 'antd-mobile'
import TextHeader from '@components/Header/TextHeader'
import _ from 'underscore'
import $ from 'jquery'
import {baseUrl,getToken} from '@common/js/util.js'
import Loading from '@base/Loading'
import '@common/styles/orderdetail.scss'
import axios from 'axios'

class Order extends Component {
  constructor(props){
      super(props)
      this.state = {
        token:null,
        loading:true,
        orderInfo:null,
        addressList:[],
        orderId:null,
        addr:null,
        memo:'',
        freight:0,
        presetArr:[
          {
            label:'快递',
            value:1
          },{
            label:'送货上门',
            value:2
          },{
            label:'到店自提',
            value:3
          }
        ],
        index:1,
        coupons:[],
        coupon:null,
        couponIndex:0,
      }
  }
  //获取订单
  getOrderInfo(cb){
      let order = sessionStorage.getItem('goodDetailData')
      if(order===null){
          Toast.info("没有订单", 1);
          setTimeout(()=>{
            let prevPath = sessionStorage.getItem('__search_prev_path__')
            this.props.history.push(prevPath||'/')
          },2000)
          return;
      }
      order=JSON.parse(order);
      let num=0
      let allQuantity=0
      let wArr=[]
      order.items.forEach((ktem,k)=>{
        ktem.productPrice = parseFloat(ktem.productPrice);
        num = num + (ktem.productPrice * ktem.selectQuantity);
        var pickupWayArr = ktem.pickupWay.split(",");
        wArr=wArr.concat(pickupWayArr)
        allQuantity += ktem.selectQuantity
      })
      //合计
      order.totalPrice = num.toFixed(2)
      order.allQuantity = allQuantity
      order.idx = 1;//购买
      let uniqArr = _.uniq(wArr)
      let presetArr = ['快递', '送货上门', '到店自提'];

      let deliveryArr = uniqArr.map((jtem,j)=>{
        return {
          value:jtem*1,
          label:presetArr[jtem-1]
        }
      })
      order.uniqArr = uniqArr;
      order.pickupWayArr = wArr;
      order.deliveryArr = deliveryArr;
      order.deliveryInfo = deliveryArr[0];
      order.leaveMsg=""
      this.setState({
        orderInfo:order
      },()=>{
        cb&&cb()
      })
      console.log('--------订单--------')
      console.log(order)
  }
  //获取我的地址列表
  getAddressList(cb){
    (async ()=>{
      let params = { token: getToken()}
      let {data} = await axios.get(baseUrl+'/address/list',{params}).then(res=>res).catch( (error)=>{
        this.setState({
          loading:false
        })
      });
      console.log(data)
      this.setState({
        addressList:data.data.data,
        loading:false
      })
      cb && cb(data.data.data);
    })()
  }
  //获取运费
  getFreight(){
    let that = this
    let params = {}
    $.ajax({
      type:'get',
      data:params,
      url:baseUrl+'/publicFreight/getPublicFreight',
      success(res){
          console.log(res)
          if(res.code === 0){
            let publicFreight = res.data.publicFreight
            let totalPrice=that.state.orderInfo.totalPrice;
            let addrId = that.state.addr.provinceId
            if (addrId==="440000"){
              if (totalPrice > publicFreight.internalAmount){
                that.setState({
                  freight:0
                })
              }else{
                that.setState({
                  freight: publicFreight.insideFreight
                })
              }
            }else{
              if (totalPrice > publicFreight.outsourcedAmount) {
                that.setState({
                  freight: 0
                })
              }else{
                that.setState({
                  freight: publicFreight.outsideFreight
                })
              }
            }
          }else{
              Toast.info(res.message,1);
              this.setState({
                loading: false
              })
          }
      },
      error(){
        Toast.info('请求出错',1);
        this.setState({
          loading: false
        })
      }
    })
  }
  //设置显示的地址
  setAddress(cb){
    var that=this;
    var addr=this.props.location.query?this.props.location.query.addr:false;
    if (!addr){
        that.getAddressList((data)=>{
            let index = _.findIndex(data,(item)=>{
                return item.isDefault === true;
            })
            this.setState({
              addr:data[index]
            },()=>{
              cb&&cb()
            })
        });
    }else{
        var address = sessionStorage.getItem('address');
        if (address===null){
            that.getAddressList((data)=>{
                var index = _.findIndex(data, (item)=>{
                    return item.isDefault === true;
                })
                this.setState({
                  addr:data[index]
                },()=>{
                  cb&&cb()
                })
            });
        }else{
            that.getAddressList();
            this.setState({
              addr:JSON.parse(address)
            },()=>{
              cb&&cb()
            })
        }
    }
  }
  //选择运送
  bindPickerChange(val){
    console.log(val)
    let orderInfo = this.state.orderInfo
    orderInfo.deliveryInfo = orderInfo.deliveryArr.find(v=>{
      return v.value===val
    })
    this.setState({
      index: val,
      orderInfo
    })
  }
  //选择代金券
  bindPickerChange1(val){
    let coupons = this.state.coupons
    let coupon = coupons.find(v=>{
      return v.value===val
    })
    this.setState({
      couponIndex: val,
      coupons,
      coupon
    })
  }
  //提交订单
  clickAccount(){
      //确认订单
      var that = this;
      if (that.state.addressList.length < 1) {
          Toast.info("请选择送货地址",1);
          return false;
      }
      let cart={}
      let data=JSON.parse(sessionStorage.getItem('goodDetailData'))
      let grrs=[]
      data.items.forEach(item=>{
          grrs.push({
            productId:item.productId,
            skuId:item.skuId,
            quantity:item.selectQuantity
        })
      })
      cart={
        pickupWay:this.state.orderInfo.deliveryInfo.value,
        goods:grrs
      }
      let params = {
        token:getToken(),
        cartStr:JSON.stringify([cart]),
        payMethod:'1',
        receiverId:that.state.addr.id,
        memo:this.state.memo,
        couponId:this.state.coupon?this.state.coupon.id:''
      }
      $.ajax({
          type:'post',
          data:params,
          url:baseUrl+'/order/cartSettlement',
          success(res){
              console.log(res)
              if(res.code == 0){
                  let orderId = res.data.orderId;
                  let orderMoney = res.data.orderMoney;
                  that.setState({
                    orderId
                  })
                  that.payment(orderId,orderMoney);
              } else if(res.code == 2){
                  Toast.info(res.message,1);
              }
          
          },
          error(){
              Toast.info('下单失败',1);
          }
      })
  }
  //获取所有券
  getCouponList(cb){
    var that = this;
    var params = {
      token: getToken(),
      amount: this.state.orderInfo.totalPrice,
      isUsed:false
    };
    let url = baseUrl + '/coupon/list'
    $.ajax({
      type:'get',
      dataType:'json',
      data:params,
      url:url,
      success(res){
        if(res.code===0){
          if (res.data.data){
            var newData = res.data.data.map((v, i) => {
              return {
                ...v,
                label: v.title,
                value: i
              }
            });
          }else{
            var newData = [];
          }
          that.setState({
            coupons: newData,
            couponIndex: newData.length-1,
            coupon: newData.length > 0 ? newData[newData.length - 1]:null
          },()=>{
            cb&&cb()
          })
        }else{
          Toast.info('获取失败',1)
        }
      },
      error(err){
        Toast.info('请求出错',1)
      }
    })
  }
  //获取购买分享积分
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
  payment(orderId,orderMoney){
      var that = this;
      var reqType = 1;  
      var params = {
          token: getToken(),
          totalFee: orderMoney,
          outTradeNo: orderId,
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
                  console.log(res)
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
                                  that.setShare(orderMoney)
                                  that.props.history.push('/my/orderdetail/'+orderId)
                              }else{
                                that.props.history.push('/my/orderdetail/'+orderId)
                              } // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。 
                          }
                      );
                    }
                  } catch (error) {
                      
                  }
              }
          }
    })
  }
  componentDidMount(){
    this.getOrderInfo(()=>{
      this.setAddress(()=>{
        this.getFreight()
      });
      this.getCouponList();
    });
    console.log(this.props)
  }
  render() {
    //处理跳转到我的地址页面选择地址返回时，无法返回到商品页的问题
    let orderPrevPath=sessionStorage.getItem('__order_prev_path__');
    if(orderPrevPath){
      sessionStorage.setItem('__search_prev_path__',orderPrevPath)
    }
    let prevPath = sessionStorage.getItem('__search_prev_path__')
    return (
      <div className="orderDetail-page">
        <TextHeader callback={(back)=>{
          if(this.state.orderId){
            Modal.alert('提示', '是否取消该订单？', [
              { text: '取消', onPress: () => console.log('cancel'), style: 'default' },
              { text: '确认', onPress: () => {
                $.ajax({
                    type:'post',
                    data:{
                        token:getToken(),
                        orderId:this.state.orderId
                    },
                    url:baseUrl+'/order/delete',
                    success(res){
                      back()
                    }
                })
              }},
            ]);
          }else{
            back()
          }
        }} returnbtn={true} title="订单支付" pathname={prevPath||'/'}></TextHeader>
        {
          this.state.loading?
        <Loading/>
          :
        <div className="orderDetail-main">
            {
                this.state.orderInfo?
                <div className="orderDetail">
                    <div className="logistics" onClick={()=>{
                      this.props.history.push('/my/address')
                      sessionStorage.setItem('__order_prev_path__',prevPath)
                      sessionStorage.setItem('__address_prev_path__','/order')
                      sessionStorage.setItem('__search_prev_path__','/order')
                    }}>
                        <img className="wuliu" src={require(`@common/images/address-b.svg`)} alt=""/>
                        {
                          this.state.addressList.length>0?
                          <div className="info">
                              <div>{this.state.addr&&this.state.addr.consignee} {this.state.addr&&this.state.addr.phone}</div>
                              <div className="desc">
                                {this.state.addr&&this.state.addr.provinceName}
                                {this.state.addr&&this.state.addr.cityName}
                                {this.state.addr&&this.state.addr.countyName}
                                {this.state.addr&&this.state.addr.address}
                                &nbsp;
                                
                              </div>
                              {
                                  this.state.addr&&this.state.addr.isDefault
                                  ?
                                  <div style={{color:'red'}}>默认</div>
                                  :null
                              }
                          </div>
                          :
                          <div className="info">
                            <div>请选择收货地址</div>
                          </div>
                        }
                        <img className="next" src={require(`@common/images/next.png`)} alt=""/>
                    </div>
                    <div className="section section-top">
                        <div className="inner-line">
                            <span className="title">已选商品</span>
                        </div>
                        <div className="order-goods">
                          {
                            this.state.orderInfo&&this.state.orderInfo.items?
                            this.state.orderInfo.items.map((item,i)=>{
                              return (
                                <div key={i} className="goods-item">
                                  <div className="goods-cover">
                                      <img src={item.productImage} alt={item.productName}/>
                                  </div>
                                  <div className="goods-cont">
                                      <div className="goods-info">
                                          <div className="info-desc">
                                              <div className="goods-name">                              
                                                  {item.productName}
                                              </div>
                                          </div>
                                          <div className="info-price">
                                              <p className="price">{item.productPrice.toFixed(2)}</p>
                                              <p className="count">x{item.selectQuantity}</p>
                                          </div>
                                      </div>
                                      <div className="goods-sku">
                                        {item.skuStr}
                                      </div>
                                      <div className="goods-btns"></div>
                                  </div>
                              </div>
                              )
                            })
                            :null
                          }
                        </div>
                    </div>
                    <div className="section-top">
                      <List>
                        <Picker 
                          data={this.state.orderInfo&&this.state.orderInfo.deliveryArr} 
                          value={[this.state.index]} 
                          cols={1} 
                          className="forss" 
                          onOk={(val)=>{
                            this.bindPickerChange(val[0]);
                          }}
                        >
                          <List.Item><span style={{fontSize:'14px'}}>运送方式</span></List.Item>
                        </Picker>
                        {
                          this.state.coupons.length<1?
                          <List.Item className='listitem'><span style={{fontSize:'14px'}}>代金券</span><span style={{fontSize:'14px','color':'#888'}}>无代金券</span></List.Item>
                          :
                          <Picker
                            data={this.state.coupons}
                            value={[this.state.couponIndex]} 
                            cols={1} 
                            className="forss"
                            onOk={(val)=>{
                              console.log(val)
                              this.bindPickerChange1(val[0]);
                            }}
                          >
                            <List.Item><span style={{fontSize:'14px'}}>代金券</span></List.Item>
                          </Picker>
                        }
                        <div style={{padding:'15px 0',margin:'0 15px',borderBottom:'1px solid #eee'}}>
                          {
                            this.state.coupon?
                            <div class='coupon' style={{color:'#ff5b05'}}>
                              <div>优惠￥{this.state.coupon.faceValue}</div>
                              <div>订单满{this.state.coupon.useCondition}元使用</div>
                            </div>
                            :
                            <div class='nocoupon'>暂无优惠</div>
                          }
                        </div>
                        <TextareaItem
                          title="留言"
                          placeholder="输入留言"
                          rows={3}
                          value={this.state.memo}
                          onChange={(val)=>{
                            this.setState({
                              memo:val
                            })
                          }}
                          autoHeight
                        />
                      </List>
                    </div>
                    <div className="order_total">
                        <ul>
                            <li>商品金额<span className="price">¥ {this.state.orderInfo&&this.state.orderInfo.totalPrice}</span></li>
                            <li>代金券<span className="price">- ¥ {this.state.coupon?this.state.coupon.faceValue.toFixed(2):'0.00'}</span></li>
                            <li>运费<span className="price">+ ¥ {this.state.freight.toFixed(2)}</span></li>
                        </ul> 
                        <p className="total">总价：<span>¥ {this.state.orderInfo&&(this.state.orderInfo.totalPrice-(this.state.coupon?this.state.coupon.faceValue:0.00)+this.state.freight).toFixed(2)}</span></p>
                    </div>
                    <div className="section">
                      <Button type="primary" onClick={()=>{
                        this.clickAccount()
                      }}>在线支付</Button>
                    </div>
                </div>
                :<div style={{padding:'10px',textAlign:'center'}}>缺少参数</div>
            }
        </div>
        }
      </div>
    )
  }
}
export default connect()(Order)
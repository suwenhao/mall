import React, { Component } from 'react'
import {connect} from 'react-redux'
import { Tabs, SearchBar, SwipeAction, PullToRefresh, Toast, Modal } from 'antd-mobile'
import Header from '@components/Header/Header'
import Loading from '@base/Loading'
import axios from 'axios'
import $ from 'jquery'
import {baseUrl,imgUrl,getToken} from '@common/js/util.js'

import '@common/styles/orderlist.scss'

class Orderlist extends Component {
  constructor(props){
    super(props)
    let tabs = [
      { title: '全部', sub: 0 },
      { title: '待付款', sub: 1 },
      { title: '待发货', sub: 2 },
      { title: '待收货', sub: 3 },
      // { title: '已取消', sub: 4 },
      { title: '待评价', sub: 6 },
      { title: '已完成', sub: 7 },
    ]
    var orderIndex=sessionStorage.getItem('__session_order__');
    let currentIndex=tabs.findIndex((v)=>{
      return v.sub==orderIndex
    })
    this.state={
      orderIndex:currentIndex,
      tabs:tabs,
      val:'',
      down:false,
      height: document.documentElement.clientHeight-134,
      list:[],
      status:orderIndex!==null?parseInt(orderIndex,10):0,
      pageNumber:1,
      pageSize:10,
      totalPages:1,
      loading:true,
      orderTip:false,
      refreshing:true
    }
  }
  //获取订单列表
  getOrderList(cb){
    (async ()=>{
      let params = {
        token:getToken(),
        pageNumber:this.state.pageNumber,
        pageSize:this.state.pageSize,
        status:this.state.status
      }
      let {data} = await axios.get(baseUrl+'/order/list',{params}).then(res=>res)
      console.log(data)
      let list = data.data.data;
      //获取物流信息
      list.forEach((item,i)=>{
        if(item.trackingno){
          $.ajax({
            type:'post',
            data:{
                token:getToken(),
                com:item.expressCode,
                num:item.trackingno
            },
            async:false,
            url:baseUrl+'/order/query',
            success(res){
                let taeckArr=JSON.parse(res.data.result).data;
                item.trackingTxt = taeckArr?taeckArr[0].context.substring(0,6):'查询无结果'
            }
          })
        }
      })
      this.setState({
        list:list,
        loading:false,
        pageNumber:this.state.pageNumber+1,
        pageSize:10,
        orderTip:data.data.data.length>0?false:true,
        totalPages:data.data.totalPages
      },()=>{
        cb&&cb()
      })
    })()
  }
  //切换tab
  changeStatus(tab,index){
    this.setState({
      orderIndex:index,
      status:tab.sub,
      loading:true,
      orderTip:false,
      list:[],
      pageNumber:1,
      pageSize:10,
      refreshing:false
    },()=>{
      this.getOrderList()
    })
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
              that.setState({
                list:[],
                loading:true,
                pageNumber:1,
                pageSize:10,
                totalPages:1,
                refreshing: false
              },()=>{
                that.getOrderList()
              })
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
            that.setState({
              list:[],
              loading:true,
              pageNumber:1,
              pageSize:10,
              totalPages:1,
              refreshing: false
            },()=>{
              that.getOrderList()
            })
          }
        })
      } },
    ])
  }
  //加载更多
  getRefresh(cb){
    if(this.state.pageNumber>this.state.totalPages){
      this.setState({ refreshing: false });
      return;
    }else{
      (async ()=>{
        let params = {
          token:getToken(),
          pageNumber:this.state.pageNumber,
          pageSize:this.state.pageSize,
          status:this.state.status
        }
        let {data} = await axios.get(baseUrl+'/order/list',{params}).then(res=>res)
        let list = data.data.data;
        //获取物流信息
        list.forEach((item,i)=>{
          if(item.trackingno){
            $.ajax({
              type:'post',
              data:{
                  token:getToken(),
                  com:item.expressCode,
                  num:item.trackingno
              },
              async:false,
              url:baseUrl+'/order/query',
              success(res){
                  let taeckArr=JSON.parse(res.data.result).data;
                  item.trackingTxt = taeckArr?taeckArr[0].context.substring(0,6):'查询无结果'
              }
            })
          }
        })
        let newData=this.state.list.concat(list)
        this.setState({
          list:newData,
          loading:false,
          pageNumber:this.state.pageNumber+1,
          pageSize:10,
          orderTip:newData.length>0?false:true,
          totalPages:data.data.totalPages,
          refreshing: false 
        },()=>{
          cb&&cb()
        })
      })()
    }
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
  payment(item){
    let that = this;
    let reqType = 1;  //请求类型 1-订单 2-卡券 3-团购 4-充值 5-其他
    let params = {
        token: getToken(),
        totalFee: item.orderMoney,
        outTradeNo: item.orderId,
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
                                    that.getOrderList()
                                    that.setShare(item.orderMoney)
                                    window.location.reload()
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
    if(item.orderStatus===4||item.orderStatus===7){
      return [{
        text: '删除',
        onPress: () =>{
          this.removeOrder(item)
          return false;
        },
        style: { backgroundColor: '#F4333C', color: 'white' },
      }]
    }else if(item.orderStatus===1){
      return [{
        text: '取消',
        onPress: () =>{
          this.cancelOrder(item)
          return false;
        },
        style: { backgroundColor: '#FFAC1D', color: 'white' },
      }]
    }
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
            that.setState({
              list:[],
              loading:true,
              pageNumber:1,
              pageSize:10,
              totalPages:1,
              refreshing: false
            },()=>{
              that.getOrderList()
            })
          }
        })
      } },
    ])
  }
  //立即评论
  gotoComment(item) {
    var that = this;
    console.log(item)
    that.props.history.push('/my/ordercomment/'+item.orderId)
  }
  //跳转到物流
  gotoTrack(item){
    console.log(item)
    if(item.trackingno){
      this.props.history.push('/my/logistics');
      sessionStorage.setItem('__logistics__',JSON.stringify({
        com:item.expressCode,
        num:item.trackingno,
        orderId:item.orderId,
        name:item.expressName
      }))
    }
  }
  //挂载组件
  componentDidMount(){
    this.getOrderList()
  }
  
  render() {
    return (
      <div className="order-page">
        <Header returnbtn={true} title="我的订单" pathname="/my"></Header>
        <div className="order-main">
          <div className="search-box">
            {
              this.state.val.length>0?
              null
              :
              <span style={{width:'7px',display:'block','height':'34px'}}></span>
            }
            
            <div>
              <SearchBar
              value={this.state.val}
              ref="search" 
              focus={true}
              showCancelButton 
              cancelText={" "}
              onSubmit={()=>{
                
              }}
              onChange={(val)=>{
                this.setState({val})
              }}
              placeholder="商品名称/商品编号/订单号"></SearchBar>
            </div>
            {
              this.state.val.length>0?
              <button>搜索</button>
              :null
            }
          </div>
          
          <Tabs tabs={this.state.tabs}
              initialPage={this.state.orderIndex}
              tabBarPosition="top"
              swipeable={false}
              renderTab={tab => <span>{tab.title}</span>}
              onChange={(tab, index) => {
                sessionStorage.setItem('__session_order__',tab.sub)
                this.changeStatus(tab,index)
              }}
            >
              <PullToRefresh
                damping={60}
                ref={el => this.ptr = el}
                style={{
                  height: this.state.height,
                  overflow: 'auto',
                }}
                indicator={this.state.down ? {} : { deactivate: '上拉加载' }}
                direction={this.state.down ? 'down' : 'up'}
                refreshing={this.state.refreshing}
                onRefresh={() => {
                  this.setState({ refreshing: true },()=>{
                    this.getRefresh()
                  });
                }}
              >
                {
                  this.state.loading?
                  <Loading/>
                  :null
                }
                <div className="order-div"  style={{
                  height: this.state.list.length>0?'auto':this.state.height-300
                }}>
                  {
                    this.state.list.length>0?
                    this.state.list.map((item,i)=>{
                      return (
                        <SwipeAction
                          key={i}
                          autoClose={true}
                          style={{ backgroundColor: '#f5f5f9',paddingBottom:'10px' }}
                          right={this.deleteBtns(item)}
                          onOpen={() => console.log('global open')}
                          onClose={() => {
                            console.log('global close')
                            return false;
                          }}
                        >
                        <div className="order-item">
                          <div className="order-id">
                            <span className="label">订单号：</span>
                            {item.orderId} 
                          </div>
                          <div className="order-id" onClick={()=>{
                              this.gotoTrack(item)
                            }}>
                            <span className="label">物&nbsp;&nbsp;&nbsp;&nbsp;流：</span>
                            {item.trackingno?item.trackingTxt:'暂无物流信息'} 
                          </div>
                          <div className="order-state">
                            <div className="o-left">
                              <div className="state">
                                <span>状&nbsp;&nbsp;&nbsp;&nbsp;态：</span>
                                <span>{item.orderStatusTxt}</span>
                              </div>
                              <div className="price">
                                <span>总&nbsp;&nbsp;&nbsp;&nbsp;价：</span>
                                <span>￥{item.orderMoney.toFixed(2)}</span>
                              </div>
                            </div>
                            <div className="o-right">
                              {
                                item.orderStatus===1||item.orderStatus===0?
                                  <button style={{
                                    background: '#f19325'
                                  }} onClick={()=>{
                                    this.payment(item)
                                  }}>支付</button>
                                :
                                null
                              }
                              {
                                item.orderStatus===2?
                                  null
                                :
                                null
                              }
                              {
                                item.orderStatus===3?
                                  <button onClick={()=>{
                                    this.completeOrder(item)
                                  }}>确认收货</button>
                                :
                                null
                              }
                              {
                                item.orderStatus===6?
                                  <button style={{
                                    background: '#3884ff'
                                  }} onClick={()=>{
                                    this.gotoComment(item)
                                  }}>评价</button>
                                :
                                null
                              }
                            </div>
                          </div>
                          <div className="order-list" onClick={()=>{
                            this.props.history.push({
                              pathname:'/my/orderdetail/'+item.orderId
                            })
                          }}>
                            {
                                item.orderItems.map((jtem,j)=>{
                                  return (
                                    <div key={j} className="order-goods">
                                      <img src={imgUrl+jtem.thumbnail} alt=""/>
                                      <div className="right">
                                        <div className="title">{jtem.name}</div>
                                        <div className="piece">
                                          <span>￥{jtem.price.toFixed(2)}</span>
                                          <span>{jtem.quantity}件</span>
                                        </div>
                                        <div className="sku">{jtem.sku}</div>
                                      </div>
                                    </div>
                                  )
                                })
                            }
                          </div>
                        </div>
                        </SwipeAction>
                      )
                    })
                    :
                    this.state.orderTip?
                    <div className="order-tip">暂无订单</div>
                    :null
                  }
                </div>
              </PullToRefresh>
            </Tabs>
        </div>
      </div>
    )
  }
}
export default connect()(Orderlist)

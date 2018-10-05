import React, { Component } from 'react'
//头部组件
import TextHeader from '@components/Header/TextHeader'
//引入redux
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import * as routerAction from '@actions/routerAction'
//antd-mobile组件
import { Tabs, Toast } from 'antd-mobile'
//classnames
import classnames from 'classnames'
import Loading from '@base/Loading'
import {baseUrl,imgUrl,getToken} from '@common/js/util.js'
import '@common/styles/coupon.scss'
import $ from 'jquery'


class Coupon extends Component {
  constructor(props){
    super(props)
    this.state={
      currentTab:0,
      height:document.documentElement.clientHeight-90,
      tabs:[
        { title: '未使用', sub: 0 },
        { title: '已使用', sub: 1 }
      ],
      loading:true,
      tip:false,
      list: [],
    }
  }
  //内容适应窗口
  resize(){
    let self =this;
    $(window).on('resize',()=>{
        self.setState({
            height:document.documentElement.clientHeight-90
        })
    })
  }
  //获取代金券
  getCouponList(){
    let that = this
    this.setState({
      loading: true,
      list:[],
      tip:false,
    })
    let params = {
      token: getToken(),
      amount: '',
      isUsed: this.state.currentTab===0?false:true,
    }
    let url = baseUrl + '/coupon/list'

    $.ajax({
      type:'get',
      dataType:'json',
      data:params,
      url:url,
      success(res){
        if (res.code === 0) {
          if (res.data.data){
            setTimeout(() => {
              that.setState({
                list: res.data.data,
                tip: res.data.data.length < 1 ? true : false,
                loading: false,
              })
            }, 500)
          }else{
            setTimeout(() => {
              that.setState({
                list:[],
                tip: true,
                loading: false,
              })
            }, 500)
          }
        } else {
          Toast.info('获取失败',1)
        }
      },
      error(err){
        Toast.info('请求出错',1)
      }
    })
  }
  //tab栏滑动切换
  switchTab(tab, index) {
    this.setState({
      currentTab: index
    }, () => {
      this.getCouponList()
    });
  }
  componentDidMount(){
    this.resize()
    this.getCouponList()
  }
  render() {
    return (
      <div className="coupon-page">
        <TextHeader returnbtn={true} title="代金券" pathname="/my"></TextHeader>
        <div className='coupon-main'>
          <Tabs
            tabs={this.state.tabs}
            page={this.state.currentTab}
            tabBarPosition="top"
            renderTab={tab => <span>{tab.title}</span>}
            onChange={(tab, index) => {
              this.switchTab(tab, index)
            }}
            swipeable={true}
          >
            <div className="coupon-div" style={{height:this.state.height}}>
              {
                this.state.list.map((item,i)=>{
                  return (
                    <div key={i} className={classnames({
                        stamp:true,
                        stamp01:this.state.currentTab===0?true:false,
                        stamp02:this.state.currentTab===1?true:false,
                    })}>
                      <div className="par">
                        <div className='p'>{item.title}</div>
                        <div className='span'>￥{item.faceValue}</div>
                        <div className='p'>订单满{item.useCondition}元使用</div>
                      </div>
                      <div className="copy">
                        <div className='p'>{this.state.currentTab===0?'未使用':'已使用'}</div>
                      </div>
                      <div className='i'></div>
                    </div>
                  )
                })
              }
              {
                this.state.loading?
                <Loading />
                :null
              }
              {
                this.state.tip?
                <div class='nodata'>暂无代金券</div>
                :null
              }
            </div>
            
          </Tabs>
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
)(Coupon)
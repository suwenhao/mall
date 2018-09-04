import React, { Component } from 'react'
//引入redux
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import * as routerAction from '@actions/routerAction'
import {Toast,PullToRefresh} from 'antd-mobile'
//引入头部
import TextHeader from '@components/Header/TextHeader'
import Loading from '@base/Loading'
import {baseUrl,getToken,formatDate} from '@common/js/util.js'
import $ from 'jquery'

import '@common/styles/integral.scss'

class Integral extends Component {
  constructor(props){
    super(props)
    this.state={
      userInfo:{},
      refreshing:false,
      down:false,
      height:document.documentElement.clientHeight-118,
      list:[],
      pageNumber:1,
      pageSize:10,
      loading:true,
      totalPage:1,
      tip:false,
    }
  }
  //内容适应窗口
  resize(){
      let self =this;
      $(window).on('resize',()=>{
          self.setState({
              height:document.documentElement.clientHeight-118
          })
      })
  }
  //获取列表
  getPurseInfo(){
      let that = this
      let params = {
          token:getToken(),
          pageNumber:this.state.pageNumber,
          pageSize:this.state.pageSize,
      }
      $.ajax({
          type:'get',
          url:baseUrl+'/point/list',
          data:params,
          dataType:'json',
          success(res){
              if(res.code===0){
                res.data.rows=res.data.rows.map(v=>{
                    v.id=v.id+''
                    let y=v.id.substring(0,2);
                    let m=v.id.substring(2,4);
                    let d=v.id.substring(4,6);
                    return {
                        ...v,
                        time:'20'+y+'-'+m+'-'+d
                    }
                })
                  that.setState({
                      list:res.data.rows,
                      totalPage:res.data.totalPage,
                      loading:false,
                      pageNumber:that.state.pageNumber+1,
                      pageSize:10,
                      tip:res.data.rows.length>0?false:true,
                  })
              }else{
                  Toast.info('获取失败',1)
              }
          },
          error(err){
              Toast.info('获取失败',1)
          }
      })
  }
  //加载更多
  getRefresh(cb){
      let that=this
      console.log()
      if(this.state.pageNumber>this.state.totalPage){
          this.setState({ refreshing: false });
          return;
      }else{
          let params = {
              token:getToken(),
              pageNumber:this.state.pageNumber,
              pageSize:this.state.pageSize
          }
          $.ajax({
              type:'get',
              url:baseUrl+'/point/list',
              data:params,
              dataType:'json',
              success(res){
                  if(res.code===0){
                    res.data.rows=res.data.rows.map(v=>{
                        v.id=v.id+''
                        let y=v.id.substring(0,2);
                        let m=v.id.substring(2,4);
                        let d=v.id.substring(4,6);
                        return {
                            ...v,
                            time:'20'+y+'-'+m+'-'+d
                        }
                    })
                      let newData=that.state.list.concat(res.data.rows)
                      that.setState({
                          list:newData,
                          loading:false,
                          pageNumber:that.state.pageNumber+1,
                          pageSize:10,
                          tip:newData.length>0?false:true,
                          totalPage:res.data.totalPage,
                          refreshing: false 
                      },()=>{
                          cb&&cb()
                      })
                  }else{
                      Toast.info('获取失败',1)
                  }
              },
              error(err){
                  Toast.info('获取失败',1)
              }
          })
      }
  }
  //获取积分
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
            that.setState({
                userInfo:res.data
            })
        },
        error(err){
            Toast.info('获取失败',1)
        }
    })
  }
  componentDidMount(){
    this.getPurseInfo()
    this.resize()
    this.getPurse()
  }
  render() {
    return (
      <div className="integral-page">
        <TextHeader returnbtn={true} title="我的积分" pathname="/my"></TextHeader>
        <div className="integral-main">
          <div className="integral-wrap">
            {this.state.userInfo.integral} <span>积分</span>
          </div>
          <div>
          <PullToRefresh
              damping={60}
              style={{
                  height: this.state.height,
                  overflow: 'auto',
                  backgroundColor:'#fff'
              }}
              indicator={this.state.down ? {} : { deactivate: '上拉加载' }}
              direction={this.state.down ? 'down' : 'up'}
              refreshing={this.state.refreshing}
              onRefresh={() => {
                  this.setState({ refreshing: true });
                  //上拉加载
                  this.getRefresh()
              }}
          >
              {
                  this.state.loading?
                  <Loading/>
                  :null
              }
              {
                  this.state.list.length>0?
                  this.state.list.map((item,i)=>{
                      return (
                          <div key={i} className="integral-item">
                              <div className="i-left">
                                  <h2>{
                                      item.type===1?
                                      '分享好友加积分'
                                      :
                                      item.type===2?
                                      '分享好友加积分'
                                      :
                                      item.type===3?
                                      '好友购买加积分'
                                      :
                                      '消费积分'
                                  }
                                  </h2>
                                  <div>{item.time}</div>
                              </div>
                              <div className="i-right red">
                                    {
                                        item.type===1||item.type===2||item.type===3?
                                        '+'
                                        :
                                        '-'
                                    }
                                    {item.amount}
                              </div>
                          </div>
                      )
                  })
                  :
                  this.state.tip?
                  <div className="order-tip">暂无列表</div>
                  :null
              }
          </PullToRefresh>
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
)(Integral)

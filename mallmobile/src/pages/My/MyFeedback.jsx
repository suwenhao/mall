import React, { Component } from 'react'
import {connect} from 'react-redux'
import TextHeader from '@components/Header/TextHeader'
import {Toast,PullToRefresh} from 'antd-mobile'
import Loading from '@base/Loading'
import $ from 'jquery'
import {baseUrl,getToken,formatDate} from '@common/js/util.js'

import '@common/styles/myfeedback.scss'

class MyFeedback extends Component {
  constructor(props){
      super(props)
      this.state={
          refreshing:false,
          down:false,
          height:document.documentElement.clientHeight-46,
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
              height:document.documentElement.clientHeight-46
          })
      })
  }
  //获取列表
  getFeedbackList(){
      let that = this
      let params = {
          token:getToken(),
          pageNumber:this.state.pageNumber,
          pageSize:this.state.pageSize,
      }
      $.ajax({
          type:'get',
          url:baseUrl+'/feedback/list',
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
              url:baseUrl+'/feedback/list',
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
  //挂载组件
  componentDidMount(){
      this.getFeedbackList()
      this.resize()
  }
  render() {
    return (
      <div className="myfeedback-page">
        <TextHeader returnbtn={true} title="我的反馈" pathname="/my/helpback">
        </TextHeader>
        <div className="myfeedback-main">
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
                    <div key={i} className="myfeedback-item">
                      <button>
                      {
                        item.type===1?
                        '功能异常'
                        :item.type===2?
                        '产品建议'
                        :'其他'
                      }
                      </button>
                      <div className="body" dangerouslySetInnerHTML = {{ __html:item.content!==""?item.content:"暂无反馈内容" }}>
                          
                      </div>
                      <div className="time">{item.time}</div>
                  </div>
                  )
              })
              :
              this.state.tip?
              <div className="order-tip">暂无数据</div>
              :null
            }
        </PullToRefresh>
        </div>
      </div>
    )
  }
}
export default connect()(MyFeedback)

import React, { Component } from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import * as routerAction from '@actions/routerAction'
import SearchHead from '@components/Header/SearchHead'
import '@common/styles/search.scss'
import {Modal,Toast} from 'antd-mobile'
import _ from 'underscore'
import Tag from '@base/Tag/index.js'

class Search extends Component {
  constructor(props){
    super(props);
    this.state={
      history:JSON.parse(localStorage.getItem('history'))||[],
      searchHot:['rec','电脑','照片扫描仪','智能手表','功夫茶杯','广角镜头手机'],
      searchList:[]
    }
    console.log(this.props)
  }
  //跳转到搜索结果列表
  gotoList(v){
    if(v){
      var newHistory=[...this.state.history,v];
    }else{
      var newHistory=[...this.state.history];
    }

    localStorage.setItem('history',JSON.stringify( _.uniq(newHistory)))
    sessionStorage.setItem('__search_prev_path__',this.props.location.pathname)
    this.props.history.push('/searchlist/'+v)
    this.props.router.changePath('/searchlist/'+v)
  }
  //清空最近搜索
  removeHistory(){
    let that=this;
    Modal.alert('提示', '是否清空最近搜索？', [
        { text: '取消', onPress: () => console.log('cancel'), style: 'default' },
        { text: '确认', onPress: () => {
          localStorage.removeItem('history')
          that.setState({
            history:JSON.parse(localStorage.getItem('history'))||[]
          })
        } },
    ])
  }
  //挂载组件
  componentDidMount(){
    sessionStorage.removeItem('__cateId__')
  }
  render() {
    let querystring=this.props.location.query?this.props.location.query.s:'';
    return (
      <div className="search-page">
        <SearchHead value={querystring} returnbtn={true} goto={this.gotoList.bind(this)}></SearchHead>
        {
          this.props.searchVal.length<1
          ?
          <div className="search-main">
            <div className="search-land search-history">
              <label>
                <span>最近搜索</span>
                <img src={require(`@common/images/delete.png`)} alt="delete" onClick={()=>{
                  this.removeHistory()
                }}/>
              </label>
              <div className="search-tag">
                {
                  this.state.history.length>0?
                  this.state.history.map((v,i)=>{
                    return (<Tag key={i} onClick={()=>{
                     this.gotoList(v)
                    }}>{v}</Tag>)
                  })
                  :<div style={{textAlign:'center',padding:'20px'}}>暂无历史</div>
                }
              </div>
            </div>
            {/* <div className="search-land search-hot">
              <label>
                <span>热门搜索</span>
              </label>
              <div className="search-tag">
                {
                  this.state.searchHot.length>0?
                  this.state.searchHot.map((v,i)=>{
                    return (<Tag key={i} onClick={()=>{
                      this.gotoList(v)
                    }}>{v}</Tag>)
                  })
                  :<div style={{textAlign:'center',padding:'20px'}}>暂无热门</div>
                }
              </div>
            </div> */}
          </div>
          :
          <div className="search-main searct-lists">
            <ul>
              {
                this.state.searchList.length>0?
                this.state.searchList.map((v,i)=>{
                  return (
                    <li key={i} className="list" onClick={()=>{
                      this.gotoList(v)
                    }}>{v}</li>
                  )
                })
                :
                <li style={{textAlign:'center',padding:'20px'}}>暂时数据</li>
              }
            </ul>
          </div>
        }
      </div>
    )
  }
}
export default connect(
  ({searchReducer})=>{
      return {
          searchVal:searchReducer.val
      }
  },
  (dispatch)=>{
      return {
          router:bindActionCreators(routerAction,dispatch)
      }
  }
)(Search)

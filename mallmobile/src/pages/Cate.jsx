import React, {Component} from 'react'
import {connect} from 'react-redux'
import { bindActionCreators } from 'redux'
import * as loadAction from '@actions/loadAction'
import * as routerAction from '@actions/routerAction'
import classnames from 'classnames'
import {Tabs,PullToRefresh,Toast} from 'antd-mobile'
import Loading from '@base/Loading'
import $ from 'jquery'
import Commodity from '@/components/Commodity'
import {baseUrl,imgUrl,getToken} from '@common/js/util.js'
//css
import '@common/styles/cate.scss'

//组件
import SearchHeader from '@components/Header/SearchHeader'

class Cate extends Component {
    constructor(props){
        super(props);
        this.state={
            loading:true,
            tabs:[],
            currentTab:0,
            cateId:null,
            refreshing:false,
            down:false,
            pageNumber:1,
            pageSize:10,
            loading:true,
            visible:false,
            totalPage:1,
            tip:false,
            nodata:false,
            goodsList:[],
        }
    }
    //加载更多
    getRefresh(){
        this.setState({
            loading: true,
            tip: false,
          }, () => {
            if (this.state.pageNumber > this.state.totalPage) {
              this.setState({
                loading: false,
                tip: false,
              })
              return;
            }
            this.getGoodsList()
          })
    }
    overload(cb){
        this.setState({
          loading:true,
          goodsList: [],
          pageSize: 10,
          pageNumber: 1,
          totalPage: 1,
          tip: false,
          nodata:false,
        },()=>{
          cb()
        })
    }
    //获取商品列表
    getGoodsList(cb){
        let that = this;
        let params = {
            categoryId: this.state.cateId,
            sortType: 1,
            isTop:'',
            name:'',
            pageSize: this.state.pageSize,
            pageNumber: this.state.pageNumber,
            labelId:''
        }
        let url = baseUrl + '/goodList';
        //请求
        $.ajax({
            type:'get',
            dataType:'json',
            url:url,
            data:params,
            success(res){
                if (res.code === 0) {
                    res.data.data = res.data.data.map(v => {
                    return {
                        ...v,
                        thumbnail: imgUrl + v.thumbnail
                    }
                    })
                    let newData = that.state.goodsList.concat(res.data.data)
                    that.setState({
                        goodsList: newData,
                        pageNumber: that.state.pageNumber + 1,
                        totalPage: res.data.totalPages,
                        pageSize: that.state.pageSize,
                        loading: false,
                        tip: that.state.pageNumber + 1>=res.data.totalPages?false:true,
                        nodata: newData.length > 0 ? false : true,
                    }, () => {
                        cb && cb()
                    })
                } else {
                    Toast.info('获取失败',1)
                }
            },
            error(err){
                Toast.info('请求出错',1)
            }
        })
    }
    //挂载组件
    componentDidMount(){
        this.props.load.loadCate(()=>{
            this.setState({
                cateId:this.props.cates[0].id
            },()=>{
                this.getGoodsList()
            })
        })
    }
    render() {
        let cates = this.props.cates?this.props.cates.map(v=>{
            return {
                ...v,
                title:v.name.split('').length>5?v.name.split('').slice(0,4).join('')+'...':v.name
            }
        }):[]
        return (
            <div className="cate-page">
                <SearchHeader returnbtn={true}></SearchHeader>
                {
                this.state.loading?
                <Loading/>
                :
                <div className="cate-body">
                    <Tabs className="tabs" 
                          tabs={cates}
                          page={this.state.currentTab}
                          swipeable={true}
                          useOnPan={true}
                          tabBarTextStyle={
                            {
                                width:'86px',
                                overflow:'hidden',
                                textOverflow:'ellipsis',
                                whiteSpace:'nowrap',
                                backgroundColor:'#f9f9f9',
                                borderTop:'1px solid #eee',
                                height:'44px',
                            }
                          }
                          onChange={(tab,index)=>{
                              console.log(index)
                              this.setState({
                                currentTab:index,
                                loading: true,
                                cateId:tab.id,
                              },()=>{
                                this.overload(()=>{
                                    this.getGoodsList()
                                })
                              })
                          }}
                          tabBarPosition="top"
                          tabDirection="horizontal"
                    >
                        <PullToRefresh
                            className="tabs-r" 
                            damping={60}
                            style={{
                                height: '100%',
                                overflow: 'auto',
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
                            <Commodity data={ this.state.goodsList}></Commodity>
                            {
                                this.state.nodata?
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60px',}}>暂无商品</div>
                                :null
                            }
                            {
                                this.state.tip?
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60px', }}>更多加载</div>
                                :null
                            }
                        </PullToRefresh>
                    </Tabs>
                    
                </div>
                }
            </div>
        )
    }
}

export default connect(
    ({loadReducer})=>{
        return {
            cates:loadReducer.cates
        }
    },
    (dispatch)=>{
        return {
            load:bindActionCreators(loadAction,dispatch),
            router:bindActionCreators(routerAction,dispatch)
        }
    }
)(Cate)
import React, { Component } from 'react'
import {connect} from 'react-redux'
import TextHeader from '@components/Header/TextHeader'
import {Toast,PullToRefresh} from 'antd-mobile'
import Loading from '@base/Loading'
import $ from 'jquery'
import {baseUrl,getToken,formatTime} from '@common/js/util.js'

import '@common/styles/browse-record.scss'
import { imgUrl } from '../../common/js/util';

class BrowseRecord extends Component {
    constructor(props){
        super(props)
        this.state={
            refreshing:false,
            down:false,
            height:document.documentElement.clientHeight-46,
            list:[],
            pageNumber:1,
            pageSize:10000000,
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
    getBrowseRecord(){
        let that = this
        let params = {
            token:getToken(),
            pageNumber:this.state.pageNumber,
            pageSize:this.state.pageSize,
        }
        $.ajax({
            type:'get',
            url:baseUrl+'/productTrace/list',
            data:params,
            dataType:'json',
            success(res){
                if(res.code===0){
                    let list=[]
                    for(let key in res.data){
                        
                        list.push({
                            key:key,
                            child:res.data[key].map(v=>{
                                return {
                                    ...v,
                                    productData:JSON.parse(v.productData)
                                }
                            })
                        })
                    }
                    function sequence(a, b) {
                        if (new Date(b.time).getTime() > new Date(a.time).getTime()) {
                          return 1;
                        } else if (new Date(b.time).getTime() < new Date(a.time).getTime()) {
                          return -1
                        } else {
                          return 0;
                        }
                      }
                    that.setState({
                        list:list.sort(sequence),
                        totalPage:1,
                        loading:false,
                        pageNumber:that.state.pageNumber+1,
                        pageSize:10,
                        tip:list.length>0?false:true,
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
                url:baseUrl+'/productTrace/list',
                data:params,
                dataType:'json',
                success(res){
                    if(res.code===0){
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
        this.getBrowseRecord()
        this.resize()
    }
    render() {
        return (
        <div className="browse-record-page">
            <TextHeader returnbtn={true} title="浏览记录" pathname="/my"></TextHeader>
            <div className="browse-record-main">
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
                            <div key={i} className="browse-wrap">
                                <div className="browse-time">{formatTime(new Date(item.key))}</div>
                                <div className="browse-main">
                                   {
                                       item.child.map((jtem,j)=>{
                                           return (
                                            <div key={j} className="browse-item">
                                                <img width="90" src={imgUrl+jtem.productData.thumbnail} alt=""/>
                                                <div className="browse-right">
                                                    <div className="title">{jtem.productData.name}</div>
                                                    <div className="price"><span>￥</span>{jtem.productData.salesPrice.toFixed(2)}</div>
                                                </div>
                                            </div>
                                           )
                                       })
                                   } 
                                </div>
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
export default connect()(BrowseRecord)

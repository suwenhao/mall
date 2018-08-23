import React, { Component } from 'react'
import {connect} from 'react-redux'
import TextHeader from '@components/Header/TextHeader'
import {Toast,PullToRefresh} from 'antd-mobile'
import Loading from '@base/Loading'
import $ from 'jquery'
import {baseUrl,getToken,formatDate} from '@common/js/util.js'

import '@common/styles/integral.scss'

class PurseDetail extends Component {
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
    getPurseInfo(){
        let that = this
        let params = {
            token:getToken(),
            pageNumber:this.state.pageNumber,
            pageSize:this.state.pageSize,
        }
        $.ajax({
            type:'get',
            url:baseUrl+'/balance/list',
            data:params,
            dataType:'json',
            success(res){
                if(res.code===0){
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
                url:baseUrl+'/balance/list',
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
        this.getPurseInfo()
        this.resize()
    }
    render() {
        return (
            <div className="integral-page">
                <TextHeader returnbtn={true} title="零钱详细" pathname="/my/purse"></TextHeader>
                <div className="integral-main">
                    <div className="integral-detail">
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
                                                '充值'
                                                :
                                                item.type===2?
                                                '提现'
                                                :
                                                '消费'
                                            }
                                            <span style={{color:'red',fontSize:'14px',marginLeft:'20px','fontWeight':'400'}}>
                                                状态:
                                                {
                                                    item.status===1?
                                                    '待处理'
                                                    :
                                                    item.status===2?
                                                    '成功'
                                                    :
                                                    '失败'
                                                }
                                            </span>
                                            </h2>
                                            
                                            <div>{formatDate(item.updateTime)}</div>
                                        </div>
                                        <div className="i-right red">
                                            ￥{item.amount}
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
            </div>
        )
    }
}
export default connect()(PurseDetail)

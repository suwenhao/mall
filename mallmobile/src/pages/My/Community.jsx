import React, { Component } from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import * as routerAction from '@actions/routerAction'
import {Toast,PullToRefresh } from 'antd-mobile'
import TextHeader from '@components/Header/TextHeader'
import Loading from '@base/Loading'
import $ from 'jquery'
import {baseUrl,getToken} from '@common/js/util.js'

import '@common/styles/community.scss'

class Community extends Component {
    constructor(props){
        super(props)
        this.state={
            refreshing:false,
            down:false,
            height:document.documentElement.clientHeight-46,
            list:[{id:1},{id:2},{id:3}],
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
    //获取社区列表
    getCommunityList(){
        let that = this
        let params = {
            token:getToken()
        }
        this.setState({
            loading:false,
        })
        // $.ajax({
        //     type:'post',
        //     url:baseUrl+'/',
        //     data:params,
        //     dataType:'json',
        //     success(res){
        //         console.log(res)
        //         res.data.balance=res.data.balance.toFixed(2)
        //         that.setState({
        //             userInfo:res.data
        //         })
        //     },
        //     error(err){
        //         Toast.info('获取失败',1)
        //     }
        // })
    }
    //加载更多
    getRefresh(cb){

    }
    //跳转
    goto(path,id){
        if(id){
            this.props.history.push(path+id)
            this.props.router.changePath(path+id)
        }else{
            this.props.history.push(path)
            this.props.router.changePath(path)
        }
    }
    //挂载组件
    componentDidMount(){
        this.getCommunityList()
        this.resize()
    }
    render() {
        return (
        <div className="community-page">
            <TextHeader returnbtn={true} title="榴莲社区" pathname="/my" >
                <div className="integraldetail" style={{
                    paddingRight: '10px',
                    fontSize: '14px',
                }} onClick={()=>{
                    this.goto(`/my/communitycomment`)    
                }}>发布</div>
            </TextHeader>
            <div className="community-main">
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
                            return(
                                <div className="community-item" key={i} onClick={(e)=>{
                                    this.goto('/my/communitydetail/',item.id)
                                }}>
                                    <div className="community-header">
                                        <div className="c-left">
                                            <img src={require(`@common/images/avatar.jpg`)} alt=""/>
                                            <span>流连忘返</span>
                                        </div>
                                        <div className="c-right">2018-07-31</div>
                                    </div>
                                    <div className="community-body">
                                        <div className="desc">榴莲是我最爱的水果，没有之一，很多国家的榴莲都吃过，唯一最好吃的就是马来西亚榴莲，独特的香味透出一丝丝香气，油而不腻是这种榴莲的特征。</div>
                                        <div className="pictrues">
                                            <div className="img-item">
                                                <img src={
                                                    require(`@common/images/test/u3058.jpg`)
                                                } alt=""/>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="community-footer">
                                        <div className="c-left"></div>
                                        <div className="c-right">
                                            <div className="c-icon" onClick={(e)=>{
                                                e.stopPropagation()
                                            }}>
                                                <img src={require(`@common/images/msg@default.png`)}/>
                                                <span>12</span>
                                            </div>
                                            <div className="c-icon" onClick={(e)=>{
                                                e.stopPropagation()
                                            }}>
                                                <img src={require(`@common/images/zan.png`)}/>
                                                <span>12</span>
                                            </div>
                                        </div>
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
export default connect(
    null,
    //跳转路由
    (dispatch)=>({
        router:bindActionCreators(routerAction,dispatch)
    })
)(Community)

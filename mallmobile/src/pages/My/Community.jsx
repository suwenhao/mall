import React, { Component } from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import * as routerAction from '@actions/routerAction'
import {Popover,Icon,Toast,PullToRefresh } from 'antd-mobile'
import TextHeader from '@components/Header/TextHeader'
import Loading from '@base/Loading'
import $ from 'jquery'
import {baseUrl,imgUrl,getToken} from '@common/js/util.js'

import '@common/styles/community.scss'

const Item = Popover.Item;

class Community extends Component {
    constructor(props){
        super(props)
        let ww=document.documentElement.clientWidth-20
        this.state={
            refreshing:false,
            down:false,
            height:document.documentElement.clientHeight-46,
            imgWidth:ww,
            imgHeight:ww*20/35,
            list:[],
            pageNumber:1,
            pageSize:10,
            loading:true,
            visible:false,
            totalPage:1,
            tip:false,
        }
    }
    //内容适应窗口
    resize(){
        let self =this;
        $(window).on('resize',()=>{
            let ww=document.documentElement.clientWidth-20
            self.setState({
                imgWidth:ww,
                imgHeight:ww*20/35,
                height:document.documentElement.clientHeight-46
            })
        })
    }
    //获取社区列表
    getCommunityList(){
        let that = this
        let params = {
            token:getToken(),
            pageNumber:this.state.pageNumber,
            pageSize:this.state.pageSize,
        }
        $.ajax({
            type:'get',
            url:baseUrl+'/durianCommunity/list',
            data:params,
            dataType:'json',
            success(res){
                console.log(res)
                if(res.code===0){
                    setTimeout(()=>{
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
                            // list:[],
                            totalPage:res.data.totalPage,
                            loading:false,
                            pageNumber:that.state.pageNumber+1,
                            pageSize:10,
                            tip:res.data.rows.length>0?false:true,
                            // tip:true
                        })
                    },50)
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
        let that = this
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
                url:baseUrl+'/durianCommunity/list',
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
    //跳转
    goto(path){
        this.props.history.push(path)
        this.props.router.changePath(path)
        sessionStorage.setItem('__search_prev_path__',this.props.location.pathname)
    }
    handleVisibleChange(visible){
        this.setState({
            visible,
        });
    }
    onSelect(opt){
        console.log(opt.props);
        this.setState({
            visible: false,
            selected: opt.props.value,
        });
        this.goto(opt.props.path)
    }
    //挂载组件
    componentDidMount(){
        this.getCommunityList()
        this.resize()
    }
    render() {
        const myImg = src => <img key={src} src={require(`@common/images/${src}.png`)} className="am-icon am-icon-xs" alt="" />;
        return (
        <div className="community-page">
            <TextHeader returnbtn={true} title="榴莲社区" pathname="/my" >
                <Popover
                    key="1" 
                    mask
                    overlayClassName="fortest"
                    overlayStyle={{ color: 'currentColor' }}
                    visible={this.state.visible}
                    overlay={[
                        (<Item path="/my/communityissue" value="我的发布" icon={myImg('list')}>我的发布</Item>),
                        // (<Item path="/my/communitymycomment" value="我的评论" icon={myImg('msg@default')}>我的评论</Item>),
                        (<Item path="/my/communitycomment" value="发布" icon={myImg('submit')}>发布</Item>),
                    ]}
                    align={{
                        overflow: { adjustY: 0, adjustX: 0 },
                        offset: [-10, 0],
                    }}
                    onVisibleChange={this.handleVisibleChange.bind(this)}
                    onSelect={this.onSelect.bind(this)}
                >
                    <Icon onClick={()=>{
                        this.setState({
                            visible:true
                        })
                    }} type="ellipsis"/>
                </Popover>
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
                                    this.goto('/my/communitydetail')
                                    sessionStorage.setItem('__mall__community__',JSON.stringify(item))
                                }}>
                                    <div className="community-header" style={{padding:'10px 0'}}>
                                        <div className="c-left">
                                            <img src={require(`@common/images/avatar.jpg`)} alt=""/>
                                            <span>{item.title}</span>
                                        </div>
                                        <div className="c-right">{item.time}</div>
                                    </div>
                                    <div className="community-body">
                                        <div className="desc">{item.content}</div>
                                        <div className="pictrues">
                                            <div className="img-item">
                                                <img src={
                                                    imgUrl+item.picture.split(',')[0]
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
                                                <span>{item.comment}</span>
                                            </div>
                                            <div className="c-icon" onClick={(e)=>{
                                                e.stopPropagation()
                                            }}>
                                                <img src={require(`@common/images/zan.png`)}/>
                                                <span>{item.like}</span>
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

import React, { Component } from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import * as routerAction from '@actions/routerAction'
import {Toast,PullToRefresh,SwipeAction,Modal} from 'antd-mobile'
import TextHeader from '@components/Header/TextHeader'
import Loading from '@base/Loading'
import $ from 'jquery'
import {baseUrl,imgUrl,getToken} from '@common/js/util.js'

import '@common/styles/community.scss'


class Community extends Component {
    constructor(props){
        super(props)
        let ww=document.documentElement.clientWidth-20
        this.state={
            refreshing:false,
            down:false,
            edit:false,
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
            self:1
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
                pageSize:this.state.pageSize,
                self:1
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
    //删除
    delete(item,i){
        var that=this;
        Modal.alert('提示', '是否删除该订单？', [
          { text: '取消', onPress: () => console.log('cancel'), style: 'default' },
          { text: '确认', onPress: () => {
            $.ajax({
              type:'get',
              data:{
                  token:getToken(),
                  id:parseInt(item.id),
              },
              url:baseUrl+'/durianCommunity/delete',
              success(res){
                Toast.info("删除成功",1);
                that.setState({
                  list:[],
                  loading:true,
                  pageNumber:1,
                  pageSize:10,
                  totalPages:1,
                  refreshing: false
                },()=>{
                  that.getCommunityList()
                })
              }
            })
          } },
        ])
    }
    //跳转
    goto(path){
        this.props.history.push(path)
        this.props.router.changePath(path)
        sessionStorage.setItem('__search_prev_path__',this.props.location.pathname)
    }
    //下拉改变
    handleVisibleChange(visible){
        this.setState({
            visible,
        });
    }
    //选择下拉
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
            <TextHeader returnbtn={true} title="我的发布" pathname="/my/community" ></TextHeader>
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
                                <SwipeAction
                                    key={i}
                                    autoClose={true}
                                    style={{ backgroundColor: '#f5f5f9'}}
                                    right={[{
                                        text: '删除',
                                        onPress: () =>{
                                            this.delete(item,i)
                                            return false;
                                        },
                                        style: { backgroundColor: '#F4333C', color: 'white' },
                                    }]}
                                    onOpen={() => console.log('global open')}
                                    onClose={() => {
                                        console.log('global close')
                                        return false;
                                    }}
                                >
                                    <div className="community-item community-item-flex" onClick={(e)=>{
                                        this.goto('/my/communitydetail')
                                        sessionStorage.setItem('__mall__community__',JSON.stringify(item))
                                    }}>
                                        <div className="right-check">
                                            {/* <div className="community-header" style={{padding:'10px 0'}}>
                                                <div className="c-left">
                                                    <img src={require(`@common/images/avatar.jpg`)} alt=""/>
                                                    <span>{item.nickname}</span>
                                                </div>
                                                <div className="c-right">{item.time}</div>
                                            </div> */}
                                            <div className="community-body" style={{paddingTop:'10px'}}>
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
                                                <div className="c-left">
                                                    <span style={{
                                                        color:item.status===0?'#3985ff':item.status===1?'green':'red',
                                                        padding:'10px 0'
                                                    }}>{
                                                        item.status===0?'待审核'
                                                        :
                                                        item.status===1?'已审核'
                                                        :'审核拒绝'
                                                    }</span>
                                                </div>
                                                <div className="c-right">
                                                    <div className="c-icon" onClick={(e)=>{
                                                        e.stopPropagation()
                                                    }}>
                                                        <span>{item.time}</span>
                                                    </div>
                                                    {/* <div className="c-icon" onClick={(e)=>{
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
                                                    </div> */}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </SwipeAction>
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

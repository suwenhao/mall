import React, {Component} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import * as routerAction from '@actions/routerAction'
import {TabBar} from 'antd-mobile'
import {withRouter} from 'react-router-dom'

class NavFooter extends Component {
    constructor(props) {
        super(props);
        this.state={
            selectedTab: 'index',
            tabbars:[
                {
                    icon:require('../../common/images/index.png'),
                    selectedIcon:require('../../common/images/index_active.png'),
                    title:'首页',
                    key:'index'
                },
                {
                    icon:require('../../common/images/cate.png'),
                    selectedIcon:require('../../common/images/cate_active.png'),
                    title:'分类',
                    key:'cate'
                },
                {
                    icon:require('../../common/images/cart.png'),
                    selectedIcon:require('../../common/images/cart_active.png'),
                    title:'购物车',
                    key:'cart'
                },
                {
                    icon:require('../../common/images/my.png'),
                    selectedIcon:require('../../common/images/my_active.png'),
                    title:'个人中心',
                    key:'my'
                }
            ]
        }
    }
    componentWillMount(){
        this.setState({
            selectedTab:this.props.location.pathname==='/'?'index':this.props.location.pathname.substring(1)
        })
    }
    styleImage(url){
        return (
            <div style={{
                width: '22px',
                height: '22px',
                background: 'url('+url+') center center /  21px 21px no-repeat' }}
            />
        )
    }
    calcPath(){
        if(this.props.path==='/index'||this.props.path==='/'){
            return 'index'
        }else{
            return this.props.path.substring(1)
        }
    }
    render() {
        
        return (
            <TabBar
                unselectedTintColor="#707070"
                tintColor="#ff5b05"
                barTintColor="white"
            >
                {
                    this.state.tabbars.map((v,i)=>{
                        return (
                            <TabBar.Item
                                key={i}
                                title={v.title}
                                icon={
                                    this.styleImage(v.icon)
                                }
                                selectedIcon={
                                    this.styleImage(v.selectedIcon)
                                }
                                selected={this.props.path?this.calcPath()===v.key:this.state.selectedTab === v.key}
                                onPress={() => {
                                    this.setState({
                                        selectedTab: v.key,
                                    });
                                    this.props.history.push('/'+v.key)
                                    this.props.router.changePath('/'+v.key)
                                    sessionStorage.setItem('__search_prev_path__','/'+v.key)
                                }}
                            />
                        )
                    })
                }
            </TabBar>
        )
    }
}
export default connect(
    ({routerReducer})=>{
        return{
            path:routerReducer.path
        }
    },
    (dispatch)=>{
        return {
            router:bindActionCreators(routerAction,dispatch)
        }
    }
)(withRouter(NavFooter))
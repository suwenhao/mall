import React, { Component } from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import * as routerAction from '@actions/routerAction'
import * as loadAction from '@actions/loadAction'
import {Route,Switch,Redirect} from 'react-router-dom'
import {baseUrl, getToken, locationHref,getQueryString} from '@common/js/util'

//css
import '@common/styles/index.scss'
import 'react-photoswipe/lib/photoswipe.css'
//组件
import NavFooter from '@/components/NavFooter'
import Main from '@/pages/Main'
import Cate from '@/pages/Cate'
import My from '@/pages/My'
import Cart from '@/pages/Cart'
import GoodsDetail from '@/pages/GoodsDetail';
import Comments from '@/pages/Comments';
import Order from '@/pages/Order';
import Search from '@/pages/Search';
import Searchlist from '@/pages/Searchlist';
import $ from 'jquery'

class Index extends Component {
    authRoute(){
        let token = getToken()
        if(token){
            return;
        }else{
            window.location.href = locationHref()
        }
    }
    getCartNum(){
        this.props.load.getCartList()
    }
    getShare(){
        let userId=getQueryString('userId')
        let storage=sessionStorage.getItem('__mall__userId__')
        if(userId){
            console.log(storage)
            if(storage){
                return;
            }else{
                if(getToken()){
                    $.ajax({
                        type:'post',
                        data:{
                            token:getToken(),
                            type:2,
                            monetory:'',
                            recommendId:userId
                        },
                        url:baseUrl+'/share',
                        success(res){

                        }
                    })
                }else{
                    sessionStorage.setItem('__mall__userId__',userId)
                }
            }
            
        }
    }
    render(){
        this.authRoute()
        this.getShare()
        this.getCartNum()
        let pathTF = false;
        this.props.paths.forEach(v=>{
            if(this.props.pathname===null&&(this.props.location.pathname===v)){
                pathTF=true
            }else if(v===this.props.pathname){
                pathTF=true
            }else if(this.props.location.pathname===v){
                pathTF=true
            }
        })
        this.props.router.changePath(this.props.location.pathname)

        return (
            <div className="index-page">
                <div className="main" style={{
                    marginBottom:pathTF?'50px':'0px'
                }}>
                    <Switch>
                        <Route exact path="/" component={Main}></Route>
                        <Route exact path="/index" render={()=><Redirect to="/"/>}></Route>
                        <Route exact path="/cate" component={Cate}></Route>
                        <Route  path="/cate" component={Cate}></Route>
                        <Route path="/goods/:id" component={GoodsDetail}></Route>
                        <Route path="/comments/:id" component={Comments}></Route>
                        <Route path="/order" component={Order}></Route>
                        <Route exact path="/search" component={Search}></Route>
                        <Route exact path="/searchlist/:s" component={Searchlist}></Route>
                        <Route exact path="/cart" component={Cart}></Route>
                        <Route component={My}></Route>
                    </Switch>
                </div>
                {
                    pathTF?
                    <div className="footer">
                        <NavFooter></NavFooter>
                    </div>
                    :null
                }
            </div>
        )
    }
}

export default connect(
    ({routerReducer})=>{
        return {
            paths:routerReducer.paths,
            pathname:routerReducer.path,
        }
    },
    (dispatch)=>{
        return {
            router:bindActionCreators(routerAction,dispatch),
            load:bindActionCreators(loadAction,dispatch)
        }
    }
)(Index)
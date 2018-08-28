import React, { Component } from 'react'
import {connect} from 'react-redux'
import {Route,Switch,Redirect} from 'react-router-dom'

//css
import '@common/styles/index.scss'
//组件

import My from '@/pages/My/My'          //个人中心
import Orderlist from '@/pages/My/Orderlist'        //订单列表
import OrderDetail from '@/pages/My/OrderDetail'    //订单详情
import OrderComment from '@pages/My/OrderComment'   //订单评论
import Helpback from '@/pages/My/Helpback'       //帮助反馈
import MyFeedback from '@/pages/My/MyFeedback'   //反馈列表
import BrowseRecord from '@/pages/My/BrowseRecord'   //浏览记录
import Mypurse from '@pages/My/Mypurse'   //我的钱包
import Integral from '@pages/My/Integral'   //积分
import PurseDetail from '@pages/My/PurseDetail'   //零钱详情
import Address from '@pages/My/Address'   //地址列表
import AddressAdd from '@pages/My/AddressAdd'  //新建地址
import AddressEdit from '@pages/My/AddressEdit'  //编辑地址
import Logistics from '@pages/My/Logistics'  //物流
import Community from '@pages/My/Community'  //榴莲社区
import CommunityDetail from '@pages/My/CommunityDetail'  //榴莲社区详情
import CommunityComment from '@pages/My/CommunityComment'  //榴莲社区发布
import School from '@pages/My/School'  //榴莲学堂
import SchoolDetail from '@pages/My/SchoolDetail'  //榴莲学堂详情

class Mypage extends Component {
    render(){
        return (
            <Switch>
                <Route exact path="/my" component={My}></Route>
                <Route exact path='/my/purse' component={Mypurse}></Route>
                <Route exact path='/my/integral' component={Integral}></Route>
                <Route exact path='/my/pursedetail' component={PurseDetail}></Route>
                <Route exact path='/my/address' component={Address}></Route>
                <Route exact path='/my/addressadd' component={AddressAdd}></Route>
                <Route exact path='/my/addressedit' component={AddressEdit}></Route>
                <Route exact path='/my/logistics' component={Logistics}></Route>
                <Route exact path='/my/orderlist' component={Orderlist}></Route>
                <Route exact path='/my/orderdetail/:orderId' component={OrderDetail}></Route>
                <Route exact path='/my/ordercomment/:orderId' component={OrderComment}></Route>
                <Route exact path='/my/helpback' component={Helpback}></Route>
                <Route exact path='/my/feedback' component={MyFeedback}></Route>
                <Route exact path='/my/browserecord' component={BrowseRecord}></Route>
                <Route exact path='/my/community' component={Community}></Route>
                <Route exact path='/my/communitydetail/:id' component={CommunityDetail}></Route>
                <Route exact path='/my/communitycomment' component={CommunityComment}></Route>
                <Route exact path='/my/school' component={School}></Route>
                <Route exact path='/my/schooldetail/:id' component={SchoolDetail}></Route>
                <Route render={() => <Redirect to="/404" />} />
            </Switch>
        )
    }
}

export default connect()(Mypage)
import React, { Component } from 'react'
import {connect} from 'react-redux'
import { Checkbox, Button, SwipeAction, Toast, Modal } from 'antd-mobile'
import TextHeader from '@components/Header/TextHeader'
import axios from 'axios'
import Loading from '@base/Loading'
import _ from 'underscore'
import $ from 'jquery'
import {baseUrl,imgUrl,getToken} from '@common/js/util.js'

import '@common/styles/address.scss'

class Address extends Component {
    constructor(props){
        super(props)
        this.state = {
            list:[],
            noneData:false,
            loading:true
        }
    }
    //删除地址
    removeAddr(item){
        var that = this;
        Modal.alert('提示', '您确认要删除该地址?', [
            { text: '取消', onPress: () => console.log('cancel'), style: 'default' },
            { text: '确认', onPress: () => {
                var params = {
                    token: getToken(),
                    reciverId: item.id
                };
                $.post(baseUrl + '/address/delete',params,(res)=>{
                    if(res.code == 0){
                        Toast.info( '删除成功',1);
                        that.getAddressList();
                    } else {
                        Toast.info('删除失败',1);
                    }
                })
            } },
        ], 'ios')
    }
    //设置默认地址
    setDefaultAddress(id) {
        var that = this;
        var params = {
            token: getToken(),
            reciverId: id
        };
        $.ajax({
            type:'post',
            data:params,
            url:baseUrl+'/address/setDefault',
            success(res){
                if(res.code == 0){
                    Toast.info( '设置默认成功',1);
                    that.getAddressList();
                } else {
                    Toast.info('设置默认失败',1);
                }
            }
        })
    }
    //获取地址列表
    getAddressList(){
        //初始化获取数据
        (async ()=>{
            let params = {
                token:getToken()
            }
            let {data} = await axios.get(baseUrl+'/address/list',{params}).then(res=>res);
            setTimeout(()=>{
                this.setState({
                    list:data.data.data,
                    loading:false,
                    noneData:data.data.data.length>0?false:true
                })
            },200)
        })()
    }
    //挂载程序
    componentDidMount(){
        this.getAddressList()
    }
    render() {
        let addressPrevPath = sessionStorage.getItem('__address_prev_path__')
        if(addressPrevPath){
            sessionStorage.setItem('__search_prev_path__',addressPrevPath)
        }
        let  prevPath = sessionStorage.getItem('__search_prev_path__')
        return (
        <div className="address-page">
            <div className="address-top">
                <TextHeader returnbtn={true} title="收货地址" pathname={prevPath||'/my'}></TextHeader>
                <div className="address-main">
                    {this.state.loading?<Loading/>:null}
                    {
                        this.state.list.length>0?
                        this.state.list.map((item,i)=>{
                            return (
                                <SwipeAction
                                    autoClose={true}
                                    key={i}
                                    style={{backgroundColor: '#f5f5f9',paddingBottom:'10px'}}
                                    right={[
                                        {
                                        text: '删除',
                                        onPress: () => {
                                            this.removeAddr(item)
                                        },
                                        style: { backgroundColor: '#F4333C', color: 'white' },
                                        },
                                    ]}
                                >
                                    <div className="address-item" onClick={()=>{
                                        if(prevPath==='/my'||prevPath==='/my/address'||prevPath==='/my/addressadd'||prevPath==='/my/addressedit'){

                                        }else{
                                            this.props.history.push({
                                                pathname:'/order',
                                                query:{
                                                    addr:true
                                                }
                                            })
                                            sessionStorage.setItem('address',JSON.stringify(item))
                                        }
                                    }}>
                                        <div className="a-left">
                                            <div className="info">
                                                <span>{item.consignee}</span>
                                                <span>{item.phone}</span>
                                            </div>
                                            <div className="address">
                                                {item.provinceName}{item.cityName}{item.countyName}{item.address}
                                            </div>
                                            <div className="check">
                                                <span><Checkbox checked={item.isDefault} onClick={(e)=>{
                                                    e.stopPropagation()
                                                    this.setDefaultAddress(item.id)
                                                }}/></span>
                                                <span>{item.isDefault?'已设为默认':'设为默认'}</span>
                                            </div>
                                        </div>
                                        <div className="a-right" onClick={(e)=>{
                                            e.stopPropagation()
                                            this.props.history.push('/my/addressedit')
                                            sessionStorage.setItem('__address_edit__',JSON.stringify(item))
                                        }}>
                                            <img src={require(`@common/images/edit.png`)} alt="edit"/>
                                        </div>
                                    </div>
                                </SwipeAction>
                            )
                        })
                        :
                        this.state.noneData?
                        <div style={{padding:'20px',textAlign:'center',color:'#999'}}>暂无数据</div>
                        :null
                    }
                </div>
            </div>
            <div className="address-footer">
                <Button type="primary" onClick={(e)=>{
                    e.stopPropagation()
                    this.props.history.push('/my/addressadd')
                }}>新增收货地址</Button>
            </div>
        </div>
        )
    }
}
export default connect()(Address)

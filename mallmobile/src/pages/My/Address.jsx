import React, { Component } from 'react'
import {connect} from 'react-redux'
import { Checkbox, Button, SwipeAction } from 'antd-mobile'
import TextHeader from '@components/Header/TextHeader'
import axios from 'axios'
import Loading from '@base/Loading'

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
  componentDidMount(){
      //初始化获取数据
      (async ()=>{
        let {data} = await axios.get('/api/alliance/listAddress').then(res=>res);
        setTimeout(()=>{
            this.setState({
                list:data.data,
                loading:false,
                noneData:data.data.length>0?false:true
            })
        },1000)
      })()
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
                                key={i}
                                style={{backgroundColor: '#f5f5f9',paddingBottom:'10px'}}
                                right={[
                                    {
                                    text: '删除',
                                    onPress: () => {

                                    },
                                    style: { backgroundColor: '#F4333C', color: 'white' },
                                    },
                                ]}
                            >
                                <div className="address-item" onClick={()=>{
                                    if(prevPath==='/my'){

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
                                            }}/></span>
                                            <span>{item.isDefault?'已设为默认':'设为默认'}</span>
                                        </div>
                                    </div>
                                    <div className="a-right" onClick={(e)=>{
                                        e.stopPropagation()
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

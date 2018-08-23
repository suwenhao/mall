import React, { Component } from 'react'
import {connect} from 'react-redux'
import TextHeader from '@components/Header/TextHeader'
import {Toast,PullToRefresh} from 'antd-mobile'
import Loading from '@base/Loading'
import $ from 'jquery'
import {baseUrl,getToken,formatDate} from '@common/js/util.js'
import classnames from 'classnames';
import '@common/styles/logistics.scss'

class Logistics extends Component {
    constructor(props){
        super(props)
        let logs=JSON.parse(sessionStorage.getItem('__logistics__'))
        this.state={
            logs:logs?logs:{com:null,num:null,orderId:null,name:null},
            list:[]
        }
    }
    getTracking(){
        var that = this
        $.ajax({
            type:'post',
            data:{
                token:getToken(),
                com:this.state.logs.com,
                num:this.state.logs.num
            },
            url:baseUrl+'/order/query',
            success(res){
                var taeckArr=JSON.parse(res.data.result).data;
                that.list = taeckArr||[]
            }
        })
    }
    //组件挂载
    componentDidMount(){
        this.getTracking()
    }
    render() {
        return (
        <div className="logistics-page">
            <TextHeader returnbtn={true} title="物流详细" pathname="/my/orderlist"></TextHeader>
            <div className="content">
                <div className="track_info">
                    <div className="track_info_item">
                        <p className="track_info_item_label">订单编号：</p>
                        <div className="track_info_item_content">{this.state.logs.orderId}</div>             
                    </div>
                    <div className="track_info_item">                 
                        <p className="track_info_item_label">运单号：</p>
                        <div className="track_info_item_content">{this.state.logs.num}</div>             
                    </div>
                    <div className="track_info_item">                 
                        <p className="track_info_item_label">快递公司：</p>
                        <div className="track_info_item_content">{this.state.logs.name}</div>             
                    </div>
                </div>
                {
                    this.state.list.length>0?
                    <ul className="track_shipflow">
                        {
                            this.state.list.map((item,i)=>{
                                return (
                                    <li className={classnames({
                                        'track_shipflow_item':true,
                                        'cur':i==0?true:false
                                    })} key={i}>
                                        <i className="track_shipflow_item_status type_dot"></i>
                                        <div className="track_shipflow_item_msg">
                                            <p className="track_shipflow_item_msg_text">{item.context} </p>
                                            <p className="track_shipflow_item_msg_time">{item.time}</p>
                                        </div>
                                    </li>
                                )
                            })
                        }
                    </ul>
                    :
                    <div className="nodata">查询无结果</div>
                }
            </div>
        </div>
        )
    }
}
export default connect()(Logistics)

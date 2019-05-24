import React, { Component } from 'react'
import {connect} from 'react-redux'
import { Button, TextareaItem, WingBlank, WhiteSpace, Picker, Toast } from 'antd-mobile'
import TextHeader from '@components/Header/TextHeader'
import axios from 'axios'

import '@common/styles/addressadd.scss'

class AddressAdd extends Component {
  constructor(props){
    super(props)
    this.state={
      name:'',
      phone:'',
      address:'',
      isDefault: false,
      provinces:[],
      provinceActive:{value:'110000'},
      provinceDefault:{},
      province:'-请选择-',
      citys:[],
      cityActive:{value:'110000'},
      cityDefault:{},
      city:'',
      areas:[],
      areaActive:{value:'110000'},
      areaDefault:{},
      area:'',
      cols: 1,
    }
  }
  componentDidMount(){
    this.getAddressArea(null,1,'provinces')
  }
  getAddressArea(parentId,level,type,cb){
    (async ()=>{
      let params={
        parentId:parentId,
        level:level
      }
      let {data} = await axios.get('/api/alliance/areaList',{
        params:params
      }).then(res=>res);
      console.log(data)
      this.setState({
        [type]:data.data.map(item=>{
          return {
            ...item,
            value:item.id,
            label:item.cname
          }
        })
      })
      cb&&cb()
    })()
  }
  submit(){
    let myreg = /^[1][3,4,5,7,8][0-9]{9}$/;
    if (this.state.name === "") {
      Toast.info("请填写收货人");
    } else if (this.state.phone === "") {
      Toast.info("请填写手机号码");
    } else if (!myreg.test(this.state.phone)) {
      Toast.info("手机号码有误");
    } else if (this.state.province === '-请选择-' || this.state.province ==="") {
      Toast.info("请选择省份");
    } else if (this.state.city === '-请选择-' || this.state.city ==="") {
      Toast.info("请选择市");
    } else if (this.state.area === '-请选择-'|| this.state.area ==="") {
      Toast.info("请选择区");
    } else if (this.state.address === "") {
      Toast.info("请填写详细地址");
    } else {
      
    }
  }
  render() {
    return (
      <div className="addressadd-page">
          <TextHeader returnbtn={true} title="新增地址" pathname="/my/address"></TextHeader>
          <div className="addressadd-main">
              <div className="addressadd">
                <div className="p-item">
                  <label>
                    <span className="tit">联系人</span>
                    <input type="text" placeholder="姓名" value={this.state.name} onChange={(ev)=>{this.setState({name:ev.target.value})}}/>
                  </label>
                </div>
                <div className="p-item">
                  <label>
                    <span className="tit">联系方式</span>
                    <input type="text" placeholder="手机号码" value={this.state.phone} onChange={(ev)=>{this.setState({phone:ev.target.value})}}/>
                  </label>
                </div>
                <div className="p-item">
                  <label>
                    <span className="tit">所在省</span>
                    <Picker 
                      data={this.state.provinces}
                      cols={this.state.cols}
                      value={[this.state.provinceActive.value]}
                      onPickerChange={(v)=>{
                        let prov = this.state.provinces.filter((item) => {
                          return v[0] === item.id
                        })
                        this.setState({
                          provinceActive:prov[0]
                        })
                        return true;
                      }}
                      onOk={v => {
                        let prov = this.state.provinces.filter(item=>{
                          return v[0] === item.id
                        })
                        console.log(prov)
                        this.setState({
                          provinceDefault:prov[0],
                          province:prov[0].cname,
                          cityDefault:{},
                          cityActive:{value:'110000'},
                          city:'-请选择-',
                          areaDefault:{},
                          areaActive:{value:'110000'},
                          area:''
                        })
                        this.getAddressArea(prov[0].id,2,'citys')
                        return true;
                      }}
                    >
                      <div arrow="horizontal">{this.state.province}</div>
                    </Picker>
                  </label>
                </div>
                <div className="p-item">
                  <label>
                    <span className="tit">所在市</span>
                    <Picker 
                      data={this.state.citys}
                      cols={this.state.cols}
                      value={[this.state.cityActive.value]}
                      onPickerChange={(v)=>{
                        console.log(v)
                        let prov = this.state.citys.filter(item=>{
                          return v[0] === item.id
                        })
                        this.setState({
                          cityActive:prov[0]
                        })
                        return true;
                      }}
                      onOk={v => {
                        let prov = this.state.citys.filter(item=>{
                          return v[0] === item.id
                        })
                        console.log(prov)
                        this.setState({
                          cityDefault:prov[0],
                          city:prov[0].cname,
                          areaActive:{value:'110000'},
                          areaDefault:{},
                          area:'-请选择-'
                        })
                        this.getAddressArea(prov[0].id,3,'areas')
                        return true;
                      }}
                    >
                      <div arrow="horizontal">{this.state.city}</div>
                    </Picker>
                  </label>
                </div>
                <div className="p-item">
                  <label>
                    <span className="tit">所在区</span>
                    <Picker 
                      data={this.state.areas}
                      cols={this.state.cols}
                      value={[this.state.areaActive.value]}
                      onPickerChange={(v)=>{
                        console.log(v)
                        let prov = this.state.areas.filter(item=>{
                          return v[0] === item.id
                        })
                        this.setState({
                          areaActive:prov[0]
                        })
                        return true;
                      }}
                      onOk={v => {
                        let prov = this.state.areas.filter(item=>{
                          return v[0] === item.id
                        })
                        console.log(prov)
                        this.setState({
                          areaDefault:prov[0],
                          area:prov[0].cname
                        })
                        return true;
                      }}
                    >
                      <div arrow="horizontal">{this.state.area}</div>
                    </Picker>
                  </label>
                </div>
                <div className="p-item">
                  <label>
                    <span className="tit">详细地址</span>
                    <TextareaItem rows="3" placeholder="详细地址需填写楼栋楼层或房间号信息" value={this.state.address} onChange={(val)=>{this.setState({address:val})}}></TextareaItem>
                  </label>
                </div>
                <WhiteSpace/>
                <WingBlank>
                  <Button type="primary" onClick={()=>{
                    this.submit()
                  }}>新增地址</Button>
                </WingBlank>
              </div>
          </div>
      </div>
    )
  }
}
export default connect()(AddressAdd)

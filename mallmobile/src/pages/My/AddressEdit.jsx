import React, { Component } from 'react'
import {connect} from 'react-redux'
import { Button, TextareaItem, WingBlank, WhiteSpace, Picker, Toast } from 'antd-mobile'
import TextHeader from '@components/Header/TextHeader'
import axios from 'axios'
import {baseUrl,imgUrl,getToken} from '@common/js/util.js'
import $ from 'jquery'
import _ from 'underscore'

import '@common/styles/addressadd.scss'

class AddressAdd extends Component {
  constructor(props){
    super(props)
    this.state={
      updateId:'',
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
  getAddressArea(parentId,level,type,cb){
    (async ()=>{
      let params={
        parentId:parentId,
        level:level
      }
      let {data} = await axios.get(baseUrl+'/area/list',{
        params:params
      }).then(res=>res);
      console.log(data)
      this.setState({
        [type]:data.data.data.map(item=>{
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
  //获取地址信息
  getAddressEdit() {
      let item = JSON.parse(sessionStorage.getItem('__address_edit__'));
      let currentProvinces = this.state.provinces.filter(v=>{
        if(v.value===item.provinceId){
          return v
        }
      })
      this.setState({
        updateId:item.id,
        name:item.consignee,
        phone:item.phone,
        address:item.address,
        isDefault:item.isDefault,
        province:item.provinceName,
        city: item.cityName,
        area:item.countyName,
        provinceActive:currentProvinces[0],
        provinceDefault:currentProvinces[0],
      },()=>{
        this.getAddressArea(item.provinceId,2,'citys',()=>{
          let currentCitys = this.state.citys.filter(v=>{
            if(v.value===item.cityId){
              return v
            }
          })
          this.setState({
            cityActive:currentCitys[0],
            cityDefault:currentCitys[0],
          },()=>{
            this.getAddressArea(item.cityId,3,'areas',()=>{
              let currentAreas = this.state.areas.filter(v=>{
                if(v.value===item.countyId){
                  return v
                }
              })
              this.setState({
                areaActive:currentAreas[0],
                areaDefault:currentAreas[0],
              })
            })
          })
        })
      })
  }
  submit(){
    let that = this;
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
      var params = {
          token: getToken(),
          reciverId:this.state.updateId,
          provinceId: parseInt(this.state.provinceDefault.id),
          cityId: parseInt(this.state.cityDefault.id),
          countyId: parseInt(this.state.areaDefault.id),
          address: this.state.address,
          phone: parseInt(this.state.phone),
          consignee: this.state.name,
          isDefault: this.state.isDefault
      };
      params.provinceName = this.state.provinceDefault.cname;
      params.cityName = this.state.cityDefault.cname;
      params.countyName = this.state.areaDefault.cname;
      console.log(params)
      $.ajax({
        type:'post',
        data:params,
        url:baseUrl+'/address/update',
        success(res){
            console.log(res)
            Toast.info('修改成功',1);
            that.props.history.push('/my/address')
        },
        error(){
            Toast.info('修改失败',1);
        }
      })
    }
  }
  componentDidMount(){
    this.getAddressArea('',1,'provinces',()=>{
      this.getAddressEdit()
    })
  }
  render() {
    return (
      <div className="addressadd-page">
          <TextHeader returnbtn={true} title="修改地址" pathname="/my/address"></TextHeader>
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
                        let prov = this.state.provinces.filter((item)=>{
                            if(v[0]===item.id){
                              return item
                            }
                        })
                        this.setState({
                          provinceActive:prov[0]
                        })
                        return true;
                      }}
                      onOk={v => {
                        let prov = this.state.provinces.filter(item=>{
                            if(v[0]===item.id){
                              return item
                            }
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
                            if(v[0]===item.id){
                              return item
                            }
                        })
                        this.setState({
                          cityActive:prov[0]
                        })
                        return true;
                      }}
                      onOk={v => {
                        let prov = this.state.citys.filter(item=>{
                            if(v[0]===item.id){
                              return item
                            }
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
                            if(v[0]===item.id){
                              return item
                            }
                        })
                        this.setState({
                          areaActive:prov[0]
                        })
                        return true;
                      }}
                      onOk={v => {
                        let prov = this.state.areas.filter(item=>{
                            if(v[0]===item.id){
                              return item
                            }
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
                <div style={{color:'#555',fontSize:'12px',margin:'10px'}}>详细地址需填写楼栋楼层或房间号信息</div>
                <WhiteSpace/>
                <WingBlank>
                  <Button type="primary" onClick={()=>{
                    this.submit()
                  }}>修改地址</Button>
                </WingBlank>
              </div>
          </div>
      </div>
    )
  }
}
export default connect()(AddressAdd)

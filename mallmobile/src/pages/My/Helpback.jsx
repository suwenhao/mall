import React, { Component } from 'react'
//引入redux
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import * as routerAction from '@actions/routerAction'
//antd-mobile组件
import { Tabs, Button, Toast } from 'antd-mobile'
//头部组件
import TextHeader from '@components/Header/TextHeader'
//classnames
import classnames from 'classnames'
//css
import '@common/styles/helpback.scss'
import {baseUrl,imgUrl,getToken} from '@common/js/util.js'
import $ from 'jquery'
//富文本
import wangEditor from 'wangeditor'

class Helpback extends Component {
  constructor(props){
    super(props)
    this.state={
      helpbackIndex:0,
      //tabs
      tabs:[
        { title: '帮助', sub: 0 },
        { title: '反馈', sub: 1 }
      ],
      feedbackBtn:null,
      content:''
    }
  }
  createEditor(){
    this.editor = new wangEditor(this.refs.editor);
    this.editor.customConfig.showLinkImg = false
    this.editor.customConfig.uploadFileName = 'file';
    //配置formData参数
    this.editor.customConfig.uploadImgParams = {
        fileType: 'image',
        fileModule:'product',
        isZoom: 0,
        imgData:''
    }
    //配置服务器路径
    this.editor.customConfig.uploadImgServer = baseUrl+'/fileUpload'  
    //配置菜单
    this.editor.customConfig.menus = [
      'image',  // 插入图片
    ]
    //图片上传成功回调
    this.editor.customConfig.uploadImgHooks={
        customInsert: function (insertImg, result, editor) {
            // 图片上传并返回结果，自定义插入图片的事件（而不是编辑器自动插入图片！！！）
            // insertImg 是插入图片的函数，editor 是编辑器对象，result 是服务器端返回的结果

            // 举例：假如上传图片成功后，服务器端返回的是 {url:'....'} 这种格式，即可这样插入图片：
            var url = imgUrl+result.url
            insertImg(url)
        }
    }
    // html 即变化之后的内容
    this.editor.customConfig.onchange = (html)=>{
        this.setState({
          content:html
        })
    }
    //生成editor
    this.editor.create()
  }
  submit(){
    let that = this
    if(!this.state.feedbackBtn){
      Toast.info("请选择类型",1)
    }else if(this.state.content===""){
      Toast.info("请输入内容",1)
    }else{
      console.log(this.state)
      let params={
        token:getToken(),
        type:this.state.feedbackBtn,
        content:this.state.content,
        pictrue:''
      }
      $.ajax({
        type:'post',
        url:baseUrl+'/feedback/submit',
        data:params,
        dataType:'json',
        success(res){
          if(res.code===0){
            Toast.info("提交成功",1)
            that.props.history.push('/my/feedback')
          }
        },
        error(err){
          Toast.info("提交失败",1)
        }
      })
    }
  }
  //挂载组件
  componentDidMount(){
    this.createEditor()
  }
  render() {
    return (
      <div className="helpback-page">
        {/* 头部 */}
        <TextHeader returnbtn={true} title="帮助反馈" pathname="/my">
          <div className="myfeedback" onClick={()=>{
            this.props.history.push('/my/feedback')
            this.props.router.changePath('/my/feedback')
            sessionStorage.setItem('__search_prev_path__','/my/feedback')
          }}>我的反馈</div>
        </TextHeader>
         {/* 内容 */}
        <div className="helpback-main">
          <Tabs tabs={this.state.tabs}
              initialPage={this.state.helpbackIndex}
              tabBarPosition="top"
              renderTab={tab => <span>{tab.title}</span>}
              onChange={(tab, index) => {
                this.setState({
                  helpbackIndex:index
                })
              }}
            >
              {/* 帮助 */}
              <div className="helpback-div" style={{display:this.state.helpbackIndex===0?'block':'none'}}>
                <div className="help-img">
                    <img src={require(`@common/images/test/info.jpg`)} alt=""/>
                </div>
              </div>
              {/* 反馈 */}
              <div className="helpback-div" style={{display:this.state.helpbackIndex===1?'block':'none'}}>
                  <div className="feedback">
                    {/* 反馈标题 */}
                    <h4 className="feedback-title">反馈问题类型</h4>
                    {/* 反馈类型 */}
                    <div className="feedback-check">
                        <div className="feedback-btn">
                            <button className={classnames({
                              active:this.state.feedbackBtn===1
                            })} onClick={()=>{
                              this.setState({
                                feedbackBtn:1
                              })
                            }}>功能异常</button>
                        </div>
                        <div className="feedback-btn">
                            <button className={classnames({
                              active:this.state.feedbackBtn===2
                            })} onClick={()=>{
                              this.setState({
                                feedbackBtn:2
                              })
                            }}>产品建议</button>
                        </div>
                        <div className="feedback-btn">
                            <button className={classnames({
                              active:this.state.feedbackBtn===3
                            })} onClick={()=>{
                              this.setState({
                                feedbackBtn:3
                              })
                            }}>其他</button>
                        </div>
                    </div>
                    {/* 反馈详细 */}
                    <div className="feedback-text">
                      <div id="editor" ref="editor"></div>
                    </div>
                    {/* 反馈提交 */}
                    <div className="feedback-footer">
                      <Button type="primary" onClick={()=>{
                        this.submit()
                      }}>提交</Button>
                    </div>
                  </div>
                </div>
            </Tabs>
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
)(Helpback)

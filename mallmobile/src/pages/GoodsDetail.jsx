import React, { Component } from 'react'
//头部
import Header from '@components/Header/Header'
//组件
import {Carousel,Stepper,Toast} from 'antd-mobile'
//页面css
import '@common/styles/goodsdetail.scss'
//图片预览器组件
import {PhotoSwipe} from 'react-photoswipe'
//公共功能
import {unique,baseUrl,imgUrl,getToken} from '@common/js/util.js'
//加载中组件
import Loading from '@base/Loading'
//classnames插件
import classnames from 'classnames'
//jquery
import $ from 'jquery'
//评论组件
import Comments from '@components/GoodsDetail/Comments'

class GoodsDetail extends Component {
  //构造函数
  constructor(props){
    super(props);
    this.state = {
      loading:true, //控制加载中显示
      data: null,   //商品数据
      val: 1,       //商品数量
      sku:null,     //sku 
      goodId:props.match.params.id,  //商品id
      stockNum:null,    //库存
      stockId:null,     //库存id
      popPrice:null,    //商品当前规格价格
      standard:null,    //sku文字
      productName:null,  //商品名称
      productImage:null, //商品图片
      productPrice:null, //商品价格
      introduction:"",   //商品详情
      specCount:null,   
      specData:null,
      specNameArr:null,
      spcount:null,
      allBtn:true,
      cartListNum:[],
      style:{
        height:'auto',
        width:'auto'
      },
      dotStyle:{
        width:'5px',
        height:'5px'
      },
      isOpen:false,  //图片预览开关
      //图片预览设置
      options:{
        index: 0,
        escKey: true,
        shareEl: false,
        history:false,
        shareButtons:[]
      },
    }
  }
  //计算窗口宽高
  calcWindow(){
    return {
      w:$(window).width(),
      h:$(window).height()
    }
  }
  //窗口大小改变
  resize(){
    let calcw=this.calcWindow()
    let ww=calcw.w>540?'540px':calcw.w+'px';
    this.setState({
      style:{
        width:ww,
        height:ww
      }
    })
  }
  //打开图片浏览
  handleClose(){
    this.setState({
      isOpen: false
    })
  }
  //计算图片宽高
  calcImg(ev,i){
    let picobjs=this.state.data.picobjs.concat();
    picobjs[i].w=ev.currentTarget.width
    picobjs[i].h=ev.currentTarget.height
    this.setState({
      data:{
        ...this.state.data,
        picobjs
      }
    })
  }
  //获取购物车列表
  getCartList(){
      let that = this
      $.ajax({
          type:'get',
          data:{
              token:getToken()
          },
          url:baseUrl+'/cart/getCart',
          success(res){
              console.log(res)
              let cartListNum=0;
              res.data.data.forEach(item => {
                cartListNum+=item.quantity
              });
              that.setState({
                cartListNum:cartListNum
              })
          }
      })
  }
  //获取商品信息详情
  getGoodsDetail(){
    let that = this
    let params = {
      goodId:this.state.goodId
    }
    $.ajax({
      type:'get',
      data:params,
      url:baseUrl+'/goodDetail',
      success(res){
        // console.log(res.data.data)
        that.setState({
          introduction:res.data.data.introduction
        })
      },
      error(){
        that.setState({
          loading:false
        })
      }
    })
  }
  //获取商品信息
  getGoodsInfo(){
    let that = this
    let params = {
      goodId:this.state.goodId,
      token:getToken()
    }
    $.ajax({
      type:'get',
      data:params,
      url:baseUrl+'/goodsInfo',
      success(res){
        let data = res.data
        data.productImage = imgUrl+ data.productImage; 
        //组合图片数组
        let pictures = []
        //有详细图片时
        if (data.pictures) {
            pictures = data.pictures.split(',')
            for (var i in pictures) {
                pictures[i] = imgUrl + pictures[i]
            }
            pictures.unshift(data.productImage)
        }
        //没有详细图片时放入封面图片
        if (pictures.length < 1) {
            pictures.push(data.productImage)
        }
        //构建图片预览器需要的数据
        let picobjs=pictures.map(v=>{
          return {
            src:v,w:500,h:500
          }
        })
        data.picobjs=picobjs
        //更新model
        that.setState({
          data,
          loading:false
        })
        //构建规格
        that.filterData(data)
        that.getCartList()
      },
      error(){
        that.setState({
          loading:false
        })
      }
    })
  }
  //设置初始
  setAllDataStandard(sku){
    //统一处理点击后的规格处理
    let that = this;
    let stockNum = sku.stockNum;
    let popPrice = sku.price.toFixed(2);
    let skuId = sku.id;
    let productName = sku.productName;
    that.setState({
      stockNum: stockNum,
      stockId: skuId,
      popPrice: popPrice,
      standard: '',
      productName: productName,
    })
  }
  //过滤规格数据
  filterData(result){
    //刚开始进来的时候先显示一部分内容
    let that = this;
    let skuData = result.sku[0];
    that.setState({
      sku: result.sku
    })
    //第一次进来设置数据
    that.setAllDataStandard(skuData);
    //判断有一个规格的时候
    let sku = result.sku;
    let productImage = result.productImage;
    that.setState({
      productImage: productImage
    })
    let specNameArr=[];//规格组名字
    let specCount=0;//规格组的数量
    let data=[];//对应规格组的规格
    let code = [];
    for (let i = 0; i < sku[0].skuValues.length;i++){
      specCount++;
      data.push([]);
      code.push([]);
      specNameArr.push(sku[0].skuValues[i].specificationName)
    }
    that.setState({
      specCount: specCount
    })
    let finData = [];
    for (let i = 0; i < sku.length; i++) {
      var specSubArr=[];//规格值
      var skuId = sku[i].id;  //库存id
      for (let j = 0; j < sku[i].skuValues.length;j++){
        specSubArr.push({
          value:sku[i].skuValues[j].specificationValue,
          code: sku[i].skuValues[j].specificationCode
        });  //值
      }
      finData.push(specSubArr);
    }
    //把对应的规格放进对应的规格组
    for (let k = 0; k < finData.length;k++){
      for (let g = 0; g < specCount;g++){
        data[g].push(finData[k][g]['value']);
        code[g].push(finData[k][g]['code']);
      }
    }
    //去重
    for(let i=0;i<data.length;i++){
      data[i] = unique(data[i]);
      code[i] = unique(code[i]);
      let newData = [];
      for(let j=0;j<data[i].length;j++){
        newData.push({
          key:'0',
          text: data[i][j],
          code: code[i][j],
        })
      }
      data[i]=newData;
    }
    //默认设置选中
    for(let k in data){
      data[k][0].key = '1';
    }
    that.setState({
      specData:data,
      specNameArr:specNameArr
    })
    let standardText='';
    for (let i in data){
      let key = false;
      for(let j in data[i]){
        if (data[i][j].key=='1'){
          key = data[i][j].text;
          break;
        }
      }
      if (key===false){
        standardText += specNameArr[i] + ": ;"
      }else{
        standardText += specNameArr[i] + ':' +key+ ";"
      }
    }
    that.setState({
      standard: standardText
    })
  }
  //选择规格
  selectedSpec(parentIndex,index){
    let that=this;
    that.setState({
      spcount: 0,
      allBtn:false
    })
    let specCount = that.state.specCount;
    let data = that.state.specData;
    let sku = that.state.sku;
    let specNameArr = that.state.specNameArr;
    for (let i in data[parentIndex]){
      data[parentIndex][i].key='0'
    }
    data[parentIndex][index].key='1';
    let standardText = '';
    let spcount=0;
    let codeArr=[];
    for (let i in data) {
      let key = false;
      for (let j in data[i]) {
        if (data[i][j].key == '1') {
          spcount++;
          key = data[i][j].text;
          codeArr.push(data[i][j].code);
          break;
        }
      }
      if (key === false) {
        standardText += specNameArr[i] + ": ;"
      } else {
        standardText += specNameArr[i] + ':' + key + ";"

      }
    }
    that.setState({
      specData:data,
      spcount: spcount,
      standard: standardText
    })
    if (spcount == specCount){
      let stockNum=0;
      let stockId=null;
      let popPrice=null;
      for(let i in sku){
        let key=false;
        for (let j in sku[i]['skuValues']){
          if (sku[i]['skuValues'][j].specificationCode==codeArr[j]){
            key=true;
          }else{
            key=false;
            break;
          }
        }
        if(key===true){
          stockNum=sku[i].stockNum;
          stockId = sku[i].id;
          popPrice = sku[i].price;
          break;
        }
      }
      that.setState({
        stockNum: stockNum,
        val:1,
        stockId: stockId,
        allBtn: true,
        popPrice: popPrice.toFixed(2)
      })
    }
  }
  //数量改变
  stepperChange(e){
    if(e>this.state.stockNum){
      this.setState({
        val:this.state.stockNum
      })
      Toast.info('库存不足', 1);
      return;
    }
    this.setState({
      val:e
    })
  }
  //加入购物车
  addGoodOrCart(){
    //这样才能加入购物车
    //加入购物车
    let that = this;
    let stockNum = that.state.stockNum;
    let allBtn = that.state.allBtn;
    if(this.state.loading){
      Toast.info('等待数据加载完毕',1);
    }else{
      if (allBtn) {
        if (this.state.val > stockNum) {
          Toast.info('库存不足',1);
        } else {
            let params = {
              token: getToken(),
              productId: that.state.goodId,
              quantity: this.state.val,
              skuId: that.state.stockId
            }
            $.ajax({
              type:"get",
              url:baseUrl+'/cart/addCart',//添加自己的接口链接
              data:params,
              dataType:'json',
              success(res){
                  Toast.info('加入购物车成功',1)
                  that.getCartList()
              },
              error(err){
                  Toast.info('加入购物车失败',1)
              }
            })
        }
      } else {
        Toast.info('请选择规格',1);
      }
    }
  }
  //购买
  buyImmediately(){
    //点击立刻购买
    var that = this;
    var allBtn = that.state.allBtn;
    var result = that.state.data;

    if(this.state.loading){
      Toast.info('等待数据加载完毕',1);
    }else{
      if (allBtn) {
        if (that.state.val > that.state.stockNum) {
          Toast.info('库存不足',1);
        } else {
          //现在的思路是每次点击规格的时候就把规格参数记录起来，
          //然后再点击立即购买的时候拿出数据，
          //转跳界面的时候需要清除数据
          var allData = {};
          allData['items']=[]
          allData['items'].push({
              productId: that.state.goodId,
              selectQuantity: that.state.val,
              skuId: that.state.stockId,
              skuStr: that.state.standard,
              productName: that.state.productName,
              productPrice: that.state.popPrice,
              productImage: that.state.productImage,
              pickupWay: result.pickupWay
          })
          allData['pickupWay'] = result.pickupWay;
          //保存数据到本地
          sessionStorage.setItem('goodDetailData', JSON.stringify(allData));
          sessionStorage.setItem('__search_prev_path__',this.props.location.pathname)
          this.props.history.push('/order')
        }
      } else {
        Toast.info('请选择规格',1);
      }
    }
  }
  //组件装载完毕
  componentDidMount(){
    let self = this
    this.resize()
    $(window).on('resize',()=>{
      self.resize()
    })
    this.getGoodsInfo()
    this.getGoodsDetail()
  }
  render() {
    let prevPath = sessionStorage.getItem('__search_prev_path__')
    let goodsPrevPath = sessionStorage.getItem('__goods_prev_path__')
    return (
      <div className="goods-page">
        {
          this.state.isOpen?
          <PhotoSwipe isOpen={this.state.isOpen} items={this.state.data?this.state.data.picobjs:[]} options={this.state.options} onClose={this.handleClose.bind(this)}/>
          :null
        }
        {/* <-头部 */}
        <div style={{
          position:'fixed',
          top:0,
          left:0,
          width:'100%',
          zIndex:1000
        }}>
          <Header returnbtn={true} title="商品详情" pathname={goodsPrevPath||'/'}></Header>
        </div> 
        {/* 头部-> */}
        {/* <-body */}
        {
        this.state.loading?
        null
        :
          <div className="cart-icon" onClick={()=>{
            sessionStorage.setItem('__search_prev_path__',this.props.location.pathname)
            this.props.history.push('/cart')
          }}>
            {
              this.state.cartListNum>0?
              <span>{this.state.cartListNum}</span>
              :null
            }
            <img src={require(`@common/images/cart_w.png`)} alt=""/>
          </div>
        }
        <div style={{
          height:'46px',
          width:'100%'
        }}></div>
        {
        this.state.loading?
        <Loading/>
        :
        <div className="goods-main">
          {/* <--商品图片 */}
          {this.state.data?
          <Carousel
            autoplay={false}
            className="carousel"
            infinite={false}
            style={this.state.style}
            dotStyle={this.state.dotStyle}
            dotActiveStyle={this.state.dotStyle}
            beforeChange={(from, to) => {}}
            afterChange={index => {}}
          >
             {  
              this.state.data.picobjs.map((val,i) => (
                  <a
                    className="carousel-item"
                    key={i}
                    style={this.state.style}
                  >
                    <img
                      src={val['src']}
                      alt={val['src']}
                      onLoad={(ev) => {
                        // 图片加载完毕
                        window.dispatchEvent(new Event('resize'));
                        //计算图片宽高
                        this.calcImg(ev,i)
                      }}
                      onClick={()=>{
                        this.setState({
                          isOpen: true,
                          options:{
                            ...this.state.options,
                            index:i
                          }
                        })
                      }}
                    />
                  </a>
                ))
              }
          </Carousel>
          :null
          }
          {/* 商品图片--> */}
          {/* <--商品详情 */}
          <div className="buy-wrap">
              <div className="goods-name">
                <div className="goods-title">
                {this.state.data&&this.state.data.productName}
                </div>
                {/* <div className="goods-favour">
                  收藏
                </div> */}
              </div>
              <div className="goods-desc">
              {this.state.data&&this.state.data.desc}
              </div>
          </div>
          {/* 商品详情--> */}
          {/* <--价格 */}
          <div className="price-wrap">
              <div className="price">
                <span><i>￥</i>{this.state.data&&this.state.popPrice}</span>
                <span>￥{this.state.data&&this.state.data.productPrice.toFixed(2)}</span>
              </div>
              <div className="scoket">
                库存 <span>{this.state.data&&this.state.stockNum}</span>
              </div>
          </div>
           {/* 价格--> */}
           <div className="item-list">
            <h3>选择</h3>
            <div className="item-content">
              {this.state.standard}
            </div>
          </div>
           {/* <--规格 */}
          <div className="sku-wrap">
            <div className="property-div">
              {/* 规格组 */}
              {
                this.state.specData&&this.state.specData.length>0?
                this.state.specData.map((item,i)=>{
                  return (
                    <div className="sku" key={i}>
                      <h3>{this.state.specNameArr&&this.state.specNameArr[i]}</h3>
                      <div className="sku-list">
                          {
                            item.map((jtem,j)=>{
                              return (
                                <div key={j} className={classnames({
                                  'option':true,
                                  'option-selected':jtem.key==="1"?true:false
                                })} onClick={()=>{
                                  //规格点击事件
                                  this.selectedSpec(i,j)
                                }}>{jtem.text}</div>
                              )
                            })
                          }
                      </div>
                    </div>
                  )
                })
                :null
              }
            </div>
            {/* 商品数量 */}
            <div className="sku-num">
              <div className="sku">
                    <h3>数量</h3>
                    <div className="sku-list">
                      <Stepper
                        className="stepper"
                        showNumber
                        min={1}
                        value={this.state.val}
                        onChange={(e)=>{
                          this.stepperChange(e)
                        }}
                      />
                    </div>
              </div>
            </div>
            {/* 商品数量 */}
          </div>
          {/* 规格--> */}
          <div className="info-wrap">
            <div className="info-header comment">
              <span>
                评论
              </span>
              {/* <span>
                <img src={require('@common/images/next.png')} alt=""/>
              </span> */}
            </div>
            <Comments commentTotal={this.state.data&&this.state.data.commentTotal} goodId={parseInt(this.state.goodId)}/>
          </div>
          <div className="info-wrap">
            <div className="info-header">商品详情</div>
            <div className="info-body" dangerouslySetInnerHTML = {{ __html:this.state.introduction!==""?this.state.introduction:"暂无商品详情" }}>
            </div>
          </div>
        </div>
        }
        {/* body-> */}
        <div className="fixed-btns">
          <div className="icon" onClick={()=>{
            window.location.href="tel:13726686145"
          }}>
              <img src={require(`@common/images/msg@default.png`)} alt="客服"/>
              <span>客服</span>
          </div>
          <button className="btn-orange" onClick={()=>{
            this.addGoodOrCart()
          }}>加入购物车</button>
          <button onClick={()=>{
            this.buyImmediately()
          }}>购买</button>
        </div>
      </div>
    )
  }
}
export default GoodsDetail

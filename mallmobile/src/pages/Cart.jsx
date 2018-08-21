import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Checkbox} from 'antd-mobile'
//组件
import TextHeader from '@components/Header/TextHeader'
import CartList from '@components/Cart/CartList'
import Loading from '@base/Loading'
//css
import '@common/styles/cart.scss'
//ajax
import axios from 'axios'
import $ from 'jquery'
import {baseUrl,imgUrl,getToken} from '@common/js/util.js'
import classnames from 'classnames'


class Cart extends Component {
    constructor(props){
        super(props)
        this.state={
            deleteAll:false,
            loading:true,
            checkedNum:0,
            allPrice:0,
            cartNmu:0,
            data:[]
        }
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
                that.setState({
                    data:res.data.data.map(v=>{
                        return {
                            ...v,
                            check:false,
                            value:v.quantity
                        }
                    }),
                    loading:false,
                    checkedNum:0,
                    allPrice:0,
                    cartNmu:0,
                })
            }
        })
    }
    //全选
    allChange(e){
        let checked = e.target.checked
        let newData=this.state.data.map((item,i)=>{
            return {
                ...item,
                check:checked
            }
        })
        this.setState({
            data:newData
        })
        this.calc(newData)
    }
    //改变库存
    changeStock(id,val){
        let newData = this.state.data.map((item,i)=>{
            if(item.id===id){
                return {
                    ...item,
                    value:val
                }
            }else{
                return item;
            }
        })
        this.setState({
            data:newData
        })
        this.calc(newData)
    }
    //点击
    checkChange(id,check){
        let newData = this.state.data.map((item,i)=>{
            if(item.id===id){
                return {
                    ...item,
                    check:check
                }
            }else{
                return item;
            }
        })
        this.setState({
            data:newData
        })
        this.calc(newData)
    }
    //计算总价
    calc(newData){
        let allPrice = 0;
        let checkedNum = 0;
        let cartNmu = 0;
        newData.forEach((item,i)=>{
            if(item.check){
                cartNmu+=1;
                checkedNum+=parseFloat(item.value);
                allPrice+=parseFloat(item.value)*parseFloat(item.productSalesPrice)
            }
        })
        this.setState({
            checkedNum,
            allPrice,
            cartNmu
        })
    }
    //购买
    buy(){
        console.log(this.state)
        var allData = {};
        allData['items']=[]
        this.state.data.forEach(v=>{
            if(v.check){
                allData['items'].push({
                    productId: v.productId,
                    selectQuantity: v.value,
                    skuId: v.skuId,
                    skuStr: v.skuStr,
                    productName: v.productName,
                    productPrice: v.productSalesPrice,
                    productImage: imgUrl+v.productThumbnail,
                    pickupWay: v.pickupWay
                })
            }
        })
        
        allData['pickupWay'] = allData['items'][0].pickupWay;
        console.log(allData)
        //保存数据到本地
        sessionStorage.setItem('goodDetailData', JSON.stringify(allData));
        sessionStorage.setItem('__search_prev_path__',this.props.location.pathname)
        this.props.history.push('/order')
    }
    deleteAll(){
        let deleteData = this.state.data.filter(v=>{
            if(v.check){
                return v
            }
        })
        console.log(deleteData)
    }
    //装载组件
    componentDidMount(){
        this.getCartList()
    }
    render() {
        return (
            <div className="cart-page" style={{overflow:'hidden'}}>
                <TextHeader returnbtn={true} title="购物车" pathname={sessionStorage.getItem('__search_prev_path__')}>
                    {/* <span className="edit" onClick={(e)=>{
                        e.preventDefault();
                        this.setState({deleteAll:!this.state.deleteAll})
                    }}>
                    {
                        this.state.deleteAll?
                        '返回'
                        :
                        '编辑'
                    }
                    </span> */}
                </TextHeader>
                <div className="cart-body">
                    {
                        this.state.loading?
                        <Loading/>
                        :
                        <CartList getCartList={this.getCartList.bind(this)} changeStock={this.changeStock.bind(this)} checkChange={this.checkChange.bind(this)} data={this.state.data}></CartList>
                    }
                </div>
                {
                    this.state.deleteAll?
                    <div className="cart-footer">
                        <div>
                            <Checkbox onChange={(e)=>{
                                this.allChange(e)
                            }}/>
                            <div>全选</div>
                        </div>
                        <div></div>
                        <div  className={classnames({
                            'active':this.state.cartNmu>0
                        })} onClick={()=>{
                            if(this.state.cartNmu>0){
                                this.delete()
                            }
                        }}>
                            删除<span>({this.state.cartNmu})</span>
                        </div>
                    </div>
                    :
                    <div className="cart-footer">
                        <div>
                            <Checkbox onChange={(e)=>{
                                this.allChange(e)
                            }}/>
                            <div>全选</div>
                        </div>
                        <div className="all-pirce">
                            <p>
                                <span>总计：</span>
                                <span>￥{this.state.allPrice}</span>
                            </p>
                        </div>
                        <div className={classnames({
                            'active':this.state.checkedNum>0
                        })} onClick={()=>{
                            if(this.state.checkedNum>0){
                                this.buy()
                            }
                        }}>
                            去结算<span>({this.state.checkedNum}件)</span>
                        </div>
                    </div>
                }
                
            </div>
        )
    }
}

export default connect()(Cart)
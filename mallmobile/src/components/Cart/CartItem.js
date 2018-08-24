import React, {Component} from 'react'
import {withRouter} from 'react-router-dom'
import {Checkbox, Stepper, SwipeAction, Toast, Modal} from 'antd-mobile'
import {baseUrl,imgUrl,getToken} from '@common/js/util'
import $ from 'jquery'


class CratItem extends Component{
    //构造函数
    constructor(props){
        super(props)
        this.state={
            val:props.item.value
        }
    }
    //改变选择
    onChange(e,id){
        let checked = e.target.checked;
        // console.log(checked,id)
        this.props.checkChange(id,checked)
    }
    //修改购物车
    editCart(it,val){
        let params = {};
        params.items=[]
        params.items.push({
            id:it.id,
            skuId:it.skuId,
            quantity:val,
            productId:it.productId,
        })
        params.items=JSON.stringify(params.items)
        params['token'] = getToken()
        $.ajax({
            type:'post',
            url:baseUrl+'/cart/updateCart',
            data:params,
            dataType:'json',
            success(res){
                if(res.code==0){
                    Toast.info('修改成功',1)
                }
            },
            error(err){
                Toast.info('修改失败',1)
            }
        })
    }
    //删除购物车
    delete(id){
        var that=this;
        Modal.alert('提示', '是否删除该商品？', [
            { text: '取消', onPress: () => console.log('cancel'), style: 'default' },
            { text: '确认', onPress: () => {
                $.ajax({
                    type:'post',
                    data:{
                        token:getToken(),
                        id:id,
                    },
                    url:baseUrl+'/cart/deleteCart',
                    success(res){
                        Toast.info("删除成功",1);
                        that.props.getCartList()
                    },
                    error(err){
                        Toast.info('删除失败',1)
                    }
                })
            } },
        ])
    }
    //跳转
    goto(id){
        this.props.history.push('/goods/'+id)
        sessionStorage.setItem('__search_prev_path__',this.props.location.pathname)
        sessionStorage.setItem('__goods_prev_path__',this.props.location.pathname)
    }
    //render
    render(){
        let item = this.props.item
        return (
            <SwipeAction
            autoClose={true}
            style={{ backgroundColor: '#f5f5f9',paddingBottom:'10px' }}
            right={[
                {
                text: '删除',
                onPress: () =>{
                    console.log('delete')
                    this.delete(item.id)
                    return false;
                },
                style: { backgroundColor: '#F4333C', color: 'white' },
                },
            ]}
            onOpen={() => console.log('global open')}
            onClose={() => {
                console.log('global close')
                return false;
            }}
        >
            <div className="cart-c-item" >
                <div className="cart-c-check">
                    <Checkbox checked={item.check} onChange={(e) => {
                        this.onChange(e,item.id)
                    }}/>
                </div>
                {/* 商品图片 */}
                <div className="cart-ci-left" onClick={()=>{
                    this.goto(item.productId)
                }}>
                    <img src={imgUrl+item.productThumbnail} alt={item.productName}/>
                </div>
                {/* 商品信息 */}
                <div className="cart-ci-right">
                    <div className="r-title"><span>{item.productName}</span></div>
                    <div className="r-step">
                        <span className="r-price"><span>￥</span>{item.productSalesPrice.toFixed(2)}</span>
                        <span className="span-stepper">
                            {/* 加减步进器 */}
                            <Stepper
                                style={{ maxWidth: '100px',height:'30px' }}
                                showNumber
                                max={item.stockNum}
                                min={1}
                                value={item.value}
                                onChange={(val)=>{
                                    if(val>item.stockNum){
                                        Toast.info("库存不足",1)
                                        this.props.changeStock(item.id,item.stockNum)
                                        this.editCart(item,val)
                                    }else{
                                        this.props.changeStock(item.id,val)
                                        this.editCart(item,val)
                                    }
                                }}
                            />
                        </span>
                    </div>
                </div>
            </div>
        </SwipeAction>
        )
    }
}
export default withRouter(CratItem)
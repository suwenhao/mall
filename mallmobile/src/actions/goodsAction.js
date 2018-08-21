import {GETGOODSLIST,GETPUSHGOODS,CHANGEISTOP,CHANGESORTTYPE,CHANGECATEID,CHANGEPAGESIZE,CHANGEPRICE,OVERLOAD} from '@types/goodsType'
import { baseUrl,imgUrl } from '@common/js/util'
import { Toast } from 'antd-mobile'
import axios from 'axios'

//获取商品列表
export const getGoodsList = (search,cb) => async(dispatch,state)=>{
    let {categoryId,sortType,isTop,pageSize,endPrice,startPrice} = state().goodsReducer
    let params={
        categoryId:categoryId,
        sortType:sortType,
        isTop:isTop,
        name:search,
        pageSize:pageSize,
        pageNumber:1
    }
    if(endPrice){
        params['endPrice']=endPrice;
    }
    if(startPrice){
        params['startPrice']=startPrice
    }
    let {data} = await axios.get(baseUrl+'/goodList',{params}).then(res=>res)
    console.log(data)
    if(data.code===0){
        let newData = data.data.data.map(v=>{
            return {
                ...v,
                thumbnail:imgUrl+v.thumbnail
            }
        })
        dispatch({type:GETGOODSLIST,goods:newData,totalPages:data.data.totalPages,pageNumber:2,pageSize})
        cb&&cb()
    }else{
        Toast.init(data.message,1)
    }
    
}
//获取更多商品
export const getPushGoods = (search,cb) => async(dispatch,state)=>{
    let {categoryId,sortType,isTop,pageSize,pageNumber,endPrice,startPrice} = state().goodsReducer
    let params={
        categoryId:categoryId,
        sortType:sortType,
        isTop:isTop,
        name:search,
        pageSize:pageSize,
        pageNumber:pageNumber
    }
    if(endPrice){
        params['endPrice']=endPrice;
    }
    if(startPrice){
        params['startPrice']=startPrice
    }
    let {data} = await axios.get(baseUrl+'/goodList',{params}).then(res=>res)
    console.log(data)
    if(data.code===0){
        let newData = data.data.data.length>0?data.data.data.map(v=>{
            return {
                ...v,
                thumbnail:imgUrl+v.thumbnail
            }
        }):[]
        dispatch({type:GETPUSHGOODS,goods:newData,totalPages:data.data.totalPages,pageNumber:pageNumber+1,pageSize})
        cb&&cb()
    }else{
        Toast.init(data.message,1)
    }
}
//改变istop
export const changeIsTop = (isTop)=>{
    return {
        type:CHANGEISTOP,
        isTop
    }
}
//改变sorttype
export const changeSortType = (sortType)=>{
    return {
        type:CHANGESORTTYPE,
        sortType
    }
}
//改变cateid
export const changeCateId = (id)=>{
    return {
        type:CHANGECATEID,
        id
    }
}
//改变分页大小
export const changPageSize = (pageSize)=>{
    return {
        type:CHANGEPAGESIZE,
        pageSize
    }
}
//改变价格
export const changePrice = (startPrice, endPrice)=>{
    return {
        type:CHANGEPRICE,
        endPrice,
        startPrice
    }
}
//重载
export const overload = ()=>{
    return {
        type:OVERLOAD
    }
}
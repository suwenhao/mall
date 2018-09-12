import {LOADCATE,SETCARTNUM} from '@types/loadType'
import axios from 'axios'
import {baseUrl,getToken} from '@common/js/util'

export const loadCate = (cb) => async (dispatch) => {
    let {data} = await axios.get(baseUrl+'/productCategory/list').then(res=>res)
    dispatch({type:LOADCATE,cates:data.data})
    localStorage.setItem('cates',JSON.stringify(data.data))
    cb&&cb(data.data)
}
export const getCartList = () => async (dispatch)=>{
    let params={
        token:getToken()
    }
    let {data} = await axios.get(baseUrl+'/cart/getCart',{params}).then(res=>res)
    console.log(data)
    var cartListNum=0;
    data.data.data.forEach(item => {
        cartListNum+=item.quantity
    });
    dispatch({type:SETCARTNUM,num:cartListNum})
}
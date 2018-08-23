import {LOADCATE} from '@types/loadType'
import axios from 'axios'
import {baseUrl} from '@common/js/util'

export const loadCate = (cb) => async (dispatch) => {
    let cates=localStorage.getItem('cates');
    if(cates){
        dispatch({type:LOADCATE,cates:JSON.parse(cates)})
        cb&&cb(JSON.parse(cates))
    }else{
        let {data} = await axios.get(baseUrl+'/productCategory/list').then(res=>res)
        dispatch({type:LOADCATE,cates:data.data})
        localStorage.setItem('cates',JSON.stringify(data.data))
        cb&&cb(data.data)
    }
    
}
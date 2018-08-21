import {GETGOODSLIST,GETPUSHGOODS,CHANGEISTOP,CHANGESORTTYPE,CHANGECATEID,CHANGEPAGESIZE,CHANGEPRICE,OVERLOAD} from '@types/goodsType'

const initState ={
    goods:[],
    categoryId:'',
    endPrice:'',
    startPrice:'',
    sortType:'',
    isTop:'',
    pageSize:20,
    totalPages:1,
    pageNumber:1
}
export default (state=initState,action)=>{
    switch(action.type){
        case GETGOODSLIST:
            return {
                ...state,
                goods:action.goods,
                totalPages:action.totalPages,
                pageNumber:action.pageNumber,
                pageSize:action.pageSize
            }
        case GETPUSHGOODS:
            return {
                ...state,
                goods:state.goods.concat(action.goods),
                totalPages:action.totalPages,
                pageNumber:action.pageNumber,
                pageSize:action.pageSize
            }
        case CHANGEISTOP:
            return {
                ...state,
                isTop:action.isTop
            }
        case CHANGESORTTYPE:
            return {
                ...state,
                sortType:action.sortType
            }
        case CHANGECATEID:
            return {
                ...state,
                categoryId:action.id
            }
        case CHANGEPAGESIZE:
            return {
                ...state,
                pageSize:action.pageSize
            }
        case CHANGEPRICE:
            return {
                ...state,
                endPrice:action.endPrice,
                startPrice:action.startPrice,
            }
        case OVERLOAD:
            return {
                ...state,
                goods:[],
                categoryId:'',
                sortType:'',
                isTop:'',
                pageSize:20,
                totalPages:1,
                pageNumber:1
            }
        default:
            return state;
    }
}
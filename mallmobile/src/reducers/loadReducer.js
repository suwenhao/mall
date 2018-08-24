import {LOADCATE,SETCARTNUM} from '@types/loadType'
const initState={
    cates:[],
    cartNum:0,
}
export default (state=initState,action)=>{
    switch(action.type){
        case LOADCATE:
            return {
                ...state,
                cates:action.cates
            }
        case SETCARTNUM:
            return {
                ...state,
                cartNum:action.num
            }
        default:
            return state
    }
}
const router = require('koa-router')();
const util = require('../../models/util.js');
const fs = require('fs');
const path = require('path');

router.get('/listAddress', async (ctx)=>{
    let address_list = fs.readFileSync(path.join(__dirname,'../../static/address_list.json'),'utf8')
    ctx.body=JSON.parse(address_list)
})
router.get('/areaList', async (ctx)=>{
    let {parentId,level} = ctx.query
    if(level==1){
        let province = fs.readFileSync(path.join(__dirname,'../../static/province.json'),'utf8')
        ctx.body=JSON.parse(province)
    }else if(level==2){
        let city = fs.readFileSync(path.join(__dirname,'../../static/city.json'),'utf8')
        ctx.body=JSON.parse(city)
    }else if(level==3){
        let area = fs.readFileSync(path.join(__dirname,'../../static/area.json'),'utf8')
        ctx.body=JSON.parse(area)
    }
})
router.post('/order/list', async (ctx)=>{
    let {status} = ctx.request.body
    if(status===0){
        let order_list = fs.readFileSync(path.join(__dirname,'../../static/order_list.json'),'utf8')
        ctx.body=JSON.parse(order_list)
    }else{
        ctx.body={
            "pageNumber": 1,
            "code": 0,
            "data": [],
            "totalPages": 1,
            "pageSize": 10,
            "message": "操作成功"
        }
    }
    
})
router.get('/goodInfo', async (ctx)=>{
    let data = JSON.parse(fs.readFileSync(path.join(__dirname,'../../static/goods_detail.json'),'utf8'))
    ctx.body={
        msg:'success',
        code:0,
        data
    }
})
router.get('/cartList', async (ctx)=>{
    let data = JSON.parse(fs.readFileSync(path.join(__dirname,'../../static/cart.json'),'utf8'))
    ctx.body=data
})
module.exports = router.routes()
const Koa = require('koa'),
      Router = require('koa-router'),
      Static = require('koa-static'),
      Session = require('koa-session'),
      BodyParser = require('koa-bodyparser'),
      path = require('path'),
      url = require('url'),
      jsonp = require('koa-jsonp');

const app = new Koa();
const router = new Router();

/*
*配置中间件
*/
//配置session
app.keys = ['some secret hurr'];
app.use(Session({
    key: 'koa:sess',
    maxAge: 8640000,
    overwrite: true,
    httpOnly: true,
    signed: true, 
    rolling: true, 
    renew: false
},app))
//配置静态资源
app.use(Static(path.join(__dirname,'static')))
//配置post请求数据接收
app.use(BodyParser());
//jsonp
app.use(jsonp());

//引入路由模块routes
const api = require('./routes/api');

router.use('/api',api);


//启动路由
app.use(router.routes());
app.use(router.allowedMethods());
//启动服务器
app.listen(3001,(err)=>console.log('http://localhost:3001'));
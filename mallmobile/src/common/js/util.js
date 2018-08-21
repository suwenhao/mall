export const baseUrl = "http://chaoliu.huibada.cn/mc-shopping/api"
export const imgUrl = "http://exotic.gzfenzu.com"

//数组去重
export const unique = (array)=>{
    var n = []; //一个新的临时数组 
    //遍历当前数组 
    for (var i = 0; i < array.length; i++) {
      //如果当前数组的第i已经保存进了临时数组，那么跳过， 
      //否则把当前项push到临时数组里面
      if (n.indexOf(array[i]) === -1) n.push(array[i]);
    }
    return n;
}
export const getToken = ()=>{
  var token = localStorage.getItem('token')
  if (!token) {
      return '3517dcab16b368c11e12f70369b50185RR20A85m3b7TZyoU0w78330NO69o3oR2De1770Sg5a98l2U9q13c8Mk6V11o25z6'
      // return null
  } else {
    return token
  }
}
export const getQueryString=(name)=>{
  var result = window.location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
  if (result == null || result.length < 1) {
      return "";
  }
  return result[1];
}
export const locationHref =()=>{
  var ret_url = "http://chaoliu.huibada.cn/mc-shopping/getLogin.html"
  var open_weixin = 'https://open.weixin.qq.com/connect/oauth2/authorize'
  var app_id = 'wx36cf3578e22c3eb5'
  var oper_url = open_weixin + '?appid=' + app_id + '&redirect_uri=' + ret_url + '&response_type=code&scope=snsapi_userinfo&state=null#wechat_redirect'
  return oper_url
}
export const formatTime = (date)=>{
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  return [year, month, day].map(this.formatNumber).join('/')
}
export const formatDate=(now, fmt)=>{
  var now = new Date(now);
  var fmt = fmt ? fmt : 'yyyy-MM-dd hh:mm:ss';
  var o = {
      "M+": now.getMonth() + 1,                 //月份 
      "d+": now.getDate(),                    //日 
      "h+": now.getHours(),                   //小时 
      "m+": now.getMinutes(),                 //分 
      "s+": now.getSeconds(),                 //秒 
      "q+": Math.floor((now.getMonth() + 3) / 3), //季度 
      "S": now.getMilliseconds()             //毫秒 
  };
  if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (now.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  for (var k in o) {
      if (new RegExp("(" + k + ")").test(fmt)) {
          fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
      }
  }
  return fmt;
}
//js获取当前时间前后N天前后日期的方法
export const GetDateStr=(AddDayCount)=>{   
  var dd = new Date();  
  dd.setDate(dd.getDate()+AddDayCount);//获取AddDayCount天后的日期  
  var y = dd.getFullYear();   
  var m = (dd.getMonth()+1)<10?"0"+(dd.getMonth()+1):(dd.getMonth()+1);//获取当前月份的日期，不足10补0  
  var d = dd.getDate()<10?"0"+dd.getDate():dd.getDate();//获取当前几号，不足10补0  
  return y+"-"+m+"-"+d;   
}  
//计算时间相差fn(过去距离当前时间)
export const computingTime=(pastTime)=>{
  var currentTime = (new Date()).getTime(),
      distanceTime = currentTime - pastTime,
      //计算相差天数
      days = Math.floor(distanceTime / (24 * 3600 * 1000)),
      //计算相差小时数
      leave1 = distanceTime % (24 * 3600 * 1000),
      hours = Math.floor(leave1 / (3600 * 1000)),
      //计算相差分钟数
      leave2 = leave1 % (3600 * 1000),
      minutes = Math.floor(leave2 / (60 * 1000)),
      //计算相差毫秒数
      leave3 = leave2 % (60 * 1000),
      seconds = Math.round(leave3 / 1000),
      //处理返回格式
      dayStr = days <= 0 ? "" : days + "天",
      hourStr = hours <= 0 ? "" : hours + "小时",
      minuteStr = minutes <= 0 ? "" : minutes + "分钟",
      secondStr = (days <= 0 && hours <= 0 && minutes <= 0) ? "刚刚" : "前";
  // secondStr=seconds==0?"":seconds+"秒";
  if (days >= 1) {
      return dayStr + '前';
  } else {
      return dayStr + hourStr + minuteStr + secondStr;
  }
}
//时间倒计(未来距离现在)
export const timeDown=(endDate)=>{
  var now = new Date();
  var leftTime = endDate - now.getTime();
  var leftsecond = parseInt(leftTime / 1000);
  var day1 = Math.floor(leftsecond / (60 * 60 * 24));
  var hour = Math.floor((leftsecond - day1 * 24 * 60 * 60) / 3600);
  var minute = Math.floor((leftsecond - day1 * 24 * 60 * 60 - hour * 3600) / 60);
  var second = Math.floor(leftsecond - day1 * 24 * 60 * 60 - hour * 3600 - minute * 60);
  hour = hour >= 10 ? hour : '0' + hour;
  minute = minute >= 10 ? minute : '0' + minute;
  second = second >= 10 ? second : '0' + second;
  return day1 + '天' + hour + ':' + minute + ':' + second;
  return leftTime;
}

//去除字符串首尾空格
export const strTrim=(s)=>{
  return s.replace(/(^\s*)|(\s*$)/g, "");
}

export const isPhone=($poneInput)=>{
  var myreg = /^[1][3,4,5,7,8][0-9]{9}$/;
  if (!myreg.test($poneInput)) {
      return true;
  } else {
      return false;
  }
} 
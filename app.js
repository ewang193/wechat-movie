// $ node --harmony app.js   注意node的版本需要是11以上才可以用KOA框架，用--harmony把generator function给开起来
// 浏览器访问http://localhost:1234(命令行会打印出{}), http://localhost:1234?a=1(命令行会打印出{ a: '1' })

//'use strict';

//var koa = require('koa');
//var sha1 = require('sha1');
//var path = require('path');
//var wechat = require('./wechat/g');
//var util = require('./libs/util');
//var route = require('koa-route');
//var wechat_file = path.join(__dirname, './config/wechat.txt');
//var config = {
//    wechat: {
//        appID: 'wx1ba5f1d5e4960b1e',
//        appSecret: '430bdc6a070e50b6cf34cbd38a39b691',
//        token: 'testtoken',   //自己设置的token值
//        getAccessToken: function() {
//            return util.readFileAsync(wechat_file);
//        },
//        saveAccessToken: function(data){
//            data = JSON.stringify(data);
//            return util.writeFileAsync(wechat_file, data);
//        }
//    }
//};

//var app = new koa();   //实例化一个koa的web服务器

//app.use(wechat(config.wechat));

//app.listen(1234);
//console.log('Listening: 1234');




'use strict';

var koa = require('koa');
var wechat = require('./wechat/g');
var config = require('./config');
var weixin = require('./weixin');

var app = new koa();

app.use(wechat(config.wechat, weixin.reply));

app.listen(1234);
console.log('Listening: 1234');
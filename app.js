// 'use strict';

var koa = require('koa');
var sha1 = require('sha1');
var route = require('koa-route');
var config = {
    wechat: {
        appID: 'wx1ba5f1d5e4960b1e',
        appSecret: '430bdc6a070e50b6cf34cbd38a39b691',
        token: 'testtoken'   //自己设置的token值
    }
};

var app = new koa();   //实例化一个koa的web服务器

app.use(function *(next) {    // *表示是生成器函数，KOA也只接受生成器函数，generator function
    console.log(this.query);

    var token = config.wechat.token;
    var signature = this.query.signature;
    var nonce = this.query.nonce;
    var timestamp = this.query.timestamp;
    var echostr = this.query.echostr;

    var str = [token, timestamp, nonce].sort().join('');
    var sha = sha1(str);

    if(sha === signature){
        this.body = echostr + '';
    } else {
        this.body = 'wrong';
    }
});

// function about(ctx){
//     ctx.response.type = "html";
//     ctx.response.body = '<a href="/">Index Page</a>';
// }
//
function main(ctx){
    ctx.response.body = 'Hello World';
}

app.use(route.get('/', main));
// app.use(route.get('/about', about));

app.listen(1234);
console.log('Listening: 1234');



// $ node --harmony app.js   注意node的版本需要是11以上才可以用KOA框架，用--harmony把generator function给开起来
// 浏览器访问http://localhost:1234(命令行会打印出{}), http://localhost:1234?a=1(命令行会打印出{ a: '1' })





// const about = ctx => {
//     ctx.response.type = "html";
//     ctx.response.body = '<a href="/">Index Page</a>';
// };
//
// const main = ctx => {
//     ctx.response.body = 'Hello World';
// };



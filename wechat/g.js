// 'use strict';
//g.js是一个中间件，只处理纯碎和微信交互的部分，而不应该干涉外面的业务，所以读取票据信息和写入票据信息的部分应该独立出来，在业务层里处理
//返回回来的数据不是json，而是xml，这里用到raw-body模块，可以把这个this上的request对象，其实也是http模块中的request对象，去拼装它的数据，最终可以拿到一个buffer的xml数据
//CDATA是xml的CDATA区块，作用是这个区块中的内容被xml中的解析器所解析，避免像小于号这些的解析错误



//var sha1 = require('sha1');
//var getRawBody = require('raw-body');
//var Wechat = require('./wechat');
//var util = require('./util');

//module.exports = function(opts){
//    return function *(next) {    // *表示是生成器函数，KOA也只接受生成器函数，generator function
//       console.log(this.query);

//        var token = opts.token;
//        var signature = this.query.signature;
//        var nonce = this.query.nonce;
//        var timestamp = this.query.timestamp;
//        var echostr = this.query.echostr;

//       var str = [token, timestamp, nonce].sort().join('');
//        var sha = sha1(str);

//        if(this.method === 'GET') {
//            if(sha === signature){
//                this.body = echostr + '';
//            } else {
//                this.body = 'wrong';
//            }
//        } else if(this.method === 'POST') {
//            if(sha !== signature){
//                this.body = 'wrong';
//                return false;
//            }

//            var data = yield getRawBody(this.req, {
//                length: this.length,
//                limit: '1mb',
//                encoding: this.charset
//            })

//            var content = yield util.parseXMLAsync(data);

//            console.log(content);

//            var message = util.formatMessage(content.xml);

//            console.log(message);

//            if(message.MsgType === 'event') {
//                if(message.Event === 'subscribe') {
//                   var now = new Date().getTime();

//                    that.status = 200;
//                    that.type ='application/xml';
//                    that.body = '<xml>' +
//                        '<ToUserName><![CDATA[' + message.FromUserName +']]></ToUserName>' +
//                        '<FromUserName><![CDATA[' + message.ToUserName +']]></FromUserName>' +
//                        '<CreateTime>' + now + '</CreateTime>' +
//                        '<MsgType><![CDATA[text]]></MsgType>' +
//                        '<Content><![CDATA[Hi ,Imooc 童鞋！]]></Content>' +
//                        '</xml>'

//                    return;
//                }
//            }
//        }
//    }
//};

'use strict';

var sha1 = require('sha1');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var prefix = 'https://api.weixin.qq.com/cgi-bin/';
var api = {
    accessToken: prefix + 'token?grant_type=client_credential'
}

//构造函数,假设有个文件中存着老的旧的票据信息，要先读一下这个文件，判断票据是否过期，如果过期，重新向微信服务器获取一次，然后把新的票据信息重新写入到这个文件中
//票据的读出与写入
function Wechat(opts){
    var that = this;
    this.appID = opts.appID;
    this.appSecret = opts.appSecret;
    this.getAccessToken = opts.getAccessToken;
    this.saveAccessToken = opts.saveAccessToken;

    this.getAccessToken()
        .then(function(data){
            try {
                data = JSON.parse(data);
            } catch(e){  //获取异常，文件不存在或者不合法，应该再去更新一下票据
                return that.updateAccessToken(data);
            }

            if(data.isValidAccessToken(data)){
                Promise.resolve(data);
            } else {
                return that.updateAccessToken();
            }
        })
        .then(function(data){
            that.access_token = data.access_token;
            that.expires_in = data.expires_in;

            that.saveAccessToken(data);
        })
}

Wechat.prototype.isValidAccessToken = function(data){
    if(!data || !data.access_token || !data.expires_in) {
        return false;
    }

    var access_token = data.access_token;
    var expires_in = data.expires_in;
    var now = (new Date().getTime());

    if(now < expires_in) {
        return true;
    } else {
        return false;
    }
}

Wechat.prototype.updateAccessToken = function(){
    var appID = this.appID;
    var appSecret = this.appSecret;
    console.log("appID:", appID);
    console.log("appSecret:", appSecret);
    var url = prefix + api.accessToken + '&appid=' + appID + '&secret=' + appSecret;
    console.log('url:', url);

    return new Promise(function(resolve, reject){
        request({url: url, json: true}).then(function(response){
            var data = response[1];
            console.log("data:", JSON.stringify(data));
            var now = (new Date().getTime());
            var expires_in = now + (data.expires_in - 20) * 1000;    //data.expires_in是票据返回结果的时间
            data.expires_in = expires_in;   //把新的有效票据的时间赋值给票据对象

            resolve(data);
        })
    })

}

module.exports = function(opts){
    var wechat = new Wechat(opts);

    return function *(next){
        console.log(this.query);

        var token = opts.token;
        var signature = this.query.signature;
        var nonce = this.query.nonce;
        var timestamp = this.query.timestamp;
        var echostr = this.query.echostr;
        var str = [token, timestamp, nonce].sort().join('');
        // console.log("str:", str);
        var sha = sha1(str);
        // console.log("sha:", sha);

        if(sha === signature) {
            this.body = echostr + '';
        } else {
            this.body = 'wrong!' + 'str:' + str + ', sha:' + sha + ', signature:' + signature;
        }
    }
};



















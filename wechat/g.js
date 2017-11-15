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

var koa = require('koa');

module.exports = function(opts){
    return function *(next){
        console.log(this.query);

        var token = opts.token;
        var signature = this.query.signature;
        var nonce = this.query.nonce;
        var timestamp = this.query.timestamp;
        var echostr = this.query.echostr;
        var str = [token, timestamp, nonce].sort().join('');
        console.log("str:", str);
        var sha = sha1(str);
        console.log("sha:", sha);

        if(sha === signature) {
            this.body = echostr + '';
        } else {
            this.body = 'wrong!' + 'str:' + str + ', sha:' + sha + ', signature:' + signature;
        }
    }
};



















'use strict';

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

            if(that.isValidAccessToken(data)){
                return Promise.resolve(data);
            } else {
                return that.updateAccessToken();
            }
        })
        .then(function(data){
            console.log("data:", data);
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
};

Wechat.prototype.updateAccessToken = function(){
    var appID = this.appID;
    var appSecret = this.appSecret;
    console.log("appID:", appID);
    console.log("appSecret:", appSecret);
    var url = api.accessToken + '&appid=' + appID + '&secret=' + appSecret;
    console.log('url:', url);

    return new Promise(function(resolve, reject){
        request({url: url, json: true}).then(function(response){
            var data = response.body;
            console.log("data:", JSON.stringify(data));
            var now = (new Date().getTime());
            var expires_in = now + (data.expires_in - 20) * 1000;    //data.expires_in是票据返回结果的时间
            data.expires_in = expires_in;   //把新的有效票据的时间赋值给票据对象

            resolve(data);
        })
    })
};

module.exports = Wechat;
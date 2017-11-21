'use strict';

var path = require('path');
var util = require('./libs/util');
var wechat_file = path.join(__dirname, './config/wechat.txt');
var config = {
    wechat: {
        appID: 'wx1ba5f1d5e4960b1e',
        appSecret: '430bdc6a070e50b6cf34cbd38a39b691',
        token: 'testtoken',
        getAccessToken: function(){
            return util.readFileAsync(wechat_file);
        },
        saveAccessToken: function(data) {
            data = JSON.stringify(data);
            return util.writeFileAsync(wechat_file, data);
        }
    }
};

module.exports = config;


'use strict';

var Promise = require('bluebird');
var _ = require('lodash');
var request = Promise.promisify(require('request'));
var util = require('./util');
var fs = require('fs');
var prefix = 'https://api.weixin.qq.com/cgi-bin/';
var api = {
    accessToken: prefix + 'token?grant_type=client_credential',
    //把临时素材upload的地址配置上去  access_token=ACCESS_TOKEN&type=TYPE   access_token是全局票据，type来标示素材是哪种类型
    temporary: {
        upload: prefix + 'media/upload?',
        //download
        fetch: prefix + 'media/get?'
    },
    permanent: {
        // https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=ACCESS_TOKEN&type=TYPE
        upload: prefix + 'material/add_material?',
        uploadNews: prefix + 'material/add_news?',
        uploadNewsPic: prefix + 'media/uploading?',
        //download
        fetch: prefix + 'material/get_material?',
        //delete
        del: prefix + 'media/del_material?',
        update: prefix + 'media/update_news?',
        //素材总数
        count: prefix + 'media/get_materialcount?',
        //获取素材列表
        batch: prefix + 'media/batchget_material?'

    }
}

function Wechat(opts){
    var that = this;
    this.appID = opts.appID;
    this.appSecret = opts.appSecret;
    this.getAccessToken = opts.getAccessToken;
    this.saveAccessToken = opts.saveAccessToken;

    this.fetchAccessToken();
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
            var expires_in = now + (data.expires_in - 20) * 1000;
            data.expires_in = expires_in;

            resolve(data);
        })
    })
};

Wechat.prototype.reply = function() {
    var content = this.body;
    var message = this.weixin;

    var xml = util.tpl(content, message);

    this.status = 200;
    this.type = 'application/xml';
    this.body = xml;
}

Wechat.prototype.fetchAccessToken = function(data) {
    var that = this;

    if(this.access_token && this.expires_in) {
        if(this.isValidAccessToken(this)) {
            return Promise.resolve(this);
        }
    }

    this.getAccessToken()
        .then(function(data){
            try {
                data = JSON.parse(data);
            } catch(e){
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

            return Promise.resolve(data);
        })
}

Wechat.prototype.uploadMaterial = function(type, material, permanent){
    var that = this;
    var form = {};
    var uploadUrl = api.temporary.upload;

    if(permanent) {
        uploadUrl = api.permanent.upload;
        _.extend(form, permanent);
    }

    if(type === 'pic') {
        uploadUrl = api.permanent.uploadNewsPic;
    }

    if(type === 'news') {
        uploadUrl = api.permanent.uploadNews;
        form = material;
    } else {
        form.media = fs.createReadStream(material);
    }

    var appID = this.appID;
    var appSecret = this.appSecret;

    return new Promise(function(resolve, reject){
        that.fetchAccessToken()
            .then(function(data){
                var url = uploadUrl + 'access_token=' + data.access_token;

                if(!permanent) {
                    url += '&type=' + type;
                } else {
                    form.access_token = data.access_token;
                }

                var options = {
                    method: 'POST',
                    url: url,
                    json: true
                }

                if(type === 'news'){
                    options.body = form;
                } else {
                    options.formData = form;
                }
                request({method: 'POST', url: url, formData: form, json: true}).then(function(response){
                    var _data = response.body;

                    if(_data){
                        resolve(_data);
                    } else {
                        throw new Error('Upload material fails');
                    }
                }).catch(function(err){
                    reject(err);
                })
            })
    })
}

Wechat.prototype.fetchMaterial = function(mediaId, type, permanent){
    var that = this;
    var form = {};
    var fetchUrl = api.temporary.fetch;

        fetchUrl = api.permanent.fetch;
    }

    return new Promise(function(resolve, reject){
        that.fetchAccessToken()
            .then(function(data){
                var url = fetchUrl + 'access_token=' + data.access_token + '&media_id=' + mediaId;

                if(!permanent && type === 'video') {
                    url = url.replace('https://', 'http://');
                }

                resolve(url);
            })
    })
}

Wechat.prototype.deleteMaterial = function(mediaId){
    var that = this;
    var form = {
        media_id: mediaId
    };

    return new Promise(function(resolve, reject){
        that.fetchAccessToken()
            .then(function(data){
                var url = api.permanent.del + 'access_token=' + data.access_token + '&media_id=' + mediaId;

                return new Promise(function(resolve, reject){
                    that.fetchAccessToken()
                        .then(function(data){
                            var url = api.permanent.del + 'access_token=' + data.access_token + '&media_id=' + mediaId;

                            request({method: 'POST', url: url, body: form, json: true}).then(function(response){
                                var _data = response[1];

                                if(_data){
                                    resolve(_data);
                                } else {
                                    throw new Error('delete material fails');
                                }
                            }).catch(function(err){
                                reject(err);
                            })
                        })
                })
            })
    })
}

Wechat.prototype.updateMaterial = function(mediaId, news){
    var that = this;
    var form = {
        media_id: mediaId
    };

    _.extend(form, news);

    return new Promise(function(resolve, reject){
        that.fetchAccessToken()
            .then(function(data){
                var url = api.permanent.update + 'access_token=' + data.access_token + '&media_id=' + mediaId;

                return new Promise(function(resolve, reject){
                    that.fetchAccessToken()
                        .then(function(data){
                            var url = api.permanent.del + 'access_token=' + data.access_token + '&media_id=' + mediaId;

                            request({method: 'POST', url: url, body: form, json: true}).then(function(response){
                                var _data = response[1];

                                if(_data){
                                    resolve(_data);
                                } else {
                                    throw new Error('update material fails');
                                }
                            }).catch(function(err){
                                reject(err);
                            })
                        })
                })
            })
    })
}

Wechat.prototype.countMaterial = function(){
    var that = this;
    var form = {
        media_id: mediaId
    };

    _.extend(form, news);

    return new Promise(function(resolve, reject){
        that.fetchAccessToken()
            .then(function(data){
                var url = api.permanent.count + 'access_token=' + data.access_token;

                return new Promise(function(resolve, reject){
                    that.fetchAccessToken()
                        .then(function(data){
                            var url = api.permanent.del + 'access_token=' + data.access_token + '&media_id=' + mediaId;

                            request({method: 'GET', url: url, json: true}).then(function(response){
                                var _data = response[1];

                                if(_data){
                                    resolve(_data);
                                } else {
                                    throw new Error('update material fails');
                                }
                            }).catch(function(err){
                                reject(err);
                            })
                        })
                })
            })
    })
}

Wechat.prototype.batchMaterial = function(options){
    var that = this;

    options.type = options.type || 'image';
    options.offset = options.offset || 0;
    options.count = options.count || 1;

    var form = {
        media_id: mediaId
    };

    _.extend(form, news);

    return new Promise(function(resolve, reject){
        that.fetchAccessToken()
            .then(function(data){
                var url = api.permanent.batch + 'access_token=' + data.access_token;

                return new Promise(function(resolve, reject){
                    that.fetchAccessToken()
                        .then(function(data){
                            var url = api.permanent.del + 'access_token=' + data.access_token + '&media_id=' + mediaId;

                            request({method: 'POST', url: url, body: options, json: true}).then(function(response){
                                var _data = response[1];

                                if(_data){
                                    resolve(_data);
                                } else {
                                    throw new Error('update material fails');
                                }
                            }).catch(function(err){
                                reject(err);
                            })
                        })
                })
            })
    })
}

module.exports = Wechat;
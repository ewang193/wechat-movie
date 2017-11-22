'use strict';

var config = require('./config');
var Wechat = require('./wechat/wechat');

var wechatApi = new Wechat(config.wechat);

exports.reply = function* (next) {
    var message = this.weixin;

    if(message.MsgType === 'event') {
        if(message.Event === 'subscribe'){
            if(message.Eventkey){
                console.log('扫二维码进来：' + message.Eventkey + ' ' + message.ticket);
            }
            this.body = '哈哈，你订阅了这个号\r\n' + ' 消息ID：' + message.MsgId;
        } else if(message.Event === 'unsubscribe') {
            console.log('无情取关');
            this.body = '';
        } else if(message.Event === 'LOCATION') {
            this.body = '您上报的位置是: ' + message.Latitude + '/' + message.Longitude + '-' + message.Precision;
        } else if(message.Event === 'CLICK') {
            this.body = '您点击了菜单：' + message.Eventkey;
        } else if(message.Event === 'SCAN') {
            console.log('关注后扫二维码' + message.Eventkey + ' ' + message.Ticket);
            this.body = '看到你扫了一下哦'
        } else if(message.Event === 'VIEW') {
            this.body = '您点击了菜单中的链接：' + message.Eventkey;
        }
    } else if(message.MsgType === 'text'){
        var content = message.Content;
        var reply = '额，你说的 ' + message.Content + ' 太复杂了';
        if(content === '1') {
            reply = '天下第一吃大米';
        } else if(content === '2') {
            reply = '天下第二吃豆腐';
        } else if(content === '3') {
            reply = '天下第三吃仙丹';
        }
        else if(content === '4') {
            reply = [{
                Title: '技术改变世界',
                Description: '只是一个描述而已',
                PicUrl: 'http://res.cloudinary.com/moveha/image/upload/v1441184110/assets/images/Mask-min.png',
                Url: 'https://github.com'
            },{
                Title: 'Nodejs开发微信',
                Description: '只是一个描述而已',
                PicUrl: 'http://res.cloudinary.com/moveha/image/upload/v1431337192/index-img2_fvzeow.png',
                Url: 'https://nodejs.org/'
            }]
        }else if(content === '5') {
            //首先上传一张图片，通过yield来调用wechat API上的uploadMaterial
            //这里wechatApi还没有，这里需要初始化这个API
            var data = yield wechatApi.uploadMaterial('image', __dirname + '/2.jpg');
            console.log('after data:', JSON.stringify(data));

            //构建一个reply
            reply = {
                type: 'image',
                MediaId: data.media_id
            }
        }

        this.body = reply;
    }
    // else if(message.MsgType === 'article') {
    //     var content = message.Content;
    //     var reply = '额，你说的 ' + message.Content + ' 太复杂了';
    //     if(content === '4'){
    //         reply = [{
    //             Title: '技术改变世界',
    //             Description: '只是一个描述而已',
    //             PicUrl: 'http://res.cloudinary.com/moveha/image/upload/v1441184110/assets/images/Mask-min.png',
    //             Url: 'https://github.com'
    //         },{
    //             Title: 'Nodejs开发微信',
    //             Description: '只是一个描述而已',
    //             PicUrl: 'http://res.cloudinary.com/moveha/image/upload/v1431337192/index-img2_fvzeow.png',
    //             Url: 'https://nodejs.org/'
    //         }]
    //     }
    //     this.body = reply;
    // }
    yield next
}

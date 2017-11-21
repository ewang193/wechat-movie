'use strict';

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
        }
    } else {

    }

    yield next
}

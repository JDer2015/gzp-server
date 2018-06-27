const {ChatModel} = require('../db/models')

module.exports = function (seaver) {
    //得到操作服务器端的sockeIO的IO对象
    const io = require('socket.io')(seaver)
     io.on('connection',function (socket) {
         console.log('有客户端连接到服务器上了~~~')
         //绑定send监听客户发过来的消息
         socket.on('sendMsg',function (data) {
             console.log('服务器端接收到消息~~~~',data)
             const {from, to, content} = data
             const chat_id = [from,to].sort().join('_')
             const create_time = Date.now()
             const chatModel = new ChatModel({from, to, content,chat_id,create_time})
             chatModel.save(function (err,chatMsg) {
                 //保存成功后向所有连接的客户端发送消息
                 io.emit('receiveMsg',chatMsg)
                 console.log('保存成功后向所有连接的客户端发送消息',chatMsg)
             })
         })
     })
}
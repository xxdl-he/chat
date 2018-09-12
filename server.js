let path = require("path")
let express = require('express')
let app = express()
let http = require('http').Server(app)

// 将http交给socket监听处理
let io = require('socket.io')(http)

const PORT = 3000

// 设置静态文件可访问
app.use(express.static(path.join(__dirname,'public') ))

app.get('/', (req,res) => {
    // res.end('hello world')
    res.sendFile(path.join(__dirname, 'index.html'))
})

http.listen(PORT, () => {
    console.log("服务器开始监听端口：" + PORT )
})


// 验证用户名是否重复
let checkname = (nickname) => {
    for(let k in io.sockets.sockets) { // 之前登录过的 nickname
        // console.log(io.sockets.sockets[k].nickname)
        if( nickname == io.sockets.sockets[k].nickname ) {
            return false
        }
    }
    return true
}
// io通信
io.on('connection', (socket) => { // socket 客服端
    console.log(socket.id)
    // 监听加入群聊事件 
    socket.on('join', (nickname) => {
        console.log(nickname)
        if( checkname(nickname) ) { // 用户名是否重复
            socket.nickname = nickname // 存储用户名
            // 服务端发送给所有人，包括自己
            io.emit('notice', '系统', socket.nickname + '加入群聊' ) // => 客服端 通知所有人有人加入了。
        }else{
            socket.emit("repeat")
        }
    })
    // 客服端接受一个人的信息，然后转发信息给所有人，除了自己
    socket.on('sendMsg', (msg) => {
        socket.broadcast.emit('getMsg',socket.nickname, msg)
    })

    socket.on('disconnect', () => {
        // console.log("有人下线了...")
        socket.broadcast.emit('getMsg','系统', socket.nickname + '离开了群聊')
    })
})


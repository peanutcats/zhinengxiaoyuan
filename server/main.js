const express = require('express')
const cors = require('cors')
const userRoutes = require('./api/user')
const chatRoutes = require('./api/chat')

// 创建一个Express应用实例
// express()函数返回一个Express应用对象,用于配置中间件、路由等
// app对象是整个Express应用的核心,提供了配置服务器的各种方法
const app = express()
const port = 3001

// 中间件
app.use(cors())
app.use(express.json())

// 路由
app.use('/api/user', userRoutes)
app.use('/api/chat', chatRoutes)

// 测试路由
app.get('/', (req, res) => {
  res.json({ message: 'API服务器正在运行' })
})

// 启动服务器
const server = app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`)
})

// 错误处理
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`端口 ${port} 已被占用`)
  } else {
    console.error('服务器启动错误:', error)
  }
}) 
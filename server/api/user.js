const express = require('express')
const router = express.Router()
const mysql = require('mysql')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// 数据库连接配置
const db = mysql.createPool({
  host: '10.0.17.192',
  port: 3306,
  user: 'znzs',
  password: 'CXCYds_2025',
  database: 'smart_guider'
})

// JWT密钥
const JWT_SECRET = 'your-jwt-secret'

// 注册路由
router.post('/register', async (req, res) => {
  console.log('收到注册请求，请求体：', req.body)
  
  // 获取请求体数据
  const { username, studentId, password } = req.body
  
  console.log('解析的数据：', { username, studentId, password })
  
  // 验证数据完整性
  if (!username || !studentId || !password) {
    console.log('数据不完整：', { username, studentId, password })
    return res.status(400).json({
      code: 400,
      message: '请提供完整的注册信息'
    })
  }

  try {
    // 检查用户名和学工号是否已存在
    const checkUser = await new Promise((resolve, reject) => {
      db.query('SELECT * FROM users WHERE username = ? OR student_id = ?', 
        [username, studentId], (err, results) => {
          if (err) reject(err)
          else resolve(results)
        })
    })

    if (checkUser.length > 0) {
      return res.status(400).json({
        code: 400,
        message: '用户名或学工号已存在'
      })
    }

    // 密码加密
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // 插入新用户
    await new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO users (username, student_id, password) VALUES (?, ?, ?)',
        [username, studentId, hashedPassword],
        (err, results) => {
          if (err) reject(err)
          else resolve(results)
        }
      )
    })

    // 返回成功响应
    res.status(201).json({
      code: 201,
      message: '注册成功',
      data: {
        username,
        studentId
      }
    })

  } catch (error) {
    console.error('注册错误：', error)
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    })
  }
})

// 登录路由
router.post('/login', async (req, res) => {
  console.log('收到登录请求，请求体：', req.body)
  
  const { studentId, password } = req.body

  if (!studentId || !password) {
    return res.status(400).json({
      code: 400,
      message: '请提供学工号和密码'
    })
  }

  try {
    // 查询用户
    const users = await new Promise((resolve, reject) => {
      db.query('SELECT * FROM users WHERE student_id = ?', [studentId], (err, results) => {
        if (err) reject(err)
        else resolve(results)
      })
    })

    if (users.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '学工号或密码错误'
      })
    }

    const user = users[0]

    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400).json({
        code: 400,
        message: '学工号或密码错误'
      })
    }

    // 生成JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, studentId: user.student_id },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          studentId: user.student_id,
          avatar: user.avatar
        }
      }
    })

  } catch (error) {
    console.error('登录错误：', error)
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.message
    })
  }
})

module.exports = router 
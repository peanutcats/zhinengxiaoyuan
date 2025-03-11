const express = require('express')
const router = express.Router()
const axios = require('axios')

// 大模型API配置
const API_KEY = 'app-mItRBDT4WaJ6hPx46o0DjcSn'
// const MODEL_NAME = 'deepseek-r1-250120'
const API_URL = 'http://10.0.17.192/v1'

// 聊天路由
router.post('/message', async (req, res) => {
  const { messages } = req.body
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({
      code: 400,
      message: '请提供有效的消息数组'
    })
  }
  
  try {
    // 调用大模型API
    const response = await axios.post(API_URL, {
      inputs:{},
	  query: messages,
	  response_mode:"streaming",
	  conversation_id: "",
	  user: "智能助手",
	  // model: MODEL_NAME,
      // messages: messages,
      // temperature: 0.7,
      // max_tokens: 1000
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      }
    })
    
    // 返回AI回复
    res.json({
      code: 200,
      message: '成功',
      data: response.data
    })
    
  } catch (error) {
    console.error('聊天API调用失败：', error.response?.data || error.message)
    
    res.status(500).json({
      code: 500,
      message: '服务器错误',
      error: error.response?.data?.error || error.message
    })
  }
})

module.exports = router 
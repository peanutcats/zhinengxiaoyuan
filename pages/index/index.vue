<!-- pages/index/index.vue -->
<template>
  <view class="container">
    <!-- 顶部标题栏 -->
    <view class="header">
      <view class="user-info" @click="handleUserClick">
        <image 
          v-if="userInfo && userInfo.avatar" 
          class="avatar" 
          :src="userInfo.avatar"
        />
        <view v-else class="avatar guest-avatar">
          <text class="guest-icon">👤</text>
        </view>
        <text class="username">{{ userInfo ? userInfo.username : '游客' }}</text>
      </view>
      <text class="title">苏食院智能助手</text>
    </view>

    <!-- 左侧功能栏 -->
    <view class="main-layout">
      <view class="sidebar">
        <view class="menu-list">
          <view v-if="!userInfo" class="login-section">
            <button class="menu-btn login-btn" @click="handleLogin">登录</button>
            <button class="menu-btn register-btn" @click="handleRegister">注册</button>
          </view>
          
          <view class="menu-item" @click="handleMenu('map')">
            <text class="menu-icon">🗺️</text>
            <text class="menu-text">校园地图</text>
          </view>
          <view class="menu-item" @click="handleMenu('faq')">
            <text class="menu-icon">❓</text>
            <text class="menu-text">常见问题</text>
          </view>
          <view class="menu-item" @click="handleMenu('settings')">
            <text class="menu-icon">⚙️</text>
            <text class="menu-text">设置</text>
          </view>
        </view>
      </view>

      <!-- 主聊天区域 -->
      <view class="chat-area">
        <!-- 聊天内容区 -->
        <scroll-view 
          class="chat-container" 
          scroll-y="true"
          :scroll-top="scrollTop"
          :scroll-with-animation="true"
          @scrolltoupper="loadMoreMessages"
          ref="chatScroll"
        >
          <view class="welcome-message" v-if="messages.length === 0">
            <view class="welcome-header">
              <image class="school-logo" src="/static/学校logo.jpg" mode="aspectFit" />
              <text class="welcome-text">你好！我是苏食院智能助手，请问有什么可以帮助您的吗？</text>
            </view>
          </view>
          
          <!-- 聊天消息列表 -->
          <view class="message-list">
            <view 
              v-for="(message, index) in messages" 
              :key="index" 
              :class="['message-item', message.role === 'user' ? 'user-message' : 'assistant-message']"
            >
              <view class="message-avatar">
                <image 
                  v-if="message.role === 'user' && userInfo && userInfo.avatar" 
                  class="avatar" 
                  :src="userInfo.avatar"
                />
                <view v-else-if="message.role === 'user'" class="avatar user-avatar">
                  <text class="avatar-text">{{ getUserInitial() }}</text>
                </view>
                <image 
                  v-else 
                  class="avatar" 
                  src="/static/学校logo.jpg"
                />
              </view>
              <view class="message-content">
                <view class="message-bubble">
                  <text class="message-text" v-if="message.role === 'user'">{{ message.content }}</text>
                  <rich-text v-else class="markdown-content" :nodes="formatMarkdown(message.content)"></rich-text>
                </view>
                <view class="message-time">{{ formatTime(message.time) }}</view>
              </view>
            </view>
          </view>
          
          <!-- 加载中提示 -->
          <view class="loading-indicator" v-if="isLoading">
            <view class="loading-dots">
              <view class="dot"></view>
              <view class="dot"></view>
              <view class="dot"></view>
            </view>
          </view>
        </scroll-view>

        <!-- 底部输入区 -->
        <view class="input-section">
          <view class="input-wrapper">
            <input
              class="input"
              v-model="inputMessage"
              placeholder="请输入您的问题..."
              :adjust-position="false"
              confirm-type="send"
              :disabled="isLoading"
              @confirm="sendMessage"
            />
            <view class="send-btn" @click="sendMessage" :class="{ 'disabled': isLoading || !inputMessage.trim() }">
              <text class="send-icon">发送</text>
            </view>
          </view>
          <view class="tool-buttons">
            <text class="tool-btn voice-btn" @click="handleVoice">🎤</text>
            <text class="tool-btn keyboard-btn" @click="handleKeyboard">⌨️</text>
            <text class="tool-btn emoji-btn" @click="handleEmoji">😊</text>
            <text class="tool-btn more-btn" @click="handleMore">➕</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
// import { marked } from 'marked';

export default {
  data() {
    return {
      inputMessage: '',
      userInfo: null,
      messages: [],
      isLoading: false,
      scrollTop: 0,
      apiKey: 'app-mItRBDT4WaJ6hPx46o0DjcSn',
      // modelName: 'deepseek-r1-250120',
      temperature: 0.7,
      conversationId: '',
      currentAssistantMessage: null
    }
  },
  methods: {
    handleUserClick() {
      if (!this.userInfo) {
        this.handleLogin()
      } else {
        // 跳转到用户信息页面或显示用户菜单
        uni.showActionSheet({
          itemList: ['个人信息', '退出登录'],
          success: (res) => {
            if (res.tapIndex === 0) {
              // 跳转到个人信息页面
            } else if (res.tapIndex === 1) {
              this.handleLogout()
            }
          }
        })
      }
    },
    handleLogout() {
      this.userInfo = null
      // 清除存储的token和用户信息
      uni.removeStorageSync('token')
      uni.removeStorageSync('userInfo')
      // 清空聊天记录
      this.messages = []
      uni.removeStorageSync('chatHistory')
      uni.showToast({
        title: '已退出登录',
        icon: 'success'
      })
    },
    handleLogin() {
      try {
        uni.navigateTo({
          url: '/pages/login/login'
        })
      } catch (error) {
        console.error('跳转失败：', error)
      }
    },
    
    handleRegister() {
      try {
        uni.navigateTo({
          url: '/pages/register/register'
        })
      } catch (error) {
        console.error('跳转失败：', error)
      }
    },
    handleMenu(type) {
      try {
        switch(type) {
          case 'map':
            uni.navigateTo({
              url: '/pages/map/map'
            })
            break
          case 'faq':
            uni.navigateTo({
              url: '/pages/faq/faq'
            })
            break
          case 'settings':
            uni.navigateTo({
              url: '/pages/settings/settings'
            })
            break
        }
      } catch (error) {
        console.error('跳转失败：', error)
        // 添加错误提示
        uni.showToast({
          title: '页面跳转失败',
          icon: 'none'
        })
      }
    },
    handleVoice() {
      uni.showToast({
        title: '语音输入功能开发中',
        icon: 'none'
      })
    },
    handleKeyboard() {
      // 键盘切换功能
    },
    handleEmoji() {
      // 表情选择功能
    },
    handleMore() {
      // 更多功能
    },
    
    // 发送消息
    async sendMessage() {
      if (!this.inputMessage.trim() || this.isLoading) return
      
      console.log('发送消息:', this.inputMessage.trim()); // 调试信息
      
      // 检查用户是否已登录
      if (!this.userInfo) {
        uni.showModal({
          title: '提示',
          content: '请您先登录账号',
          confirmText: '去登录',
          success: (res) => {
            if (res.confirm) {
              this.handleLogin()
            }
          }
        })
        return
      }
      
      // 添加用户消息
      const userMessage = {
        role: 'user',
        content: this.inputMessage.trim(),
        time: new Date()
      }
      this.messages.push(userMessage)
      
      // 清空输入框
      const userInput = this.inputMessage
      this.inputMessage = ''
      
      // 滚动到底部
      this.scrollToBottom()
      
      // 设置加载状态
      this.isLoading = true
      
      try {
        // 创建一个初始的助手消息（显示为"正在思考中..."）
        this.currentAssistantMessage = {
          role: 'assistant',
          content: '正在思考中...',
          time: new Date()
        }
        this.messages.push(this.currentAssistantMessage)
        
        // 调用API获取回复
        await this.sendChatRequest(userInput)
        
        // 保存聊天记录
        this.saveChatHistory()
      } catch (error) {
        console.error('获取回复失败：', error) // 调试信息
        
        // 更新错误消息
        if (this.currentAssistantMessage) {
          this.currentAssistantMessage.content = '抱歉，我遇到了一些问题，无法回答您的问题。请稍后再试。'
          this.currentAssistantMessage.time = new Date()
        } else {
          // 添加错误消息
          const errorMessage = {
            role: 'assistant',
            content: '抱歉，我遇到了一些问题，无法回答您的问题。请稍后再试。',
            time: new Date()
          }
          this.messages.push(errorMessage)
        }
      } finally {
        // 取消加载状态
        this.isLoading = false
        
        // 滚动到底部
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      }
    },
    
    // 发送聊天请求并处理响应
    async sendChatRequest(userInput) {
      try {
        console.log('发送聊天请求，用户输入:', userInput); // 调试信息
        
        // 获取用户设置的模型和温度
        const savedModel = uni.getStorageSync('selectedModel')
        const modelToUse = savedModel || this.modelName
        
        const savedTemperature = uni.getStorageSync('temperature')
        const temperatureToUse = savedTemperature !== '' ? parseFloat(savedTemperature) : this.temperature
        
        console.log('使用的模型:', modelToUse, '温度:', temperatureToUse); // 调试信息
        
        // 准备历史消息
        const history = this.messages.slice(-10).map(msg => ({
          role: msg.role,
          content: msg.content
        }))
        
        // 添加当前用户输入，并指示 AI 使用 Markdown 格式回复
        history.push({
          role: 'user',
          content: userInput + "\n\n请使用 Markdown 格式回复，以提供更好的排版效果。"
        })
        
        // 调用API
        const response = await uni.request({
          url: 'http://10.0.17.192/v1/chat-messages',
          method: 'POST',
          header: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          data: {
            inputs: {},
            query: userInput, // 使用用户输入作为查询
            response_mode: "streaming",
            conversation_id: this.conversationId || "", // 使用已有的会话ID
            user: "智能助手", // 可以根据需要修改用户标识
            files: [] // 如果有文件需要上传，可以在这里添加
          }
        })
        
        console.log('API响应:', response); // 调试信息
        
        // 处理新的响应格式
        const res = response[1] || response
        
        if (res.statusCode === 200) {
          // 首先检查响应是否符合截图中的格式
          if (res.data && typeof res.data === 'object' && res.data.data) {
            // 这里处理的是类似截图中的格式：
            // { "data": "data: {\"event\": \"workflow_started\", ...}", "statusCode": 200, ... }
            
            let dataContent = res.data.data;
            
            // 如果dataContent是字符串，则进行处理
            if (typeof dataContent === 'string') {
              // 移除前缀 "data: "
              dataContent = dataContent.replace(/^data:\s*/, '');
              
              try {
                // 尝试解析JSON
                const eventData = JSON.parse(dataContent);
                console.log('解析的事件数据:', eventData); // 调试信息
                
                // 根据事件类型处理
                if (eventData.event === 'workflow_started') {
                  console.log('工作流已启动，会话ID:', eventData.conversation_id);
                  // 保存会话ID以便后续使用
                  this.conversationId = eventData.conversation_id;
                  
                  // 更新助手消息
                  if (this.currentAssistantMessage) {
                    this.currentAssistantMessage.content = "正在思考中...";
                  }
                  
                  // 如果有data字段，可能包含更多信息
                  if (eventData.data) {
                    console.log('工作流数据:', eventData.data);
                  }
                } else if (eventData.event === 'message') {
                  // 处理消息内容
                  if (eventData.message && eventData.message.content) {
                    const messageContent = this.decodeUnicodeText(eventData.message.content);
                    console.log('收到消息内容:', messageContent);
                    
                    // 更新助手消息
                    if (this.currentAssistantMessage) {
                      this.currentAssistantMessage.content = messageContent;
                    }
                  }
                } else if (eventData.event === 'workflow_completed') {
                  console.log('工作流已完成');
                } else {
                  console.log('未知事件类型:', eventData.event);
                  
                  // 尝试从事件数据中提取任何可能的文本内容
                  const extractedContent = this.extractContentFromResponse(eventData);
                  if (extractedContent && this.currentAssistantMessage) {
                    this.currentAssistantMessage.content = extractedContent;
                  }
                }
              } catch (jsonError) {
                console.error('JSON解析失败:', jsonError, '原始数据:', dataContent);
                
                // 如果不是有效的JSON，直接显示原始内容（可能是文本回复）
                if (this.currentAssistantMessage) {
                  const decodedText = this.decodeUnicodeText(dataContent);
                  this.currentAssistantMessage.content = decodedText || "无法解析服务器响应";
                }
              }
            } else if (typeof dataContent === 'object') {
              // 如果dataContent已经是对象，直接处理
              console.log('数据已经是对象:', dataContent);
              
              // 尝试从对象中提取内容
              const extractedContent = this.extractContentFromResponse(dataContent);
              if (extractedContent && this.currentAssistantMessage) {
                this.currentAssistantMessage.content = extractedContent;
              }
            }
          } else if (typeof res.data === 'string') {
            // 如果响应是字符串，可能是直接的文本内容或多个事件块
            console.log('收到文本响应:', res.data);
            
            // 检查是否包含多个事件块（以\n\n分隔）
            if (res.data.includes('\n\n')) {
              // 分割事件块
              const eventBlocks = res.data.split('\n\n').filter(block => block.trim());
              console.log(`检测到${eventBlocks.length}个事件块`);
              
              let combinedAnswer = '';
              let hasSetContent = false;
              
              // 处理每个事件块
              for (const block of eventBlocks) {
                if (block.startsWith('data:')) {
                  try {
                    // 解析事件数据
                    const jsonStr = block.replace(/^data:\s*/, '');
                    const eventData = JSON.parse(jsonStr);
                    
                    // 如果是消息事件，提取回答内容
                    if (eventData.event === 'message' && eventData.answer) {
                      const decodedAnswer = this.decodeUnicodeText(eventData.answer);
                      combinedAnswer += decodedAnswer;
                      
                      // 更新助手消息
                      if (this.currentAssistantMessage) {
                        if (!hasSetContent || this.currentAssistantMessage.content === '正在思考中...') {
                          // 第一次设置内容
                          this.currentAssistantMessage.content = decodedAnswer;
                          hasSetContent = true;
                        } else {
                          // 追加内容
                          this.currentAssistantMessage.content += decodedAnswer;
                        }
                      }
                    } else if (eventData.event === 'workflow_started' && eventData.conversation_id) {
                      // 保存会话ID
                      this.conversationId = eventData.conversation_id;
                    }
                  } catch (e) {
                    console.error('解析事件块失败:', e, '原始块:', block);
                  }
                }
              }
              
              // 如果没有在循环中更新过消息内容，但有组合的答案，则更新
              if (!hasSetContent && combinedAnswer && this.currentAssistantMessage) {
                this.currentAssistantMessage.content = combinedAnswer;
              }
            } else if (res.data.startsWith('data:')) {
              // 单个事件块
              try {
                // 解析事件数据
                const jsonStr = res.data.replace(/^data:\s*/, '');
                const eventData = JSON.parse(jsonStr);
                
                // 如果是消息事件，提取回答内容
                if (eventData.event === 'message' && eventData.answer) {
                  const messageContent = this.decodeUnicodeText(eventData.answer);
                  if (this.currentAssistantMessage) {
                    this.currentAssistantMessage.content = messageContent;
                  }
                }
              } catch (e) {
                // 如果解析失败，直接显示文本
                if (this.currentAssistantMessage) {
                  const decodedText = this.decodeUnicodeText(res.data);
                  this.currentAssistantMessage.content = decodedText || res.data;
                }
              }
            } else {
              // 普通文本响应
              if (this.currentAssistantMessage) {
                const decodedText = this.decodeUnicodeText(res.data);
                this.currentAssistantMessage.content = decodedText || res.data;
              }
            }
          } else if (res.data && typeof res.data === 'object') {
            // 处理其他对象格式的响应
            console.log('收到对象响应:', res.data);
            
            // 尝试从对象中提取内容
            const extractedContent = this.extractContentFromResponse(res.data);
            if (extractedContent && this.currentAssistantMessage) {
              this.currentAssistantMessage.content = extractedContent;
            } else if (this.currentAssistantMessage) {
              this.currentAssistantMessage.content = "收到服务器响应，但无法提取有效内容。";
            }
          } else {
            console.error('响应格式不符合预期:', res.data);
            if (this.currentAssistantMessage) {
              this.currentAssistantMessage.content = "收到的响应格式不符合预期。";
            }
          }
        } else {
          console.error('API返回异常:', res); // 调试信息
          throw new Error(`API返回异常: ${res.statusCode}`);
        }
      } catch (error) {
        console.error('API调用失败：', error);
        throw error;
      }
    },
    
    // 解码Unicode文本
    decodeUnicodeText(text) {
      try {
        if (typeof text !== 'string') return null;
        
        // 检查是否包含Unicode转义序列
        if (text.includes('\\u')) {
          return text.replace(/\\u[\dA-Fa-f]{4}/g, match => {
            return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
          });
        }
        
        return text;
      } catch (error) {
        console.error('解码Unicode文本失败:', error);
        return text;
      }
    },
    
    // 从响应中提取内容
    extractContentFromResponse(data) {
      try {
        // 如果是字符串，直接返回
        if (typeof data === 'string') {
          return this.decodeUnicodeText(data);
        }
        
        // 如果是对象，尝试提取内容
        if (typeof data === 'object' && data !== null) {
          // 检查常见的内容字段
          if (data.content) return this.decodeUnicodeText(data.content);
          if (data.message && data.message.content) return this.decodeUnicodeText(data.message.content);
          
          // 处理截图中显示的格式：data字段包含"data: {...}"格式的字符串
          if (data.data && typeof data.data === 'string') {
            // 尝试从data字段提取JSON
            try {
              // 移除前缀 "data: "
              const jsonStr = data.data.replace(/^data:\s*/, '');
              const jsonData = JSON.parse(jsonStr);
              
              // 检查是否有消息内容
              if (jsonData.message && jsonData.message.content) {
                return this.decodeUnicodeText(jsonData.message.content);
              }
              
              // 检查是否有data字段中包含内容
              if (jsonData.data && typeof jsonData.data === 'object') {
                // 尝试从data字段中提取内容
                if (jsonData.data.content) {
                  return this.decodeUnicodeText(jsonData.data.content);
                }
                
                // 如果data字段是一个对象，尝试将其转换为可读的文本
                const dataStr = JSON.stringify(jsonData.data, null, 2);
                return this.decodeUnicodeText(dataStr);
              }
              
              // 如果没有找到内容，但有事件类型，返回事件相关信息
              if (jsonData.event) {
                if (jsonData.event === 'workflow_started') {
                  return "正在思考中...";
                } else if (jsonData.event === 'workflow_completed') {
                  return "回答已完成";
                } else {
                  return `收到事件: ${jsonData.event}`;
                }
              }
              
              // 如果没有找到任何有用的内容，返回整个JSON对象的字符串表示
              return this.decodeUnicodeText(JSON.stringify(jsonData, null, 2));
            } catch (e) {
              console.error('解析data字段中的JSON失败:', e);
              // 如果解析失败，直接返回data字段的内容
              return this.decodeUnicodeText(data.data);
            }
          }
          
          // 如果找不到内容，将对象转为字符串
          return "服务器返回了数据，但无法提取有效内容。";
        }
        
        return null;
      } catch (error) {
        console.error('提取内容失败:', error);
        return null;
      }
    },
    
    // 调用聊天API
    async callChatAPI(userInput) {
      try {
        console.log('调用聊天API，用户输入:', userInput); // 调试信息
        
        // 获取用户设置的模型和温度
        const savedModel = uni.getStorageSync('selectedModel')
        const modelToUse = savedModel || this.modelName
        
        const savedTemperature = uni.getStorageSync('temperature')
        const temperatureToUse = savedTemperature !== '' ? parseFloat(savedTemperature) : this.temperature
        
        console.log('使用的模型:', modelToUse, '温度:', temperatureToUse); // 调试信息
        
        // 准备历史消息
        const history = this.messages.slice(-10).map(msg => ({
          role: msg.role,
          content: msg.content
        }))
        
        // 添加当前用户输入，并指示 AI 使用 Markdown 格式回复
        history.push({
          role: 'user',
          content: userInput + "\n\n请使用 Markdown 格式回复，以提供更好的排版效果。"
        })
        
        console.log('历史消息:', history); // 调试信息
        
        // 调用API
        const response = await uni.request({
          url: 'http://10.0.17.192/v1/chat-messages',
          method: 'POST',
          header: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          data: {
            inputs: {},
            query: userInput, // 使用用户输入作为查询
            response_mode: "streaming",
            conversation_id: this.conversationId || "", // 使用已有的会话ID
            user: "智能助手", // 可以根据需要修改用户标识
            files: [] // 如果有文件需要上传，可以在这里添加
          }
        })
        
        console.log('API响应:', response); // 调试信息
        
        // 处理新的响应格式
        const res = response[1] || response
        
        if (res.statusCode === 200) {
          // 解析事件流数据
          if (res.data && typeof res.data === 'object') {
            try {
              // 检查是否有data字段
              if (res.data.data) {
                // 从data字段中提取JSON字符串并解析
                const dataStr = res.data.data;
                // 移除前缀 "data: "
                const jsonStr = dataStr.replace(/^data:\s*/, '');
                const eventData = JSON.parse(jsonStr);
                
                console.log('解析的事件数据:', eventData); // 调试信息
                
                // 根据事件类型处理
                if (eventData.event === 'workflow_started') {
                  console.log('工作流已启动，会话ID:', eventData.conversation_id);
                  // 保存会话ID以便后续使用
                  this.conversationId = eventData.conversation_id;
                  
                  // 返回一个初始消息
                  return "正在思考中..."; 
                } else {
                  // 处理其他事件类型
                  console.log('收到其他类型事件:', eventData.event);
                  return "收到服务器响应，但需要进一步处理。";
                }
              } else {
                // 如果没有data字段，尝试直接解析整个响应
                console.log('尝试解析完整响应:', res.data);
                
                // 检查是否有message_id字段，这可能表示是一个完整的消息
                if (res.data.message_id) {
                  console.log('收到完整消息:', res.data);
                  // 如果有content字段，返回内容
                  if (res.data.content) {
                    return res.data.content;
                  }
                }
                
                // 如果没有识别出特定格式，返回一个通用消息
                return "收到服务器响应，但格式无法识别。";
              }
            } catch (parseError) {
              console.error('解析事件数据失败:', parseError, '原始数据:', res.data);
              throw new Error('解析事件数据失败');
            }
          } else if (typeof res.data === 'string') {
            // 如果响应是字符串，可能是直接的文本内容
            console.log('收到文本响应:', res.data);
            return res.data;
          } else {
            console.error('响应格式不符合预期:', res.data);
            throw new Error('响应格式不符合预期');
          }
        } else {
          console.error('API返回异常:', res); // 调试信息
          throw new Error(`API返回异常: ${res.statusCode}`);
        }
      } catch (error) {
        console.error('API调用失败：', error);
        throw error;
      }
    },
    
    // 处理事件流消息
    processEventStream(eventData) {
      // 根据不同的事件类型处理消息
      switch(eventData.event) {
        case 'workflow_started':
          console.log('工作流已启动，会话ID:', eventData.conversation_id);
          // 保存会话ID
          this.conversationId = eventData.conversation_id;
          return null;
        case 'message':
          // 处理消息内容
          if (eventData.message && eventData.message.content) {
            return eventData.message.content;
          }
          return null;
        case 'workflow_completed':
          console.log('工作流已完成');
          return null;
        default:
          console.log('未知事件类型:', eventData.event);
          return null;
      }
    },
    
    // 滚动到底部
    scrollToBottom() {
      // 使用nextTick确保DOM已更新
      this.$nextTick(() => {
        const query = uni.createSelectorQuery().in(this)
        query.select('.message-list').boundingClientRect(data => {
          if (data) {
            this.scrollTop = data.height + 1000 // 添加足够的高度确保滚动到底部
          }
        }).exec()
      })
    },
    
    // 加载更多消息
    loadMoreMessages() {
      // 实现加载历史消息的逻辑
      console.log('加载更多消息')
    },
    
    // 保存聊天历史
    saveChatHistory() {
      // 只保存最近的50条消息
      const recentMessages = this.messages.slice(-50)
      uni.setStorageSync('chatHistory', JSON.stringify(recentMessages))
    },
    
    // 获取用户头像首字母
    getUserInitial() {
      if (this.userInfo && this.userInfo.username) {
        return this.userInfo.username.charAt(0).toUpperCase()
      }
      return '用'
    },
    
    // 格式化时间
    formatTime(time) {
      const date = new Date(time)
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    },
    
    // 格式化 Markdown 内容
    formatMarkdown(content) {
      try {
        // 移除 marked 库相关代码
        // if (typeof marked !== 'undefined') {
        //   return marked(content);
        // }
        
        // 简单的 Markdown 解析
        // 处理标题
        let formatted = content.replace(/#{1,6}\s+(.*?)(?:\n|$)/g, (match, title) => {
          const size = 7 - match.indexOf(' '); // 根据 # 的数量确定标题级别
          return `<h${size} style="font-weight:bold;margin:10px 0;">${title}</h${size}>`;
        });
        
        // 处理粗体
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // 处理斜体
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // 处理代码块
        formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre style="background-color:#f5f5f5;padding:10px;border-radius:5px;overflow-x:auto;"><code>$1</code></pre>');
        
        // 处理行内代码
        formatted = formatted.replace(/`(.*?)`/g, '<code style="background-color:#f5f5f5;padding:2px 4px;border-radius:3px;">$1</code>');
        
        // 处理列表
        formatted = formatted.replace(/^\s*-\s+(.*?)(?:\n|$)/gm, '<li style="margin-left:20px;">$1</li>');
        
        // 处理段落和换行
        formatted = formatted.replace(/\n\n/g, '</p><p>');
        formatted = `<p>${formatted}</p>`;
        
        return formatted;
      } catch (error) {
        console.error('Markdown 解析错误:', error);
        return content; // 出错时返回原始内容
      }
    }
  },
  onLoad() {
    // 获取用户信息
    const userInfo = uni.getStorageSync('userInfo')
    if (userInfo) {
      this.userInfo = JSON.parse(userInfo)
    }
    
    // 加载聊天历史
    const chatHistory = uni.getStorageSync('chatHistory')
    if (chatHistory) {
      try {
        this.messages = JSON.parse(chatHistory)
      } catch (error) {
        console.error('解析聊天历史失败：', error)
      }
    }
    
    // 加载模型设置
    const savedModel = uni.getStorageSync('selectedModel')
    if (savedModel) {
      this.modelName = savedModel
    }
    
    const savedTemperature = uni.getStorageSync('temperature')
    if (savedTemperature !== '' && !isNaN(savedTemperature)) {
      this.temperature = parseFloat(savedTemperature)
    }
  },
  onShow() {
    // 检查登录状态变化
    const userInfo = uni.getStorageSync('userInfo')
    if (userInfo) {
      this.userInfo = JSON.parse(userInfo)
    }
    
    // 滚动到底部
    this.$nextTick(() => {
      this.scrollToBottom()
    })
  }
}
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8f9fa;
}

/* 头部样式 */
.header {
  height: 44px;
  background: linear-gradient(135deg, #43a047 0%, #2e7d32 100%);
  display: flex;
  align-items: center;
  padding: 0 15px;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  position: absolute;
  left: 15px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e0e0e0;
  flex-shrink: 0;
}

.avatar image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.guest-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e8f5e9;
}

.guest-icon {
  font-size: 20px;
}

.username {
  color: #ffffff;
  font-size: 14px;
}

.title {
  flex: 1;
  text-align: center;
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
}

/* 主布局 */
.main-layout {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

/* 侧边栏样式优化 */
.sidebar {
  width: 22vw;
  max-width: 120px;
  min-width: 80px;
  height: 100%;
  background-color: #f8f9fa;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}

/* 左侧菜单样式优化 */
.menu-list {
  display: flex;
  flex-direction: column;
  padding: 15px 10px;
  height: 100%;
}

.login-section {
  margin-bottom: 30px;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px 0;
  margin: 10px 0;
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.menu-item:hover {
  background-color: #e8f5e9;
}

.menu-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.menu-text {
  font-size: 13px;
  color: #333;
  font-weight: 500;
}

/* 登录注册按钮样式优化 */
.menu-btn {
  width: 100%;
  height: 40px;
  margin: 8px 0;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  color: #fff;
  white-space: nowrap;
  overflow: visible;
  text-overflow: clip;
  padding: 0 10px;
  line-height: 40px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.login-btn {
  background: linear-gradient(135deg, #4CAF50 0%, #43a047 100%);
}

.register-btn {
  background: linear-gradient(135deg, #81C784 0%, #66bb6a 100%);
}

.menu-btn:active {
  transform: scale(0.98);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* 聊天区域调整 */
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: calc(100% - 22vw); /* 减去侧边栏宽度 */
  max-width: calc(100% - 80px);
}

.chat-container {
  flex: 1;
  padding: 16px;
  background-color: #ffffff;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; /* 提升iOS滚动体验 */
}

.welcome-message {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.welcome-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.school-logo {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  flex-shrink: 0;
}

.welcome-text {
  flex: 1;
  font-size: 15px;
  color: #2e7d32;
  line-height: 1.5;
}

/* 消息列表样式 */
.message-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-item {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  width: 100%;
  align-items: flex-start;
}

.user-message {
  flex-direction: row-reverse;
  justify-content: flex-start;
}

.message-avatar {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #43a047;
  color: white;
  font-weight: bold;
  width: 100%;
  height: 100%;
}

.avatar-text {
  font-size: 14px;
  line-height: 1;
}

.message-content {
  max-width: 70%;
  display: flex;
  flex-direction: column;
}

.user-message .message-content {
  align-items: flex-end;
}

.message-bubble {
  padding: 10px 12px;
  border-radius: 16px;
  background-color: #f1f1f1;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  word-break: break-word; /* 确保长文本正确换行 */
}

.user-message .message-bubble {
  background-color: #e8f5e9;
  border-top-right-radius: 4px;
}

.assistant-message .message-bubble {
  background-color: #f5f5f5;
  border-top-left-radius: 4px;
}

.message-text {
  font-size: 15px;
  line-height: 1.5;
  word-break: break-word;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  text-align: right;
}

.user-message .message-time {
  text-align: right;
}

.assistant-message .message-time {
  text-align: left;
}

/* 加载指示器 */
.loading-indicator {
  display: flex;
  justify-content: center;
  margin: 16px 0;
}

.loading-dots {
  display: flex;
  gap: 4px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #43a047;
  opacity: 0.6;
  animation: pulse 1.5s infinite ease-in-out;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}

/* 输入区域样式 */
.input-section {
  padding: 10px;
  background-color: #ffffff;
  border-top: 1px solid #e0e0e0;
  width: 100%;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.input {
  height: 38px;
  font-size: 14px;
}

.send-btn {
  width: 60px;
  height: 40px;
  background-color: #43a047;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.send-btn.disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.send-icon {
  color: #ffffff;
  font-size: 14px;
}

.tool-buttons {
  display: flex;
  justify-content: space-around;
  padding: 0 5px;
}

.tool-btn {
  font-size: 22px;
  padding: 6px;
}

/* 响应式设计优化 */
@media screen and (max-width: 375px) {
  .sidebar {
    width: 20vw;
    min-width: 70px;
  }
  
  .avatar {
    width: 32px;
    height: 32px;
  }
  
  .message-content {
    max-width: 75%;
  }
  
  .message-text, .markdown-content {
    font-size: 14px;
  }
}

@media screen and (min-width: 768px) {
  .sidebar {
    width: 18vw;
  }
  
  .message-content {
    max-width: 60%;
  }
  
  .avatar {
    width: 40px;
    height: 40px;
  }
}

/* 优化聊天区域，确保滚动正常 */
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: calc(100% - 22vw); /* 减去侧边栏宽度 */
  max-width: calc(100% - 80px);
}

.chat-container {
  flex: 1;
  padding: 16px;
  background-color: #ffffff;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; /* 提升iOS滚动体验 */
}

/* 优化输入区域 */
.input-section {
  padding: 10px;
  background-color: #ffffff;
  border-top: 1px solid #e0e0e0;
  width: 100%;
}

.input {
  height: 38px;
  font-size: 14px;
}

/* 优化工具按钮区域 */
.tool-buttons {
  display: flex;
  justify-content: space-around;
  padding: 0 5px;
}

.tool-btn {
  font-size: 22px;
  padding: 6px;
}

/* 优化 Markdown 内容在小屏幕上的显示 */
@media screen and (max-width: 320px) {
  .markdown-content h1 {
    font-size: 18px;
  }
  
  .markdown-content h2 {
    font-size: 16px;
  }
  
  .markdown-content h3 {
    font-size: 15px;
  }
  
  .markdown-content code {
    font-size: 12px;
  }
}

/* 在 <style> 部分添加 Markdown 样式 */
.markdown-content {
  line-height: 1.6;
  word-break: break-word;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  margin-top: 16px;
  margin-bottom: 8px;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-content h1 {
  font-size: 20px;
}

.markdown-content h2 {
  font-size: 18px;
}

.markdown-content h3 {
  font-size: 16px;
}

.markdown-content p {
  margin-top: 0;
  margin-bottom: 10px;
}

.markdown-content ul,
.markdown-content ol {
  padding-left: 20px;
  margin-top: 0;
  margin-bottom: 10px;
}

.markdown-content code {
  font-family: monospace;
  background-color: #f6f8fa;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 14px;
}

.markdown-content pre {
  background-color: #f6f8fa;
  border-radius: 6px;
  padding: 12px;
  overflow-x: auto;
  margin-bottom: 16px;
}

.markdown-content pre code {
  background-color: transparent;
  padding: 0;
  border-radius: 0;
  font-size: 14px;
  line-height: 1.5;
}

.markdown-content blockquote {
  padding: 0 1em;
  color: #6a737d;
  border-left: 3px solid #dfe2e5;
  margin: 0 0 16px 0;
}

.markdown-content table {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 16px;
}

.markdown-content table th,
.markdown-content table td {
  padding: 6px 13px;
  border: 1px solid #dfe2e5;
}

.markdown-content table tr {
  background-color: #fff;
  border-top: 1px solid #c6cbd1;
}

.markdown-content table tr:nth-child(2n) {
  background-color: #f6f8fa;
}
</style>
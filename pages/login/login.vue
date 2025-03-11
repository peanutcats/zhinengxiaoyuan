<template>
  <view class="login-container">
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="title">用户登录</text>
    </view>
    
    <view class="form-container">
      <view class="input-group">
        <input 
          class="input" 
          type="text" 
          v-model="loginForm.studentId"
          placeholder="请输入学工号" 
        />
      </view>
      <view class="input-group">
        <input 
          class="input" 
          type="password" 
          v-model="loginForm.password"
          placeholder="请输入密码" 
        />
      </view>
      <button class="submit-btn" @click="handleLogin">登录</button>
      <view class="register-link" @click="toRegister">还没有账号？立即注册</view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      loginForm: {
        studentId: '',
        password: ''
      }
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    async handleLogin() {
      if (!this.loginForm.studentId || !this.loginForm.password) {
        uni.showToast({
          title: '请填写完整信息',
          icon: 'none'
        })
        return
      }
      
      try {
        // 显示加载提示
        uni.showLoading({
          title: '登录中...'
        })
        
        const response = await uni.request({
          url: 'http://10.0.17.192:3001/api/user/login', // 修正URL，添加端口号3001
          method: 'POST',
          header: {
            'Content-Type': 'application/json'
          },
          data: this.loginForm
        })
        
        // 隐藏加载提示
        uni.hideLoading()
        
        // 处理响应
        const res = response[1] || response
        
        if (res.statusCode === 200 && res.data.code === 200) {
          uni.setStorageSync('token', res.data.data.token)
          uni.setStorageSync('userInfo', JSON.stringify(res.data.data.user))
          uni.showToast({
            title: '登录成功',
            icon: 'success'
          })
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          uni.showToast({
            title: res.data?.message || '登录失败',
            icon: 'none'
          })
        }
      } catch (error) {
        // 隐藏加载提示
        uni.hideLoading()
        
        console.error('登录错误：', error)
        uni.showToast({
          title: '网络连接失败',
          icon: 'none'
        })
      }
    },
    toRegister() {
      uni.navigateTo({
        url: '/pages/register/register'
      })
    }
  }
}
</script>

<style>
.login-container {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.header {
  height: 44px;
  background: linear-gradient(135deg, #43a047 0%, #2e7d32 100%);
  display: flex;
  align-items: center;
  padding: 0 15px;
  position: relative;
}

.back-btn {
  position: absolute;
  left: 15px;
}

.back-icon {
  color: #ffffff;
  font-size: 24px;
}

.title {
  flex: 1;
  text-align: center;
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
}

.form-container {
  padding: 30px 20px;
}

.input-group {
  margin-bottom: 20px;
}

.input {
  width: 100%;
  height: 45px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 0 15px;
  font-size: 15px;
}

.submit-btn {
  width: 100%;
  height: 45px;
  background: linear-gradient(135deg, #4CAF50 0%, #43a047 100%);
  border-radius: 8px;
  color: #ffffff;
  font-size: 16px;
  margin-top: 30px;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  color: #43a047;
  font-size: 14px;
}
</style> 
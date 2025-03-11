<template>
  <view class="register-container">
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="title">用户注册</text>
    </view>
    
    <view class="form-container">
      <view class="input-group">
        <input 
          class="input" 
          type="text" 
          v-model="registerForm.username"
          placeholder="请输入用户名" 
        />
      </view>
      <view class="input-group">
        <input 
          class="input" 
          type="text" 
          v-model="registerForm.studentId"
          placeholder="请输入学工号" 
        />
      </view>
      <view class="input-group">
        <input 
          class="input" 
          type="password" 
          v-model="registerForm.password"
          placeholder="请输入密码" 
        />
      </view>
      <view class="input-group">
        <input 
          class="input" 
          type="password" 
          v-model="registerForm.confirmPassword"
          placeholder="请确认密码" 
        />
      </view>
      <button class="submit-btn" @click="handleRegister">注册</button>
      <view class="login-link" @click="toLogin">已有账号？立即登录</view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      registerForm: {
        username: '',
        studentId: '',
        password: '',
        confirmPassword: ''
      }
    }
  },
  methods: {
    goBack() {
      uni.navigateBack({
        delta: 1
      })
    },
    async handleRegister() {
      // 表单验证
      if (!this.registerForm.username || !this.registerForm.studentId || 
          !this.registerForm.password || !this.registerForm.confirmPassword) {
        uni.showToast({
          title: '请填写完整信息',
          icon: 'none'
        })
        return
      }
      
      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        uni.showToast({
          title: '两次密码不一致',
          icon: 'none'
        })
        return
      }
      
      try {
        // 显示加载提示
        uni.showLoading({
          title: '注册中...'
        })
        
        // 准备请求数据
        const requestData = {
          username: this.registerForm.username,
          studentId: this.registerForm.studentId,
          password: this.registerForm.password
        }
        
        // 发送注册请求
        const response = await uni.request({
          url: 'http://10.0.17.192:3001/api/user/register',
          method: 'POST',
          header: {
            'Content-Type': 'application/json'
          },
          data: requestData
        })
        
        // 隐藏加载提示
        uni.hideLoading()
        
        // 处理响应
        const res = response[1] || response
        
        if (res.statusCode === 201) {
          uni.showToast({
            title: '注册成功',
            icon: 'success',
            duration: 1500
          })
          
          // 注册成功后跳转到登录页
          setTimeout(() => {
            uni.navigateTo({
              url: '/pages/login/login'
            })
          }, 1500)
        } else {
          uni.showToast({
            title: res.data?.message || '注册失败',
            icon: 'none'
          })
        }
      } catch (error) {
        // 隐藏加载提示
        uni.hideLoading()
        
        console.error('注册错误：', error)
        uni.showToast({
          title: '网络连接失败',
          icon: 'none'
        })
      }
    },
    toLogin() {
      uni.navigateTo({
        url: '/pages/login/login'
      })
    }
  },
  // 添加页面生命周期钩子
  onLoad() {
    console.log('注册页面加载')
  },
  onUnload() {
    console.log('注册页面卸载')
  }
}
</script>

<style>
.register-container {
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

.login-link {
  text-align: center;
  margin-top: 20px;
  color: #43a047;
  font-size: 14px;
}
</style> 
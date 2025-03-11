<template>
  <view class="settings-container">
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="title">设置</text>
    </view>
    
    <view class="settings-content">
      <view class="settings-section">
        <view class="section-title">模型设置</view>
        
        <view class="setting-item">
          <text class="setting-label">选择AI模型</text>
          <picker 
            class="model-picker" 
            :value="selectedModelIndex" 
            :range="modelOptions" 
            range-key="name"
            @change="handleModelChange"
          >
            <view class="picker-value">
              {{ modelOptions[selectedModelIndex].name }}
              <text class="picker-arrow">▼</text>
            </view>
          </picker>
        </view>
        
        <view class="setting-item">
          <text class="setting-label">温度 (创造性)</text>
          <slider 
            class="temperature-slider" 
            :value="temperature * 100" 
            min="0" 
            max="100" 
            show-value 
            @change="handleTemperatureChange"
          />
        </view>
      </view>
      
      <view class="settings-section">
        <view class="section-title">聊天设置</view>
        
        <view class="setting-item">
          <text class="setting-label">清除聊天记录</text>
          <button class="clear-btn" @click="handleClearChat">清除</button>
        </view>
      </view>
      
      <view class="settings-section">
        <view class="section-title">关于</view>
        
        <view class="setting-item">
          <text class="setting-label">版本</text>
          <text class="setting-value">1.0.0</text>
        </view>
        
        <view class="setting-item">
          <text class="setting-label">开发者</text>
          <text class="setting-value">苏食院智能助手团队</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      modelOptions: [
        { id: 'deepseek-r1-250120', name: 'DeepSeek R1 (默认)' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
        { id: 'gpt-4', name: 'GPT-4' },
        { id: 'claude-3-opus', name: 'Claude 3 Opus' }
      ],
      selectedModelIndex: 0,
      temperature: 0.7
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    
    handleModelChange(e) {
      this.selectedModelIndex = e.detail.value
      const selectedModel = this.modelOptions[this.selectedModelIndex]
      
      // 保存选择的模型
      uni.setStorageSync('selectedModel', selectedModel.id)
      
      uni.showToast({
        title: `已选择 ${selectedModel.name}`,
        icon: 'none'
      })
    },
    
    handleTemperatureChange(e) {
      this.temperature = e.detail.value / 100
      
      // 保存温度设置
      uni.setStorageSync('temperature', this.temperature)
      
      uni.showToast({
        title: `温度设置为 ${this.temperature.toFixed(2)}`,
        icon: 'none'
      })
    },
    
    handleClearChat() {
      uni.showModal({
        title: '确认清除',
        content: '确定要清除所有聊天记录吗？此操作不可撤销。',
        success: (res) => {
          if (res.confirm) {
            // 清除聊天记录
            uni.removeStorageSync('chatHistory')
            
            uni.showToast({
              title: '聊天记录已清除',
              icon: 'success'
            })
          }
        }
      })
    },
    
    loadSettings() {
      // 加载已保存的模型设置
      const savedModel = uni.getStorageSync('selectedModel')
      if (savedModel) {
        const index = this.modelOptions.findIndex(option => option.id === savedModel)
        if (index !== -1) {
          this.selectedModelIndex = index
        }
      }
      
      // 加载已保存的温度设置
      const savedTemperature = uni.getStorageSync('temperature')
      if (savedTemperature !== '' && !isNaN(savedTemperature)) {
        this.temperature = parseFloat(savedTemperature)
      }
    }
  },
  onLoad() {
    this.loadSettings()
  }
}
</script>

<style>
.settings-container {
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

.settings-content {
  padding: 20px;
}

.settings-section {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 8px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  font-size: 15px;
  color: #333;
}

.setting-value {
  font-size: 15px;
  color: #666;
}

.model-picker {
  flex: 1;
  max-width: 60%;
}

.picker-value {
  font-size: 15px;
  color: #43a047;
  text-align: right;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.picker-arrow {
  font-size: 12px;
  margin-left: 5px;
}

.temperature-slider {
  width: 70%;
}

.clear-btn {
  background-color: #f44336;
  color: white;
  font-size: 14px;
  padding: 4px 12px;
  border-radius: 4px;
  line-height: 1.5;
}
</style> 
<template>
  <view class="map-container">
    <!-- 顶部导航栏 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="title">校园地图</text>
    </view>

    <!-- 地图展示区域 -->
    <view class="map-wrapper">
      <movable-area class="movable-area">
        <movable-view
          class="movable-view"
          direction="all"
          :scale="true"
          :scale-min="0.5"
          :scale-max="4"
          :scale-value="scale"
          @change="handleChange"
          @scale="handleScale"
        >
          <image
            class="map-image"
            src="/static/campus-map.jpg"
            mode="widthFix"
            @load="onImageLoad"
          />
        </movable-view>
      </movable-area>
    </view>

    <!-- 底部控制栏 -->
    <view class="control-bar">
      <view class="zoom-controls">
        <view class="zoom-btn" @click="zoomOut">
          <text>-</text>
        </view>
        <view class="zoom-level">{{ Math.round(scale * 100) }}%</view>
        <view class="zoom-btn" @click="zoomIn">
          <text>+</text>
        </view>
      </view>
      <view class="reset-btn" @click="resetZoom">
        <text>重置</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      scale: 1,
      imageWidth: 0,
      imageHeight: 0
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    handleChange(e) {
      // 处理拖动事件
      console.log('position changed', e.detail)
    },
    handleScale(e) {
      // 处理缩放事件
      this.scale = e.detail.scale
    },
    zoomIn() {
      if (this.scale < 4) {
        this.scale = Math.min(4, this.scale + 0.2)
      }
    },
    zoomOut() {
      if (this.scale > 0.5) {
        this.scale = Math.max(0.5, this.scale - 0.2)
      }
    },
    resetZoom() {
      this.scale = 1
    },
    onImageLoad(e) {
      // 图片加载完成后获取图片尺寸
      uni.getImageInfo({
        src: '/static/campus-map.jpg',
        success: (res) => {
          this.imageWidth = res.width
          this.imageHeight = res.height
        }
      })
    }
  }
}
</script>

<style>
.map-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
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
  height: 44px;
  display: flex;
  align-items: center;
}

.back-icon {
  color: #ffffff;
  font-size: 24px;
  font-weight: bold;
}

.title {
  flex: 1;
  text-align: center;
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
}

.map-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
  background-color: #ffffff;
}

.movable-area {
  width: 100%;
  height: 100%;
  position: absolute;
}

.movable-view {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-image {
  width: 100%;
  height: auto;
  display: block;
}

.control-bar {
  height: 60px;
  background-color: #ffffff;
  border-top: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.zoom-btn {
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #333;
  transition: all 0.3s ease;
}

.zoom-btn:active {
  background-color: #e0e0e0;
}

.zoom-level {
  font-size: 14px;
  color: #666;
  min-width: 60px;
  text-align: center;
}

.reset-btn {
  padding: 8px 16px;
  border-radius: 18px;
  background-color: #43a047;
  color: #ffffff;
  font-size: 14px;
  transition: all 0.3s ease;
}

.reset-btn:active {
  background-color: #2e7d32;
}
</style> 
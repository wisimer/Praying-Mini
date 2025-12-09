<template>
  <view class="page-container">
    <view class="custom-header" :style="headerStyle">
      <view class="header-left" @click="goBack">
        <uni-icons type="left" size="24" color="#333"></uni-icons>
      </view>
      <view class="header-title">关于我们</view>
      <view class="header-right"></view>
    </view>
    <view class="header-spacer" :style="spacerStyle"></view>

    <view class="logo-section">
      <image src="/static/logo.png" class="logo"></image>
      <text class="app-name">愿力岛</text>
      <text class="version">Version 1.0.0</text>
    </view>
    
    <view class="content-section">
      <view class="section-title">应用说明</view>
      <view class="text-content">
        愿力岛是一个互助许愿平台，用户可以发布愿望，也可以帮助他人实现愿望。我们致力于打造一个温暖互助的社区环境。
      </view>
      
      <view class="section-title">使用指南</view>
      <view class="text-content">
        1. 发布愿望：点击首页发布按钮，填写愿望详情。<br>
        2. 接取任务：浏览任务列表，选择感兴趣的任务接取。<br>
        3. 获得奖励：完成任务并获得发布者确认后，即可获得奖励。
      </view>
    </view>
    
    <view class="footer">
      <text>Copyright © 2023 Praying Team</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const headerStyle = ref({})
const spacerStyle = ref({})

onLoad(() => {
  // #ifdef MP-WEIXIN
  try {
    const menuButton = uni.getMenuButtonBoundingClientRect()
    const sysInfo = uni.getSystemInfoSync()
    const statusBarHeight = sysInfo.statusBarHeight
    const navBarContentHeight = (menuButton.top - statusBarHeight) * 2 + menuButton.height
    const totalHeight = statusBarHeight + navBarContentHeight
    
    headerStyle.value = {
      height: `${totalHeight}px`,
      paddingTop: `${statusBarHeight}px`
    }
    spacerStyle.value = {
      height: `${totalHeight}px`
    }
  } catch (e) {
    console.error('Header calculation failed:', e)
  }
  // #endif
})

const goBack = () => {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background-color: #fff;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
}

.custom-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 44px;
  padding-top: var(--status-bar-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 30rpx;
  padding-right: 30rpx;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  z-index: 100;
  box-sizing: border-box;
}
.header-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}
.header-spacer {
  height: calc(44px + var(--status-bar-height));
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60rpx;
  margin-top: 40rpx;
  
  .logo {
    width: 160rpx;
    height: 160rpx;
    border-radius: 30rpx;
    margin-bottom: 20rpx;
  }
  
  .app-name {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 10rpx;
  }
  
  .version {
    font-size: 24rpx;
    color: #999;
  }
}

.content-section {
  flex: 1;
  
  .section-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
    margin-top: 40rpx;
    
    &:first-child { margin-top: 0; }
  }
  
  .text-content {
    font-size: 28rpx;
    color: #666;
    line-height: 1.6;
    margin-bottom: 20rpx;
  }
}

.footer {
  text-align: center;
  padding: 40rpx 0;
  
  text {
    font-size: 24rpx;
    color: #ccc;
  }
}
</style>

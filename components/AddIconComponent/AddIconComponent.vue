<template>
  <view class="add-icon-container" :style="{ right: right, bottom: bottom }">
    <view class="menu-items" :class="{ 'is-expanded': isExpanded }">
      <view class="menu-item" @click="navigateTo('/pages/publish/wish')" :style="{ transitionDelay: isExpanded ? '0.1s' : '0.2s' }">
        <view class="menu-btn wish-btn">✨</view>
        <text class="menu-label">许愿</text>
      </view>
      <view class="menu-item" @click="navigateTo('/pages/publish/fulfill')" :style="{ transitionDelay: isExpanded ? '0.15s' : '0.1s' }">
        <view class="menu-btn fulfill-btn">🌸</view>
        <text class="menu-label">还愿</text>
      </view>
      <view class="menu-item" @click="navigateTo('/pages/publish/task')" :style="{ transitionDelay: isExpanded ? '0.2s' : '0s' }">
        <view class="menu-btn task-btn">📝</view>
        <text class="menu-label">任务</text>
      </view>
    </view>

    <view class="addicon" @click.stop="toggleMenu" :class="{ 'is-active': isExpanded, 'is-loading': isLoading }">
      <image v-if="!isLoading" class="icon" src="https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/addicon.png"></image>
      <view v-else class="loading-spinner"></view>
    </view>
    
    <view v-if="isExpanded" class="overlay" @click="closeMenu"></view>
  </view>
</template>

<script setup>
/**
 * AddIconComponent
 * 
 * A floating action button that expands into a menu with 3 options: Wish, Fulfill, and Task.
 * 
 * Props:
 * - right: CSS value for right position (default: '30rpx')
 * - bottom: CSS value for bottom position (default: '130rpx')
 */
import { ref } from 'vue'
import { toNextPage } from '@/core/app.js'
import { store } from '@/uni_modules/uni-id-pages/common/store'

const props = defineProps({
  right: {
    type: String,
    default: '30rpx'
  },
  bottom: {
    type: String,
    default: '130rpx'
  }
})

const isExpanded = ref(false)
const isLoading = ref(false)

const toggleMenu = () => {
  if (isLoading.value) return

  // 1. 检测当前用户登录状态
  const userInfo = uniCloud.getCurrentUserInfo()
  const tokenExpired = userInfo.tokenExpired
  const isLogin = store.hasLogin && tokenExpired > Date.now()

  // 2. 未登录处理流程
  if (!isLogin) {
    isLoading.value = true
    uni.showToast({
      title: "请先登录后再进行操作",
      icon: 'none',
      duration: 1500
    })

    // 3. 页面跳转控制
    setTimeout(() => {
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      let currentRoute = currentPage.route
      if (!currentRoute.startsWith('/')) {
        currentRoute = '/' + currentRoute
      }
      
      // 保留当前页面的参数
      if (currentPage.options && Object.keys(currentPage.options).length > 0) {
        const query = Object.keys(currentPage.options)
          .map(key => `${key}=${currentPage.options[key]}`)
          .join('&')
        currentRoute += `?${query}`
      }
      
      // 4. 跳转参数处理
      const redirect = encodeURIComponent(currentRoute)
      const url = `/uni_modules/uni-id-pages/pages/login/login-withpwd?uniIdRedirectUrl=${redirect}`
      
      uni.navigateTo({
        url: url,
        success: () => {
          // 5. 按钮交互优化 - 跳转完成后恢复
          isLoading.value = false
        },
        fail: (err) => {
          // 6. 异常处理
          console.error('Navigate failed:', err)
          isLoading.value = false
          uni.showToast({
            title: '跳转失败，请检查网络',
            icon: 'none'
          })
        }
      })
    }, 1500)
    return
  }

  isExpanded.value = !isExpanded.value
}

const closeMenu = () => {
  isExpanded.value = false
}

const navigateTo = (toUrl) => {
	console.log("navigateTo : ", toUrl)
  toNextPage(toUrl)
  // Delay closing to ensure navigation triggers and provides visual feedback
  setTimeout(() => {
    closeMenu()
  }, 300)
}
</script>

<style lang="scss" scoped>
.add-icon-container {
  position: fixed;
  z-index: 999;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.addicon {
  width: 80rpx;
  height: 80rpx;
  background-color: #AFC272;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(175, 194, 114, 0.4);
  transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  z-index: 1001;
  position: relative;

  &.is-active {
    transform: rotate(45deg);
    background-color: #FF6B81;
  }

  &:active {
    transform: scale(0.95) rotate(45deg);
  }
}

.icon {
  width: 26rpx;
  height: 26rpx;
}

.menu-items {
  position: absolute;
  bottom: 90rpx;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 16rpx;
  pointer-events: none;
  opacity: 0;
  z-index: 1002;
  
  &.is-expanded {
    pointer-events: auto;
    opacity: 1;
    
    .menu-item {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
  }
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
  transform: translateY(20rpx) scale(0.8);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  
  .menu-label {
    background-color: rgba(255, 255, 255, 0.9);
    padding: 8rpx 16rpx;
    border-radius: 8rpx;
    font-size: 24rpx;
    color: #333;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    font-weight: 500;
  }
  
  .menu-btn {
    width: 70rpx;
    height: 70rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30rpx;
    box-shadow: 0 3px 8px rgba(0,0,0,0.15);
    background-color: #fff;
    
    &.wish-btn { color: #FFD700; background-color: #FEF9E7; }
    &.fulfill-btn { color: #FF69B4; background-color: #FFF0F5; }
    &.task-btn { color: #4682B4; background-color: #F0F8FF; }
    
    &:active {
      transform: scale(0.9);
    }
  }
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 990;
  /* Transparent overlay to capture clicks outside */
}

.loading-spinner {
  width: 30rpx;
  height: 30rpx;
  border: 3rpx solid #ffffff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.addicon.is-loading {
  background-color: #ccc; 
  pointer-events: none;
}
</style>

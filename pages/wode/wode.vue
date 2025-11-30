<template>
  <view class="page-container">
    <!-- User Info Header -->
    <view class="header-section">
      <image 
        class="avatar" 
        :src="store.userInfo?.avatar_file?.url || BASE_URL_AVATAR"
        @click="toNextPage('/uni_modules/uni-id-pages/pages/userinfo/userinfo')"
      ></image>
      <view class="nickname">{{ store.userInfo?.nickname || '点击登录' }}</view>
      <view class="stats-row">
        <view class="stat-item">
          <image src="/static/icon/wish-coin.png" class="icon-small"></image>
          <text>愿力值 {{ can }}</text>
        </view>
        <view class="stat-item">
          <image src="/static/icon/gold-coin.png" class="icon-small"></image>
          <text>金币 {{ coin }}</text>
        </view>
      </view>
    </view>

    <!-- Menu List -->
    <view class="menu-list">
      <!-- Group 1: Tasks & Wishes -->
      <view class="menu-group">
        <view class="menu-item" @click="toNextPage('/pages/wode/wish-list/wish-list')">
          <view class="item-left">
            <uni-icons type="list" size="20" color="#409EFF"></uni-icons>
            <text class="item-text">我的愿望列表</text>
          </view>
          <uni-icons type="right" size="16" color="#999"></uni-icons>
        </view>
        
        <view class="menu-item" @click="toNextPage('/pages/wode/task-published/task-published')">
          <view class="item-left">
            <uni-icons type="paperplane" size="20" color="#409EFF"></uni-icons>
            <text class="item-text">我发布的任务</text>
          </view>
          <uni-icons type="right" size="16" color="#999"></uni-icons>
        </view>
        
        <view class="menu-item" @click="toNextPage('/pages/wode/task-accepted/task-accepted')">
          <view class="item-left">
            <uni-icons type="checkbox" size="20" color="#409EFF"></uni-icons>
            <text class="item-text">我接的任务</text>
          </view>
          <uni-icons type="right" size="16" color="#999"></uni-icons>
        </view>
      </view>

      <!-- Group 2: Recharge & Support -->
      <view class="menu-group">
        <view class="menu-item" @click="toNextPage('/pages/wode/recharge/recharge')">
          <view class="item-left">
            <uni-icons type="wallet" size="20" color="#E6A23C"></uni-icons>
            <text class="item-text">充值金币</text>
          </view>
          <uni-icons type="right" size="16" color="#999"></uni-icons>
        </view>
        
        <button class="menu-item contact-btn" open-type="contact" @click="handleContact">
          <view class="item-left">
            <uni-icons type="help" size="20" color="#409EFF"></uni-icons>
            <text class="item-text">帮助与客服</text>
          </view>
          <uni-icons type="right" size="16" color="#999"></uni-icons>
        </button>
        
        <view class="menu-item" @click="toNextPage('/pages/wode/about/about')">
          <view class="item-left">
            <uni-icons type="info" size="20" color="#409EFF"></uni-icons>
            <text class="item-text">关于</text>
          </view>
          <uni-icons type="right" size="16" color="#999"></uni-icons>
        </view>
      </view>
    </view>

    <!-- Logout Button -->
    <view class="logout-section" v-if="store.hasLogin">
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { store, mutations } from '@/uni_modules/uni-id-pages/common/store'
import { toNextPage, showModal, showToast, showLoading } from '@/core/app.js'
import { BASE_URL_AVATAR } from '@/core/config.js'
import { getWodePage } from '@/cloud-api/index.js'

const can = ref(0)
const coin = ref(0)

onShow(() => {
  if (store.hasLogin) {
    initData()
  }
})

const initData = () => {
  getWodePage().then(datalist => {
    const playerData = datalist[1].data || {}
    can.value = playerData.can || 0
    coin.value = playerData.coin || 0
  }).catch(console.error)
}

const handleContact = () => {
  // #ifdef H5
  // For H5, we might redirect to a specific page or show a modal since open-type="contact" is for MP-WEIXIN
  showToast('请在微信小程序中咨询客服')
  // #endif
}

const handleLogout = () => {
  showModal({
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        showLoading('退出中...')
        mutations.logout()
        uni.hideLoading()
        uni.reLaunch({
          url: '/uni_modules/uni-id-pages/pages/login/login-withpwd'
        })
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 40rpx;
}

.header-section {
  background-color: #fff;
  padding: 60rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20rpx;
  
  .avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    margin-bottom: 20rpx;
    border: 2rpx solid #eee;
  }
  
  .nickname {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 20rpx;
  }
  
  .stats-row {
    display: flex;
    gap: 40rpx;
    
    .stat-item {
      display: flex;
      align-items: center;
      gap: 10rpx;
      font-size: 28rpx;
      color: #666;
      
      .icon-small {
        width: 32rpx;
        height: 32rpx;
      }
    }
  }
}

.menu-list {
  padding: 0 30rpx;
  
  .menu-group {
    background-color: #fff;
    border-radius: 16rpx;
    margin-bottom: 20rpx;
    overflow: hidden;
  }
  
  .menu-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx;
    background-color: #fff;
    border-bottom: 1rpx solid #f5f5f5;
    
    &:last-child {
      border-bottom: none;
    }
    
    &.contact-btn {
      width: 100%;
      border-radius: 0;
      margin: 0;
      line-height: normal;
      
      &::after {
        border: none;
      }
    }
    
    .item-left {
      display: flex;
      align-items: center;
      gap: 20rpx;
      
      .item-text {
        font-size: 30rpx;
        color: #333;
      }
    }
  }
}

.logout-section {
  padding: 40rpx 30rpx;
  
  .logout-btn {
    background-color: #fff;
    color: #ff4d4f;
    font-size: 30rpx;
    border-radius: 16rpx;
    &::after {
      border: none;
    }
  }
}
</style>

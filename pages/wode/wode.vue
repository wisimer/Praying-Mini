<template>
  <view class="page-container">
    <!-- Background Gradient -->
    <div class="page-bg"></div>

    <!-- User Info Header -->
    <view class="header-section">
      <image 
        class="avatar" 
        :src="store.userInfo?.avatar_file?.url || BASE_URL_AVATAR"
        @click="handleAvatarClick"
      ></image>
      <view class="nickname" @click="handleAvatarClick">{{ store.userInfo?.nickname || '点击登录' }}</view>
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
            <view class="icon-box blue">
              <uni-icons type="list" size="20" color="#fff"></uni-icons>
            </view>
            <text class="item-text">我的愿望列表</text>
          </view>
          <uni-icons type="right" size="16" color="#ccc"></uni-icons>
        </view>

        <view class="menu-item" @click="toNextPage('/pages/wode/my-favorites/my-favorites')">
          <view class="item-left">
            <view class="icon-box red">
              <uni-icons type="heart-filled" size="20" color="#fff"></uni-icons>
            </view>
            <text class="item-text">我的收藏</text>
          </view>
          <uni-icons type="right" size="16" color="#ccc"></uni-icons>
        </view>
        
        <view class="menu-item" @click="toNextPage('/pages/wode/task-published/task-published')">
          <view class="item-left">
            <view class="icon-box purple">
              <uni-icons type="paperplane" size="20" color="#fff"></uni-icons>
            </view>
            <text class="item-text">我发布的任务</text>
          </view>
          <uni-icons type="right" size="16" color="#ccc"></uni-icons>
        </view>
        
        <view class="menu-item" @click="toNextPage('/pages/wode/task-accepted/task-accepted')">
          <view class="item-left">
            <view class="icon-box green">
              <uni-icons type="checkbox" size="20" color="#fff"></uni-icons>
            </view>
            <text class="item-text">我接的任务</text>
          </view>
          <uni-icons type="right" size="16" color="#ccc"></uni-icons>
        </view>
      </view>

      <!-- Group 2: Recharge & Support -->
      <view class="menu-group">
        <view class="menu-item" @click="toNextPage('/pages/wode/recharge/recharge')">
          <view class="item-left">
            <view class="icon-box orange">
              <uni-icons type="wallet" size="20" color="#fff"></uni-icons>
            </view>
            <text class="item-text">充值金币</text>
          </view>
          <uni-icons type="right" size="16" color="#ccc"></uni-icons>
        </view>
        
        <button class="menu-item contact-btn" open-type="contact" @click="handleContact">
          <view class="item-left">
            <view class="icon-box pink">
              <uni-icons type="help" size="20" color="#fff"></uni-icons>
            </view>
            <text class="item-text">帮助与客服</text>
          </view>
          <uni-icons type="right" size="16" color="#ccc"></uni-icons>
        </button>
        
        <view class="menu-item" @click="toNextPage('/pages/wode/about/about')">
          <view class="item-left">
            <view class="icon-box gray">
              <uni-icons type="info" size="20" color="#fff"></uni-icons>
            </view>
            <text class="item-text">关于</text>
          </view>
          <uni-icons type="right" size="16" color="#ccc"></uni-icons>
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

const handleAvatarClick = () => {
  if (store.hasLogin) {
    toNextPage('/uni_modules/uni-id-pages/pages/userinfo/userinfo')
  } else {
    uni.navigateTo({
      url: '/uni_modules/uni-id-pages/pages/login/login-withpwd'
    })
  }
}

const handleContact = () => {
  // #ifdef H5
  // For H5, we might redirect to a specific page or show a modal since open-type="contact" is for MP-WEIXIN
  showToast('请在微信小程序中咨询客服')
  // #endif
}

const handleLogout = () => {
  showModal({
    content: '确定要退出登录吗？'
  }).then(async () => {
    showLoading('退出中...')
    await mutations.logout()
    uni.hideLoading()
    can.value = 0
    coin.value = 0
  })
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 40rpx;
  position: relative;
}

.page-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 420rpx;
  background: linear-gradient(180deg, #6FCFFB 0%, #B59DFF 100%);
  z-index: 0;
  opacity: 0.8;
}

.header-section {
  padding: 60rpx 0;
  padding-top: calc(80rpx + env(safe-area-inset-top));
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20rpx;
  position: relative;
  z-index: 1;
  
  .avatar {
    width: 140rpx;
    height: 140rpx;
    border-radius: 50%;
    margin-bottom: 24rpx;
    border: 6rpx solid rgba(255, 255, 255, 0.8);
    box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.1);
  }
  
  .nickname {
    font-size: 36rpx;
    font-weight: 800;
    color: #fff;
    margin-bottom: 24rpx;
    text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.1);
  }
  
  .stats-row {
    display: flex;
    gap: 30rpx;
    
    .stat-item {
      display: flex;
      align-items: center;
      gap: 12rpx;
      font-size: 26rpx;
      color: #333;
      background-color: rgba(255, 255, 255, 0.9);
      padding: 10rpx 30rpx;
      border-radius: 30rpx;
      font-weight: 600;
      box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.05);
      
      .icon-small {
        width: 36rpx;
        height: 36rpx;
      }
    }
  }
}

.menu-list {
  padding: 0 30rpx;
  position: relative;
  z-index: 1;
  
  .menu-group {
    background-color: #fff;
    border-radius: 24rpx;
    margin-bottom: 24rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
  }
  
  .menu-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 32rpx;
    background-color: #fff;
    border-bottom: 1rpx solid #f9f9f9;
    transition: background-color 0.2s;
    
    &:active {
      background-color: #f9f9f9;
    }
    
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
      gap: 24rpx;
      
      .icon-box {
        width: 72rpx;
        height: 72rpx;
        border-radius: 20rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        
        &.blue { background: linear-gradient(135deg, #6FCFFB 0%, #409EFF 100%); }
        &.purple { background: linear-gradient(135deg, #B59DFF 0%, #8E44AD 100%); }
        &.green { background: linear-gradient(135deg, #81FBB8 0%, #28C76F 100%); }
        &.orange { background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); }
        &.pink { background: linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%); }
        &.red { background: linear-gradient(135deg, #FF6B81 0%, #FF4757 100%); }
        &.gray { background: linear-gradient(135deg, #E0E0E0 0%, #BDBDBD 100%); }
      }
      
      .item-text {
        font-size: 30rpx;
        color: #333;
        font-weight: 500;
      }
    }
  }
}

.logout-section {
  padding: 40rpx 30rpx;
  position: relative;
  z-index: 1;
  
  .logout-btn {
    background-color: rgba(255, 255, 255, 0.8);
    color: #ff4d4f;
    font-size: 32rpx;
    font-weight: 600;
    border-radius: 24rpx;
    height: 96rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(5px);
    box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
    
    &::after {
      border: none;
    }
    
    &:active {
      background-color: rgba(255, 255, 255, 0.9);
      transform: scale(0.99);
    }
  }
}
</style>

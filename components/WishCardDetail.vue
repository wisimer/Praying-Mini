<template>
  <view class="wish-detail-modal" v-if="visible" @click="handleClose" :class="{ 'fade-in': visible }">
    <view class="modal-content" :class="{ 'wide-mode': wishData.fullfilled }" @click.stop>
      <!-- Card Area -->
      <scroll-view scroll-y class="card-container" id="wish-card-capture">
        <!-- Background Layer -->
        <image v-if="isImageBg" class="card-bg" :src="bgValue" mode="aspectFill"></image>
        <view v-else class="card-bg-css" :style="{ background: bgValue }"></view>
        
        <view class="conversation-container">
          <!-- Left Side: Wish -->
          <view class="chat-section left-section">
            <view class="section-header">
              <image class="user-avatar" :src="wishData.user?.avatar || defaultAvatar" mode="aspectFill"></image>
              <view class="header-info">
                <text class="user-name">许愿</text>
                <text class="date-text">{{ formattedDate }}</text>
              </view>
            </view>
            
            <view class="bubble-group">
              <view class="bubble wish-bubble">
                <text class="bubble-text" :style="textStyle">{{ wishContent }}</text>
              </view>
              
              <view class="bubble ai-bubble" v-if="aiMessage">
                <view class="ai-header">
                  <uni-icons type="star-filled" size="14" color="#FFD700"></uni-icons>
                  <text class="ai-title">星语</text>
                </view>
                <text class="ai-content">{{ aiMessage }}</text>
              </view>
            </view>
          </view>

          <!-- Right Side: Fulfillment -->
          <view class="chat-section right-section" v-if="wishData.fullfilled">
            <view class="section-header reverse">
              <image class="user-avatar" :src="wishData.user?.avatar || defaultAvatar" mode="aspectFill"></image>
              <view class="header-info align-right">
                <text class="user-name">还愿</text>
                <text class="date-text">{{ formatFulfillDate }}</text>
              </view>
            </view>

            <view class="bubble-group align-right">
              <view class="bubble fulfill-bubble">
                <text class="bubble-text">{{ wishData.fullfill_content }}</text>
              </view>

              <view class="bubble ai-bubble fulfill-ai" v-if="wishData.fullfill_ai_message">
                <view class="ai-header">
                  <uni-icons type="heart-filled" size="14" color="#FF6B81"></uni-icons>
                  <text class="ai-title">祝福</text>
                </view>
                <text class="ai-content">{{ wishData.fullfill_ai_message }}</text>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>

      <!-- Action Buttons -->
      <view class="action-area">
        <view class="action-btn" @click="handleLike">
          <view class="icon-wrapper like-icon" :class="{ 'is-liked': isLiked }">
            <uni-icons :type="isLiked ? 'heart-filled' : 'heart'" size="24" :color="isLiked ? '#ff5a5f' : '#fff'"></uni-icons>
          </view>
          <text class="btn-text">{{ isLiked ? '已收藏' : '收藏' }}</text>
        </view>

        <view class="action-btn" @click="handleSave">
          <view class="icon-wrapper save-icon">
            <uni-icons type="download" size="24" color="#fff"></uni-icons>
          </view>
          <text class="btn-text">保存</text>
        </view>

        <view class="action-btn" @click="handleShare">
          <view class="icon-wrapper share-icon">
            <uni-icons type="redo" size="24" color="#fff"></uni-icons>
          </view>
          <text class="btn-text">分享</text>
        </view>

        <view class="action-btn" @click="handleSameWish" v-if="showSameWish && !wishData.fullfilled">
          <view class="icon-wrapper same-icon">
            <uni-icons type="plus" size="24" color="#fff"></uni-icons>
          </view>
          <text class="btn-text">同款</text>
        </view>
        
        <view class="action-btn" @click="handleFulfill" v-if="!wishData.fullfilled && isMine">
           <view class="icon-wrapper fulfill-icon">
            <uni-icons type="checkbox-filled" size="24" color="#fff"></uni-icons>
          </view>
          <text class="btn-text">去还愿</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { setLike, removeLike, getLikeDel } from '@/cloud-api/dynamic.js'
import { store } from '@/uni_modules/uni-id-pages/common/store.js'
import { showToast, toNextPage } from '@/core/app.js'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  wishData: {
    type: Object,
    default: () => ({})
  },
  showSameWish: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:visible', 'close'])

const defaultAvatar = 'https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/default_avatar.png'
const isLiked = ref(false)
const loading = ref(false)

const isMine = computed(() => {
  return store.hasLogin && props.wishData.user_id === store.userInfo._id
})

const isImageBg = computed(() => {
  const cs = props.wishData?.content_style
  return cs?.bgType === 'image' || (!cs?.bgType && props.wishData?.poster)
})

const bgValue = computed(() => {
  const cs = props.wishData?.content_style
  if (isImageBg.value) {
    return cs?.bgValue || props.wishData?.poster
  }
  return cs?.bgValue || 'linear-gradient(135deg, #fff1eb 0%, #ace0f9 100%)'
})

const textStyle = computed(() => {
  const cs = props.wishData?.content_style || {}
  return {
    fontSize: (cs.fontSize || 16) + 'px',
    color: cs.color || '#333',
    fontWeight: cs.fontWeight || 'normal'
  }
})

const wishContent = computed(() => {
  return props.wishData.original_content || props.wishData.content || props.wishData.title
})

const aiMessage = computed(() => {
  return props.wishData.ai_message || props.wishData.content_style?.aiMessage
})

const formattedDate = computed(() => {
  if (!props.wishData.publish_date && !props.wishData.createTime) return ''
  const date = new Date(props.wishData.publish_date || props.wishData.createTime)
  if (isNaN(date.getTime())) return props.wishData.createTime
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
})

const formatFulfillDate = computed(() => {
  if (!props.wishData.fullfill_date) return ''
  const date = new Date(props.wishData.fullfill_date)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
})

const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}

const checkLogin = () => {
  if (!store.hasLogin) {
    toNextPage('/uni_modules/uni-id-pages/pages/login/login-withpwd')
    return false
  }
  return true
}

const initLikeStatus = async () => {
    if (store.hasLogin && props.wishData._id) {
        try {
            const res = await getLikeDel(props.wishData._id)
            isLiked.value = !!(res && res.data && res.data._id)
        } catch (e) {
            // console.error('Check like status failed:', e)
        }
    } else {
        isLiked.value = false
    }
}

const handleLike = async () => {
  if (!checkLogin()) return
  
  if (loading.value) return
  loading.value = true
  
  try {
    if (isLiked.value) {
        await removeLike(props.wishData._id)
        isLiked.value = false
        showToast('已取消收藏')
    } else {
        await setLike(props.wishData._id)
        isLiked.value = true
        showToast('收藏成功')
    }
  } catch (e) {
    showToast(e.message || '操作失败')
  } finally {
    loading.value = false
  }
}

const handleSave = () => {
  uni.showLoading({ title: '保存中...' })
  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({
      title: '已保存到相册',
      icon: 'success'
    })
  }, 1000)
}

const handleShare = () => {
  uni.showActionSheet({
    itemList: ['分享给微信好友', '分享到朋友圈'],
    success: (res) => {
      uni.showToast({
        title: '分享成功',
        icon: 'success'
      })
    }
  })
}

const handleSameWish = () => {
  if (!checkLogin()) return
  uni.navigateTo({
    url: `/pages/publish/wish?content=${encodeURIComponent(wishContent.value)}`
  })
}

const handleFulfill = () => {
  if (!checkLogin()) return
  uni.navigateTo({
    url: '/pages/publish/fulfill'
  })
}

watch(() => props.visible, (val) => {
    if (val) {
        initLikeStatus()
    }
})
</script>

<style lang="scss" scoped>
.wish-detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;

  &.fade-in {
    opacity: 1;
    pointer-events: auto;
  }

  .modal-content {
    width: 85%;
    max-width: 600rpx;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    transform: scale(0.9);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    
    &.wide-mode {
      width: 95%;
      max-width: 720rpx;
    }
  }
}

.wish-detail-modal.fade-in .modal-content {
  transform: scale(1);
}

.card-container {
  width: 100%;
  height: 60vh; 
  background-color: #fffbe8;
  border-radius: 24rpx;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  margin-bottom: 40rpx;

  .card-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }

  .card-bg-css {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }
}

.conversation-container {
  position: relative;
  z-index: 1;
  padding: 30rpx;
  min-height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 30rpx;
  
  .wide-mode & {
    flex-direction: row;
    align-items: flex-start;
    gap: 20rpx;
  }
}

.chat-section {
  flex: 1;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(5px);
  border-radius: 20rpx;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  
  &.right-section {
    background: rgba(255, 240, 245, 0.7); // Light pink tint
  }
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  
  &.reverse {
    flex-direction: row-reverse;
  }
  
  .user-avatar {
    width: 60rpx;
    height: 60rpx;
    border-radius: 50%;
    border: 2px solid #fff;
    margin: 0 10rpx;
  }
  
  .header-info {
    display: flex;
    flex-direction: column;
    
    &.align-right {
      align-items: flex-end;
    }
    
    .user-name {
      font-size: 26rpx;
      font-weight: bold;
      color: #333;
    }
    
    .date-text {
      font-size: 20rpx;
      color: #666;
    }
  }
}

.bubble-group {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  
  &.align-right {
    align-items: flex-end;
  }
}

.bubble {
  padding: 20rpx;
  border-radius: 20rpx;
  max-width: 100%;
  box-sizing: border-box;
  position: relative;
  
  &.wish-bubble {
    background: #fff;
    border-top-left-radius: 4rpx;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
  
  &.fulfill-bubble {
    background: #fff0f5;
    border-top-right-radius: 4rpx;
    box-shadow: 0 2px 8px rgba(255, 182, 193, 0.2);
    color: #333;
    font-size: 28rpx;
    line-height: 1.5;
  }
  
  &.ai-bubble {
    background: rgba(255,255,255,0.9);
    border: 1px solid rgba(255,255,255,0.5);
    
    &.fulfill-ai {
      background: rgba(255, 250, 250, 0.95);
    }
  }
  
  .bubble-text {
    word-break: break-all;
    white-space: pre-wrap;
  }
}

.ai-header {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 8rpx;
  
  .ai-title {
    font-size: 22rpx;
    color: #999;
    font-weight: bold;
  }
}

.ai-content {
  font-size: 24rpx;
  color: #555;
  line-height: 1.4;
  text-align: justify;
}

.action-area {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 20rpx;
  flex-wrap: wrap;
  gap: 10rpx;

  .action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 100rpx;
    
    .icon-wrapper {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 10rpx;
      transition: transform 0.2s;

      &:active {
        transform: scale(0.95);
      }

      &.like-icon {
        background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
        &.is-liked { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); }
      }

      &.save-icon { background: linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%); }
      &.share-icon { background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%); }
      &.same-icon { background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%); }
      &.fulfill-icon { background: linear-gradient(135deg, #f6d365 0%, #fda085 100%); }
    }

    .btn-text {
      font-size: 22rpx;
      color: #fff;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }
  }
}
</style>
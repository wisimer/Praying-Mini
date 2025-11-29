<template>
  <view class="wish-detail-modal" v-if="visible" @click="handleClose" :class="{ 'fade-in': visible }">
    <view class="modal-content" @click.stop>
      <!-- Card Area -->
      <view class="card-container" id="wish-card-capture">
        <!-- Background Layer -->
        <image v-if="isImageBg" class="card-bg" :src="bgValue" mode="aspectFill"></image>
        <view v-else class="card-bg-css" :style="{ background: bgValue }"></view>
        
        <view class="card-header">
          <image class="user-avatar" :src="wishData.user?.avatar || defaultAvatar" mode="aspectFill"></image>
          <text class="user-name">{{ wishData.user?.nickname || 'Unknown' }}</text>
          <text class="date-text">{{ formattedDate }}</text>
        </view>

        <view class="card-body">
          <text class="wish-text" :style="textStyle">{{ wishData.content || wishData.title }}</text>
        </view>

        <view class="card-footer">
          <view v-if="wishData.content_style && wishData.content_style.aiMessage" class="ai-message" :class="{ show: showAiMessage }">
            <text class="ai-label">AI 寄语</text>
            <text class="ai-content">{{ wishData.content_style.aiMessage }}</text>
          </view>
        </view>
      </view>

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
          <text class="btn-text">保存到相册</text>
        </view>

        <view class="action-btn" @click="handleShare">
          <view class="icon-wrapper share-icon">
            <uni-icons type="redo" size="24" color="#fff"></uni-icons>
          </view>
          <text class="btn-text">分享给好友</text>
        </view>

        <view class="action-btn" @click="handleSameWish" v-if="showSameWish">
          <view class="icon-wrapper same-icon">
            <uni-icons type="plus" size="24" color="#fff"></uni-icons>
          </view>
          <text class="btn-text">同款许愿</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { BASE_URL_AVATAR } from '@/core/config.js'
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
    fontSize: (cs.fontSize || 18) + 'px',
    color: cs.color || '#333',
    fontWeight: cs.fontWeight || 'normal'
  }
})

const showAiMessage = computed(() => !!props.wishData?.content_style?.aiMessage)

const formattedDate = computed(() => {
  if (!props.wishData.createTime) return ''
  // Handle if createTime is "XX分钟前" or "刚刚"
  if (props.wishData.createTime.includes('前') || props.wishData.createTime.includes('刚刚')) {
      // If it's relative time, we might want to use publish_date if available, or just keep it.
      // But requirement says yyyy年mm月dd日.
      // Let's try to use publish_date timestamp if available in wishData
      if (props.wishData.publish_date) {
          const date = new Date(props.wishData.publish_date)
          const y = date.getFullYear()
          const m = String(date.getMonth() + 1).padStart(2, '0')
          const d = String(date.getDate()).padStart(2, '0')
          return `${y}年${m}月${d}日`
      }
      return props.wishData.createTime // Fallback
  }
  
  // If it's already formatted or timestamp
  try {
      const date = new Date(props.wishData.createTime)
      if (isNaN(date.getTime())) return props.wishData.createTime
      
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      return `${y}年${m}月${d}日`
  } catch (e) {
      return props.wishData.createTime
  }
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
            // check if data exists and has _id
            isLiked.value = !!(res && res.data && res.data._id)
        } catch (e) {
            console.error('Check like status failed:', e)
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
  // Mock save functionality
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
  // Mock share functionality
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

  // Mock navigation to publish page with copied content
  uni.showToast({
    title: '正在创建同款...',
    icon: 'none'
  })
  setTimeout(() => {
    // Navigate to publish page (assuming path based on analysis)
    uni.navigateTo({
      url: `/pages/publish/wish?content=${encodeURIComponent(props.wishData.content || props.wishData.title)}`
    })
  }, 500)
}

watch(() => props.visible, (val) => {
    if (val) {
        initLikeStatus()
    }
})

watch(() => store.hasLogin, (val) => {
    if (val && props.visible) {
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
    display: flex;
    flex-direction: column;
    align-items: center;
    transform: scale(0.9);
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

.wish-detail-modal.fade-in .modal-content {
  transform: scale(1);
}

.card-container {
  width: 100%;
  aspect-ratio: 3/4;
  background-color: #fffbe8; /* Fallback color */
  border-radius: 24rpx;
  padding: 40rpx;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
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

  .card-header {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    margin-bottom: 30rpx;

    .user-avatar {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      border: 2px solid #fff;
      margin-right: 20rpx;
    }

    .user-name {
      font-size: 28rpx;
      color: #333;
      font-weight: 600;
    }

    .date-text {
      margin-left: auto;
      font-size: 24rpx;
      color: #666;
    }
  }

  .card-body {
    position: relative;
    z-index: 1;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20rpx 0;

    .wish-text {
      line-height: 1.6;
      text-align: center;
      font-family: serif; /* Elegant font feel */
      white-space: pre-wrap;
      word-break: break-all;
      max-width: 90%;
    }
  }

  .card-footer {
    position: relative;
    z-index: 1;
    text-align: center;
    margin-top: auto;
    width: 100%;
    display: flex;
    justify-content: center;

    .ai-message {
      margin-top: 10px;
      padding: 10px;
      background: rgba(255,255,255,0.8);
      border-radius: 8px;
      max-width: 90%;
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.5s ease;
      
      &.show {
        opacity: 1;
        transform: translateY(0);
      }
      
      .ai-label {
        display: block;
        font-size: 10px;
        color: #999;
        margin-bottom: 4px;
        text-align: center;
      }
      
      .ai-content {
        font-size: 12px;
        color: #555;
        line-height: 1.4;
        text-align: justify;
      }
    }
  }
}

.action-area {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 20rpx;

  .action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .icon-wrapper {
      width: 100rpx;
      height: 100rpx;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16rpx;
      transition: transform 0.2s;

      &:active {
        transform: scale(0.95);
      }

      &.like-icon {
        background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
        box-shadow: 0 4px 10px rgba(168, 237, 234, 0.3);
        
        &.is-liked {
          background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
          box-shadow: 0 4px 10px rgba(255, 154, 158, 0.3);
        }
      }

      &.save-icon {
        background: linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%);
        box-shadow: 0 4px 10px rgba(255, 154, 158, 0.3);
      }

      &.share-icon {
        background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);
        box-shadow: 0 4px 10px rgba(161, 140, 209, 0.3);
      }

      &.same-icon {
        background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
        box-shadow: 0 4px 10px rgba(132, 250, 176, 0.3);
      }
    }

    .btn-text {
      font-size: 24rpx;
      color: #fff;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }
  }
}
</style>

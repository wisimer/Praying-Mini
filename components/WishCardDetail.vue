<template>
  <view class="wish-detail-modal" v-if="visible" @click="handleClose" :class="{ 'fade-in': visible }">
    <view class="modal-content" @click.stop>
      <!-- Card Area -->
      <view class="card-container" id="wish-card-capture">
        <image v-if="bgUrl" class="card-bg" :src="bgUrl" mode="aspectFill"></image>
        <view v-else class="card-bg-gradient"></view>
        
        <view class="card-header">
          <image class="user-avatar" :src="wishData.user?.avatar || defaultAvatar" mode="aspectFill"></image>
          <text class="user-name">{{ wishData.user?.nickname || 'Unknown' }}</text>
        </view>

        <view class="card-body">
          <text class="wish-text">{{ wishData.title }}</text>
        </view>

        <view class="card-footer">
          <text class="date-text">{{ formattedDate }}</text>
        </view>
      </view>

      <!-- Action Buttons -->
      <view class="action-area">
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

        <view class="action-btn" @click="handleSameWish">
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
import { computed } from 'vue'
import { BASE_URL_AVATAR } from '@/core/config.js' // Assuming this exists based on other files

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  wishData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:visible', 'close'])

const defaultAvatar = 'https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/default_avatar.png'

const bgUrl = computed(() => {
  const src = props.wishData?.poster || props.wishData?.bg || ''
  return src && typeof src === 'string' ? src : ''
})

const formattedDate = computed(() => {
  if (!props.wishData.createTime) return ''
  // Assuming createTime is a string or timestamp that needs formatting
  // Simple format for now, can use utils if needed
  return props.wishData.createTime
})

const handleClose = () => {
  emit('update:visible', false)
  emit('close')
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
  // Mock navigation to publish page with copied content
  uni.showToast({
    title: '正在创建同款...',
    icon: 'none'
  })
  setTimeout(() => {
    // Navigate to publish page (assuming path based on analysis)
    uni.navigateTo({
      url: `/pages/publish/wish?content=${encodeURIComponent(props.wishData.title)}`
    })
  }, 500)
}
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

  .card-bg-gradient {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    background: linear-gradient(135deg, #fff1eb 0%, #ace0f9 100%);
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
  }

  .card-body {
    position: relative;
    z-index: 1;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20rpx 0;

    .wish-text {
      font-size: 36rpx;
      color: #333;
      line-height: 1.6;
      text-align: center;
      font-weight: 500;
      font-family: serif; /* Elegant font feel */
    }
  }

  .card-footer {
    position: relative;
    z-index: 1;
    text-align: center;
    margin-top: auto;

    .date-text {
      font-size: 24rpx;
      color: #666;
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

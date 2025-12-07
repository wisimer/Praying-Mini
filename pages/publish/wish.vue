<template>
  <view class="wish-page">
    <!-- Background Layer -->
    <view class="page-bg">
      <image 
        class="bg-image" 
        :src="currentScene.bg" 
        mode="aspectFill"
      ></image>
      <view class="bg-overlay"></view>
    </view>

    <!-- Navigation -->
    <view class="nav-header" :style="navStyle">
      <uni-icons type="back" size="24" color="#fff" @click="goBack"></uni-icons>
      <text class="title">许愿</text>
      <view class="placeholder"></view>
    </view>

    <!-- Main Content -->
    <view class="content-container">
      
      <!-- 1. Scene Card Area -->
      <view class="scene-area">
        <swiper 
          class="scene-swiper" 
          circular 
          :current="currentIndex" 
          previous-margin="130rpx" 
          next-margin="130rpx"
          @change="onSwiperChange"
        >
          <swiper-item v-for="(scene, index) in scenes" :key="index" class="swiper-item">
            <view 
              class="scene-card" 
              :class="{ active: currentIndex === index }"
              @click="currentIndex = index"
            >
              <image class="card-img" :src="scene.preview" mode="aspectFill"></image>
              <view class="card-info">
                <text class="scene-name">{{ scene.name }}</text>
              </view>
            </view>
          </swiper-item>
        </swiper>
      </view>

      <!-- 2. Wish Input Area -->
      <view class="input-area">
        <view class="input-wrapper">
          <textarea
            class="wish-textarea"
            v-model="wishText"
            placeholder="写下你的心愿（最多100字）"
            placeholder-class="input-placeholder"
            maxlength="100"
            :disable-default-padding="true"
          ></textarea>
          <text class="char-counter">{{ wishText.length }}/100</text>
        </view>
      </view>

    </view>

    <!-- 3. Wish Button Area -->
    <view class="action-bar">
      <button 
        class="wish-btn" 
        :class="{ 'is-loading': isAnimating, 'is-disabled': !canSubmit }" 
        @click="handleWish"
        :disabled="!canSubmit || isAnimating"
      >
        <template v-if="!isAnimating">
          <text class="btn-text">许愿（✨：{{ remainingWishes }}）</text>
        </template>
        <view v-else class="loading-dots">
          <text class="dot">.</text><text class="dot">.</text><text class="dot">.</text>
        </view>
      </button>
    </view>

    <!-- 4. Result Modal -->
    <WishCardDetail 
      v-if="showResult"
      :visible="showResult"
      :wish-data="resultData"
      :show-same-wish="false"
      @close="closeResult"
      @update:visible="v => showResult = v"
    />
  </view>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app'
import WishCardDetail from '@/components/WishCardDetail.vue'
import { addWish } from '@/cloud-api/dynamic.js'
import { showToast } from '@/core/app.js'

// Data
const scenes = [
  { name: '云端筑梦', preview: 'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/card_bg_1.png', bg: 'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/card_bg_1.png' },
  { name: '静谧森林', preview: 'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/card_bg_2.png', bg: 'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/card_bg_2.png' },
  { name: '星辰大海', preview: 'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/card_bg_3.png', bg: 'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/card_bg_3.png' },
  { name: '极光之夜', preview: 'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/card_bg_4.png', bg: 'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/card_bg_4.png' },
  { name: '落日余晖', preview: 'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/card_bg_5.png', bg: 'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/card_bg_5.png' },
]

const currentIndex = ref(0)
const wishText = ref('')
const isAnimating = ref(false)
const showResult = ref(false)
const resultData = ref({})
const navStyle = ref({})
const remainingWishes = ref(5) // Mock value

const currentScene = computed(() => scenes[currentIndex.value] || scenes[0])
const canSubmit = computed(() => wishText.value.trim().length > 0)

// Lifecycle
onLoad(() => {
  // #ifdef MP-WEIXIN
  try {
    const menuButton = uni.getMenuButtonBoundingClientRect()
    const sysInfo = uni.getSystemInfoSync()
    const statusBarHeight = sysInfo.statusBarHeight
    const navBarContentHeight = (menuButton.top - statusBarHeight) * 2 + menuButton.height
    const totalHeight = statusBarHeight + navBarContentHeight
    
    navStyle.value = {
      height: `${totalHeight}px`,
      paddingTop: `${statusBarHeight}px`
    }
  } catch (e) {
    console.error('Header calculation failed:', e)
  }
  // #endif
  
  // Preload images
  scenes.forEach(scene => {
    uni.getImageInfo({ src: scene.bg })
  })
})

// Share Handler
onShareAppMessage((res) => {
  const shareTitle = wishText.value 
    ? `我的心愿：${wishText.value.substring(0, 20)}...` 
    : '我在愿力岛许下了一个心愿'
    
  const imageUrl = currentScene.value.preview
  
  return {
    title: shareTitle,
    path: '/pages/publish/wish',
    imageUrl: imageUrl
  }
})

// Methods
const goBack = () => uni.navigateBack()

const onSwiperChange = (e) => {
  currentIndex.value = e.detail.current
}

const handleWish = async () => {
  if (!canSubmit.value || isAnimating.value) return

  isAnimating.value = true
  
  try {
    // Mock API call delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 1. Check Text (Weixin MP)
    // #ifdef MP-WEIXIN
    const checkRes = await uniCloud.callFunction({ 
      name: 'set-check-text', 
      data: { text: wishText.value } 
    })
    if (checkRes.result.errCode === 400) {
      throw new Error('内容不合规')
    }
    // #endif

    // 2. Generate AI Message
    const aiMessages = [
      "你的愿望已被星辰听见，正在赶来的路上。",
      "愿你所求皆如愿，所行化坦途。",
      "念念不忘，必有回响。加油！",
      "美好的事情即将发生，请保持期待。"
    ]
    const randomMsg = aiMessages[Math.floor(Math.random() * aiMessages.length)]
    
    // 3. Construct Data
    const contentStyle = {
      bgType: 'image',
      bgValue: currentScene.value.bg,
      sceneName: currentScene.value.name,
      aiMessage: randomMsg
    }
    
    const obj = {
      content: wishText.value,
      sort: 0, 
      imgs: "",
      content_style: contentStyle
    }
    
    // 4. Save to DB
    await addWish(obj)
    uni.$emit('saveRecord')
    
    // 5. Update UI
    resultData.value = {
      title: wishText.value,
      user: {
        nickname: '我',
        avatar: '' // Should get from store if available
      },
      createTime: new Date().getTime(),
      bgType: 'image',
      bgValue: currentScene.value.bg,
      poster: currentScene.value.bg,
      aiMessage: randomMsg
    }
    
    showResult.value = true
    remainingWishes.value = Math.max(0, remainingWishes.value - 1)
    wishText.value = ''

  } catch (e) {
    console.error(e)
    if (e.message === '内容不合规') {
      showToast('内容不合规，请重新编辑')
    } else {
      showToast('许愿失败，请稍后重试')
    }
  } finally {
    isAnimating.value = false
  }
}

const closeResult = () => {
  showResult.value = false
}
</script>

<style lang="scss" scoped>
.wish-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.page-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 0;
  transition: all 0.5s ease;

  .bg-image {
    width: 100%;
    height: 100%;
    transition: opacity 0.5s ease;
  }

  .bg-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3); // Semi-transparent overlay
    backdrop-filter: blur(10px); // Add blur to background
  }
}

.nav-header {
  height: 44px;
  padding: 0 16px;
  padding-top: env(safe-area-inset-top);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
  
  .title { 
    font-size: 18px; 
    font-weight: 600; 
    color: #fff; 
    letter-spacing: 1px;
    text-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
  .placeholder { width: 24px; }
}

.content-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
  padding-bottom: 100px; // Space for bottom button
  width: 100%;
}

// Scene Swiper Area
.scene-area {
  width: 100%;
  height: 400rpx;
  margin-bottom: 40rpx;

  .scene-swiper {
    width: 100%;
    height: 100%;

    .swiper-item {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .scene-card {
      width: 420rpx; // Slightly increased base width
      height: 280rpx; // Slightly increased base height
      border-radius: 20rpx;
      overflow: hidden;
      position: relative;
      transition: all 0.3s ease;
      transform: scale(0.9); // Scale up non-active cards slightly
      opacity: 0.8;
      box-shadow: 0 8px 16px rgba(0,0,0,0.3);

      &.active {
        transform: scale(1.15); // Adjust active scale to prevent overflow
        opacity: 1;
        z-index: 10;
        border: 2px solid rgba(255, 255, 255, 0.8);
      }

      .card-img {
        width: 100%;
        height: 100%;
      }

      .card-info {
        position: absolute;
        top: 20rpx;
        left: 0;
        width: 100%;
        text-align: center;
        z-index: 2;
        
        .scene-name {
          color: #fff;
          font-size: 24rpx;
          font-weight: 600;
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
          background: rgba(0,0,0,0.3);
          padding: 4rpx 16rpx;
          border-radius: 20rpx;
          backdrop-filter: blur(4px);
        }
      }
    }
  }
}

// Input Area
.input-area {
  width: 100%;
  padding: 0 40rpx;
  box-sizing: border-box;
  margin-top: 20rpx;

  .input-wrapper {
    width: 100%;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 24rpx;
    padding: 30rpx;
    box-sizing: border-box;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    position: relative;
    transition: all 0.3s;

    &:focus-within {
      background: rgba(255, 255, 255, 0.25);
      border-color: rgba(255, 255, 255, 0.4);
    }

    .wish-textarea {
      width: 100%;
      height: 160rpx;
      font-size: 30rpx;
      color: #fff;
      line-height: 1.6;
      
      // Placeholder color
      &::placeholder {
        color: rgba(255, 255, 255, 0.6);
      }
    }

    .input-placeholder {
      color: rgba(255, 255, 255, 0.6);
    }

    .char-counter {
      display: block;
      text-align: right;
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.8);
      margin-top: 10rpx;
    }
  }
}

// Action Bar
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 30rpx 40rpx;
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
  background: rgba(0, 0, 0, 0.2); // Slight dark background
  backdrop-filter: blur(5px);
  z-index: 100;
  box-sizing: border-box;

  .wish-btn {
    width: 100%;
    height: 96rpx;
    border-radius: 48rpx;
    background: linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%);
    color: #fff;
    font-size: 32rpx;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    box-shadow: 0 8px 20px rgba(255, 154, 158, 0.4);
    transition: all 0.3s;

    &.is-disabled {
      opacity: 0.6;
      background: #ccc;
      box-shadow: none;
      pointer-events: none;
    }

    &:active {
      transform: scale(0.98);
    }

    .loading-dots {
      .dot {
        animation: dotFade 1.4s infinite ease-in-out both;
        font-size: 40rpx;
        margin: 0 2rpx;
        &:nth-child(1) { animation-delay: -0.32s; }
        &:nth-child(2) { animation-delay: -0.16s; }
      }
    }
  }
}

@keyframes dotFade {
  0%, 80%, 100% { opacity: 0; }
  40% { opacity: 1; }
}
</style>

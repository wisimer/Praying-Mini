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

      <!-- 2. Chat Area -->
      <scroll-view 
        class="chat-area" 
        scroll-y 
        :scroll-into-view="scrollViewId"
        :scroll-with-animation="true"
      >
        <view class="chat-list">
          <view 
            v-for="(msg, index) in chatList" 
            :key="index" 
            :id="'msg-' + index"
            class="chat-item" 
            :class="msg.type"
          >
            <!-- AI Side -->
            <template v-if="msg.type === 'ai'">
              <view class="avatar ai-avatar">
                <image class="avatar-img" src="https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/avatar_ai.png" mode="aspectFill"></image>
              </view>
              <view class="content-wrapper">
                <text class="nickname">飞飞</text>
                <view class="bubble">
                  <text class="text">{{ msg.content }}</text>
                </view>
              </view>
            </template>
            
            <!-- User Side -->
            <template v-else>
              <view class="avatar user-avatar">
                 <!-- Use user avatar if available, else default -->
                 <image class="avatar-img" :src="userInfo.avatar || 'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/avatar_user_default.png'" mode="aspectFill"></image>
              </view>
              <view class="content-wrapper">
                <text class="nickname">{{ userInfo.nickname || 'XP' }}</text>
                <view class="bubble">
                  <text class="text">{{ msg.content }}</text>
                </view>
              </view>
            </template>
          </view>
        </view>
      </scroll-view>

    </view>

    <!-- 3. Bottom Input Area -->
    <view class="bottom-bar">
      <view class="input-wrapper">
        <input
          class="wish-input"
          v-model="wishText"
          placeholder="写下你的心愿..."
          placeholder-class="input-placeholder"
          maxlength="100"
          :confirm-type="'send'"
          @confirm="handleWish"
        />
      </view>
      
      <button 
        class="send-btn" 
        :class="{ 'is-loading': isAnimating, 'is-disabled': !canSubmit }" 
        @click="handleWish"
        :disabled="!canSubmit || isAnimating"
      >
        <text v-if="!isAnimating">许愿</text>
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
      :start-rect="startRect"
      :show-same-wish="false"
      @close="closeResult"
      @update:visible="v => showResult = v"
    />
  </view>
</template>

<script setup>
import { ref, computed, reactive, onMounted, nextTick } from 'vue'
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
const startRect = ref(null)
const chatList = ref([])
const scrollViewId = ref('')
const userInfo = ref({
  nickname: 'XP',
  avatar: '' // Will use default
})

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

const scrollToBottom = () => {
  nextTick(() => {
    scrollViewId.value = 'msg-' + (chatList.value.length - 1)
  })
}

const typeWriter = async (text) => {
  const msgIndex = chatList.value.length
  chatList.value.push({ type: 'ai', content: '' })
  
  let index = 0
  return new Promise(resolve => {
    const timer = setInterval(() => {
      if (index < text.length) {
        chatList.value[msgIndex].content += text.charAt(index)
        index++
        scrollToBottom()
      } else {
        clearInterval(timer)
        resolve()
      }
    }, 100) // 100ms per char
  })
}

const handleWish = async () => {
  if (!canSubmit.value || isAnimating.value) return

  isAnimating.value = true
  const currentWishText = wishText.value
  wishText.value = '' // Clear input immediately
  
  // Add User Message
  chatList.value.push({ type: 'user', content: currentWishText })
  scrollToBottom()
  
  try {
    // 0. Capture Card Position for Animation
    const rect = await new Promise(resolve => {
      uni.createSelectorQuery().select('.scene-card.active').boundingClientRect(resolve).exec()
    })
    if (rect) {
      startRect.value = rect
    }

    // Check Text (Weixin MP)
    // #ifdef MP-WEIXIN
    const checkRes = await uniCloud.callFunction({ 
      name: 'set-check-text', 
      data: { text: currentWishText } 
    })
    if (checkRes.result.errCode === 400) {
      throw new Error('内容不合规')
    }
    // #endif

    // Generate AI Message
    const aiMessages = [
      "你的愿望已被星辰听见，正在赶来的路上。",
      "愿你所求皆如愿，所行化坦途。",
      "念念不忘，必有回响。加油！",
      "美好的事情即将发生，请保持期待。"
    ]
    const randomMsg = aiMessages[Math.floor(Math.random() * aiMessages.length)]
    
    // Construct Data
    const contentStyle = {
      bgType: 'image',
      bgValue: currentScene.value.bg,
      sceneName: currentScene.value.name,
      aiMessage: randomMsg
    }
    
    const obj = {
      content: currentWishText,
      sort: 0, 
      imgs: "",
      content_style: contentStyle
    }
    
    // Save to DB
    addWish(obj).then(() => {
       uni.$emit('saveRecord')
    })
    
    // Start Typewriter Effect
    await typeWriter(randomMsg)
    
    // Prepare Result Data
    resultData.value = {
      title: currentWishText,
      user: {
        nickname: '我',
        avatar: '' 
      },
      createTime: new Date().getTime(),
      bgType: 'image',
      bgValue: currentScene.value.bg,
      poster: currentScene.value.bg,
      aiMessage: randomMsg
    }
    
    // Trigger Modal
    showResult.value = true
    remainingWishes.value = Math.max(0, remainingWishes.value - 1)

  } catch (e) {
    console.error(e)
    if (e.message === '内容不合规') {
      showToast('内容不合规，请重新编辑')
      wishText.value = currentWishText // Restore text
    } else {
      showToast('许愿失败，请稍后重试')
      wishText.value = currentWishText // Restore text
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
  justify-content: flex-start; // Start from top
  align-items: center;
  z-index: 10;
  width: 100%;
  overflow: hidden;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom)); // Space for bottom bar
}

// Scene Swiper Area
.scene-area {
  width: 100%;
  height: 400rpx;
  margin-top: 40rpx;
  flex-shrink: 0;

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

// Chat Area
.chat-area {
  flex: 1;
  width: 100%;
  padding: 0 30rpx;
  box-sizing: border-box;
  overflow: hidden;
  
  .chat-list {
    padding-bottom: 20rpx;
    
    .chat-item {
      display: flex;
      margin-bottom: 30rpx;
      align-items: flex-start;
      
      .content-wrapper {
        display: flex;
        flex-direction: column;
        max-width: 70%;
      }
      
      .nickname {
        font-size: 24rpx;
        color: #fff; // Contrast against background
        margin-bottom: 8rpx;
        text-shadow: 0 1px 2px rgba(0,0,0,0.5);
      }
      
      .avatar {
        width: 80rpx;
        height: 80rpx;
        border-radius: 10rpx; // Rounded square like WeChat
        overflow: hidden;
        flex-shrink: 0;
        background: #fff;
        
        .avatar-img {
          width: 100%;
          height: 100%;
        }
      }
      
      .bubble {
        padding: 20rpx;
        border-radius: 10rpx;
        position: relative;
        font-size: 30rpx;
        line-height: 1.5;
        word-wrap: break-word;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      }

      // User Specific Styles
      &.user {
        flex-direction: row-reverse;
        
        .content-wrapper {
          align-items: flex-end;
          margin-right: 20rpx;
        }
        
        .nickname {
          text-align: right;
        }

        .bubble {
          background: #95ec69; // WeChat Green
          color: #000;
          
          &::after { // Triangle
            content: '';
            position: absolute;
            right: -10rpx;
            top: 20rpx;
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 10rpx 0 10rpx 12rpx;
            border-color: transparent transparent transparent #95ec69;
          }
        }
      }
      
      // AI Specific Styles
      &.ai {
        flex-direction: row;
        
        .content-wrapper {
          align-items: flex-start;
          margin-left: 20rpx;
        }
        
        .nickname {
          text-align: left;
        }

        .bubble {
          background: #fff;
          color: #333;
          
          &::after { // Triangle
            content: '';
            position: absolute;
            left: -10rpx;
            top: 20rpx;
            width: 0;
            height: 0;
            border-style: solid;
            border-width: 10rpx 12rpx 10rpx 0;
            border-color: transparent #fff transparent transparent;
          }
        }
      }
    }
  }
}

// Bottom Bar
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: rgba(0, 0, 0, 0.4); 
  backdrop-filter: blur(10px);
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 20rpx;
  box-sizing: border-box;

  .input-wrapper {
    flex: 1;
    background: #fff;
    border-radius: 10rpx;
    padding: 16rpx 20rpx;
    display: flex;
    align-items: center;
    min-height: 80rpx;
    
    .wish-input {
      width: 100%;
      font-size: 30rpx;
      color: #333;
      
      &::placeholder {
        color: #999;
      }
    }
  }

  .send-btn {
    width: 140rpx;
    height: 80rpx;
    border-radius: 10rpx;
    background: #07c160; // WeChat Green or keep gradient? User mentioned WeChat style, maybe green is better, or keep theme.
    // Keeping theme for consistency but style for layout
    background: linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%);
    color: #fff;
    font-size: 30rpx;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    margin: 0;
    border: none;
    
    &.is-disabled {
      opacity: 0.6;
      background: #ccc;
    }
    
    &:active {
      opacity: 0.8;
    }
    
    .loading-dots {
      .dot {
        font-size: 40rpx;
        animation: dotFade 1.4s infinite ease-in-out both;
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

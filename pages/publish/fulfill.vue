<template>
  <view class="fulfill-page">
    <!-- Background Layer -->
    <view class="page-bg">
      <image 
        class="bg-image" 
        :src="currentWish?.content_style?.bgValue || defaultBg" 
        mode="aspectFill"
      ></image>
      <view class="bg-overlay"></view>
    </view>

    <!-- Navigation -->
    <view class="nav-header" :style="navStyle">
      <uni-icons type="back" size="24" color="#fff" @click="goBack"></uni-icons>
      <text class="title">我要还愿</text>
      <view class="placeholder"></view>
    </view>

    <!-- Main Content -->
    <view class="content-container">
      
      <!-- 1. Wish Swiper Area -->
      <view class="wish-area">
        <view v-if="loadingWishes" class="loading-state">
           <uni-icons type="spinner-cycle" size="24" color="#fff" class="rotating"></uni-icons>
           <text style="color: #fff; margin-top: 10px;">加载愿望中...</text>
        </view>
        <swiper 
          v-else-if="wishes.length > 0"
          class="wish-swiper" 
          circular 
          :current="currentIndex" 
          previous-margin="90rpx" 
          next-margin="90rpx"
          @change="onSwiperChange"
        >
          <swiper-item v-for="(item, index) in wishes" :key="item._id" class="swiper-item">
            <view 
              class="wish-card" 
              :class="{ active: currentIndex === index }"
              @click="currentIndex = index"
            >
              <image class="card-bg" :src="item.content_style?.bgValue || defaultBg" mode="aspectFill"></image>
              <view class="card-overlay"></view>
              <view class="card-info">
                <text class="wish-content">{{ item.content }}</text>
                <text class="wish-date">{{ formatDate(item.publish_date) }}</text>
              </view>
            </view>
          </swiper-item>
        </swiper>
         <view v-else class="empty-state">
            <text style="color: #fff;">暂无待还愿的祈愿</text>
         </view>
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
                <text class="nickname">{{ userInfo.nickname || '我' }}</text>
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
    <view class="bottom-bar" v-if="!hasFulfilled && wishes.length > 0">
      <view class="input-wrapper">
        <textarea
          class="fulfill-input"
          v-model="fulfillContent"
          placeholder="写下你的还愿感言..."
          placeholder-class="input-placeholder"
          maxlength="200"
          auto-height
          :cursor-spacing="20"
          :show-confirm-bar="false"
        ></textarea>
      </view>
      
      <button 
        class="send-btn" 
        :class="{ 'is-loading': submitting, 'is-disabled': !canSubmit }" 
        @click="handleFulfill"
        :disabled="!canSubmit || submitting"
      >
        <text v-if="!submitting">还愿</text>
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
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getUnfulfilledWishes, fulfillWish } from '@/cloud-api/dynamic.js'
import { showToast } from '@/core/app.js'
import WishCardDetail from '@/components/WishCardDetail.vue'
import { store } from '@/uni_modules/uni-id-pages/common/store.js'

const wishes = ref([])
const currentIndex = ref(0)
const fulfillContent = ref('')
const loadingWishes = ref(false)
const submitting = ref(false)
const navStyle = ref({})
const preSelectId = ref('')
const defaultBg = 'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/card_bg_1.png'

const showResult = ref(false)
const resultData = ref({})
const startRect = ref(null)
const chatList = ref([])
const scrollViewId = ref('')
const userInfo = ref({
  nickname: store.userInfo?.nickname || '我',
  avatar: store.userInfo?.avatar_file?.url || ''
})
const hasFulfilled = ref(false)

const currentWish = computed(() => wishes.value[currentIndex.value] || null)
const canSubmit = computed(() => fulfillContent.value.trim().length > 0 && currentWish.value)

// Watch current wish to update chat history
watch(currentWish, (newVal) => {
  if (newVal) {
    const history = []
    
    // 1. Original Wish (User)
    if (newVal.content) {
      history.push({ type: 'user', content: newVal.content })
    }
    
    // 2. Original AI Message (AI)
    const aiMsg = newVal.content_style?.aiMessage || newVal.ai_message || newVal.aiMessage
    if (aiMsg) {
      history.push({ type: 'ai', content: aiMsg })
    }
    
    chatList.value = history
    scrollToBottom()
  } else {
    chatList.value = []
  }
}, { immediate: true })

onLoad((options) => {
  if (options.id) {
    preSelectId.value = options.id
  }

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
})

const goBack = () => uni.navigateBack()

const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

const loadWishes = async () => {
  loadingWishes.value = true
  try {
    const res = await getUnfulfilledWishes()
    wishes.value = res.data || []
    
    // Check pre-selection
    if (preSelectId.value) {
       const index = wishes.value.findIndex(w => w._id === preSelectId.value)
       if (index !== -1) {
         currentIndex.value = index
       }
    }
  } catch (e) {
    console.error(e)
    showToast('获取愿望列表失败')
  } finally {
    loadingWishes.value = false
  }
}

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
    }, 100)
  })
}

const handleFulfill = async () => {
  if (!currentWish.value || !fulfillContent.value.trim()) return
  
  submitting.value = true
  const content = fulfillContent.value
  fulfillContent.value = ''
  
  // Add User Message
  chatList.value.push({ type: 'user', content: content })
  scrollToBottom()

  try {
    // 0. Capture Card Position
    const rect = await new Promise(resolve => {
      uni.createSelectorQuery().select('.wish-card.active').boundingClientRect(resolve).exec()
    })
    if (rect) {
      startRect.value = rect
    }

    // Check text content
    // #ifdef MP-WEIXIN
    const checkRes = await uniCloud.callFunction({ 
      name: 'set-check-text', 
      data: { text: content } 
    })
    if (checkRes.result.errCode === 400) {
      throw new Error('内容不合规')
    }
    // #endif

    // Generate AI Message
    let aiMessage = ''
    try {
      const aiRes = await uniCloud.callFunction({
        name: 'ai-message',
        data: {
          content: content,
          type: 'fulfill'
        }
      })
      
      if (aiRes.result.code === 0) {
        aiMessage = aiRes.result.data.content
      } else {
        throw new Error(aiRes.result.message || 'AI生成失败')
      }
    } catch (err) {
      console.error('AI generation failed, falling back to local:', err)
      const fallbackMessages = [
        "你的诚心已获回应，愿福泽常伴左右。",
        "感恩之心是幸福的源泉，愿你未来更加美好。",
        "善愿得偿，功德无量。继续保持这份美好。",
        "愿望成真，是努力与幸运的共鸣。祝贺你！"
      ]
      aiMessage = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)]
    }

    // Wait for API
    await fulfillWish(currentWish.value._id, content, aiMessage)
    
    // Start Typewriter
    await typeWriter(aiMessage)
    
    // Prepare Result Data (Combined)
    resultData.value = {
      ...currentWish.value,
      fullfilled: true,
      fullfill_content: content, // Current fulfillment content
      ai_message: aiMessage, // Current AI message
      original_ai_message: currentWish.value.content_style?.aiMessage || currentWish.value.ai_message || currentWish.value.aiMessage, // Preserve original AI message
      // Ensure display logic in card detail works
      content: content // Card detail might use this if fulfilled
    }
    
    showResult.value = true
    hasFulfilled.value = true

  } catch (e) {
    console.error(e)
    if (e.message === '内容不合规') {
      showToast('内容不合规，请重新编辑')
      fulfillContent.value = content
    } else {
      showToast('还愿失败，请重试')
      fulfillContent.value = content
    }
  } finally {
    submitting.value = false
  }
}

const closeResult = () => {
  showResult.value = false
  uni.navigateBack()
}

onMounted(() => {
  loadWishes()
})
</script>

<style lang="scss" scoped>
.fulfill-page {
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
    background: rgba(0, 0, 0, 0.5); 
    backdrop-filter: blur(10px);
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
  justify-content: flex-start;
  align-items: center;
  z-index: 10;
  width: 100%;
  overflow: hidden;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

// Wish Swiper Area
.wish-area {
  width: 100%;
  height: 450rpx;
  margin-top: 20rpx;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;

  .loading-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
  }

  .rotating {
      animation: rotate 1s linear infinite;
  }

  .wish-swiper {
    width: 100%;
    height: 100%;

    .swiper-item {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .wish-card {
      width: 500rpx; 
      height: 350rpx; 
      border-radius: 20rpx;
      overflow: hidden;
      position: relative;
      transition: all 0.3s ease;
      transform: scale(0.9);
      opacity: 0.8;
      box-shadow: 0 8px 16px rgba(0,0,0,0.3);
      background: #fff;

      &.active {
        transform: scale(1.05);
        opacity: 1;
        z-index: 10;
        border: 2px solid rgba(255, 215, 0, 0.8);
      }

      .card-bg {
        width: 100%;
        height: 100%;
        position: absolute;
      }
      
      .card-overlay {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0,0,0,0.3);
      }

      .card-info {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        padding: 40rpx;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 2;
        
        .wish-content {
          color: #fff;
          font-size: 32rpx;
          font-weight: 600;
          text-align: center;
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
          overflow: hidden;
          margin-bottom: 20rpx;
        }
        
        .wish-date {
            color: rgba(255,255,255,0.8);
            font-size: 24rpx;
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
        color: #fff;
        margin-bottom: 8rpx;
        text-shadow: 0 1px 2px rgba(0,0,0,0.5);
      }
      
      .avatar {
        width: 80rpx;
        height: 80rpx;
        border-radius: 10rpx;
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
          background: #95ec69; 
          color: #000;
          
          &::after { 
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
          
          &::after { 
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
  align-items: stretch;
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
    
    .fulfill-input {
      width: 100%;
      font-size: 30rpx;
      color: #333;
      line-height: 1.4;
      
      &::placeholder {
        color: #999;
      }
    }
  }

  .send-btn {
    width: 140rpx;
    min-height: 80rpx;
    border-radius: 10rpx;
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
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

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
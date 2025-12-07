<template>
  <view class="fulfill-page">
    <!-- Background Gradient -->
    <div class="page-bg"></div>

    <view class="nav-header" :style="navStyle">
      <uni-icons type="back" size="24" color="#fff" @click="goBack"></uni-icons>
      <text class="title">我要还愿</text>
      <view class="placeholder"></view>
    </view>

    <scroll-view scroll-y class="content-area">
      <!-- Step 1: Select Wish -->
      <view class="section-header">
        <text class="section-title">选择愿望</text>
        <text class="section-subtitle">请选择要还愿的祈愿</text>
      </view>
      
      <view class="wish-list-container">
        <view v-if="loadingWishes" class="loading-state">
          <uni-icons type="spinner-cycle" size="24" color="#999" class="rotating"></uni-icons>
          <text>加载中...</text>
        </view>
        
        <view v-else-if="wishes.length > 0" class="wish-list">
          <view 
            v-for="item in wishes" 
            :key="item._id" 
            class="wish-item"
            :class="{ active: selectedWishId === item._id }"
            @click="selectWish(item)"
          >
            <view class="wish-content-wrapper">
              <text class="wish-content">{{ item.content }}</text>
              <text class="wish-date">{{ formatDate(item.publish_date) }}</text>
            </view>
            <view class="radio-circle">
              <view class="radio-inner" v-if="selectedWishId === item._id"></view>
            </view>
          </view>
        </view>
        
        <view v-else class="empty-state">
          <image src="https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/empty-box.png" mode="aspectFit" class="empty-img"></image>
          <text>暂无待还愿的祈愿</text>
        </view>
      </view>

      <!-- Step 2: Fulfill Message -->
      <view class="input-section" :class="{ disabled: !selectedWishId }">
        <view class="section-header">
          <text class="section-title">还愿感言</text>
        </view>
        <view class="textarea-wrapper">
          <textarea
            class="fulfill-input"
            v-model="fulfillContent"
            placeholder="写下你的还愿感言，感谢神恩..."
            :maxlength="200"
            :disabled="!selectedWishId"
            placeholder-style="color: #ccc"
          ></textarea>
          <text class="char-count">{{ fulfillContent.length }}/200</text>
        </view>
      </view>
    </scroll-view>

    <view class="action-bar">
      <button 
        class="fulfill-btn" 
        :class="{ disabled: !selectedWishId || !fulfillContent.trim() || submitting }"
        :disabled="!selectedWishId || !fulfillContent.trim() || submitting"
        @click="handleFulfill"
      >
        <text v-if="!submitting">确认还愿</text>
        <view v-else class="loading-dots">
          <text>.</text><text>.</text><text>.</text>
        </view>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getUnfulfilledWishes, fulfillWish } from '@/cloud-api/dynamic.js'
import { showToast } from '@/core/app.js'

const wishes = ref([])
const selectedWishId = ref('')
const fulfillContent = ref('')
const loadingWishes = ref(false)
const submitting = ref(false)
const navStyle = ref({})
const preSelectId = ref('') // Store ID passed from URL

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
       const found = wishes.value.find(w => w._id === preSelectId.value)
       if (found) {
         selectedWishId.value = preSelectId.value
       }
    }
  } catch (e) {
    console.error(e)
    showToast('获取愿望列表失败')
  } finally {
    loadingWishes.value = false
  }
}

const selectWish = (item) => {
  if (selectedWishId.value === item._id) {
    selectedWishId.value = '' // Deselect
  } else {
    selectedWishId.value = item._id
  }
}

const handleFulfill = async () => {
  if (!selectedWishId.value || !fulfillContent.value.trim()) return
  
  submitting.value = true
  
  try {
    // Check text content (if needed, similar to wish.vue)
    // #ifdef MP-WEIXIN
    const checkRes = await uniCloud.callFunction({ 
      name: 'set-check-text', 
      data: { text: fulfillContent.value } 
    })
    if (checkRes.result.errCode === 400) {
      throw new Error('内容不合规')
    }
    // #endif

    // Generate AI Message
    const aiMessages = [
      "你的诚心已获回应，愿福泽常伴左右。",
      "感恩之心是幸福的源泉，愿你未来更加美好。",
      "善愿得偿，功德无量。继续保持这份美好。",
      "愿望成真，是努力与幸运的共鸣。祝贺你！"
    ]
    const aiMessage = aiMessages[Math.floor(Math.random() * aiMessages.length)]

    await fulfillWish(selectedWishId.value, fulfillContent.value, aiMessage)
    
    uni.showToast({
      title: '还愿成功',
      icon: 'success'
    })
    
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
    
  } catch (e) {
    console.error(e)
    if (e.message === '内容不合规') {
      showToast('内容不合规，请重新编辑')
    } else {
      showToast('还愿失败，请重试')
    }
  } finally {
    submitting.value = false
  }
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
  background-color: #f9f9f9;
  position: relative;
}

.page-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: linear-gradient(180deg, #6FCFFB 0%, #B59DFF 100%);
  z-index: 0;
  opacity: 0.9;
}

.nav-header {
  height: 44px;
  padding: 0 16px;
  padding-top: env(safe-area-inset-top);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: rgba(111, 207, 251, 0.95);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
  
  .title { 
    font-size: 20px; 
    font-weight: 800; 
    color: #fff; 
    letter-spacing: 1px;
  }
  .placeholder { width: 24px; }
}

.content-area {
  flex: 1;
  padding: 20px;
  box-sizing: border-box;
  z-index: 1;
}

.section-header {
  margin-bottom: 16px;
  .section-title {
    font-size: 18px;
    font-weight: bold;
    color: #fff; /* White on gradient */
    margin-right: 8px;
    text-shadow: 0 1px 2px rgba(0,0,0,0.1);
    display: inline-flex;
    align-items: center;
    
    &::before {
      content: '';
      display: block;
      width: 4px;
      height: 18px;
      background-color: #FFD700;
      margin-right: 8px;
      border-radius: 2px;
    }
  }
  .section-subtitle {
    font-size: 12px;
    color: rgba(255,255,255,0.8);
  }
}

.wish-list-container {
  min-height: 100px;
  margin-bottom: 30px;
}

.wish-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wish-item {
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 20px; /* Larger radius */
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  backdrop-filter: blur(5px);
  
  &.active {
    border-color: #FF6B81;
    background-color: #fff;
    box-shadow: 0 8px 20px rgba(255, 107, 129, 0.15);
  }
  
  .wish-content-wrapper {
    flex: 1;
    margin-right: 16px;
    display: flex;
    flex-direction: column;
    
    .wish-content {
      font-size: 16px;
      color: #333;
      margin-bottom: 8px;
      line-height: 1.5;
      font-weight: 500;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }
    
    .wish-date {
      font-size: 12px;
      color: #999;
    }
  }
  
  .radio-circle {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    
    .radio-inner {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background-color: #FF6B81;
    }
  }
  
  &.active .radio-circle {
    border-color: #FF6B81;
  }
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: rgba(255,255,255,0.8);
  font-size: 14px;
  
  .rotating {
    animation: rotate 1s linear infinite;
    margin-bottom: 10px;
  }
  
  .empty-img {
    width: 120px;
    height: 120px;
    margin-bottom: 10px;
    opacity: 0.8;
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.input-section {
  transition: opacity 0.3s;
  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }
  
  .textarea-wrapper {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    padding: 20px;
    position: relative;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    backdrop-filter: blur(5px);
    
    .fulfill-input {
      width: 100%;
      height: 140px;
      font-size: 16px;
      line-height: 1.6;
      color: #333;
    }
    
    .char-count {
      position: absolute;
      bottom: 16px;
      right: 20px;
      font-size: 13px;
      color: #999;
    }
  }
}

.action-bar {
  padding: 20px 30px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-top: none;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
  z-index: 100;
  
  .fulfill-btn {
    height: 56px;
    border-radius: 30px;
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
    color: #fff;
    font-size: 18px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    transition: all 0.3s;
    box-shadow: 0 8px 20px rgba(255, 165, 0, 0.3);
    
    &.disabled {
      opacity: 0.6;
      background: #ccc;
      box-shadow: none;
    }
    
    &:active:not(.disabled) {
      transform: scale(0.98);
    }
    
    .loading-dots {
      display: flex;
      gap: 4px;
      text { animation: bounce 1.4s infinite ease-in-out both; }
      text:nth-child(1) { animation-delay: -0.32s; }
      text:nth-child(2) { animation-delay: -0.16s; }
    }
  }
}

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}
</style>
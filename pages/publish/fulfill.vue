<template>
  <view class="fulfill-page">
    <view class="nav-header">
      <uni-icons type="back" size="24" @click="goBack"></uni-icons>
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
import { getUnfulfilledWishes, fulfillWish } from '@/cloud-api/dynamic.js'
import { showToast } from '@/core/app.js'

const wishes = ref([])
const selectedWishId = ref('')
const fulfillContent = ref('')
const loadingWishes = ref(false)
const submitting = ref(false)

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
}

.nav-header {
  height: 44px;
  padding: 0 16px;
  padding-top: env(safe-area-inset-top);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  z-index: 100;
  .title { font-size: 18px; font-weight: bold; color: #333; }
  .placeholder { width: 24px; }
}

.content-area {
  flex: 1;
  padding: 20px;
  box-sizing: border-box;
}

.section-header {
  margin-bottom: 16px;
  .section-title {
    font-size: 18px;
    font-weight: bold;
    color: #333;
    margin-right: 8px;
  }
  .section-subtitle {
    font-size: 12px;
    color: #999;
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
  background: #fff;
  padding: 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  
  &.active {
    border-color: #FF6B81;
    background-color: #fff5f6;
  }
  
  .wish-content-wrapper {
    flex: 1;
    margin-right: 16px;
    display: flex;
    flex-direction: column;
    
    .wish-content {
      font-size: 15px;
      color: #333;
      margin-bottom: 6px;
      line-height: 1.4;
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
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .radio-inner {
      width: 10px;
      height: 10px;
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
  color: #999;
  font-size: 14px;
  
  .rotating {
    animation: rotate 1s linear infinite;
    margin-bottom: 10px;
  }
  
  .empty-img {
    width: 120px;
    height: 120px;
    margin-bottom: 10px;
    opacity: 0.5;
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
    background: #fff;
    border-radius: 12px;
    padding: 16px;
    position: relative;
    box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    
    .fulfill-input {
      width: 100%;
      height: 120px;
      font-size: 15px;
      line-height: 1.5;
      color: #333;
    }
    
    .char-count {
      position: absolute;
      bottom: 12px;
      right: 16px;
      font-size: 12px;
      color: #ccc;
    }
  }
}

.action-bar {
  padding: 16px 20px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1px solid #f0f0f0;
  
  .fulfill-btn {
    height: 50px;
    border-radius: 25px;
    background: linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%);
    color: #fff;
    font-size: 16px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    transition: all 0.3s;
    
    &.disabled {
      opacity: 0.6;
      background: #ccc;
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
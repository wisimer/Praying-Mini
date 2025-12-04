<template>
  <view class="wish-page">
    <!-- Background Gradient -->
    <!-- <div class="page-bg"></div> -->

    <!-- Navigation -->
    <view class="nav-header">
      <uni-icons type="back" size="24" color="#fff" @click="goBack"></uni-icons>
      <text class="title">许愿</text>
      <view class="placeholder"></view>
    </view>

    <!-- Main Editor Area -->
    <view class="editor-area">
      <!-- Background Layer -->
      <image v-if="settings.bgType === 'image' && settings.bgValue" class="bg-layer" :src="settings.bgValue" mode="aspectFill"></image>
      <view v-else class="bg-layer" :style="{ background: bgStyle }"></view>
      
      <!-- Input Layer -->
      <textarea
        class="wish-input"
        v-model="wishText"
        placeholder="写下你的愿望，诚心祈祷..."
        placeholder-style="color: rgba(0,0,0,0.3);"
        :maxlength="20"
        :style="textStyle"
      ></textarea>
      
      <!-- Character Count -->
      <text class="char-count" :style="{ color: settings.color }">{{ wishText.length }}/100</text>
    </view>

    <!-- Tools Panel -->
    <view class="tools-panel">
      <!-- Tabs -->
      <view class="tool-tabs">
        <view 
          class="tab-item" 
          :class="{ active: activeTab === 'bg' }"
          @click="activeTab = 'bg'"
        >
          <uni-icons type="image" size="20" :color="activeTab === 'bg' ? '#FF6B81' : '#666'"></uni-icons>
          <text>背景</text>
        </view>
        <view 
          class="tab-item" 
          :class="{ active: activeTab === 'text' }"
          @click="activeTab = 'text'"
        >
          <uni-icons type="font" size="20" :color="activeTab === 'text' ? '#FF6B81' : '#666'"></uni-icons>
          <text>文字</text>
        </view>
      </view>

      <!-- Tool Content -->
      <scroll-view scroll-y class="tool-content">
        <!-- Background Settings -->
        <view v-if="activeTab === 'bg'" class="setting-group">
          <view class="mode-selector">
            <view 
              class="mode-btn" 
              :class="{ active: settings.bgType === 'gradient' }"
              @click="setBgMode('gradient')"
            >渐变</view>
            <view 
              class="mode-btn" 
              :class="{ active: settings.bgType === 'solid' }"
              @click="setBgMode('solid')"
            >纯色</view>
            <view 
              class="mode-btn" 
              :class="{ active: settings.bgType === 'image' }"
              @click="setBgMode('image')"
            >图片</view>
          </view>

          <!-- Gradient/Solid/Image Presets -->
          <scroll-view scroll-x class="preset-scroll">
            <view class="preset-list">
              <view 
                v-for="(item, index) in currentPresets" 
                :key="index"
                class="preset-item"
                :class="{ active: settings.bgValue === item }"
                @click="settings.bgValue = item"
              >
                <image v-if="settings.bgType === 'image'" :src="item" mode="aspectFill" class="preset-img"></image>
                <view v-else class="preset-color" :style="{ background: item }"></view>
              </view>
            </view>
          </scroll-view>
        </view>

        <!-- Text Settings -->
        <view v-if="activeTab === 'text'" class="setting-group">
          <!-- <view class="control-row">
            <text class="label">字号</text>
            <slider 
              class="slider" 
              :value="settings.fontSize" 
              min="12" 
              max="30" 
              activeColor="#FF6B81"
              block-size="20"
              @change="e => settings.fontSize = e.detail.value"
              @changing="e => settings.fontSize = e.detail.value"
            />
            <text class="value">{{ settings.fontSize }}px</text>
          </view>

          <view class="control-row">
            <text class="label">粗细</text>
            <switch 
              :checked="settings.fontWeight === 'bold'" 
              color="#FF6B81" 
              style="transform:scale(0.7)"
              @change="e => settings.fontWeight = e.detail.value ? 'bold' : 'normal'"
            />
          </view> -->

          <view class="control-row vertical">
            <text class="label">颜色</text>
            <scroll-view scroll-x class="preset-scroll">
              <view class="preset-list">
                <view 
                  v-for="(color, index) in textColors" 
                  :key="index"
                  class="color-item"
                  :style="{ background: color }"
                  :class="{ active: settings.color === color }"
                  @click="settings.color = color"
                ></view>
              </view>
            </scroll-view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- Bottom Action -->
    <view class="action-bar">
      <button 
        class="wish-btn" 
        :class="{ shrink: isAnimating }" 
        @click="handleWish"
        :disabled="isAnimating"
      >
        <text v-if="!isAnimating">许愿</text>
        <view v-else class="star-particles">
          <view v-for="n in 6" :key="n" class="star" :style="`--i:${n}`">★</view>
        </view>
      </button>
    </view>

    <!-- Result Modal -->
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
import { ref, computed, reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import WishCardDetail from '@/components/WishCardDetail.vue'
import { addDynamic } from '@/cloud-api/dynamic.js'
import { showLoading, showToast, asyncUploadFile } from '@/core/app.js'

// State
const wishText = ref('')
const activeTab = ref('bg')
const isAnimating = ref(false)
const showResult = ref(false)
const resultData = ref({})

// Default Settings
const settings = reactive({
  bgType: 'gradient', // gradient, solid, image
  bgValue: 'linear-gradient(135deg, #fff1eb 0%, #ace0f9 100%)',
  fontSize: 18,
  color: '#333333',
  fontWeight: 'normal'
})

// Presets
const imagePresets = [
  'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/card_bg_1.png',
  'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/card_bg_2.png',
  'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/card_bg_3.png',
  'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/card_bg_4.png',
  'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/card_bg_5.png',
  'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/card_bg_6.png',
  'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/card_bg_7.png'
]

const gradientPresets = [
  'linear-gradient(135deg, #fff1eb 0%, #ace0f9 100%)',
  'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)',
  'linear-gradient(to top, #fbc2eb 0%, #a6c1ee 100%)',
  'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)',
  'linear-gradient(to top, #fdcbf1 0%, #e6dee9 100%)',
  'linear-gradient(120deg, #f093fb 0%, #f5576c 100%)'
]

const solidPresets = [
  '#ffffff', '#f8f9fa', '#fffbe8', '#fff0f5', '#e6e6fa', '#f0fff0', '#2c3e50', '#000000'
]

const textColors = [
  '#333333', '#666666', '#999999', '#ffffff', 
  '#FF6B81', '#409EFF', '#E6A23C', '#67C23A',
  '#8E44AD', '#2C3E50'
]

// Computed
const bgStyle = computed(() => {
  return settings.bgType === 'image' ? '' : settings.bgValue
})

const currentPresets = computed(() => {
  if (settings.bgType === 'gradient') return gradientPresets
  if (settings.bgType === 'solid') return solidPresets
  if (settings.bgType === 'image') return imagePresets
  return []
})

const textStyle = computed(() => {
  return {
    fontSize: settings.fontSize + 'px',
    color: settings.color,
    fontWeight: settings.fontWeight,
    lineHeight: '1.6',
    textAlign: 'center'
  }
})

// Lifecycle
onLoad(() => {
  const saved = uni.getStorageSync('wish_settings')
  if (saved) {
    Object.assign(settings, JSON.parse(saved))
  }
})

// Methods
const goBack = () => uni.navigateBack()

const setBgMode = (mode) => {
  settings.bgType = mode
  if (mode === 'gradient' && !settings.bgValue.includes('gradient')) {
    settings.bgValue = gradientPresets[0]
  } else if (mode === 'solid' && settings.bgValue.includes('gradient')) {
    settings.bgValue = solidPresets[0]
  } else if (mode === 'image' && !imagePresets.includes(settings.bgValue)) {
    settings.bgValue = imagePresets[0]
  }
}

const handleWish = async () => {
  if (!wishText.value.trim()) {
    uni.showToast({ title: '写下你的愿望吧~', icon: 'none' })
    return
  }

  // Save settings
  uni.setStorageSync('wish_settings', JSON.stringify(settings))

  isAnimating.value = true
  
  try {
    await finishWish()
  } catch (e) {
    isAnimating.value = false
    console.error(e)
    if (e.message === '内容不合规') {
      showToast('内容不合规，请重新编辑')
    } else {
      showToast('许愿失败，请稍后重试')
    }
  }
}

const finishWish = async () => {
  // Animation Sequence (min 3s)
  const animationPromise = new Promise(resolve => setTimeout(resolve, 3000))
  
  // Data Preparation & Save Sequence
  const savePromise = (async () => {
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
      bgType: settings.bgType,
      bgValue: settings.bgValue,
      fontSize: settings.fontSize,
      color: settings.color,
      fontWeight: settings.fontWeight,
      aiMessage: randomMsg
    }
    
    const obj = {
      content: wishText.value,
      sort: 0, // 6: Wish type
      imgs: "",
      content_style: contentStyle
    }
    
    // 4. Save to DB
    await addDynamic(obj)
    uni.$emit('saveRecord')
    
    return { randomMsg }
  })()
  
  // Wait for both
  const [_, result] = await Promise.all([animationPromise, savePromise])
  const { randomMsg } = result
  
  isAnimating.value = false
  
  // Show Result
  resultData.value = {
    title: wishText.value,
    user: {
      nickname: '我',
      avatar: ''
    },
    createTime: '刚刚',
    bgType: settings.bgType,
    bgValue: settings.bgValue,
    poster: settings.bgType === 'image' ? settings.bgValue : '',
    settings: { ...settings },
    aiMessage: randomMsg
  }
  
  uni.showToast({ title: '许愿成功', icon: 'success' })
  setTimeout(() => {
    showResult.value = true
    wishText.value = ''
  }, 1000)
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
  background-color: #f5f5f5;
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

.editor-area {
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  z-index: 1;
  
  .bg-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }
  
  .wish-input {
    position: relative;
    margin-top: 50%;
    z-index: 1;
    width: 100%;
    height: 100%;
    text-align: center;
    background: transparent;
    // border: 1px dashed rgba(0,0,0,0.1); // Optional helper border
  }
  
  .char-count {
    position: absolute;
    bottom: 20px;
    right: 20px;
    font-size: 12px;
    opacity: 0.6;
    z-index: 1;
  }
}

.tools-panel {
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 24px 24px 0 0; /* Larger radius */
  box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
  padding-bottom: 20px;
  transition: transform 0.3s ease;
  z-index: 90;
  backdrop-filter: blur(10px);
  
  &.collapsed {
    transform: translateY(100%);
  }
  
  .tool-tabs {
    display: flex;
    border-bottom: 1px solid rgba(0,0,0,0.05);
    
    .tab-item {
      flex: 1;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 15px;
      color: #666;
      position: relative;
      
      &.active {
        color: #FF6B81;
        font-weight: 600;
        
        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          width: 24px;
          height: 3px;
          background: #FF6B81;
          border-radius: 2px;
        }
      }
    }
  }
  
  .tool-content {
    height: 150px; // Fixed height for settings area
    padding: 20px;
    box-sizing: border-box;
  }
}

.setting-group {
  .mode-selector {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    
    .mode-btn {
      padding: 8px 20px;
      background: #f5f7fa;
      border-radius: 20px; /* Pill */
      font-size: 13px;
      color: #666;
      font-weight: 500;
      transition: all 0.2s;
      
      &.active {
        background: #FF6B81;
        color: #fff;
        box-shadow: 0 4px 10px rgba(255, 107, 129, 0.3);
      }
    }
  }
  
  .preset-scroll {
    white-space: nowrap;
    width: 100%;
    
    .preset-list {
      display: flex;
      gap: 16px;
      padding-right: 20px;
      
      .preset-item {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        border: 2px solid transparent;
        display: inline-block;
        flex-shrink: 0;
        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        overflow: hidden;
        
        &.active {
          border-color: #FF6B81;
          transform: scale(1.1);
        }

        .preset-img, .preset-color {
          width: 100%;
          height: 100%;
          display: block;
        }
      }
    }
  }
  
  .image-uploader {
    display: none;
  }
  
  .control-row {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    
    &.vertical {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
    
    .label {
      width: 50px;
      font-size: 14px;
      color: #333;
      font-weight: 500;
    }
    
    .slider {
      flex: 1;
    }
    
    .value {
      width: 40px;
      text-align: right;
      font-size: 13px;
      color: #666;
    }
    
    .color-item {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 2px solid #fff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
      display: inline-block;
      flex-shrink: 0;
      
      &.active {
        transform: scale(1.2);
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        border-color: #FF6B81;
      }
    }
  }
}

.action-bar {
  padding: 20px 30px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.9);
  border-top: none;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
  backdrop-filter: blur(10px);
  
  .wish-btn {
    height: 60px;
    border-radius: 30px;
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); /* Yellow/Orange */
    color: #fff;
    font-size: 20px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    transition: all 0.3s ease;
    overflow: hidden;
    position: relative;
    box-shadow: 0 8px 20px rgba(255, 165, 0, 0.3);
    
    &.shrink {
      width: 60px;
      border-radius: 30px;
      margin: 0 auto; // Center it
      padding: 0;
      background: linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%); /* Pink for animation */
      box-shadow: 0 8px 20px rgba(255, 107, 129, 0.4);
    }
    
    &:active {
      transform: scale(0.98);
    }
  }
}

// Star Animation
.star-particles {
  position: relative;
  width: 100%;
  height: 100%;
  
  .star {
    position: absolute;
    top: 50%;
    left: 50%;
    color: #fff;
    font-size: 12px;
    animation: fly 1s linear infinite;
    animation-delay: calc(var(--i) * 0.1s);
    opacity: 0;
  }
}

@keyframes fly {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  100% {
    transform: translate(
      calc(-50% + (random(200) - 100) * 1px),
      calc(-50% + (random(200) - 100) * 1px)
    ) scale(1.5);
    opacity: 0;
  }
}
</style>

<template>
  <view class="bottom-nav-container">
    <view class="bottom-nav-placeholder"></view>
    
    <!-- Tab Bar -->
    <view class="bottom-nav">
      <view 
        class="nav-item" 
        :class="{ active: activeIndex === 0 }"
        @click="switchTab(0)"
      >
        <view class="icon-box">
          <image 
            :src="activeIndex === 0 ? '/static/tabBar/action/home.png' : '/static/tabBar/home.png'" 
            class="nav-icon"
          ></image>
        </view>
        <text class="label">首页</text>
      </view>

      <view 
        class="nav-item" 
        :class="{ active: activeIndex === 1 }"
        @click="switchTab(1)"
      >
        <view class="icon-box">
          <image 
            :src="activeIndex === 1 ? '/static/tabBar/action/chongquan.png' : '/static/tabBar/chongquan.png'" 
            class="nav-icon"
          ></image>
        </view>
        <text class="label">宠圈</text>
      </view>

      <!-- Plus Button -->
      <view class="nav-item center-btn-wrapper">
        <view class="center-btn" @click="toggleMenu">
          <uni-icons type="plusempty" size="30" color="#fff"></uni-icons>
        </view>
      </view>

      <view 
        class="nav-item" 
        :class="{ active: activeIndex === 2 }"
        @click="switchTab(2)"
      >
        <view class="icon-box">
          <image 
            :src="activeIndex === 2 ? '/static/tabBar/action/ai.png' : '/static/tabBar/ai.png'" 
            class="nav-icon"
          ></image>
        </view>
        <text class="label">消息</text>
      </view>

      <view 
        class="nav-item" 
        :class="{ active: activeIndex === 3 }"
        @click="switchTab(3)"
      >
        <view class="icon-box">
          <image 
            :src="activeIndex === 3 ? '/static/tabBar/action/user.png' : '/static/tabBar/user.png'" 
            class="nav-icon"
          ></image>
        </view>
        <text class="label">我的</text>
      </view>
    </view>

    <!-- Expansion Menu -->
    <view class="menu-overlay" v-if="isMenuOpen" @click="toggleMenu">
      <view class="menu-container" @click.stop>
        <view class="menu-item" @click="navigateTo('/pages/publish/wish')">
          <view class="menu-icon wish-icon">
            <text>✨</text>
          </view>
          <text class="menu-label">许愿</text>
        </view>
        <view class="menu-item" @click="navigateTo('/pages/publish/fulfill')">
          <view class="menu-icon fulfill-icon">
             <text>🌸</text>
          </view>
          <text class="menu-label">还愿</text>
        </view>
        <view class="menu-item" @click="navigateTo('/pages/publish/task')">
          <view class="menu-icon task-icon">
             <text>📝</text>
          </view>
          <text class="menu-label">任务</text>
        </view>
      </view>
      <view class="close-btn" @click="toggleMenu">
        <uni-icons type="closeempty" size="30" color="#333"></uni-icons>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:modelValue'])

const activeIndex = ref(props.modelValue)
const isMenuOpen = ref(false)

watch(() => props.modelValue, (newVal) => {
  activeIndex.value = newVal
})

const switchTab = (index) => {
  activeIndex.value = index
  emit('update:modelValue', index)
  
  const paths = [
    '/pages/home/home',
    '/pages/share/share',
    '/pages/message/message',
    '/pages/wode/wode'
  ]
  
  uni.switchTab({
    url: paths[index]
  })
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const navigateTo = (url) => {
  isMenuOpen.value = false
  uni.navigateTo({
    url: url
  })
}
</script>

<style lang="scss" scoped>
.bottom-nav-placeholder {
  height: calc(50px + env(safe-area-inset-bottom));
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #fff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 50px;
  padding-bottom: env(safe-area-inset-bottom);
  border-top: 1px solid #eee;
  box-shadow: 0 -1px 4px rgba(0,0,0,0.03);
  z-index: 999;

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    height: 100%;
    position: relative;

    .icon-box {
      width: 24px;
      height: 24px;
      margin-bottom: 2px;
      
      .nav-icon {
        width: 100%;
        height: 100%;
      }
    }

    .label {
      font-size: 10px;
      color: #999;
    }

    &.active {
      .label {
        color: #54A263; // Match pages.json selectedColor
      }
    }
    
    &.center-btn-wrapper {
      overflow: visible;
    }
  }

  .center-btn {
    position: absolute;
    top: -20px;
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #54A263 0%, #8ED69B 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 10px rgba(84, 162, 99, 0.3);
    z-index: 1000;
    transition: transform 0.2s;
    
    &:active {
      transform: scale(0.95);
    }
  }
}

.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.95);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  padding-bottom: calc(80px + env(safe-area-inset-bottom));
  animation: fadeIn 0.3s ease;
  
  .menu-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 40px;
    
    .menu-item {
      display: flex;
      align-items: center;
      gap: 15px;
      animation: slideUp 0.3s ease backwards;
      
      @for $i from 1 through 3 {
        &:nth-child(#{$i}) {
          animation-delay: #{$i * 0.05}s;
        }
      }
      
      .menu-icon {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        
        &.wish-icon { background-color: #FEF9E7; color: #FFD700; }
        &.fulfill-icon { background-color: #FFF0F5; color: #FF69B4; }
        &.task-icon { background-color: #F0F8FF; color: #4682B4; }
      }
      
      .menu-label {
        font-size: 18px;
        font-weight: bold;
        color: #333;
      }
    }
  }
  
  .close-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: rotateIn 0.3s ease;
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes rotateIn {
  from { transform: rotate(-90deg); opacity: 0; }
  to { transform: rotate(0); opacity: 1; }
}
</style>

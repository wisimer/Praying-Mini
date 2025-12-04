<template>
  <div class="wish-card" @click="handleClick" :style="cardStyle">
    <div class="poster-wrapper" v-if="data.poster">
      <image class="poster-image" :src="data.poster" mode="aspectFill"></image>
      <div class="poster-overlay"></div>
      <div class="card-title" :style="textStyle">{{ data.content || data.title }}</div>
    </div>
    <div class="content-wrapper" :style="contentWrapperStyle" v-else>
       <div class="card-title" :style="textStyle">{{ data.content || data.title }}</div>
    </div>
    
    <div class="card-footer">
      <div class="user-info">
        <image class="avatar" :src="data.user.avatar" mode="aspectFill"></image>
        <div class="info-col">
          <span class="nickname">{{ data.user.nickname }}</span>
          <span class="time">{{ data.createTime }}</span>
        </div>
      </div>
      
      <div class="interactions" v-if="showInteractions">
        <div class="action-btn" @click.stop="toggleCollect">
          <uni-icons :type="'eye'" size="20" :color="data.isCollected ? '#FFCC00' : '#999'"></uni-icons>
          <span class="count">{{ data.view_count }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  showInteractions: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['click', 'like', 'collect'])

const cardStyle = computed(() => {
  const style = {}
  const cs = props.data.content_style
  
  let hasCustomBg = false
  if (cs) {
    if (cs.bgType === 'solid'&& cs.bgValue) {
      style.background = cs.bgValue
      hasCustomBg = true
    } else if (cs.bgType === 'image' && cs.bgValue) {
      style.backgroundImage = `url("${cs.bgValue}")`
      style.backgroundSize = 'cover'
      style.backgroundPosition = 'center'
      hasCustomBg = true
    } else if (cs.bgType === 'gradient' && cs.bgValue) {
      style.background = cs.bgValue
      hasCustomBg = true
    }
  }

  if (!hasCustomBg) {
    // Default gradient background for the whole card
    style.background = 'linear-gradient(135deg, #fff 0%, #f9faff 100%)'
  }

  return style
})

const contentWrapperStyle = computed(() => {
  const style = {}
  // Background logic moved to cardStyle to cover the whole card including footer
  return style
})

const textStyle = computed(() => {
  const style = {}
  const cs = props.data.content_style
  if (!cs) return style
  
  if (cs.color) style.color = cs.color
  if (cs.fontSize) style.fontSize = cs.fontSize + 'px'
  if (cs.fontWeight) style.fontWeight = cs.fontWeight
  
  return style
})

const toggleLike = () => {
  emit('like')
}

const toggleCollect = () => {
  emit('collect')
}

const handleClick = () => {
  emit('click')
}
</script>

<style lang="scss" scoped>
.wish-card {
  /* background-color: #fff; Removed to allow dynamic background */
  border-radius: 24px; /* Larger radius */
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(111, 207, 251, 0.08); /* Very soft blue shadow */
  border: 1px solid rgba(255,255,255,0.5);

  .poster-wrapper {
    position: relative;
    width: 100%;
    height: 0;
    padding-bottom: 60%; /* Slightly taller */
    background-color: rgba(240, 244, 248, 0.5); /* Semi-transparent placeholder */

    .poster-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .poster-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 60%;
      background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
    }

    .card-title {
      position: absolute;
      bottom: 16px;
      left: 16px;
      right: 16px;
      color: #fff;
      font-size: 18px;
      font-weight: 700;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
      text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
  }

  .content-wrapper {
    padding: 24px;
    min-height: 120px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    /* Removed fixed gradient to allow dynamic background */
    /* background: linear-gradient(135deg, #fff 0%, #f9faff 100%); */
    
    .card-title {
      font-size: 18px;
      font-weight: 700;
      line-height: 1.5;
      margin-bottom: 12px;
      word-break: break-all;
      color: #333;
    }
    
    .ai-message {
      font-size: 13px;
      opacity: 0.8;
      font-style: italic;
      color: #666;
    }
  }

  .card-footer {
    padding: 16px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    /* background-color: #fff; Removed to show card background */
    backdrop-filter: blur(10px); /* Optional: adds glass effect if background is an image */
    background-color: rgba(255, 255, 255, 0.3); /* Semi-transparent for readability */

    .user-info {
      display: flex;
      align-items: center;
      
      .avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        margin-right: 10px;
        background-color: #f0f0f0;
        border: 2px solid #fff;
        box-shadow: 0 2px 6px rgba(0,0,0,0.05);
      }

      .info-col {
        display: flex;
        flex-direction: column;
        
        .nickname {
          font-size: 14px;
          color: #444;
          font-weight: 600;
        }
        
        .time {
          font-size: 11px;
          color: #999;
          margin-top: 2px;
        }
      }
    }

    .interactions {
      display: flex;
      gap: 16px;

      .action-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        background-color: #f5f7fa;
        padding: 6px 12px;
        border-radius: 20px; /* Pill shape buttons */

        .count {
          font-size: 12px;
          color: #666;
          font-weight: 500;
          
          &.active {
            color: #FF6B81;
          }
        }
      }
    }
  }
}
</style>

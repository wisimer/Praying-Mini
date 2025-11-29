<template>
  <div class="bottom-nav-placeholder"></div>
  <div class="bottom-nav">
    <div 
      class="nav-item" 
      v-for="(item, index) in navItems" 
      :key="index"
      :class="{ active: activeIndex === index }"
      @click="switchTab(index)"
    >
      <div class="icon-box">
        <uni-icons 
          :type="activeIndex === index ? item.activeIcon : item.icon" 
          size="24" 
          :color="activeIndex === index ? '#FF6B81' : '#999'"
        ></uni-icons>
      </div>
      <span class="label">{{ item.label }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:modelValue'])

const activeIndex = ref(props.modelValue)

const navItems = [
  { label: '首页', icon: 'home', activeIcon: 'home-filled' },
  { label: '任务', icon: 'calendar', activeIcon: 'calendar-filled' },
  { label: '消息', icon: 'chat', activeIcon: 'chat-filled' },
  { label: '我的', icon: 'person', activeIcon: 'person-filled' }
]

const switchTab = (index) => {
  activeIndex.value = index
  emit('update:modelValue', index)
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

    .label {
      font-size: 10px;
      color: #999;
      margin-top: 2px;
    }

    &.active {
      .label {
        color: #FF6B81;
      }
    }
  }
}
</style>

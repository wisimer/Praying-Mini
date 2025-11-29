<template>
  <div class="tab-bar">
    <div 
      v-for="(tab, index) in tabs" 
      :key:="index"
      class="tab-item"
      :class="{ active: modelValue === index }"
      @click="selectTab(index)"
    >
      <span class="tab-text">{{ tab }}</span>
      <div class="indicator" v-if="modelValue === index"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  tabs: {
    type: Array,
    default: () => ['热门愿望卡', '最新完成']
  },
  modelValue: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:modelValue'])

const selectTab = (index) => {
  emit('update:modelValue', index)
}
</script>

<style lang="scss" scoped>
.tab-bar {
  display: flex;
  height: 44px;
  background-color: #fff;
  border-bottom: 1px solid #f5f5f5;
  padding: 0 16px;

  .tab-item {
    margin-right: 24px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    cursor: pointer;
    height: 100%;

    .tab-text {
      font-size: 15px;
      color: #999;
      transition: color 0.3s;
    }

    &.active {
      .tab-text {
        color: #333;
        font-weight: 600;
      }
    }

    .indicator {
      position: absolute;
      bottom: 0;
      width: 20px;
      height: 3px;
      background-color: #FF6B81;
      border-radius: 2px;
    }
  }
}
</style>

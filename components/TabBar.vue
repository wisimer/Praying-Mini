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
  height: 50px;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 25px;
  padding: 4px;
  box-shadow: 0 8px 20px rgba(111, 207, 251, 0.15); /* Light blue shadow */
  justify-content: space-around;
  align-items: center;

  .tab-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    cursor: pointer;
    height: 100%;
    border-radius: 21px;
    transition: all 0.3s ease;

    .tab-text {
      font-size: 15px;
      color: #888;
      font-weight: 500;
      transition: color 0.3s;
      z-index: 1;
    }

    &.active {
      background-color: #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      
      .tab-text {
        color: #6FCFFB; /* Primary Blue */
        font-weight: 700;
      }
    }

    /* Removed the bottom line indicator, using pill background instead */
    .indicator {
      display: none; 
    }
  }
}
</style>

<template>
  <div class="publish-container">
    <div class="nav-header">
      <uni-icons type="back" size="24" @click="goBack"></uni-icons>
      <span class="title">我要还愿</span>
      <div class="placeholder"></div>
    </div>

    <div class="form-content">
      <div class="form-item">
        <div class="label">关联愿望</div>
        <picker @change="bindPickerChange" :value="index" :range="wishList" range-key="text">
          <div class="picker-box">
            <span v-if="index > -1">{{ wishList[index].text }}</span>
            <span v-else class="placeholder-text">请选择要还愿的愿望</span>
            <uni-icons type="bottom" size="14" color="#999"></uni-icons>
          </div>
        </picker>
      </div>

      <div class="form-item input-group">
        <textarea 
          class="wish-input" 
          v-model="fulfillContent" 
          placeholder="愿望已实现，写下你的还愿感言..." 
          maxlength="200"
        ></textarea>
        <div class="word-count">{{ fulfillContent.length }}/200</div>
      </div>
    </div>

    <div class="footer-action">
      <button class="submit-btn" @click="handleFulfill" :disabled="isLoading">
        <span v-if="!isLoading">还愿</span>
        <div v-else class="loading-spinner flower-bloom">🌸</div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const fulfillContent = ref('')
const isLoading = ref(false)
const index = ref(-1)

// Mock data for wishes
const wishList = ref([
  { id: 1, text: '希望家人身体健康' },
  { id: 2, text: '顺利通过考试' },
  { id: 3, text: '找到心仪的工作' }
])

const goBack = () => {
  uni.navigateBack()
}

const bindPickerChange = (e) => {
  index.value = e.detail.value
}

const handleFulfill = () => {
  if (index.value === -1) {
    uni.showToast({
      title: '请选择关联愿望',
      icon: 'none'
    })
    return
  }
  
  if (!fulfillContent.value.trim()) {
    uni.showToast({
      title: '请填写还愿文案',
      icon: 'none'
    })
    return
  }

  isLoading.value = true
  
  setTimeout(() => {
    isLoading.value = false
    uni.showToast({
      title: '还愿成功',
      icon: 'success'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }, 2500)
}
</script>

<style lang="scss" scoped>
.publish-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.nav-header {
  height: 44px;
  padding: 0 16px;
  padding-top: env(safe-area-inset-top);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  
  .title {
    font-size: 18px;
    font-weight: bold;
  }
  
  .placeholder {
    width: 24px;
  }
}

.form-content {
  flex: 1;
  padding: 20px;
  
  .form-item {
    margin-bottom: 20px;
    
    .label {
      font-size: 14px;
      color: #333;
      margin-bottom: 8px;
      font-weight: 500;
    }
    
    .picker-box {
      background-color: #fff;
      border-radius: 12px;
      padding: 14px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 15px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.03);
      
      .placeholder-text {
        color: #999;
      }
    }
  }
  
  .input-group {
    background-color: #fff;
    border-radius: 12px;
    padding: 16px;
    position: relative;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    
    .wish-input {
      width: 100%;
      height: 200px;
      font-size: 16px;
      line-height: 1.6;
      border: none;
      outline: none;
    }
    
    .word-count {
      text-align: right;
      color: #999;
      font-size: 12px;
      margin-top: 8px;
    }
  }
}

.footer-action {
  padding: 20px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
  
  .submit-btn {
    background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);
    color: #fff;
    border-radius: 25px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: bold;
    border: none;
    box-shadow: 0 4px 15px rgba(161, 140, 209, 0.4);
    
    &:active {
      transform: scale(0.98);
    }
    
    &:disabled {
      opacity: 0.8;
    }
  }
}

.loading-spinner {
  font-size: 24px;
  
  &.flower-bloom {
    animation: bloom 2s ease-in-out infinite;
  }
}

@keyframes bloom {
  0% { transform: scale(0.5); opacity: 0.5; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(0.5); opacity: 0.5; }
}
</style>

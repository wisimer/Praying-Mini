<template>
  <div class="publish-container">
    <div class="nav-header">
      <uni-icons type="back" size="24" @click="goBack"></uni-icons>
      <span class="title">我要许愿</span>
      <div class="placeholder"></div>
    </div>

    <div class="form-content">
      <div class="input-group">
        <textarea 
          class="wish-input" 
          v-model="wishContent" 
          placeholder="写下你的愿望，诚心祈祷..." 
          maxlength="200"
        ></textarea>
        <div class="word-count">{{ wishContent.length }}/200</div>
      </div>
    </div>

    <div class="footer-action">
      <button class="submit-btn" @click="handleWish" :disabled="isLoading">
        <span v-if="!isLoading">许愿</span>
        <div v-else class="loading-spinner star-spin">★</div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const wishContent = ref('')
const isLoading = ref(false)

const goBack = () => {
  uni.navigateBack()
}

const handleWish = () => {
  if (!wishContent.value.trim()) {
    uni.showToast({
      title: '请填写愿望内容',
      icon: 'none'
    })
    return
  }

  isLoading.value = true
  
  setTimeout(() => {
    isLoading.value = false
    uni.showToast({
      title: '许愿成功',
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
    background: linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%);
    color: #fff;
    border-radius: 25px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: bold;
    border: none;
    box-shadow: 0 4px 15px rgba(255, 154, 158, 0.4);
    
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
  
  &.star-spin {
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>

<template>
  <div class="publish-container">
    <div class="nav-header">
      <uni-icons type="back" size="24" @click="goBack"></uni-icons>
      <span class="title">发布任务</span>
      <div class="placeholder"></div>
    </div>

    <div class="form-content">
      <!-- Task Type -->
      <div class="form-item">
        <div class="label">任务类型</div>
        <picker @change="bindTypeChange" :value="typeIndex" :range="taskTypes">
          <div class="picker-box">
            <span v-if="typeIndex > -1">{{ taskTypes[typeIndex] }}</span>
            <span v-else class="placeholder-text">选择任务类型</span>
            <uni-icons type="bottom" size="14" color="#999"></uni-icons>
          </div>
        </picker>
      </div>

      <!-- Content -->
      <div class="form-item input-group">
        <textarea 
          class="task-input" 
          v-model="taskContent" 
          placeholder="详细描述任务需求..." 
          maxlength="500"
        ></textarea>
        <div class="word-count">{{ taskContent.length }}/500</div>
      </div>

      <!-- Images -->
      <div class="form-item">
        <div class="label">上传图片 ({{ imageList.length }}/9)</div>
        <div class="image-grid">
          <div 
            class="image-item" 
            v-for="(img, idx) in imageList" 
            :key="idx"
            @click="previewImage(idx)"
          >
            <image :src="img" mode="aspectFill" class="thumb"></image>
            <div class="delete-btn" @click.stop="deleteImage(idx)">
              <uni-icons type="closeempty" size="12" color="#fff"></uni-icons>
            </div>
          </div>
          <div class="upload-btn" @click="chooseImage" v-if="imageList.length < 9">
            <uni-icons type="camera-filled" size="30" color="#ccc"></uni-icons>
          </div>
        </div>
      </div>

      <!-- Deadline -->
      <div class="form-item">
        <div class="label">截止日期</div>
        <picker mode="date" :value="deadline" :start="startDate" @change="bindDateChange">
          <div class="picker-box">
            <span v-if="deadline">{{ deadline }}</span>
            <span v-else class="placeholder-text">请选择截止日期</span>
            <uni-icons type="calendar" size="16" color="#999"></uni-icons>
          </div>
        </picker>
      </div>

      <!-- Price -->
      <div class="form-item">
        <div class="label">悬赏金额</div>
        <div class="price-input-box">
          <span class="currency">¥</span>
          <input 
            type="number" 
            v-model="price" 
            class="price-input" 
            placeholder="0.00"
          />
        </div>
      </div>
    </div>

    <div class="footer-action">
      <button class="submit-btn" @click="handlePublish" :disabled="isLoading">
        <span v-if="!isLoading">发布任务</span>
        <div v-else class="loading-spinner">...</div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const taskTypes = ['日常委托', '跑腿代购', '技能服务', '其他']
const typeIndex = ref(-1)
const taskContent = ref('')
const imageList = ref([])
const deadline = ref('')
const price = ref('')
const isLoading = ref(false)

const startDate = computed(() => {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
})

const goBack = () => {
  uni.navigateBack()
}

const bindTypeChange = (e) => {
  typeIndex.value = e.detail.value
}

const bindDateChange = (e) => {
  deadline.value = e.detail.value
}

const chooseImage = () => {
  uni.chooseImage({
    count: 9 - imageList.value.length,
    success: (res) => {
      imageList.value = [...imageList.value, ...res.tempFilePaths]
    }
  })
}

const previewImage = (index) => {
  uni.previewImage({
    urls: imageList.value,
    current: index
  })
}

const deleteImage = (index) => {
  imageList.value.splice(index, 1)
}

const handlePublish = () => {
  if (typeIndex.value === -1) {
    return uni.showToast({ title: '请选择任务类型', icon: 'none' })
  }
  if (!taskContent.value.trim()) {
    return uni.showToast({ title: '请填写任务内容', icon: 'none' })
  }
  if (!deadline.value) {
    return uni.showToast({ title: '请选择截止日期', icon: 'none' })
  }
  if (!price.value) {
    return uni.showToast({ title: '请填写金额', icon: 'none' })
  }

  isLoading.value = true
  
  setTimeout(() => {
    isLoading.value = false
    uni.showToast({
      title: '发布成功',
      icon: 'success'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }, 1500)
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
  padding-bottom: 80px;
  
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
    
    .price-input-box {
      background-color: #fff;
      border-radius: 12px;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.03);
      
      .currency {
        font-size: 20px;
        font-weight: bold;
        color: #FF6B81;
        margin-right: 8px;
      }
      
      .price-input {
        flex: 1;
        font-size: 18px;
        font-weight: bold;
      }
    }
  }
  
  .input-group {
    background-color: #fff;
    border-radius: 12px;
    padding: 16px;
    
    .task-input {
      width: 100%;
      height: 150px;
      font-size: 15px;
      line-height: 1.5;
      border: none;
      outline: none;
    }
    
    .word-count {
      text-align: right;
      color: #999;
      font-size: 12px;
    }
  }
  
  .image-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    
    .image-item {
      width: calc((100% - 20px) / 3);
      height: 0;
      padding-bottom: calc((100% - 20px) / 3);
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      
      .thumb {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
      }
      
      .delete-btn {
        position: absolute;
        top: 4px;
        right: 4px;
        background-color: rgba(0,0,0,0.5);
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    
    .upload-btn {
      width: calc((100% - 20px) / 3);
      height: 0;
      padding-bottom: calc((100% - 20px) / 3);
      background-color: #fff;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px dashed #ccc;
      position: relative;
      
      .uni-icons {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }
  }
}

.footer-action {
  padding: 20px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
  background-color: #fff;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
  
  .submit-btn {
    background-color: #333;
    color: #fff;
    border-radius: 25px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: bold;
    border: none;
    
    &:active {
      opacity: 0.9;
    }
    
    &:disabled {
      opacity: 0.7;
    }
  }
}
</style>

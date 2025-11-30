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
        <div class="label">上传图片 ({{ imageList.length }}/1)</div>
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
            placeholder="0"
            @input="onPriceInput"
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
import { addDynamic } from '@/cloud-api/dynamic.js'
import { showToast, showLoading, asyncUploadFile } from '@/core/app.js'

const taskTypes = ['日常委托', '跑腿代购', '技能服务', '其他']
const typeIndex = ref(-1)
const taskContent = ref('')
const imageList = ref([])
const deadline = ref('')
const price = ref('1')
const isLoading = ref(false)

const startDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const year = tomorrow.getFullYear()
  const month = (tomorrow.getMonth() + 1).toString().padStart(2, '0')
  const day = tomorrow.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
})

const bindTypeChange = (e) => {
  typeIndex.value = e.detail.value
}

const bindDateChange = (e) => {
  deadline.value = e.detail.value
}

const chooseImage = () => {
  if (imageList.value.length >= 1) {
    return showToast('最多只能上传一张图片')
  }
  asyncUploadFile(1).then(results => {
    if (results && results.length > 0) {
      imageList.value = [results[0].fileID]
    }
  })
}

const deleteImage = (index) => {
  imageList.value.splice(index, 1)
}

const onPriceInput = (e) => {
  // 移除任何非数字字符
  let val = e.detail.value.replace(/[^\d]/g, '')
  
  // 确保是正整数
  if (val.startsWith('0')) {
    val = val.replace(/^0+/, '')
  }
  
  // 如果被修改了，需要重新赋值
  if (val !== e.detail.value) {
    // 使用nextTick确保视图更新
    setTimeout(() => {
      price.value = val
    }, 0)
  } else {
    price.value = val
  }
}

const previewImage = (index) => {
  uni.previewImage({
    urls: imageList.value,
    current: index
  })
}

const goBack = () => {
  uni.navigateBack()
}

const handlePublish = async () => {
  if (isLoading.value) return

  // Validation
  if (typeIndex.value < 0) return showToast('请选择任务类型')
  if (!taskContent.value.trim()) return showToast('请输入任务需求描述')
  // if (imageList.value.length === 0) return showToast('请上传图片') // 图片不再是必填项
  if (!deadline.value) return showToast('请选择截止日期')
  
  // Date validation: must be strictly after today
  const selectedDate = new Date(deadline.value)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (selectedDate <= today) {
    return showToast('截止日期必须选择今天之后的日期')
  }

  // Price validation
  if (!price.value || !/^\d+$/.test(price.value) || parseInt(price.value) < 0) {
    return showToast('请输入正整数金额')
  }

  isLoading.value = true
  showLoading('发布中...')

  try {
    const taskData = {
      sort: parseInt(typeIndex.value) + 11, // Map 0-3 to 11-14
      content: taskContent.value,
      imgs: imageList.value.length > 0 ? imageList.value[0] : '', // Store single image URL or empty string
      deadline_date: selectedDate.getTime(), // Save as timestamp
      price: parseInt(price.value) * 100, // Convert to cents, ensure integer
      publish_date: Date.now()
    }

    await addDynamic(taskData)
    
    // 触发上一页数据刷新
    uni.$emit('saveRecord')
    
    showToast('发布成功')
    
    // Clear form
    typeIndex.value = -1
    taskContent.value = ''
    imageList.value = []
    deadline.value = ''
    price.value = ''
    
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (err) {
    console.error(err)
    const msg = typeof err === 'string' ? err : (err.message || '未知错误')
    showToast('发布失败: ' + msg)
  } finally {
    isLoading.value = false
    uni.hideLoading()
  }
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

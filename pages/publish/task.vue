<template>
  <div class="publish-container">
    <!-- Background Gradient -->
    <!-- <div class="task-bg"></div> -->

    <div class="nav-header" :style="navStyle">
      <uni-icons type="back" size="24" color="#fff" @click="goBack"></uni-icons>
      <span class="title">发布任务</span>
      <div class="placeholder"></div>
    </div>

    <div class="form-content">
      <!-- Task Type -->
      <div class="form-item">
        <div class="label">任务类型</div>
        <picker @change="bindTypeChange" :value="typeIndex" :range="TASK_TYPE" range-key="name">
          <div class="picker-box">
            <span v-if="typeIndex > -1">{{ TASK_TYPE[typeIndex].name }}</span>
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
          placeholder-style="color: #ccc"
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
            <uni-icons type="camera-filled" size="30" color="#999"></uni-icons>
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
        <div class="label">悬赏金币</div>
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
        <div class="balance-row">
          <span class="balance-text">当前余额：{{ coin }} 金币</span>
          <button v-if="isInsufficient" class="recharge-link" @click="toNextPage('/pages/wode/recharge/recharge')">去充值</button>
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
import { onLoad } from '@dcloudio/uni-app'
import { addDynamic } from '@/cloud-api/dynamic.js'
import { showToast, showLoading, asyncUploadFile, showModal, toNextPage } from '@/core/app.js'
import { getPlayer } from '@/cloud-api/index.js'
import { SHARE_MENUS, TASK_TYPE } from '@/core/constants.js'
const navStyle = ref({})

onLoad(() => {
  // #ifdef MP-WEIXIN
  try {
    const menuButton = uni.getMenuButtonBoundingClientRect()
    const sysInfo = uni.getSystemInfoSync()
    const statusBarHeight = sysInfo.statusBarHeight
    const navBarContentHeight = (menuButton.top - statusBarHeight) * 2 + menuButton.height
    const totalHeight = statusBarHeight + navBarContentHeight
    
    navStyle.value = {
      height: `${totalHeight}px`,
      paddingTop: `${statusBarHeight}px`
    }
  } catch (e) {
    console.error('Header calculation failed:', e)
  }
  // #endif
})
const typeIndex = ref(0)
const taskContent = ref('')
const imageList = ref([])
const deadline = ref('')
const price = ref('1')
const isLoading = ref(false)
const coin = ref(0)

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

const initCoin = async () => {
  try {
    const res = await getPlayer()
    const data = res.data || {}
    coin.value = data.coin || 0
  } catch (e) {}
}

onLoad(() => {
  initCoin()
})

const isInsufficient = computed(() => {
  const p = parseInt(price.value || '0')
  return coin.value <= 0 || coin.value <= p
})

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

  const priceYuan = parseInt(price.value)
  if (coin.value <= 0 || coin.value <= priceYuan) {
    await showModal({ content: '金币不足，请先充值' })
    toNextPage('/pages/wode/recharge/recharge')
    return
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
  position: relative;
}

.task-bg {
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
  background-color: rgba(111, 207, 251, 0.95); /* Semi-transparent Sky Blue */
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
  
  .title {
    font-size: 20px; /* Larger */
    font-weight: 800; /* Bold */
    color: #fff; /* White */
    letter-spacing: 1px;
  }
  
  .placeholder {
    width: 24px;
  }
}

  .form-content {
  flex: 1;
  padding: 20px;
  padding-bottom: 100px;
  z-index: 1;
  
  .form-item {
    margin-bottom: 24px; /* More space */
    
    .label {
      font-size: 15px;
      color: #000; /* White label on gradient bg */
      margin-bottom: 10px;
      font-weight: 600;
      text-shadow: 0 1px 2px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      
      &::before {
        content: '';
        display: block;
        width: 4px;
        height: 16px;
        background-color: #FFD700; /* Yellow accent */
        margin-right: 8px;
        border-radius: 2px;
      }
    }
    
    .picker-box {
      background-color: rgba(255, 255, 255, 0.95); /* Translucent white */
      border-radius: 16px; /* Large radius */
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      backdrop-filter: blur(5px);
      
      .placeholder-text {
        color: #999;
      }
    }
    
    .price-input-box {
      background-color: rgba(255, 255, 255, 0.95);
      border-radius: 16px;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      backdrop-filter: blur(5px);
      
      .currency {
        font-size: 24px;
        font-weight: bold;
        color: #FF6B81;
        margin-right: 12px;
      }
      
      .price-input {
        flex: 1;
        font-size: 20px;
        font-weight: bold;
        color: #333;
      }
    }
    .balance-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;
    }
    .balance-text {
      font-size: 13px;
      color: #666;
    }
    .recharge-link {
      margin: 0;
      background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
      color: #fff;
      border-radius: 20px;
      height: 30px;
      line-height: 30px;
      padding: 0 12px;
      font-size: 12px;
      border: none;
    }
  }
  
  .input-group {
    background-color: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    backdrop-filter: blur(5px);
    
    .task-input {
      width: 100%;
      height: 180px; /* Taller */
      font-size: 16px;
      line-height: 1.6;
      border: none;
      outline: none;
      color: #333;
    }
    
    .word-count {
      text-align: right;
      color: #999;
      font-size: 13px;
      margin-top: 8px;
    }
  }
  
  .image-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    
    .image-item {
      width: calc((100% - 24px) / 3);
      height: 0;
      padding-bottom: calc((100% - 24px) / 3);
      position: relative;
      border-radius: 16px; /* Rounded images */
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      
      .thumb {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
      }
      
      .delete-btn {
        position: absolute;
        top: 6px;
        right: 6px;
        background-color: rgba(255, 107, 129, 0.9); /* Pink */
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      }
    }
    
    .upload-btn {
      width: calc((100% - 24px) / 3);
      height: 0;
      padding-bottom: calc((100% - 24px) / 3);
      background-color: rgba(255, 255, 255, 0.6);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px dashed #fff;
      position: relative;
      backdrop-filter: blur(5px);
      
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
  padding: 20px 30px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
  background-color: rgba(255, 255, 255, 0.9); /* Translucent footer */
  backdrop-filter: blur(10px);
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
  z-index: 100;
  
  .submit-btn {
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); /* Yellow/Orange Gradient */
    color: #fff;
    border-radius: 30px; /* Pill shape */
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 800;
    border: none;
    box-shadow: 0 8px 20px rgba(255, 165, 0, 0.3);
    transition: transform 0.2s;
    
    &:active {
      transform: scale(0.98);
      opacity: 0.95;
    }
    
    &:disabled {
      opacity: 0.7;
      background: #ccc;
      box-shadow: none;
    }
  }
}
</style>

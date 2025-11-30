<template>
  <div class="publish-container">
    <div class="nav-header">
      <uni-icons type="back" size="24" @click="goBack"></uni-icons>
      <span class="title">提交完成结果</span>
      <div class="placeholder"></div>
    </div>

    <div class="form-content">
      <!-- Content -->
      <div class="form-item input-group">
        <textarea 
          class="task-input" 
          v-model="taskContent" 
          placeholder="请详细描述任务完成情况..." 
          maxlength="500"
        ></textarea>
        <div class="word-count">{{ taskContent.length }}/500</div>
      </div>

      <!-- Images -->
      <div class="form-item">
        <div class="label">上传结果图片 ({{ imageList.length }}/9)</div>
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
    </div>

    <div class="footer-action">
      <button class="submit-btn" @click="handleSubmit" :disabled="isLoading">
        <span v-if="!isLoading">提交完成</span>
        <div v-else class="loading-spinner">...</div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { MSG_TYPE, ARTICLE_STATUS } from '@/core/constants.js'
import { onLoad } from '@dcloudio/uni-app'
import { showToast, showLoading, asyncUploadFile } from '@/core/app.js'
import { store } from '@/uni_modules/uni-id-pages/common/store.js'

const taskContent = ref('')
const imageList = ref([])
const isLoading = ref(false)

// Params
const taskId = ref('')
const toUserId = ref('')

onLoad((options) => {
  if (options.taskId) taskId.value = options.taskId
  if (options.toUserId) toUserId.value = options.toUserId
})

const chooseImage = () => {
  if (imageList.value.length >= 9) {
    return showToast('最多只能上传9张图片')
  }
  asyncUploadFile(9 - imageList.value.length).then(results => {
    if (results && results.length > 0) {
        const newImgs = results.map(r => r.fileID)
        imageList.value = [...imageList.value, ...newImgs]
    }
  })
}

const deleteImage = (index) => {
  imageList.value.splice(index, 1)
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

const handleSubmit = async () => {
  if (isLoading.value) return

  if (!taskContent.value.trim() && imageList.value.length === 0) {
      return showToast('请填写完成说明或上传图片')
  }

  isLoading.value = true
  showLoading('提交中...')

  try {
    const db = uniCloud.database()
    
    // 1. Update dynamic status to 2 (Pending Confirmation)
    // Also save the completion proof in the dynamic record (or a separate collection if needed, but for now let's assume we update the dynamic or add a message)
    // Based on previous logic: dynamicStatus = 2
    
    // We should probably update the 'app-dynamic' record to store the proof, OR just send a message.
    // The previous logic was:
    // await db.collection('app-dynamic').doc(taskId).update({ article_status: 2 })
    // await db.collection('app-task-message').add({ ... msg_type: 2 ... })
    
    // Here we want to include content and images.
    // Since the 'app-task-message' schema might not support content/imgs directly, 
    // or we might want to store it in 'app-dynamic' as 'completion_proof'.
    // Let's check if we can update 'app-dynamic' with this info.
    // Assuming 'app-dynamic' can hold 'fullfill_content' and 'fullfill_imgs' or similar.
    // Looking at home.vue: content: item.fullfilled && item.fullfill_content ? item.fullfill_content : item.content
    // It seems there is 'fullfill_content'.
    
    await db.collection('app-dynamic').doc(taskId.value).update({
        article_status: ARTICLE_STATUS.EXECUTED_WAIT_VERIFY, // 任务完成待确认
        fullfill_content: taskContent.value,
        fullfill_imgs: imageList.value
    })

    // 2. Send Message
    await db.collection('app-task-message').add({
        relevance_id: taskId.value,
        from_user_id: store.userInfo._id,
        to_user_id: toUserId.value,
        msg_type: MSG_TYPE.COMPLETE_NOTIFY, // 任务完成待确认
    })
    
    uni.$emit('refreshTasks')
    showToast('提交成功')
    
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
    
  } catch (err) {
    console.error(err)
    showToast('提交失败')
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
  
  .form-item {
    margin-bottom: 20px;
    
    .label {
      font-size: 14px;
      color: #333;
      margin-bottom: 8px;
      font-weight: 500;
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
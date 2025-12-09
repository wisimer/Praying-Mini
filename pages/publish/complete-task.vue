<template>
  <div class="publish-container">
    <!-- Background Gradient -->
    <div class="page-bg"></div>

    <cuNavbar bgColor="rgba(111, 207, 251, 0.95)">
      <template #left>
        <div @click="goBack" style="display: flex; align-items: center; margin-left: 10px;">
          <uni-icons type="back" size="24" color="#fff"></uni-icons>
        </div>
      </template>
      <template #content>
        <view class="font-size36 font-weight" style="color: #fff; font-size: 18px;">提交完成结果</view>
      </template>
    </cuNavbar>

    <div class="form-content">
      <!-- Content -->
      <div class="form-item input-group">
        <textarea 
          class="task-input" 
          v-model="taskContent" 
          placeholder="请详细描述任务完成情况..." 
          maxlength="500"
          placeholder-style="color: #ccc"
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
            <uni-icons type="camera-filled" size="30" color="#999"></uni-icons>
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
import cuNavbar from '@/components/cu-navbar/cu-navbar.vue'
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
const taskMsgId = ref('')

onLoad((options) => {
  if (options.taskId) taskId.value = options.taskId
  if (options.toUserId) toUserId.value = options.toUserId
  if (options.taskMsgId) taskMsgId.value = options.taskMsgId

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
    
    await uniCloud.callFunction({
        name: 'complete_dynamic',
        data: {
            taskId: taskId.value,
            article_status: ARTICLE_STATUS.EXECUTED_WAIT_VERIFY, // 任务完成待确认
            fullfill_content: taskContent.value,
            fullfill_imgs: imageList.value
        }
    })

    // 2. Send Message
    await db.collection('app-task-message').add({
        relevance_id: taskId.value,
        from_user_id: store.userInfo._id,
        to_user_id: toUserId.value,
        msg_type: MSG_TYPE.COMPLETE_NOTIFY, // 任务完成待确认
    })

    // Update related message state to true
    try {
            await db.collection('app-task-message')
                .where(`_id == "${taskMsgId.value}`)
                .update({
                    state: true
                })
    } catch (e) {
        console.error('Update message state failed:', e)
    }
    
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
  position: relative;
}

.page-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: linear-gradient(180deg, #6FCFFB 0%, #B59DFF 100%);
  z-index: 0;
  opacity: 0.9;
}

.form-content {
  flex: 1;
  padding: 20px;
  z-index: 1;
  
  .form-item {
    margin-bottom: 24px;
    
    .label {
      font-size: 15px;
      color: #fff;
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
        background-color: #FFD700;
        margin-right: 8px;
        border-radius: 2px;
      }
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
      height: 180px;
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
      border-radius: 16px;
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
        background-color: rgba(255, 107, 129, 0.9);
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
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
  z-index: 100;
  
  .submit-btn {
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
    color: #fff;
    border-radius: 30px;
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
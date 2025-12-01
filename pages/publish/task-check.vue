<template>
  <div class="check-container">
    <!-- Background Gradient -->
    <div class="page-bg"></div>

    <div class="nav-header">
      <uni-icons type="back" size="24" color="#fff" @click="goBack"></uni-icons>
      <span class="title">任务完成确认</span>
      <div class="placeholder"></div>
    </div>

    <div class="content-area" v-if="taskInfo">
      <div class="section-title">完成说明</div>
      <div class="text-content">
        {{ taskInfo.fullfill_content || '无完成说明' }}
      </div>

      <div class="section-title" v-if="imgs.length > 0">完成凭证</div>
      <div class="image-grid" v-if="imgs.length > 0">
        <div 
          class="image-item" 
          v-for="(img, idx) in imgs" 
          :key="idx"
          @click="previewImage(idx)"
        >
          <image :src="img" mode="aspectFill" class="thumb"></image>
        </div>
      </div>
    </div>

    <div class="loading-state" v-else>
      加载中...
    </div>

    <div class="footer-action">
      <button class="action-btn reject" @click="handleAction(MSG_TYPE.CONFIRM_INCOMPLETE)">
        <uni-icons type="closeempty" size="20" color="#fff"></uni-icons>
        拒绝完成
      </button>
      <button class="action-btn accept" @click="handleAction(MSG_TYPE.CONFIRM_COMPLETE)">
        <uni-icons type="checkmarkempty" size="20" color="#fff"></uni-icons>
        确认完成
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { MSG_TYPE, ARTICLE_STATUS } from '@/core/constants.js'
import { onLoad } from '@dcloudio/uni-app'
import { showToast, showLoading } from '@/core/app.js'
import { store } from '@/uni_modules/uni-id-pages/common/store.js'

const taskInfo = ref(null)
const imgs = ref([])
const taskId = ref('')
const messageId = ref('') // To handle the message logic if needed, though we mainly need to trigger the action back

onLoad((options) => {
  if (options.taskId) {
    taskId.value = options.taskId
    loadTaskDetail()
  }
})

const loadTaskDetail = async () => {
  try {
    const db = uniCloud.database()
    const res = await db.collection('app-dynamic').doc(taskId.value).get()
    if (res.result.data && res.result.data.length > 0) {
      taskInfo.value = res.result.data[0]
      if (taskInfo.value.fullfill_imgs) {
        imgs.value = taskInfo.value.fullfill_imgs
      }
    }
  } catch (e) {
    console.error(e)
    showToast('加载失败')
  }
}

const previewImage = (index) => {
  uni.previewImage({
    urls: imgs.value,
    current: index
  })
}

const goBack = () => {
  uni.navigateBack()
}

const handleAction = async (action) => {
    // Emit event to previous page to handle the logic (reuse the logic in message.vue)
    // Or we can implement the logic here, but message.vue already has 'handleTaskAction'.
    // Since message.vue is likely the previous page or the page that opened this, 
    // we can use uni.$emit to trigger the action in message.vue context if we want to keep logic centralized,
    // OR simply replicate the logic here. 
    
    // Replicating logic here is safer as we are in a new page.
    // However, we need 'fromUserId' which is the user who completed the task (the 'to_user_id' of the original request, or the sender of the completion msg).
    // In the 'message.vue' context, 'currentTask' has 'from_user_id' (the sender of the message).
    // When we are in this page, we are viewing the proof. The user viewing this page is the one who posted the task (requester).
    // The person who completed it is the one who sent the message (msg_type=2).
    
    // So we need to find the message related to this task with msg_type=2 to know who sent it? 
    // Or simply look at the task's 'accepted_by' if we stored it.
    
    // Actually, the simplest way is to pass the necessary info (fromUserId) via options.
    // But let's just emit an event to the previous page (message.vue) to handle the action, 
    // passing the action type ('confirm' or 'deny').
        const db = uniCloud.database()

    showLoading()
        try {
            let status = ARTICLE_STATUS.VERIFY_PASS_WAIT_PLATFORM
            if (action === MSG_TYPE.CONFIRM_INCOMPLETE) {
                status = ARTICLE_STATUS.VERIFY_FAIL_WAIT_PLATFORM
            }

            // Update dynamic status if needed
            await db.collection('app-dynamic').doc(taskId.value).update({
                     article_status: status 
                 })

            // Insert new message
            await db.collection('app-task-message').add({
                relevance_id: taskId.value,
                from_user_id: store.userInfo._id,
                to_user_id: taskInfo.value.fullfill_user_id,
                msg_type: action
            })
            
            showToast('操作成功')
            // Refresh list
            uni.navigateBack()
        } catch (e) {
            console.error(e)
            showToast('操作失败')
        } finally {
            uni.hideLoading()
        }
    
    
}
</script>

<style lang="scss" scoped>
.check-container {
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

.nav-header {
  height: 44px;
  padding: 0 16px;
  padding-top: env(safe-area-inset-top);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: rgba(111, 207, 251, 0.95);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
  
  .title {
    font-size: 20px;
    font-weight: 800;
    color: #fff;
    letter-spacing: 1px;
  }
  
  .placeholder {
    width: 24px;
  }
}

.content-area {
  flex: 1;
  padding: 20px;
  padding-bottom: 100px;
  z-index: 1;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #fff; /* White on gradient */
  margin-bottom: 12px;
  margin-top: 20px;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  
  &:first-child {
    margin-top: 0;
  }
  
  &::before {
    content: '';
    display: block;
    width: 4px;
    height: 18px;
    background-color: #FFD700;
    margin-right: 8px;
    border-radius: 2px;
  }
}

.text-content {
  background-color: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 20px; /* Larger radius */
  font-size: 16px;
  line-height: 1.6;
  color: #333;
  min-height: 100px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  backdrop-filter: blur(5px);
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
    border-radius: 16px; /* Rounded */
    overflow: hidden;
    background-color: rgba(255,255,255,0.5);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    
    .thumb {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
    }
  }
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: rgba(255,255,255,0.8);
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
  display: flex;
  gap: 20px;
  z-index: 100;
  
  .action-btn {
    flex: 1;
    height: 56px;
    border-radius: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 800;
    color: #fff;
    border: none;
    gap: 8px;
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
    transition: transform 0.2s;
    
    &.reject {
      background: linear-gradient(135deg, #FF6B81 0%, #FF8E9E 100%); /* Soft Red/Pink */
      box-shadow: 0 8px 20px rgba(255, 107, 129, 0.3);
    }
    
    &.accept {
      background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); /* Yellow/Orange */
      box-shadow: 0 8px 20px rgba(255, 165, 0, 0.3);
    }
    
    &:active {
      opacity: 0.95;
      transform: scale(0.98);
    }
  }
}
</style>
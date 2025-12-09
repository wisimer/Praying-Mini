<template>
  <view class="page-container">
    <view class="custom-header" :style="headerStyle">
      <view class="header-left" @click="goBack">
        <uni-icons type="left" size="24" color="#333"></uni-icons>
      </view>
      <view class="header-title">今日打卡任务</view>
      <view class="header-right"></view>
    </view>
    <view class="header-spacer" :style="spacerStyle"></view>

    <view class="header-card">
      <view class="title">今日愿力值获取情况</view>
      <view class="total-force">
        <text class="num">{{ totalForce }}</text>
        <text class="label">今日获取</text>
      </view>
    </view>

    <view class="task-list">
      <view class="task-item" v-for="(item, index) in tasks" :key="index">
        <view class="left">
          <view class="icon-box" :class="item.color">
            <uni-icons :type="item.icon" size="24" color="#fff"></uni-icons>
          </view>
          <view class="info">
            <view class="name">{{ item.name }}</view>
            <view class="desc">{{ item.desc }}</view>
          </view>
        </view>
        <view class="right">
          <text class="progress" :class="{ completed: item.current >= item.max }">
            {{ item.current }} / {{ item.max }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const db = uniCloud.database()
const headerStyle = ref({})
const spacerStyle = ref({})

const goBack = () => {
  uni.navigateBack()
}

const tasks = ref([
  { key: 'login_force', name: '每日登录', desc: '每天登录获取1点愿力值', max: 1, current: 0, icon: 'calendar', color: 'blue' },
  { key: 'publish_wish_force', name: '发布愿望', desc: '发布愿望获取2点愿力值', max: 2, current: 0, icon: 'heart', color: 'purple' },
  { key: 'fulfill_wish_force', name: '我要还愿', desc: '还愿获取2点愿力值', max: 2, current: 0, icon: 'heart-filled', color: 'pink' },
  { key: 'publish_task_force', name: '发布任务', desc: '发布任务获取3点愿力值', max: 3, current: 0, icon: 'paperplane', color: 'orange' },
  { key: 'complete_task_force', name: '完成任务', desc: '完成任务获取3点愿力值', max: 3, current: 0, icon: 'checkbox', color: 'green' }
])

const totalForce = computed(() => {
  return tasks.value.reduce((sum, item) => sum + item.current, 0)
})

const getTodayTimestamp = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
}

const fetchData = async () => {
  try {
    const todayTs = getTodayTimestamp()
    const { result } = await db.collection('app-daily-tasks')
      .where(`date_timestamp == ${todayTs} && user_id == $cloudEnv_uid`)
      .get()
      
    if (result.data && result.data.length > 0) {
      const data = result.data[0]
      tasks.value.forEach(task => {
        if (data[task.key] !== undefined) {
          task.current = data[task.key]
        }
      })
    }
  } catch (e) {
    console.error('Failed to fetch daily tasks:', e)
  }
}

onLoad(() => {
  // #ifdef MP-WEIXIN
  try {
    const menuButton = uni.getMenuButtonBoundingClientRect()
    const sysInfo = uni.getSystemInfoSync()
    const statusBarHeight = sysInfo.statusBarHeight
    const navBarContentHeight = (menuButton.top - statusBarHeight) * 2 + menuButton.height
    const totalHeight = statusBarHeight + navBarContentHeight

    headerStyle.value = {
      height: `${totalHeight}px`,
      paddingTop: `${statusBarHeight}px`
    }
    spacerStyle.value = {
      height: `${totalHeight}px`
    }
  } catch (e) {
    console.error('Header calculation failed:', e)
  }
  // #endif

  fetchData()
})
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 30rpx;
}

.custom-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 44px;
  padding-top: var(--status-bar-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 30rpx;
  padding-right: 30rpx;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  z-index: 100;
  box-sizing: border-box;
}

.header-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.header-spacer {
  height: calc(44px + var(--status-bar-height));
  margin-bottom: 30rpx;
}

.header-card {
  background: linear-gradient(135deg, #6FCFFB 0%, #409EFF 100%);
  border-radius: 24rpx;
  padding: 40rpx;
  color: #fff;
  margin-bottom: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 8rpx 20rpx rgba(64, 158, 255, 0.2);

  .title {
    font-size: 32rpx;
    margin-bottom: 20rpx;
    opacity: 0.9;
  }

  .total-force {
    display: flex;
    flex-direction: column;
    align-items: center;

    .num {
      font-size: 80rpx;
      font-weight: bold;
      line-height: 1;
      margin-bottom: 10rpx;
    }

    .label {
      font-size: 24rpx;
      opacity: 0.8;
    }
  }
}

.task-list {
  background-color: #fff;
  border-radius: 24rpx;
  padding: 0 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);

  .task-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx 0;
    border-bottom: 1rpx solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    .left {
      display: flex;
      align-items: center;
      gap: 24rpx;

      .icon-box {
        width: 80rpx;
        height: 80rpx;
        border-radius: 20rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        
        &.blue { background: linear-gradient(135deg, #6FCFFB 0%, #409EFF 100%); }
        &.purple { background: linear-gradient(135deg, #B59DFF 0%, #8E44AD 100%); }
        &.green { background: linear-gradient(135deg, #81FBB8 0%, #28C76F 100%); }
        &.orange { background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); }
        &.pink { background: linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%); }
      }

      .info {
        .name {
          font-size: 30rpx;
          font-weight: 600;
          color: #333;
          margin-bottom: 8rpx;
        }
        .desc {
          font-size: 24rpx;
          color: #999;
        }
      }
    }

    .right {
      .progress {
        font-size: 32rpx;
        font-weight: 600;
        color: #999;
        
        &.completed {
          color: #28C76F;
        }
      }
    }
  }
}
</style>

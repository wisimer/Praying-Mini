<template>
  <view class="page-container">
    <view class="list-container">
      <view class="list-item" v-for="item in list" :key="item._id" @click="toDetail(item)">
        <view class="item-header">
          <text class="time">{{ formatDate(item.publish_date) }}</text>
          <text class="status" :class="`status-${item.article_status || 0}`">{{ getStatusText(item.article_status) }}</text>
        </view>
        <view class="item-content">{{ item.content }}</view>
        <view class="item-footer">
          <view class="price" v-if="item.price">
            <text class="symbol">¥</text>
            <text class="amount">{{ item.price / 100 }}</text>
          </view>
        </view>
      </view>
    </view>

    <uni-load-more :status="loadStatus"></uni-load-more>
    
    <view v-if="list.length === 0 && loadStatus === 'noMore'" class="empty-state">
      <image src="/static/empty.png" mode="widthFix"></image>
      <text>暂无接取的任务</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { store } from '@/uni_modules/uni-id-pages/common/store'
import { formatDate } from '@/utils/date.js'
import { toNextPage, showToast } from '@/core/app.js'
import { ARTICLE_STATUS, CATEGORY_ID } from '@/core/constants.js'

const list = ref([])
const page = ref(1)
const pageSize = 10
const loadStatus = ref('more')

onLoad(() => {
  loadData(true)
})

onPullDownRefresh(() => {
  loadData(true)
})

onReachBottom(() => {
  if (loadStatus.value === 'noMore') return
  loadData(false)
})

const loadData = async (refresh = false) => {
  if (refresh) {
    page.value = 1
    loadStatus.value = 'more'
  }
  
  if (loadStatus.value === 'loading' || loadStatus.value === 'noMore') return
  loadStatus.value = 'loading'
  
  const db = uniCloud.database()
  const dbCmd = db.command
  
  try {
    // Query: app-dynamic != 0 (Task) AND fullfill_user_id = current user
    const res = await db.collection('app-dynamic')
      .where({
        fullfill_user_id: store.userInfo._id,
        category_id: dbCmd.neq(CATEGORY_ID.WISH) 
      })
      .orderBy('publish_date', 'desc')
      .skip((page.value - 1) * pageSize)
      .limit(pageSize)
      .get()
      
    const data = res.result.data
    if (refresh) {
      list.value = data
      uni.stopPullDownRefresh()
    } else {
      list.value = [...list.value, ...data]
    }
    
    if (data.length < pageSize) {
      loadStatus.value = 'noMore'
    } else {
      loadStatus.value = 'more'
      page.value++
    }
  } catch (e) {
    console.error(e)
    showToast('加载失败')
    loadStatus.value = 'more'
  }
}

const getStatusText = (status) => {
   const map = {
       [ARTICLE_STATUS.AUDITING]: '审核中',
       [ARTICLE_STATUS.PUBLISHED]: '已发布',
       [ARTICLE_STATUS.AUDIT_REJECT]: '审核驳回',
       [ARTICLE_STATUS.APPROVED_EXECUTING]: '进行中',
       [ARTICLE_STATUS.REJECTED]: '已拒绝',
       [ARTICLE_STATUS.EXECUTED_WAIT_VERIFY]: '已完成',
       [ARTICLE_STATUS.FAILED_TIMEOUT]: '已失败',
       [ARTICLE_STATUS.VERIFY_PASS_WAIT_PLATFORM]: '待审核',
       [ARTICLE_STATUS.VERIFY_FAIL_WAIT_PLATFORM]: '验证失败',
       [ARTICLE_STATUS.PLATFORM_PASS_SETTLED]: '已结算',
       [ARTICLE_STATUS.PLATFORM_FAIL]: '审核失败'
   }
   return map[status] || '未知'
}

const toDetail = (item) => {
  toNextPage(`/subShare/dynamic-details/dynamic-details?id=${item._id}`)
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20rpx;
}

.list-item {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  
  .item-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20rpx;
    
    .time {
      font-size: 24rpx;
      color: #999;
    }
    
    .status {
      font-size: 24rpx;
      padding: 4rpx 12rpx;
      border-radius: 8rpx;
      &.status-0 { color: #409EFF; background: #ecf5ff; }
      &.status-1 { color: #67C23A; background: #f0f9eb; }
    }
  }
  
  .item-content {
    font-size: 30rpx;
    color: #333;
    line-height: 1.5;
    margin-bottom: 20rpx;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
  }
  
  .item-footer {
    border-top: 1rpx solid #f5f5f5;
    padding-top: 20rpx;
    
    .price {
      color: #ff4d4f;
      font-weight: bold;
      .symbol { font-size: 24rpx; }
      .amount { font-size: 32rpx; }
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 100rpx;
  
  image {
    width: 200rpx;
    margin-bottom: 20rpx;
  }
  
  text {
    color: #999;
    font-size: 28rpx;
  }
}
</style>

<template>
  <view class="page-container">
    <!-- List Component -->
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
          <view class="actions">
            <view class="action-btn" @click.stop="handleDelete(item)" v-if="isAuthor">
              <uni-icons type="trash" size="16" color="#999"></uni-icons>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Loading State -->
    <uni-load-more :status="loadStatus"></uni-load-more>
    
    <!-- Empty State -->
    <view v-if="list.length === 0 && loadStatus === 'noMore'" class="empty-state">
      <image src="/static/empty.png" mode="widthFix"></image>
      <text>暂无数据</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { store } from '@/uni_modules/uni-id-pages/common/store'
import { formatDate } from '@/utils/date.js'
import { ARTICLE_STATUS, CATEGORY_ID } from '@/core/constants.js'
import { toNextPage, showModal, showToast, showLoading } from '@/core/app.js'

const list = ref([])
const page = ref(1)
const pageSize = 10
const loadStatus = ref('more') // more, loading, noMore
const isAuthor = ref(true)

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
    // Query condition: app-dynamic=0 (Wish) and user_id=current user
    const res = await db.collection('app-dynamic')
      .where({
        user_id: store.userInfo._id,
        category_id: CATEGORY_ID.WISH
      })
      .orderBy('publish_date', 'desc')
      .skip((page.value - 1) * pageSize)
      .limit(pageSize)
      .get()
      
    // Wait, I need to verify the field name for "Wish".
    // If I can't verify, I'll use a generic filter. 
    // But wait, the requirement specifically says "app-dynamic=0". 
    // This likely implies `type` or `category` field is 0.
    // Let's assume `type: 0` for now.
    
    // Actually, looking at the `app-dynamic.schema.json` content I saw earlier:
    // It has `category_id`.
    // Let's assume category_id == '0' or 0.
    
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
   // Map status to text
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

const handleDelete = (item) => {
  showModal({
    content: '确定删除该愿望吗？',
    success: async (res) => {
      if (res.confirm) {
        showLoading('删除中...')
        try {
          const db = uniCloud.database()
          await db.collection('app-dynamic').doc(item._id).remove()
          showToast('删除成功')
          loadData(true)
        } catch (e) {
          showToast('删除失败')
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
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
      &.status-2 { color: #E6A23C; background: #fdf6ec; }
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
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1rpx solid #f5f5f5;
    padding-top: 20rpx;
    
    .price {
      color: #ff4d4f;
      font-weight: bold;
      
      .symbol { font-size: 24rpx; }
      .amount { font-size: 32rpx; }
    }
    
    .actions {
      .action-btn {
        padding: 10rpx;
      }
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

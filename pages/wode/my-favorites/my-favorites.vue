<template>
  <view class="page-container">
    <view class="custom-header" :style="headerStyle">
      <view class="header-left" @click="goBack">
        <uni-icons type="left" size="24" color="#333"></uni-icons>
      </view>
      <view class="header-title">收藏列表</view>
      <view class="header-right"></view>
    </view>
    <view class="header-spacer" :style="spacerStyle"></view>

    <!-- List Component -->
    <view class="list-container">
      <view class="list-item" v-for="(item, index) in list" :key="item._id" @click="handleItemClick(item)">
        <view class="item-header">
          <text class="time">{{ formatDate(item.dynamic.publish_date) }}</text>
          <text class="status" :class="`status-${item.dynamic.article_status || 0}`">{{ getStatusText(item.dynamic.article_status) }}</text>
        </view>
        <view class="item-content">{{ item.dynamic.content }}</view>
        <view class="item-footer">
          <view class="price" v-if="item.dynamic.price">
            <text class="symbol">¥</text>
            <text class="amount">{{ item.dynamic.price / 100 }}</text>
          </view>
        </view>
      </view>
    </view>

    <uni-load-more :status="loadStatus"></uni-load-more>
    
    <view v-if="list.length === 0 && loadStatus === 'noMore'" class="empty-state">
      <image src="/static/empty.png" mode="widthFix"></image>
      <text>暂无收藏的内容</text>
    </view>

    <WishCardDetail 
      v-model:visible="showDetail" 
      :wishData="selectedWish"
    />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { store } from '@/uni_modules/uni-id-pages/common/store'
import { toNextPage, showToast } from '@/core/app.js'
import { formatDate } from '@/utils/date.js'
import { getStatusText } from '@/core/constants.js'
import WishCardDetail from '@/components/WishCardDetail.vue'

const goBack = () => {
  uni.navigateBack()
}

const list = ref([])
const page = ref(1)
const pageSize = 10
const loadStatus = ref('more')
const headerStyle = ref({})
const spacerStyle = ref({})

const showDetail = ref(false)
const selectedWish = ref({})

const handleItemClick = (item) => {
  const dynamic = item.dynamic
  // Navigate to dynamic-detail page
    uni.navigateTo({
      url: `/subShare/dynamic-details/dynamic-details?id=${dynamic._id}`
    })
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
    // Query app-like-dynamic and join with app-dynamic and uni-id-users
    const res = await db.collection('app-like-dynamic,app-dynamic,uni-id-users')
      .where({
        user_id: store.userInfo._id
      })
      .field('dynamic_id{_id,content,imgs,user_id,publish_date,price,article_status,sort,comment_count,view_count,like_count}, create_date')
      .orderBy('create_date', 'desc')
      .skip((page.value - 1) * pageSize)
      .limit(pageSize)
      .get()
      
    const rawData = res.result.data
    
    // Transform data for DynamicCard
    const formattedData = rawData.map(item => {
      if (!item.dynamic_id || item.dynamic_id.length === 0) return null
      
      const dynamic = item.dynamic_id[0]
      const author = dynamic.user_id && dynamic.user_id.length > 0 ? dynamic.user_id[0] : {}
      
      // Handle imgs if it's a string
      if (typeof dynamic.imgs === 'string') {
        dynamic.imgs = dynamic.imgs.split(',')
      } else if (!Array.isArray(dynamic.imgs)) {
        dynamic.imgs = []
      }
      
      return {
        _id: item._id, // ID of the like record
        dynamic: dynamic,
        author: author
      }
    }).filter(item => item !== null) // Filter out items where dynamic was not found
    
    if (refresh) {
      list.value = formattedData
      uni.stopPullDownRefresh()
    } else {
      list.value = [...list.value, ...formattedData]
    }
    
    if (rawData.length < pageSize) {
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
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: 40rpx;
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
}

.list-container {
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
  padding-top: 200rpx;
  
  image {
    width: 300rpx;
    margin-bottom: 20rpx;
  }
  
  text {
    font-size: 28rpx;
    color: #999;
  }
}
</style>

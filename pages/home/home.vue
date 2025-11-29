<template>
  <div class="home-container">
    <TopNav />
    
    <div class="sticky-header">
      <TabBar 
        :tabs="['热门愿望卡', '最新完成']" 
        v-model="currentTab" 
      />
    </div>

    <div class="content-area">
      <!-- List -->
      <div class="feed-list" v-if="wishList.length > 0">
        <WishCard 
          v-for="item in wishList" 
          :key="item.id" 
          :data="item" 
          @click="handleCardClick(item)"
          @like="handleLike(item)"
        />
      </div>
      <div class="loading-state" v-if="loading">
        Loading...
      </div>
      <div class="empty-state" v-if="!loading && wishList.length === 0">
        暂无数据
      </div>
    </div>

    <AddIconComponent style="margin-right: 24rpx;"/>
    
    <WishCardDetail 
      v-model:visible="showDetail" 
      :wishData="selectedWish"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow, onHide, onReachBottom } from '@dcloudio/uni-app'
import TopNav from '@/components/TopNav.vue'
import TabBar from '@/components/TabBar.vue'
import WishCard from '@/components/WishCard.vue'
import WishCardDetail from '@/components/WishCardDetail.vue'
import AddIconComponent from '@/components/AddIconComponent/AddIconComponent.vue'
import { getHomeWishList, setLike, removeLike } from '@/cloud-api/dynamic.js'

const currentTab = ref(0)
const currentNavIndex = ref(0)
const wishList = ref([])
const pageNum = ref(0)
const pageSize = 20
const hasMore = ref(true)
const loading = ref(false)

const showDetail = ref(false)
const selectedWish = ref({})

const handleCardClick = (item) => {
  selectedWish.value = item
  showDetail.value = true
}

const handleLike = async (item) => {
  try {
    if (item.isLiked) {
      await removeLike(item._id)
      item.isLiked = false
      item.likes = Math.max(0, item.likes - 1)
    } else {
      await setLike(item._id)
      item.isLiked = true
      item.likes++
    }
  } catch (e) {
    console.error('Like operation failed', e)
    uni.showToast({
      title: '操作失败',
      icon: 'none'
    })
  }
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

const loadData = async (reload = false) => {
  if (loading.value) return
  if (reload) {
    pageNum.value = 0
    hasMore.value = true
    wishList.value = []
  }
  if (!hasMore.value) return

  loading.value = true
  try {
    const res = await getHomeWishList({ pageNum: pageNum.value, pageSize })
    if (res.data && res.data.length < pageSize) {
      hasMore.value = false
    }
    const data = res.data
	
    const formattedList = data.map(item => ({
      ...item,
      id: item._id,
      likes: item.like_count || 0,
      // user info mapping
      user: {
        nickname: item.user?.nickname || 'Unknown',
        avatar: item.user?.avatar_file?.url || '/static/default-avatar.png'
      },
      createTime: formatTime(item.publish_date)
    }))
    
    if (reload) {
      wishList.value = formattedList
    } else {
      wishList.value = [...wishList.value, ...formattedList]
    }
    
    pageNum.value++
  } catch (e) {
    console.error(e)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

onShow(() => {
  // uni.hideTabBar()
})

onHide(() => {
  // uni.showTabBar()
})

onMounted(() => {
  loadData(true)
})

onReachBottom(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.home-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.sticky-header {
  position: sticky;
  top: 44px; /* Height of TopNav */
  z-index: 90;
}

.content-area {
  flex: 1;
  padding: 16px;
}

.feed-list {
  display: flex;
  flex-direction: column;
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: #999;
}
</style>

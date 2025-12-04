<template>
  <div class="home-container">
    <!-- Background Gradient -->
    <div class="home-bg"></div>
        
    <div class="sticky-header">
      <TabBar 
        :tabs="['许愿卡', '还原卡']" 
        v-model="currentTab" 
      />
    </div>

    <div class="content-area">
      <!-- List -->
      <div class="feed-list" v-if="displayWishList.length > 0">
        <WishCard 
          v-for="item in displayWishList" 
          :key="item.id" 
          :data="item" 
          :showInteractions="true"
          @click="handleCardClick(item)"
          @like="handleLike(item)"
        />
      </div>
      <uni-load-more :status="loadStatus" v-if="displayWishList.length > 0"></uni-load-more>
      <div class="empty-state" v-if="loadStatus !== 'loading' && displayWishList.length === 0">
        暂无数据
      </div>
    </div>

    <AddIconComponent style="margin-right: 44rpx;"/>
    
    <WishCardDetail 
      v-model:visible="showDetail" 
      :wishData="selectedWish"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { onShow, onHide, onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app'
import TopNav from '@/components/TopNav.vue'
import TabBar from '@/components/TabBar.vue'
import WishCard from '@/components/WishCard.vue'
import WishCardDetail from '@/components/WishCardDetail.vue'
import AddIconComponent from '@/components/AddIconComponent/AddIconComponent.vue'
import Loading from '@/components/Loading/index.vue'
import { getHomeWishList, setLike, removeLike } from '@/cloud-api/dynamic.js'
import { store } from '@/uni_modules/uni-id-pages/common/store.js'

const currentTab = ref(0)
const currentNavIndex = ref(0)
const wishList = ref([])
const userLikes = ref({}) // Store user like status separately: { id: boolean }
const pageNum = ref(0)
const pageSize = 20
const loadStatus = ref('more')

const showDetail = ref(false)
const selectedWish = ref({})

// Computed list merging wishList and userLikes
const displayWishList = computed(() => {
  return wishList.value.map(item => ({
    ...item,
    isLiked: !!userLikes.value[item.id]
  }))
})

watch(currentTab, () => {
  loadData(true)
})

watch(() => store.hasLogin, (newVal) => {
  if (newVal) {
    // If logged in, fetch like status for existing list

  } else {
    // If logged out, clear like status
    userLikes.value = {}
  }
})

const handleCardClick = (item) => {
  selectedWish.value = item
  showDetail.value = true
}

const handleLike = async (item) => {
  if (!store.hasLogin) {
    uni.navigateTo({
      url: '/uni_modules/uni-id-pages/pages/login/login-withoutpwd'
    })
    return
  }
  
  // Optimistic update
  const originalStatus = userLikes.value[item.id]
  const isLiked = !originalStatus
  userLikes.value = { ...userLikes.value, [item.id]: isLiked }
  
  // Update count in wishList
  const wishItem = wishList.value.find(w => w.id === item.id)
  if (wishItem) {
    wishItem.likes = isLiked ? wishItem.likes + 1 : Math.max(0, wishItem.likes - 1)
  }

  try {
    if (originalStatus) {
      await removeLike(item._id)
    } else {
      await setLike(item._id)
    }
  } catch (e) {
    console.error('Like operation failed', e)
    // Revert on failure
    userLikes.value = { ...userLikes.value, [item.id]: originalStatus }
    if (wishItem) {
      wishItem.likes = originalStatus ? wishItem.likes + 1 : Math.max(0, wishItem.likes - 1)
    }
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
  if (loadStatus.value === 'loading') return
  if (reload) {
    pageNum.value = 0
    loadStatus.value = 'more'
    wishList.value = []
    userLikes.value = {}
  }
  if (loadStatus.value === 'noMore') return

  loadStatus.value = 'loading'
  try {
    // Always fetch with checkLikeStatus: false (Unconditional total count)
    const res = await getHomeWishList({ 
      pageNum: pageNum.value, 
      pageSize,
      checkLikeStatus: false,
      sort: 0,
      fullfilled: currentTab.value === 1
    })
    
    const data = res.data || []
    
    if (data.length < pageSize) {
      loadStatus.value = 'noMore'
    } else {
      loadStatus.value = 'more'
    }
	
    const formattedList = data.map(item => ({
      ...item,
      id: item._id,
      likes: item.like_count || 0,
      // user info mapping
      user: {
        nickname: item.user?.nickname || 'Unknown',
        avatar: item.user?.avatar_file?.url || '/static/imgs/d-avatar-150.png'
      },
      createTime: formatTime(item.publish_date),
      // Backup original content for detail view
      original_content: item.content,
      // Display logic: show fullfill_content if fulfilled
      content: item.fullfilled && item.fullfill_content ? item.fullfill_content : item.content
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
    loadStatus.value = 'more'
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

onPullDownRefresh(() => {
  loadData(true).finally(() => {
    uni.stopPullDownRefresh()
  })
})
</script>

<style lang="scss" scoped>
.home-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
  position: relative;
}

.home-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: #f6f6f6;
  z-index: 0;
  opacity: 0.9;
}

.sticky-header {
  position: relative;
  z-index: 90;
  margin-top: 20rpx;
  /* #ifdef MP-WEIXIN */
  margin-top: 0;
  padding-top: calc(80rpx + env(safe-area-inset-top));
  /* #endif */
  padding-left: 16px;
  padding-right: 16px;
}

.content-area {
  flex: 1;
  padding: 16px;
  z-index: 1;
}

.feed-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>

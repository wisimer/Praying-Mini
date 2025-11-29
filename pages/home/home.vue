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
        />
      </div>
      <div class="loading-state" v-else>
        Loading...
      </div>
    </div>

    <!-- <BottomNav v-model="currentNavIndex" /> -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onShow, onHide } from '@dcloudio/uni-app'
import TopNav from '@/components/TopNav.vue'
import TabBar from '@/components/TabBar.vue'
import WishCard from '@/components/WishCard.vue'
import BottomNav from '@/components/BottomNav.vue'
import mockData from '@/assets/mock/wishData.json'

const currentTab = ref(0)
const currentNavIndex = ref(0)
const wishList = ref([])

onShow(() => {
  // uni.hideTabBar()
})

onHide(() => {
  // uni.showTabBar()
})

onMounted(() => {
  // Simulate API call
  setTimeout(() => {
    wishList.value = mockData
  }, 500)
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

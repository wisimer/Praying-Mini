<template>
	<view class="share-page">
    <!-- Background Gradient -->
    <div class="page-bg"></div>

		<view class="hread-box">
			<view class="hread">
				<view class="menu-scroll">
          <view class="menu" :class="index === menuIndex ? ' menu-ac' : ''" v-for="(item,index) in menus" :key="item.id"
            @click="changeMenu(index)">
            {{item.name}}
          </view>
        </view>
			</view>
		</view>
    
		<view class="content-area">
			<view class="card-wrapper" v-for="item in shares" :key="item.id">
				<DynamicCard :user-info="item.user_id[0]" :dynamic-detail="item" :isDetails="true"></DynamicCard>
			</view>
      <Loading :visible="loading" />
			<Empty v-if="!loading && shares.length === 0"></Empty>
		</view>

    <AddIconComponent style="margin-right: 24rpx;"/>
	</view>
</template>

<script setup>
	import { ref } from 'vue'
	import { onLoad, onReachBottom, onShow, onPullDownRefresh } from '@dcloudio/uni-app'
	import { toNextPage } from '@/core/app.js'
	import { getDynamicListAggregate } from '@/cloud-api/dynamic.js'
	import DynamicCard from '@/components/Dynamic-card/index.vue'
	import Empty from '@/components/Empty/index.vue'
	import AddIconComponent from '@/components/AddIconComponent/AddIconComponent.vue'
  import Loading from '@/components/Loading/index.vue'

  onShow(() => {
    // uni.hideTabBar()
  })

	const menuIndex = ref(0)

	const menus = ref([{
		id: 0,
		name: '全部'
	}, {
		id: 1,
		name: '动态'
	}, {
		id: 2,
		name: '问答'
	}, {
		id: 3,
		name: '种草'
	}, {
		id: 4,
		name: '送养'
	}, {
		id: 5,
		name: '服务'
	}])


	const shares = ref([])
	const pageNum = ref(0)
	const isQuery = ref(true)
  const loading = ref(false)

	const changeMenu = (index) => {
		menuIndex.value = index
		pageNum.value = 0
		isQuery.value = true
		shares.value = []
		init()
	}


	const init = () => {
    loading.value = true
		return getDynamicListAggregate({
			pageNum: pageNum.value,
			state: menuIndex.value
		}).then(result => {
			if (result.data.length === 0) {
				isQuery.value = false
			}
			const arr = result.data.map(val => {
				val.imgs = val.imgs ? val.imgs.split(',') : []
				return val
			})
			shares.value = [...shares.value, ...arr]
		}).finally(() => {
      loading.value = false
    })
	}

	onLoad(() => {
		init()
	})

	onReachBottom(() => {
		if (isQuery.value) {
			pageNum.value += 1
			init()
		}
	})

	onPullDownRefresh(() => {
		pageNum.value = 0
		isQuery.value = true
		shares.value = []
		init().finally(() => {
			uni.stopPullDownRefresh()
		})
	})
</script>

<style lang="scss" scoped>
.share-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  position: relative;
}

.page-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: #f6f6f6;
  z-index: 0;
  opacity: 0.8;
}

.hread-box {
  height: 120rpx;
  /* #ifdef MP-WEIXIN */
  height: 180rpx;
  /* #endif */
  padding-top: env(safe-area-inset-top);
  position: relative;
  z-index: 10;
}

.hread {
  width: 100%;
  padding: 20rpx 30rpx;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 99;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding-top: calc(20rpx + env(safe-area-inset-top));
  /* #ifdef MP-WEIXIN */
  padding-top: calc(80rpx + env(safe-area-inset-top));
  /* #endif */
  
  .menu-scroll {
    display: flex;
    align-items: center;
    justify-content: space-between;
    overflow-x: auto;
    white-space: nowrap;
    
    &::-webkit-scrollbar {
      display: none;
    }
  }

  .menu {
    font-size: 30rpx;
    color: #727272;
    padding: 10rpx 20rpx;
    border-radius: 30rpx;
    transition: all 0.3s;
    font-weight: 500;
    opacity: 0.8;
  }

  .menu-ac {
    color: #333;
    background-color: #fff;
    font-weight: bold;
    opacity: 1;
    box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
  }
}

.content-area {
  padding: 32rpx;
  padding-top: calc(30rpx + env(safe-area-inset-top));
  position: relative;
  z-index: 1;
  
  .card-wrapper {
    margin-bottom: 24rpx;
    border-radius: 24rpx;
    box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
    transition: transform 0.2s;
    
    &:active {
      transform: scale(0.99);
    }
  }
}
</style>

<template>
	<view>
		<view class="hread-box">
			<view class="hread">
				<view class="menu" :class="index === menuIndex ? ' menu-ac' : ''" v-for="(item,index) in menus" :key="item.id"
					@click="changeMenu(index)">
					{{item.name}}
				</view>
			</view>
		</view>
		<view class="padding32" style="padding-top: 0;">
			<view class="margin-b24" v-for="item in shares" :key="item.id">
				<DynamicCard :user-info="item.user_id[0]" :dynamic-detail="item" :isDetails="true"></DynamicCard>
			</view>
			<Empty v-if="shares.length === 0"></Empty>
		</view>

		<view class="addicon" @click="toNextPage('/subShare/add-dynamic/add-dynamic')">
			<image class="icon" src="https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/addicon.png">
			</image>
		</view>
    
    <!-- <BottomNav :modelValue="1" /> -->
	</view>
</template>

<script setup>
	import { ref } from 'vue'
	import { onLoad, onReachBottom, onShow } from '@dcloudio/uni-app'
	import { toNextPage } from '@/core/app.js'
	import { getDynamicListAggregate } from '@/cloud-api/dynamic.js'
	import DynamicCard from '@/components/Dynamic-card/index.vue'
	import Empty from '@/components/Empty/index.vue'
  import BottomNav from '@/components/BottomNav.vue'

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

	const changeMenu = (index) => {
		menuIndex.value = index
		pageNum.value = 0
		isQuery.value = true
		shares.value = []
		init()
	}


	const init = () => {
		getDynamicListAggregate({
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
</script>

<style lang="scss" scoped>
	.hread-box {
		height: 352rpx;
	}

	.hread {
		width: 750rpx;
		height: 352rpx;
		background-image: url('https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/chongquan.png');
		background-size: 100% 100%;
		padding: 40rpx 30rpx;
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 9;

		.menu {
			font-size: 32rpx;
			color: #8C8888;
		}

		.menu-ac {
			color: #000000;
			position: relative;
		}

		.menu-ac::after {
			content: ' ';
			width: 60rpx;
			height: 12rpx;
			background-image: url('../../static/icon/zhishiqi.png');
			background-size: 100% 100%;
			position: absolute;
			left: 50%;
			transform: translateX(-50%);
			bottom: -15rpx;
		}
	}

	.addicon {
		width: 80rpx;
		height: 80rpx;
		background-color: #AFC272;
		border-radius: 50%;
		position: fixed;
		right: 30rpx;
		bottom: 130rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.icon {
		width: 26rpx;
		height: 26rpx;
	}
</style>
<template>
	<view>
		<view class="hread-box">
			<view class="hread">
				<view class="menu" v-for="(item,index) in menus" :key="item.id" @click="setSate(item)">
					<image class="icon" :src="item.icon" mode="">
					</image>
					<text>{{item.name}}</text>
					<view class="print-num" v-if="item.num>0">
						{{item.num}}
					</view>
				</view>
			</view>
		</view>
		<view class="padding40">
			<view class="flex align-center margin-b40" v-for="item in userList" :key="item._id" @click="toRoom(item)">
				<image class="avatar" :src="item.avatar"></image>
				<view class="">
					<view class="margin-b10  color-352926 font-size30" style="position: relative;">
						<text>{{item.name}}</text>
					</view>
					<view class="color-8C8888 font-size26">
						{{item.last_msg ? `主人${formatTimeDifference(item.last_msg)}没有陪我玩了` : '主人快来陪我玩~'}}
					</view>
				</view>
				<!-- <view class="marginlauto color-B3B3B3 font-size26">
					设置
				</view> -->
			</view>
			<view class="addbtn" @click="toNextPage('/subWode/add-pet/add-pet')" v-if="isHavePet">
				添加爱宠
			</view>
		</view>


	</view>
</template>

<script setup>
	import { ref, computed } from 'vue'
	import { onLoad } from '@dcloudio/uni-app'
	import { getRooms, getPetList } from '@/cloud-api/index.js'
	import { showLoading, toNextPage } from '@/core/app.js'
	import { store } from '@/uni_modules/uni-id-pages/common/store'
	import { formatDate } from '@/utils/date.js'
	import { BASE_URL_AVATAR } from '@/core/config.js'
	import { formatTimeDifference } from '@/utils/date.js'
	import Empty from '@/components/Empty/index.vue'

	const menuIndex = ref(0)

	const menus = ref([{
		id: 1,
		num: 0,
		name: '点赞收藏',
		icon: 'https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/shoucang.png',
		url: '/subMessage/collection/collection'
	}, {
		id: 2,
		num: 0,
		name: '关注',
		icon: 'https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/guanzhu.png',
		url: '/subMessage/follow/follow'
	}, {
		id: 3,
		num: Number(getApp().globalData.comments),
		name: '评论消息',
		icon: 'https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/pinglun.png',
		url: '/subMessage/system-msg/system-msg'
	}])

	const userList = ref([])
	const isHavePet = ref(false)

	const initPet = () => {
		getPetList().then(res => {
			isHavePet.value = res.count === 0
			userList.value = res.data
		})
	}
	onLoad(() => {
		initPet()
		uni.$on('addpet', () => {
			initPet()
		})
	})

	const toRoom = (item) => {

		toNextPage(
			`/subHome/chat-room/chat-room?name=${item.name}&pet_id=${item._id}&avatar=${item.avatar}&breed=${item.breed}`
		)
	}

	const setSate = (item) => {
		if (item.id === 3) {
			uni.removeTabBarBadge({
				index: 2,
			})
			menus.value[2].num = 0
		}
		toNextPage(item.url)
	}
</script>

<style lang="scss" scoped>
	.hread-box {
		height: 352rpx;
	}

	.hread {
		width: 750rpx;
		height: 352rpx;
		background-image: url('https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/xiaoxi.png');
		background-size: 100% 100%;
		padding: 0 30rpx;
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 9;

		.menu {
			width: 218rpx;
			height: 114rpx;
			background: #E5EDCB;
			border-radius: 24rpx;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			font-size: 24rpx;
			color: #352926;
			font-weight: bold;
			position: relative;

			.icon {
				width: 50rpx;
				height: 50rpx;
				margin-bottom: 8rpx;
			}
		}
	}

	.avatar {
		width: 100rpx;
		height: 100rpx;
		margin-right: 20rpx;
		border-radius: 50%;
	}

	.print {
		width: 15rpx;
		height: 15rpx;
		background-color: red;
		border-radius: 50%;
		position: absolute;
		right: -30rpx;
		top: 0;
	}

	.print-num {
		width: 38rpx;
		height: 38rpx;
		background-color: red;
		border-radius: 50%;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 22rpx;
		position: absolute;
		right: -11rpx;
		top: -11rpx;
	}

	.addbtn {
		width: 202rpx;
		height: 60rpx;
		line-height: 60rpx;
		text-align: center;
		background: #afc272;
		border-radius: 62rpx;
		font-size: 28rpx;
		color: #ffffff;
		margin: 150rpx auto;
	}
</style>
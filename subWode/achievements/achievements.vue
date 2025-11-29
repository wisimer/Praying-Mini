<template>
	<view>
		<view class="hread">
			<cuNavbar bgColor="transparent" :fixed="false"></cuNavbar>
		</view>
		<view class="padding30 content">
			<view class="title-bg font-size36 font-weight">
				我的成就
			</view>
			<view class="ach-box margin-b30">
				<view class="ach-item" v-for="item in haveAcquired" :key="item._id" @click="change(item)">
					<image class="icon" :src="item.icon" mode=""></image>
					<view class="font-size28 margin-b10 font-weight"> {{item.name}} </view>
					<view class="color-8C8888 font-size22"> {{item.describe}}</view>
					<view class="time ">
						{{formatDate(item.create_date,'YYYY-MM-DD')}}
					</view>
				</view>
			</view>
			<view class="title-bg font-size36 font-weight">
				尚未获得
			</view>
			<view class="ach-box">
				<view class="ach-item" style="border-color: #E3E3E3;" v-for="item in allAchievement" :key="item._id">
					<image class="icon" style="filter: grayscale(100%);" :src="item.icon" mode=""></image>
					<view class="font-size28 margin-b10 color-8C8888 font-weight"> {{item.name}} </view>
					<view class=" font-size22" style="color: #B4B4B4;"> {{item.describe}}</view>
					<view class="time gray">
						尚未获得
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { onLoad } from '@dcloudio/uni-app'
	import { ref } from 'vue'
	import { changeAchievement, getUserAchievement } from '@/cloud-api/index.js'
	import { formatDate } from '@/utils/date.js'
	import { showLoading, showModal, showToast } from '../../core/app'
	import cuNavbar from '@/components/cu-navbar/cu-navbar.vue'

	const haveAcquired = ref([])
	const allAchievement = ref([])

	onLoad(() => {
		getUserAchievement().then(res => {
			const arr1 = res[0].data
			const arr2 = res[1].data
			const all = []
			const have = []
			arr1.map(val => {
				const index = arr2.findIndex(ele => ele.achievement_id === val._id)
				if (index > -1) {
					val.create_date = arr2[index].create_date
					have.push(val)
				} else {
					all.push(val)
				}
			})
			allAchievement.value = all
			haveAcquired.value = have
		})
	})

	const change = (item) => {

		showModal({ content: '是否切换显示的成就？' }).then(() => {
			showLoading()
			changeAchievement(item._id).finally(() => {
				uni.hideLoading()
				showToast('已切换')
				uni.$emit('changeAchievement', item)
			})
		})
	}
</script>

<style lang="scss" scoped>
	.hread {
		width: 750rpx;
		height: 542rpx;
		background-image: url('https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/chengjiu.png');
		background-size: 100% 100%;
	}

	.content {
		margin-top: -150rpx;
	}

	.title-bg {
		width: 270rpx;
		height: 34rpx;
		line-height: 34rpx;
		text-align: center;
		background-image: url('https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/titlebg.png');
		background-size: 100% 100%;
		margin: 0 auto;
		margin-bottom: 36rpx;
	}

	.ach-box {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20rpx;

		.ach-item {
			width: 216rpx;
			height: 284rpx;
			background: #FFFFFF;
			border-radius: 24rpx;
			border: 1px solid #775047;
			display: flex;
			justify-content: center;
			align-items: center;
			flex-direction: column;
			position: relative;
			overflow: hidden;

			.icon {
				width: 116rpx;
				height: 116rpx;
				margin-bottom: 14rpx;
				margin-top: 30rpx;
			}

			.time {
				position: absolute;
				top: 0;
				right: 0;
				width: 136rpx;
				height: 34rpx;
				background: #F5F8EB;
				border-bottom-left-radius: 24rpx;
				font-size: 20rpx;
				color: #AFC272;
				line-height: 34rpx;
				text-align: center;
			}
		}
	}

	.chroma {}

	.gray {
		background-color: #F3F3F3 !important;
		color: #BFBFBF !important;
	}
</style>
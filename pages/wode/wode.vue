<template>
	<view>
		<view class="hread">
			<image class="hi" src="https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/hi.png">
			</image>
			<view class="flex align-center margin-b40">
				<image class="avatar" :src="store.hasLogin ? store.userInfo.avatar_file.url :BASE_URL_AVATAR"></image>
				<view class="margin-l20">
					<view class="font-size30 margin-b10 color-352926"> {{store.userInfo?.nickname || '未登录'}} </view>
					<view class="flex">
						<view class="chenghao" v-if="store.hasLogin"> {{ defachievement || '未登录' }} </view>
					</view>
				</view>
				<image v-if="store.hasLogin" class="marginlauto bianji"
					@click="toNextPage('/uni_modules/uni-id-pages/pages/userinfo/userinfo')"
					src="https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/bianji.png">
				</image>
			</view>
			<view class="flex">
				<view class="margin-r40 flex align-center">
					<text class="margin-r10 font-size22 color-8C8888">日常记录</text>
					<text class="font-size26 font-weight">{{recordNumber}}次</text>
				</view>
				<view class="margin-r40  flex align-center">
					<text class="margin-r10 font-size22 color-8C8888">总花销</text>
					<text class="font-size26 font-weight">{{totalMoney}}元</text>
				</view>
				<view class=" flex align-center">
					<text class="margin-r10 font-size22 color-8C8888">罐头</text>
					<text class="font-size26 font-weight">{{can}}</text>
				</view>
			</view>

		</view>
		<view class="content">
			<view class="muens">
				<image class="img" @click="toNextPage(`/subHome/personal/personal?user_id=${store.userInfo._id}`)"
					src="https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/wodezhuye.png">
				</image>
				<image class="img" @click="toNextPage('/subWode/pet-manage/pet-manage')"
					src="https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/chongwuguanli.png" mode="">
				</image>
				<image class="img" @click="toNextPage('/subWode/leave-message/leave-message')"
					src="https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/pifuguanli.png" mode="">
				</image>
			</view>
			<view class="flex justify-between align-center margin-b20">
				<view class="font-size32 font-weight">成就墙</view>
				<view class="font-size24 color-8C8888" @click="toNextPage('/subWode/achievements/achievements')">更多 >
				</view>
			</view>
			<view class="chengjiu margin-b40" v-if="achievements.length > 0">
				<view class="flex flex-direction align-center" v-for="item in achievements" :key="item._id"
					@click="setAchievement(item)">
					<image class="c-img" :src="item.achievement_id[0].icon" mode="">
					</image>
					<text class="font-size22 font-weight">{{item.achievement_id[0].name}}</text>
				</view>
			</view>
			<view class="tiaozhan margin-b40" v-if="achievements.length === 0">
				<Empty></Empty>
			</view>
			<view class="flex justify-between align-center margin-b20">
				<view class="font-size32 font-weight">月挑战</view>
				<!-- <view class="font-size24 color-8C8888" @click="toNextPage('/subWode/challenge-success/challenge-success')">更多 >
				</view> -->
			</view>
			<view class="chengjiu margin-b40" v-if="tiaozhan.length > 0">
				<view class="flex flex-direction align-center" v-for="item in tiaozhan" :key="item._id">
					<image class="tiaozhan-img" :src="item.challenge_id[0].award_icon">
					</image>
					<text class="font-size22 font-weight">{{item.challenge_id[0].name}}</text>
				</view>
			</view>
			<view class="tiaozhan" v-if="tiaozhan.length === 0">
				<Empty></Empty>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { onLoad, onShow } from '@dcloudio/uni-app'
	import { ref } from 'vue'
	import { getWodePage, changeAchievement } from '@/cloud-api/index.js'
	import { toNextPage, showLoading, showModal, showToast } from '@/core/app.js'
	import { BASE_URL_AVATAR } from '@/core/config.js'
	import { store } from '@/uni_modules/uni-id-pages/common/store'
	import Empty from '@/components/Empty/index.vue'

  onShow(() => {
    // uni.hideTabBar()
  })

	const achievements = ref([])
	const defachievement = ref('')
	const can = ref(0)
	const totalMoney = ref(0)
	const recordNumber = ref(0)
	const tiaozhan = ref([])

	const initData = () => {
		getWodePage().then(datalist => {
			achievements.value = datalist[0].data || []
			defachievement.value = datalist[1].data.achievement_id[0].name || ''
			can.value = datalist[1].data.can || 0
			recordNumber.value = datalist[2].count || 0
			tiaozhan.value = datalist[3].data || []
		}).finally(() => {
			uni.hideLoading()
		})
	}

	const initTotalMoney = () => {
		const calculateMoney = uniCloud.importObject('calculate-money', { customUI: true })
		calculateMoney.getTotalMoney().then(res => {
			totalMoney.value = res.totalMoney
		})
	}

	onLoad(() => {
		showLoading()
		initData()
		initTotalMoney()
		uni.$on('saveRecord', () => {
			initData()
			initTotalMoney()
		})

		uni.$on('changeAchievement', data => {
			defachievement.value = data.name
		})
	})



	const setAchievement = (item) => {
		showModal({
			content: '是否切换显示的成就？'
		}).then(() => {
			showLoading()
			changeAchievement(item.achievement_id[0]._id).then(() => {
				console.log(item.achievement_id[0].name)
				defachievement.value = item.achievement_id[0].name
				uni.hideLoading()
				showToast('已切换')
			})
		})
	}
</script>

<style lang="scss" scoped>
	.hread {
		width: 750rpx;
		height: 478rpx;
		background-image: url('https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/wodebg.png');
		background-size: 100% 100%;
		padding: 0 30rpx;

		.hi {
			width: 260rpx;
			height: 174rpx;
			margin-bottom: 50rpx;
		}

		.avatar {
			width: 112rpx;
			height: 112rpx;
			border-radius: 50%;
		}

		.bianji {
			width: 60rpx;
			height: 60rpx;
		}

		.chenghao {
			height: 42rpx;
			line-height: 42rpx;
			background: #F5F8EB;
			border-radius: 12rpx;
			padding: 0 20rpx;
			font-size: 22rpx;
			color: #AFC272;
		}

	}

	.content {
		background-color: #F7F5F6;
		border-top-right-radius: 40rpx;
		border-top-left-radius: 40rpx;
		margin-top: -30rpx;
		padding: 40rpx 30rpx;

		.muens {
			display: flex;
			justify-content: space-between;
			margin-bottom: 40rpx;

			.img {
				width: 210rpx;
				height: 148rpx;
			}
		}

		.chengjiu {
			background: #FFFFFF;
			border-radius: 24rpx;
			padding: 30rpx;
			display: grid;
			grid-template-columns: repeat(4, 1fr);
			gap: 30rpx;

			.c-img {
				width: 116rpx;
				height: 116rpx;
				margin-bottom: 15rpx;
			}

			.tiaozhan-img {
				width: 106rpx;
				height: 90rpx;
				margin-bottom: 10rpx;
			}
		}

		.tiaozhan {
			background: #FFFFFF;
			border-radius: 24rpx;
			padding: 30rpx;
		}
	}
</style>
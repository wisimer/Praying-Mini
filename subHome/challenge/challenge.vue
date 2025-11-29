<template>
	<view>
		<cuNavbar :bgColor="challenge.nav_color">
			<template #content>
				<view class="font-size32 color-352926 font-weight">
					本月挑战
				</view>
			</template>
		</cuNavbar>
		<view class="hread-box">
			<view class="hread">
				<view class="description flex align-center">
					<view class="moth">
						{{challenge.month ? challenge.month.charAt(6,1):''}}月
					</view>
					<view class="">
						<view class="d-title">{{challenge.name}}</view>
						<view class="d-days flex align-center">
							<view class="d-days">剩余:{{dateNum}}天</view>
							<view class="state">进行中</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="padding30 conent">
			<view class="flex justify-between align-center margin-b24">
				<view class="font-size32 font-weight color-352926">挑战详情</view>
				<view class="font-size24 color-8C8888" @click="toNextPage('/subHome/explain/explain')">挑战说明</view>
			</view>
			<view class="c-card margin-b32">
				<view class="border-bottom padding-b20 flex">
					<view class="margin-r30"> 挑战目标 </view>
					<view class="color-352926"> 对Boss造成{{challenge.damage}}点伤害 </view>
				</view>
				<view class="border-bottom padding-tb20 flex">
					<view class="margin-r30"> 奖励罐头 </view>
					<view class="color-352926">
						{{ challenge.award_num > 0 ? `${challenge.award_num}个罐头` : '无' }}
					</view>
				</view>
				<view class="flex align-center padding-tb20" :class="isJoin ? 'border-bottom padding-b20' :''">
					<view class="margin-r30"> 奖励徽章 </view>
					<image :src="challenge.award_icon" class="award_icon margin-r16"></image>
				</view>

				<view class="addbtn flex justify-center align-center margin-t30" v-if="!isJoin" @click="add">
					<image class="addicon"
						src="https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/addicon.png">
					</image>
					<view class="color-ffffff font-weight margin-l10 font-size32">加入挑战</view>
				</view>
				<view class="margin-t20 flex" v-else>
					<view class="margin-r30"> 当前伤害 </view>
					<view class="color-352926"> {{nowChallenge}} </view>
				</view>
			</view>

			<view class="flex justify-between align-center margin-b24">
				<view class="font-size32 font-weight color-352926">伤害排行榜</view>
				<view class="font-size24 color-8C8888"
					@click="toNextPage('/subHome/user-harm/user-harm?damage='+challenge.damage)">查看全部</view>
			</view>

			<view class="c-card margin-b32">
				<view class="pro-item flex align-center margin-b50" v-for="(item,index) in userChallenge" :key="item._id"
					@click.stop="toNextPage(`/subHome/personal/personal?user_id=${item.user_id[0]._id}`)">
					<image :src="level[index]" class="level" v-if="index < 3"></image>
					<text class="num font-weight" v-else>{{index+1}}</text>
					<image class="d-avatar" :src="item.user_id[0].avatar_file.url" mode=""></image>
					<view class="flex-1">
						<view class="flex justify-between margin-b20">
							<text>{{item.user_id[0].nickname}}</text>
							<text>造成<text style="color: #54A263;">{{item.damage}}</text>点伤害</text>
						</view>
						<view class="progress">
							<view class="progress-a"
								:style="`width: ${Math.floor((Number(item.damage) / Number(challenge.damage)) * 100) > 100 ? 100 : Math.floor((Number(item.damage) / Number(challenge.damage)) * 100)}%;`">
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { ref, computed } from 'vue'
	import { onLoad } from '@dcloudio/uni-app'
	import { showLoading, toNextPage } from '@/core/app.js'
	import { addChallenge, getUserChallenge } from '@/cloud-api/index.js'
	import { daysUntilEndOfMonth } from '@/utils/date.js'
	import cuNavbar from '@/components/cu-navbar/cu-navbar.vue'

	const level = ['https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/one.png',
		'https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/two.png',
		'https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/three.png'
	]

	const challenge = ref({})
	const nowChallenge = ref(0)
	const isJoin = ref(false)
	const userChallenge = ref([])
	const dateNum = daysUntilEndOfMonth()

	const type = computed(() => {
		switch (challenge.value.award_type) {
			case 0:
				return `获取${challenge.value.award}罐头`;
			default:
				return `获取${challenge.value.award || ''}`;
		}
	})


	onLoad(({
		monthChallenge,
		isJoinChallenge
	}) => {
		challenge.value = JSON.parse(monthChallenge)
		console.log(challenge.value)
		if (isJoinChallenge !== -1) {
			const isJC = JSON.parse(isJoinChallenge)
			nowChallenge.value = isJC.damage || 0
			if (isJC.damage > -1) {
				isJoin.value = true
			}
		}

		showLoading()
		getUserChallenge().then(res => {
			userChallenge.value = res.data
		}).finally(() => {
			uni.hideLoading()
		})
	})

	const add = () => {
		showLoading()
		addChallenge().then(res => {
			isJoin.value = true
			uni.$emit('addChallenge')
		}).finally(() => {
			uni.hideLoading()
		})
	}
</script>

<style lang="scss" scoped>
	.hread-box {
		height: 428rpx;
	}

	.hread {
		width: 750rpx;
		height: 428rpx;
		background-image: url('https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/tiaozhan.png');
		background-size: 100% 100%;
		position: relative;
	}

	.description {
		width: 326rpx;
		background: #FDFAD7;
		border: 4rpx solid #775047;
		padding: 20rpx;
		border-left: none;
		border-top-right-radius: 20rpx;
		border-bottom-right-radius: 20rpx;
		position: absolute;
		left: 0;
		bottom: 40rpx;

		.moth {
			width: 70rpx;
			height: 70rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			background: #FB927A;
			border-radius: 12rpx;
			border: 4rpx solid #775047;
			font-size: 30rpx;
			color: #FFFFFF;
			margin-right: 20rpx;
		}

		.state {
			font-size: 20rpx;
			width: 72rpx;
			height: 28rpx;
			display: flex;
			justify-content: center;
			align-items: center;
			background: #ECE7B1;
			border-radius: 6rpx;
			color: #9B933D;
			margin-left: 12rpx;
		}

		.d-title {
			font-size: 30rpx;
			color: #775047;
			font-weight: bold;
			margin-bottom: 5rpx;
		}

		.d-days {
			font-size: 20rpx;
			color: #775047;
			font-weight: bold;
		}
	}

	.conent {
		background: #F7F5F6;
	}

	.addbtn {
		height: 90rpx;
		background: #FB927A;
		border-radius: 62rpx;
	}

	.addicon {
		width: 24rpx;
		height: 24rpx;
	}

	.level {
		width: 44rpx;
		height: 44rpx;
	}

	.num {
		width: 44rpx;
		height: 44rpx;
		line-height: 44rpx;
		text-align: center;
		font-size: 30rpx;
		color: #DCDBDB;
	}

	.pro-item:last-child {
		margin-bottom: 0;
	}

	.d-avatar {
		width: 76rpx;
		height: 76rpx;
		margin: 0 10px;
		border-radius: 50%;
	}

	.progress {
		height: 12rpx;
		background: #F7F5F6;
		border-radius: 24rpx;
		position: relative;
	}

	.progress-a {
		position: absolute;
		height: 12rpx;
		background: #C6D499;
		border-radius: 24rpx;
	}

	.award_icon {
		width: 106rpx;
		height: 90rpx;
	}
</style>
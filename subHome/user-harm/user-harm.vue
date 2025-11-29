<template>
	<view>
		<cuNavbar>
			<template #content>
				<view class="font-size36 color-352926 font-weight">排行榜</view>
			</template>
		</cuNavbar>

		<view class="padding32">
			<view class="c-card">
				<view class="pro-item flex align-center margin-b50" v-for="(item,index) in userChallenge" :key="item._id">
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
								:style="`width: ${Math.floor((Number(item.damage) / Number(challengeDamage)) * 100) > 100 ? 100 : Math.floor((Number(item.damage) / Number(challengeDamage)) * 100)}%;`">
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import cuNavbar from '@/components/cu-navbar/cu-navbar.vue'
	import { onLoad, onReachBottom } from '@dcloudio/uni-app'
	import { ref } from 'vue'
	import { showLoading } from '@/core/app.js'
	import { getUserChallenge } from '@/cloud-api/index.js'

	const level = ['https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/one.png',
		'https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/two.png',
		'https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/three.png'
	]
	const userChallenge = ref([])
	const challengeDamage = ref(0)
	const pageNum = ref(0)
	const count = ref(0)

	const init = () => {
		showLoading()
		getUserChallenge(pageNum.value, 30).then(res => {
			userChallenge.value = [...userChallenge.value, ...res.data]
			count.value = res.count
		}).finally(() => {
			uni.hideLoading()
		})
	}
	onLoad(({ damage }) => {
		challengeDamage.value = damage
		init()
	})

	onReachBottom(() => {
		if (userChallenge.value.length < count.value) {
			pageNum.value += 1
			init()
		}
	})
</script>

<style scoped>
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
</style>
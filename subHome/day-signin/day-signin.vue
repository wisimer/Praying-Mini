<template>
	<view>
		<view class="hread">
			<cuNavbar bgColor="transparent" :fixed="false">
				<template #content>
					<view class="font-size36 color-352926 font-weight">每日签到</view>
				</template>
			</cuNavbar>
			<div class="flex justify-center align-center" style="padding-top: 80rpx;">
				<image class="model" src="https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/petModal/modal1.png"
					mode=""></image>
			</div>

			<view class="content">
				<view class="flex justify-between align-center margin-b24">
					<view class="">
						<view class="font-size30 margin-b5 font-weight">
							签到领取罐头
						</view>
						<view class="font-size24 color-8C8888">
							已累计签到: {{total}}天
						</view>
					</view>
					<view class="color-8C8888 font-size24">
						当前罐头: {{canNum}}
					</view>
				</view>
				<view class="days">
					<view class="day-item " :class="index+1 < week ?'day-item-h':''" v-for="(item,index) in days" :key="item">
						<view class="font-size24 margin-b5">
							第{{index+1}}天
						</view>
						<view class="font-size24 color-775047 margin-b24">
							{{index+1 === 7 ? 50:10}}罐头
						</view>
						<image :src="isSignin(item,index).url" :class="isSignin(item,index).class"></image>
					</view>
				</view>
				<view class="liji" @click="signin">
					立即签到
				</view>
				<view class="font-size30 margin-b5 font-weight margin-b32">
					做任务领罐头
				</view>
				<view class="renwu  padding-b20 border-bottom margin-b20">
					<image src="https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/q-richang.png"
						class="icon">
					</image>
					<view class="">
						<view class="font-size28 margin-b5">日常记录(+10)</view>
						<view class="font-size24 color-8C8888">
							记录生活点滴，让每一天有迹可循
						</view>
					</view>
					<view class="zuo" @click="toNextPage('/subHome/add-record/add-record')">
						去记录
					</view>
				</view>
				<view class="renwu  padding-b20 border-bottom margin-b20">
					<image src="https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/q-huaxiao.png"
						class="icon">
					</image>
					<view @click="">
						<view class="font-size28 margin-b5">花销记录(+10)</view>
						<view class="font-size24 color-8C8888">
							轻松记账，管理你的每一笔消费
						</view>
					</view>
					<view class="zuo" @click="toNextPage('/subHome/add-expense/add-expense')">
						去记录
					</view>
				</view>
				<view class="renwu">
					<image src="https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/q-dongtai.png"
						class="icon">
					</image>
					<view class="">
						<view class="font-size28 margin-b5">发布动态(+20)</view>
						<view class="font-size24 color-8C8888">
							用镜头和文字记录每一个可爱瞬间
						</view>
					</view>
					<view class="zuo" @click="toNextPage('/subShare/add-dynamic/add-dynamic')">
						去发布
					</view>
				</view>
			</view>

		</view>
	</view>
</template>

<script setup>
	import { ref, computed } from 'vue'
	import { onLoad } from '@dcloudio/uni-app'
	import { addSignin, getWeekSignin, getSigninNum } from '@/cloud-api/index.js'
	import { formatDate, getWeekDates } from '@/utils/date.js'
	import { showLoading, showToast, toNextPage } from '@/core/app.js'
	import cuNavbar from '@/components/cu-navbar/cu-navbar.vue'

	const days = ref([])
	const signinList = ref([])
	const week = new Date().getDay();
	const canNum = ref(0)
	const total = ref(0)

	const init = () => {

		showLoading()
		getWeekSignin({ firstDay: days.value[0], lastDay: days.value[6] }).then(res => {
			signinList.value = res.data
		}).finally(() => {
			uni.hideLoading()
		})

		getSigninNum().then(res => {
			total.value = res.total
		})
	}

	onLoad(({ can }) => {
		canNum.value = Number(can)
		days.value = getWeekDates()
		init()
	})


	const isSignin = (date, index) => {
		const isSigIndex = signinList.value.findIndex(ele => date === ele.check_date)
		const reslut = {
			url: 'https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/guantou.png',
			class: 'guantou'
		}
		if (index + 1 < week) {
			if (isSigIndex === -1) {
				reslut.url = 'https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/weiqiandao.png'
				reslut.class = 'weiqiandao'
			} else {
				reslut.url = 'https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/qiandaoyes.png'
				reslut.class = 'yiqiandao'
			}
		} else if (index + 1 === week) {
			if (isSigIndex === -1) {
				reslut.url = 'https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/guantou.png'
				reslut.class = 'weiqiandao'
			} else {
				reslut.url = 'https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/qiandaoyes.png'
				reslut.class = 'yiqiandao'
			}
		} else {
			reslut.url = 'https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/guantou.png'
			reslut.class = 'guantou'
		}
		return reslut
	}

	const signin = () => {
		showLoading()
		addSignin({ check_date: formatDate(new Date(), 'YYYY-MM-DD') }).then(res => {
			const num = new Date().getDay() === 0 ? 50 : 10
			canNum.value += num
			uni.hideLoading()
			showToast('签到成功')
			init()
		}).catch(err => {
			showToast(err)
		})
	}
</script>

<style scoped>
	.hread {
		width: 750rpx;
		height: 812rpx;
		background-image: url('https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/qiandaobg.png');
		background-size: 100% 100%;
	}

	.model {
		width: 228rpx;
		height: 306rpx;
	}

	.content {
		background-color: white;
		margin-top: 20rpx;
		border-top-left-radius: 20rpx;
		border-top-right-radius: 20rpx;
		padding: 40rpx 32rpx;
	}

	.days {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 20rpx;
		margin-bottom: 24rpx;
	}


	.day-item {
		border-radius: 16rpx;
		background: #F2F8DD;
		display: flex;
		flex-direction: column;
		justify-content: center;
		border: 1px solid #AFC272;
		padding: 18rpx 16rpx;
	}

	.day-item:last-child {
		grid-column: 3 / span 2;
	}

	.guantou {
		width: 44rpx;
		height: 36rpx;
		margin-left: auto;
	}

	.liji {
		width: 456rpx;
		height: 96rpx;
		background: #AFC272;
		border-radius: 62rpx;
		margin: 0 auto;
		font-size: 30rpx;
		color: #FFFFFF;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 40rpx;
	}

	.icon {
		width: 86rpx;
		height: 86rpx;
		margin-right: 20rpx;
	}

	.renwu {
		display: flex;
		align-items: center;
	}

	.zuo {
		width: 150rpx;
		height: 68rpx;
		background: #AFC272;
		border-radius: 62rpx;
		font-size: 26rpx;
		color: #FFFFFF;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-left: auto;
	}

	.s-guantou {
		width: 30rpx;
		height: 32rpx;
		margin: 0 10rpx;
	}

	.day-item-h {
		background-color: white;
		opacity: 0.6;
	}

	.yiqiandao {
		width: 44rpx;
		height: 32rpx;
		margin-left: auto;
	}

	.weiqiandao {
		width: 36rpx;
		height: 36rpx;
		margin-left: auto;
	}
</style>
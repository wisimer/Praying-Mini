<template>
	<view>
		<cuNavbar>
			<template #content>
				<view class="font-size36 color-352926 font-weight">操作记录</view>
			</template>
		</cuNavbar>
		<view class="padding30">
			<view class="c-card">
				<view :class="index < actionList.length -1 ? 'padding-b20 border-bottom margin-b20' : ''"
					v-for=" (item,index) in actionList" :key="item._id">
					<view class="flex align-center ">
						<image src="@/static/icon/chuku.png" style="width: 50rpx;height: 50rpx;" v-if="item.action ===0"></image>
						<image src="@/static/icon/ruku.png" style="width: 50rpx;height: 50rpx;" v-if="item.action ===1"></image>
						<image src="@/static/icon/shanchu.png" style="width: 50rpx;height: 50rpx;" v-if="item.action ===2"></image>
						<view class="margin-l20">
							<view class="margin-b10 font-size28">
								{{item.stock_id[0].name}}
							</view>
							<view class="color-8C8888 font-size24">
								{{formatDate(item.create_date,'YYYY-MM-DD hh:mm')}}
							</view>

						</view>
						<view class="marginlauto">
							<view class="margin-b10 font-size28" style="text-align: right;">
								{{item.action === 1  ?'+':'-'}}{{item.num}}
							</view>
							<view class="color-8C8888 font-size24" style="text-align: right;">
								{{item.action === 0  ?'出库':item.action === 1 ? '入库':'丢弃' }}
							</view>
						</view>
					</view>
					<view class="color-8C8888 font-size24 remark-text margin-t20" v-if="item.remark">
						备注：{{item.remark}}
					</view>
				</view>
			</view>
		</view>

	</view>
</template>

<script setup>
	import { onLoad, onReachBottom } from '@dcloudio/uni-app'
	import { getStockAction } from '@/cloud-api/index.js'
	import { showLoading } from '@/core/app.js'
	import { formatDate } from '@/utils/date.js'
	import { ref, } from 'vue'
	import cuNavbar from '@/components/cu-navbar/cu-navbar.vue'

	const pageNum = ref(0)
	const actionList = ref([])
	const totel = ref(0)

	const initData = () => {
		showLoading()
		getStockAction(pageNum.value, 10).then(res => {
			actionList.value = [...actionList.value, ...res.data]
			totel.value = res.count
		}).finally(() => {
			uni.hideLoading()
		})
	}

	onLoad(() => {
		initData()
	})

	onReachBottom(() => {
		if (actionList.value.length < totel.value) {
			pageNum.value += 1
			initData()
		}
	})
</script>

<style scoped>
	.remark-text {
		margin-left: 80rpx;
	}

	.def-pet {
		position: absolute;
		top: 0;
		right: 0;
		height: 42rpx;
		padding: 0 20rpx;
		line-height: 42rpx;
		background: #F5F8EB;
		border-radius: 0px 0 0px 24rpx;
		text-align: center;
		font-size: 22rpx;
		color: #AFC272;
	}

	.info {
		padding: 24rpx 20rpx;
		background: #F7F5F6;
		border-radius: 16rpx;
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
	}

	.desc {
		width: 50%;
		display: flex;
		align-items: center;
	}
</style>
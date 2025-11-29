<template>
	<view>
		<cuNavbar>
			<template #content>
				<view class="font-size36 color-352926 font-weight">囤货收纳</view>
			</template>
		</cuNavbar>
		<view class="padding30">
			<view class="margin-b24 font-size32 font-weight color-352926">物品概览</view>
			<view class="c-card margin-b32">
				<view class="gailan">
					<view @click="toNextPage('/subHome/stock-list/stock-list?state=9')">
						<view class="text-align margin-b20 font-size26 color-8C8888">全部物品</view>
						<view class="text-align font-size32">{{stockCount}}</view>
					</view>
					<view v-for="(item,index) in goodState" :key="index"
						@click="toNextPage('/subHome/stock-list/stock-list?state='+item.id)">
						<view class="text-align margin-b20 font-size26 color-8C8888">{{item.name}}</view>
						<view class="text-align font-size32">{{item.num}}</view>
					</view>
				</view>
			</view>

			<view class="margin-b24 font-size32 font-weight color-352926">物品分布</view>
			<view class="c-card margin-b32" style="padding: 0;">
				<thingCharts v-if="chartData.series[0].data.length > 0" :chartData="chartData"></thingCharts>
				<view v-else class="padding-tb32">
					<Empty></Empty>
				</view>
			</view>

			<view class="flex justify-between align-center margin-b24">
				<view class="font-size32 font-weight color-352926">操作记录</view>
				<view class="font-size24 color-8C8888" @click="toNextPage('/subHome/action-stock/action-stock')">查看全部</view>
			</view>
			<view class="c-card">
				<view class="flex align-center"
					:class="index < actionList.length -1 ? 'padding-b20 border-bottom margin-b20' : ''"
					v-for="(item,index) in actionList" :key="item._id">
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
				<Empty v-if="actionList.length === 0"></Empty>
			</view>

		</view>

		<uni-popup ref="levelModal" safe-area>
			<view class="levelModal">
				<image src="https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/modal_bg.png"
					class="modal_bg"></image>
				<view class="flex flex-direction align-center model-content">
					<view class="color-8C8888 font-size28 margin-b10 ">
						亲爱的铲屎官
					</view>
					<view class="color-8C8888 font-size28 margin-b10">
						由于新版本临期提醒功能将通过
					</view>
					<view class="color-D55E64 font-size28 margin-b10 font-weight">
						公众号提醒
					</view>
					<view class="font-size28 color-8C8888 margin-b10">
						麻烦关注我们的公众号
					</view>
					<view class="color-D55E64 font-size28 margin-b10 font-weight">
						"宠物Cloud"
					</view>
					<view class="font-size28 color-8C8888 margin-b40">
						点击下方按钮即可一键关注
					</view>
					<view class="follow font-size28" @click="toNextPage('/subHome/follow-account/follow-account')">
						一键关注
					</view>
				</view>

			</view>
		</uni-popup>

		<FixedButton title="新增物品" @trigger="toNextPage('/subHome/add-stock/add-stock')"></FixedButton>
	</view>
</template>

<script setup>
	import { ref } from 'vue'
	import { getThingFen, getStockAction } from '@/cloud-api/index.js'
	import { showLoading, showToast, toNextPage } from '@/core/app.js'
	import { onLoad } from '@dcloudio/uni-app'
	import { formatDate } from '@/utils/date.js'
	import cuNavbar from '@/components/cu-navbar/cu-navbar.vue'
	import thingCharts from '@/subHome/thing-charts/index.vue'
	import FixedButton from '@/components/Fixed-button/index.vue'
	import Empty from '@/components/Empty/index.vue'

	const levelModal = ref(null)
	const goodState = ref([{
			name: '未过期',
			num: 0,
			id: 0
		},
		{
			name: '已过期',
			num: 0,
			id: 1
		},
		{
			name: '已临期',
			num: 0,
			id: 2
		},
		{
			name: '已用完',
			num: 0,
			id: 3
		},
		{
			name: '已丢弃',
			num: 0,
			id: 4
		}
	])

	const stockCount = ref(0)
	const actionList = ref([])

	const chartData = ref({
		series: [{
			data: []
		}]
	})

	const checkFollow = () => {
		const db = uniCloud.database()
		db.collection('uni-id-users').where('_id == $cloudEnv_uid').field('_id,nickname,wx_openid')
			.get({ getOne: true })
			.then(res => {
				const wx_openid = res.result.data.wx_openid
				if (!wx_openid || !wx_openid.h5) {
					levelModal.value.open()
				}
			})
	}

	const initData = () => {
		showLoading()
		getThingFen().then(res => {
			let num = 0
			const arr = res.data
			const dataList = []
			arr.map(ele => num += ele.count)
			stockCount.value = num

			const list = [0, 1, 2, 3, 4]
			const strs = ['未过期', '已过期', '已临期', '已用完', '已丢弃']
			const cValue = []

			arr.map(ele => {
				cValue.push({ name: strs[ele.state], value: ele.count })
			})
			chartData.value.series[0].data = cValue
		}).finally(() => {
			uni.hideLoading()
		})

		getStockAction(0, 50).then(res => {
			actionList.value = res.data
		})
	}

	onLoad(() => {
		initData()
		checkFollow()
		uni.$on('addThing', () => {
			initData()
		})

		uni.$on('isAction', () => {
			initData()
		})
	})
</script>

<style scoped>
	.gailan {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 45rpx 20rpx;
	}

	.levelModal {
		width: 70vw;
		background-color: white;
		border-radius: 20rpx;
	}

	.modal_bg {
		width: 100%;
		height: 400rpx;
		margin-top: -100rpx;
	}

	.follow {
		border-radius: 50rpx;
		color: white;
		background-color: #AFC272;
		padding: 10rpx 50rpx;
	}

	.model-content {
		position: relative;
		margin-top: -120rpx;
		padding: 30rpx;
		padding-bottom: 50rpx;
	}
</style>
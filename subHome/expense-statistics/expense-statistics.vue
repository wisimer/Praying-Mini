<template>
	<view>
		<cuNavbar>
			<template #content>
				<view class="font-size36 color-352926 font-weight">账单明细</view>
			</template>
		</cuNavbar>
		<view class="tabs-box">
			<view class="tabs">
				<picker mode="selector" :range="petList" range-key="name" class="tab-item" @change="petChange">
					{{petName.name}} <uni-icons type="down" size="14"></uni-icons>
				</picker>
				<!-- <picker mode="date" fields='month' class="tab-item" @change="monthChange">
					{{monthName}} <uni-icons type="down" size="14"></uni-icons>
				</picker> -->
				<picker mode="multiSelector" :range="dateSelect" class="tab-item" @change="monthChange" :value="dateSelectIndex"
					@columnchange="columnchange">
					{{monthName}} <uni-icons type="down" size="14"></uni-icons>
				</picker>
			</view>
		</view>

		<view class="padding20">
			<view class="card">
				<view class="flex align-center justify-center" style="height: 100%;" v-if="sorts.length === 0">
					<Empty></Empty>
				</view>
				<RingCharts style="margin-top: auto;" :chartData="chartData" :totalMoney="allMoney" v-else></RingCharts>
			</view>
			<view class="font-size32 color-352926 padding-lr10 margin-b20">分类统计</view>
			<view class="type-box">
				<view class="type-item flex align-center border-bottom margin-b20 padding-b20" v-for="(item,index) in sorts"
					:key="index" @click="toDel(item)">
					<image class="type-img" :src="item.icon" mode="">
					</image>
					<view class="font-size28 color-8C8888">{{item.name}}({{item.sort}})</view>
					<view class="marginlauto margin-r16 font-size28">
						{{item.preciseTotal}}({{item.percentage}})
					</view>
					<uni-icons type="right" size="12" color="#352926"></uni-icons>
				</view>
				<Empty v-if="sorts.length === 0"></Empty>
			</view>
		</view>

	</view>
</template>

<script setup>
	import { reactive, ref, computed } from 'vue';
	import { getPetList } from '@/cloud-api/index.js'
	import { onLoad } from '@dcloudio/uni-app'
	import { showLoading, toNextPage } from '@/core/app';
	import { sort } from '@/utils/tool.js'
	import { formatDate, getMonthBoundaries, getLast24Months, getLast3YearsChronological } from '@/utils/date.js'
	import cuNavbar from '@/components/cu-navbar/cu-navbar.vue'
	import RingCharts from '@/subHome/Ring-charts/index.vue'
	import Empty from '@/components/Empty/index.vue'


	const allMoney = ref(0)
	const pet_id = ref(0)
	const monthName = ref(formatDate(new Date(), 'YYYY-MM'))
	const sorts = ref([])
	const dateSelect = ref([
		["按月查询", "按年查询"],
		[...getLast24Months()]
	])

	const dateSelectIndex = ref([0, 23])
	const year = getLast3YearsChronological()
	const month = getLast24Months()
	const selectDate = ref(getMonthBoundaries(monthName.value))

	const petList = ref([{
		_id: 0,
		name: '全部'
	}])

	const chartData = ref({})


	const petName = computed(() => {
		const obj = petList.value.find(ele => ele._id === pet_id.value)
		return obj
	})

	const initData = () => {
		showLoading()
		const ops = {
			pet_id: pet_id.value,
			...selectDate.value
		}
		const calculateMoney = uniCloud.importObject('calculate-money', { customUI: true })
		calculateMoney.getSortMoney(ops).then(res => {
			const chatDataVlues = res.chatData.map(ele => {
				return {
					labelText: `${ele.preciseTotal}(${ele.percentage})`,
					name: ele.sort,
					value: ele.total
				}
			})
			chartData.value = {
				series: [{
					data: chatDataVlues
				}]
			}
			sorts.value = res.sortMoney
			allMoney.value = res.totalMoney
		}).finally(() => {
			uni.hideLoading()
		})
	}

	onLoad(() => {
		getPetList().then(res => {
			res.data.map(ele => {
				petList.value.push(ele)
			})
		})

		initData()
	})


	const petChange = (e) => {
		pet_id.value = petList.value[e.detail.value]._id
		initData()
	}

	const monthChange = (e) => {
		if (e.detail.value[0] === 0) {
			monthName.value = month[e.detail.value[1]]
			selectDate.value = getMonthBoundaries(month[e.detail.value[1]])
		} else {
			const nian = year[e.detail.value[1]]
			const date = {
				firstDay: `${nian}-01-01`,
				lastDay: `${nian}-12-31`
			}
			selectDate.value = date
			monthName.value = nian
		}

		initData()
	}

	const columnchange = (e) => {
		if (e.detail.column !== 0) return
		if (e.detail.value === 0) {
			dateSelect.value[1] = month
			dateSelectIndex.value = [0, 23]
		} else {
			dateSelect.value[1] = year
			dateSelectIndex.value = [1, 2]
		}
	}

	const toDel = (item) => {
		toNextPage(
			`/subHome/expense-detail/expense-detail?type_id=${item.type_id}&month=${monthName.value}&monthtype=${dateSelectIndex.value[0]}`
		)
	}
</script>

<style scoped>
	.tabs-box {
		height: 50rpx;
		margin-bottom: 20rpx;
	}

	.tabs {
		display: flex;
		background-color: #EDF5D5;
		position: fixed;
		left: 0;
		right: 0;
		z-index: 999;
	}

	.tab-item {
		width: 50%;
		text-align: center;
		padding-bottom: 16rpx;
		font-size: 14px;
		color: #352926;
	}


	.card {
		height: 554rpx;
		border-radius: 24rpx;
		background-image: url('https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/tongji.png');
		background-size: 100% 100%;
		margin-bottom: 52rpx;
	}

	.type-box {
		background: #FFFFFF;
		border-radius: 12px 12px 12px 12px;
		padding: 40rpx 32rpx;
	}

	.type-img {
		width: 56rpx;
		height: 56rpx;
		margin-right: 20rpx;
	}

	.type-item:last-child {
		margin-bottom: 0;
		border: none;
		padding-bottom: 0;
	}
</style>
<template>
	<view>
		<cuNavbar>
			<template #content>
				<view class="font-size36 color-352926 font-weight">明细记录</view>
			</template>
		</cuNavbar>

		<view class="tabs-box">
			<view class="tabs">

				<view class="tab-item" @click="screening">
					<span class="margin-r10">筛选</span>
					<uni-icons type="list" size="14"></uni-icons>
				</view>

				<picker mode="selector" :range="classify" class="tab-item" @change="sortChange">
					<text class="margin-r10">{{sort?sort:'分类'}}</text>
					<uni-icons type="down" size="14"></uni-icons>
				</picker>
			</view>
		</view>

		<view class="padding30">
			<view class="flex margin-b20" v-for="(item,index) in list" :key="item._id">
				<view class="margin-r20">
					<view class="print">
						<view class="s-print"></view>
					</view>
					<view class="line" v-if="index < list.length -1"></view>
				</view>
				<view class="flex-1">
					<view class="margin-b20 font-size28">
						{{item.record_date}} {{item.record_time}}
					</view>
					<view class="record-item margin-b20">
						<view class="flex align-center padding-b20 border-bottom margin-b20">
							<image class="touxiang" :src="item.petInfo[0].avatar" mode=""></image>
							<view class="font-size28">
								<text>{{item.petInfo[0].name}}</text>
								<text v-if="item.petInfo[0].state === 1" style="color: red;">（已删除）</text>
							</view>
							<!-- <view class="fenxi" v-if="item.typeInfo[0].name === '称体重'">
								体重分析
							</view> -->
							<view class="flex align-center marginlauto" @click="remove(item,index)">
								<image class="action margin-r10"
									src="https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/shanchu.png">
								</image>
								<text class="font-size24 color-8C8888">删除</text>
							</view>

							<view class="flex align-center margin-l20" @click="updateDel(item,index)">
								<image class="action margin-r10"
									src="https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/bianjipet.png">
								</image>
								<text class="font-size24 color-8C8888">编辑</text>
							</view>
						</view>
						<view class="flex flex-wrap">
							<view class="width50 font-size28">
								<text class="color-8C8888">记录类型：</text>
								<text>{{item.typeInfo[0].name}}</text>
							</view>
							<view class="width50 font-size28" v-if="item.typeInfo[0].name === '称体重'">
								<text class="color-8C8888">体重：</text>
								<text>{{item.weight}}kg</text>
							</view>
							<view class="width50 font-size28" v-if="item.typeInfo[0].name === '喝水'">
								<text class="color-8C8888">喝水量：</text>
								<text>{{item.water}}ml</text>
							</view>
						</view>
						<view class=" font-size28 margin-t20" v-if="item.remark">
							<text class="color-8C8888">备注：</text>
							<text>{{item.remark}}</text>
						</view>
						<view class="img-box" :class="item.imgs.length>0?'margin-t30':''">
							<image mode="aspectFill" class="imgs " @click="showPic(img,item.imgs)" v-for="(img,index) in item.imgs"
								:key="index" :src="`${img}?x-oss-process=image/resize,p_50`">
							</image>
						</view>
					</view>

				</view>
			</view>

		</view>


		<uni-popup ref="popup" type="right" background-color="#ffffff">
			<view class="popup-content">
				<view :style="[{height:CustomBar + 'px',}]"></view>
				<view class="color-352926 font-size30 margin-b30">选择宠物</view>
				<view class="flex margin-b30 flex-wrap" style="gap: 20rpx;">
					<view class="petitem" :class="petActivate === index ? 'active':''" style="padding: 12rpx 36rpx;"
						v-for="(item,index) in petList" :key="item._id" @click="choosePet(item,index)">{{item.name}}
					</view>
				</view>
				<view class="color-352926 font-size30 margin-b30">记录类型</view>
				<view style="	flex: 1;overflow: auto;">
					<view class="margin-b30  record-box">
						<view class="petitem" :class="typeActivate === index ? 'active':''" v-for="(item,index) in records"
							:key="item._id" @click="chooseType(item,index)">{{item.name}}
						</view>
					</view>
				</view>
				<view style="height: 76rpx;">
					<view class="btn-box">
						<view class="reset" @click="reset">
							重置
						</view>
						<view class="btn" @click="confirm">
							确认
						</view>
					</view>
				</view>
			</view>
		</uni-popup>

		<Empty v-if="list.length === 0"></Empty>
	</view>
</template>

<script setup>
	import { reactive, ref, computed } from 'vue';
	import { onLoad, onReachBottom } from '@dcloudio/uni-app'
	import { getPetList } from '@/cloud-api/index.js'
	import { getUserRecord, getRecordList, removeRecord } from '@/cloud-api/record.js'
	import { formatDate } from '@/utils/date.js'
	import cuNavbar from '@/components/cu-navbar/cu-navbar.vue'
	import Empty from '@/components/Empty/index.vue'
	import { showLoading, showModal, showToast, toNextPage } from '@/core/app';

	const list = ref([])
	const pageNum = ref(0)
	const total = ref(true)
	const pet_id = ref(null)
	const popup = ref(null)
	const CustomBar = ref(0)
	const records = ref([])
	const petActivate = ref(null)
	const typeActivate = ref(null)
	const type_id = ref(null)
	const petList = ref([])
	const classify = ref([])
	const sort = ref(null)

	uni.getSystemInfo({
		success: function(e) {
			// #ifdef H5
			CustomBar.value = 64 + 30;
			// #endif

			// #ifdef MP-WEIXIN
			let custom = wx.getMenuButtonBoundingClientRect();
			CustomBar.value = custom.bottom + custom.top;
			// #endif		
		}
	});

	const init = () => {
		showLoading()

		getUserRecord({
			pageNum: pageNum.value,
			is_daily: 0,
			typeId: type_id.value,
			petId: pet_id.value,
			sort: sort.value
		}).then(res => {
			if (res.data.length === 0) {
				total.value = false
			}
			const arr = res.data.map(val => {
				val.imgs = val.imgs ? val.imgs.split(',') : []
				return val
			})
			list.value = [...list.value, ...arr]
			uni.hideLoading()
		})
	}

	onLoad(() => {
		init()
		getPetList().then(res => {
			petList.value = res.data
		})
		getRecordList(0).then(res => {
			records.value = res.data
			const fenlei = new Set()
			res.data.map(ele => {
				fenlei.add(ele.sort)
			})
			classify.value = ['全部', ...fenlei]
		})

		uni.$on('updateRecord', () => {
			list.value = []
			pageNum.value = 0
			init()
		})
	})

	onReachBottom(() => {
		if (total.value) {
			pageNum.value += 1
			init()
		}
	})

	const screening = (e) => {
		popup.value.open()
	}

	const sortChange = (e) => {
		if (Number(e.detail.value) === 0) {
			sort.value = null
		} else {
			sort.value = classify.value[e.detail.value]
		}
		pageNum.value = 0
		list.value = []
		init()
	}

	const choosePet = (item, index) => {
		if (petActivate.value === index) {
			petActivate.value = null
			pet_id.value = null
		} else {
			petActivate.value = index
			pet_id.value = item._id
		}
	}

	const chooseType = (item, index) => {
		if (typeActivate.value === index) {
			typeActivate.value = null
			type_id.value = null
		} else {
			typeActivate.value = index
			type_id.value = item._id
		}
	}

	const confirm = () => {
		pageNum.value = 0
		list.value = []
		init()
		popup.value.close()
	}

	const reset = () => {
		typeActivate.value = null
		type_id.value = null
		petActivate.value = null
		pet_id.value = null
	}

	const showPic = (url, imgs) => {
		uni.previewImage({
			indicator: "none",
			current: url,
			urls: imgs
		});
	}

	const remove = (item, index) => {
		showModal({ content: '删除不可恢复，是否确认？' }).then(() => {
			showLoading()
			removeRecord(item._id).then(res => {
				uni.hideLoading()
				showToast('已删除')
				list.value.splice(index, 1)
			})
		})
	}

	const updateDel = (e) => {
		const type = e.typeInfo[0]

		const obj = {
			sort: e.sort,
			remark: e.remark,
			pet_id: e.pet_id,
			record_date: e.record_date,
			record_time: e.record_time,
			record_imgs: JSON.stringify(e.imgs),
			name: type.name,
			icon: type.icon,
			id: type._id,
			recordId: e._id,
			weight: e.weight,
			water: e.water
		}
		if (e.weight) {
			obj.weight = e.weight
		}
		if (e.water) {
			obj.water = e.water
		}
		let url =
			`/subHome/create-record/create-record?type=0`

		for (const key in obj) {
			url += `&${key}=${obj[key]}`
		}

		toNextPage(url)
	}
</script>

<style scoped>
	.tabs-box {
		height: 70rpx;
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
		padding-top: 10rpx;
		padding-bottom: 26rpx;
		font-size: 28rpx;
		color: #352926;
		display: flex;
		align-items: center;
		justify-content: center;
		/* line-height: 16px; */
	}

	.record-item {
		background: #FFFFFF;
		border-radius: 24rpx;
		padding: 28rpx;
	}

	.touxiang {
		width: 50rpx;
		height: 50rpx;
		margin-right: 20rpx;
		border-radius: 50%;
	}


	.img-box {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		row-gap: 20rpx;
	}

	.imgs {
		width: 108rpx;
		height: 108rpx;
		border-radius: 10rpx;
	}


	.width50 {
		width: 50%;
	}

	.fenxi {
		width: 134rpx;
		height: 46rpx;
		line-height: 46rpx;
		text-align: center;
		background: #AFC272;
		color: white;
		font-size: 24rpx;
		border-radius: 62rpx;
		margin-left: auto;
	}

	.print {
		width: 30rpx;
		height: 30rpx;
		border-radius: 50%;
		border: 1px solid #7c5e07;
		background-color: #EDF5D5;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 3rpx;
	}

	.s-print {
		width: 10rpx;
		height: 10rpx;
		border-radius: 50%;
		background-color: #7c5e07;
	}

	.line {
		height: 80%;
		border-left: 1px solid #e9e8e2;
		margin-left: 14rpx;
		margin-top: 20rpx;
	}

	.popup-content {
		width: 80vw;
		height: 100vh;
		padding: 24rpx;
		position: relative;
		display: flex;
		flex-direction: column;
	}

	.petitem {
		color: #352926;
		font-size: 26rpx;
		padding: 12rpx 0rpx;
		text-align: center;
		border-radius: 43rpx;
		background-color: #F7F5F6;
		color: rgba(102, 102, 102, 1);
	}

	.active {
		background-color: #AFC272;
		color: white;
	}

	.record-box {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 20rpx;

	}

	.btn-box {
		position: absolute;
		bottom: 24rpx;
		left: 24rpx;
		right: 24rpx;
		display: flex;
		gap: 20rpx;
	}

	.reset {
		flex: 1;
		height: 76rpx;
		border-radius: 50rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: transparent;
		border: 1px solid #AFC272;
		color: #AFC272;
	}

	.btn {
		flex: 1;
		height: 76rpx;
		border-radius: 50rpx;
		color: white;
		background-color: #AFC272;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.action {
		width: 34rpx;
		height: 34rpx;
	}
</style>
<template>
	<view>
		<cuNavbar>
			<template #content>
				<view class="font-size36 color-352926 font-weight">花销记录</view>
			</template>
		</cuNavbar>
		<view class="padding30">
			<RecordCrad :records="records" @trigger="trigger"></RecordCrad>
		</view>

		<uni-popup ref="popup" border-radius="10px" background-color="#ffffff">
			<view class="zidinyi ">
				<view class="margin-b30 font-size28"> 自定义花销 </view>
				<image class="zidinyi-img"
					src="https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/recordType/zidingyi.png" mode="">
				</image>
				<view class="flex align-center justify-between padding-b20 border-bottom margin-b40" style="width: 100%;">
					<view class="font-size28">花销名称</view>
					<input v-model="zidingyi" class="c-input" type="text" placeholder="请输入" />
				</view>
				<view class="addzidingyi" @click="addType">
					添加
				</view>
			</view>
		</uni-popup>

		<FixedButton title="自定义" @trigger="add"></FixedButton>
	</view>
</template>

<script setup>
	import { getRecordList, addRecordType } from '@/cloud-api/record.js'
	import { sort } from '@/utils/tool.js'
	import { onLoad } from '@dcloudio/uni-app'
	import { showLoading, toNextPage } from '@/core/app.js'
	import { ref } from 'vue'
	import RecordCrad from '@/components/Record-crad/index.vue'
	import FixedButton from '@/components/Fixed-button/index.vue'
	import cuNavbar from '@/components/cu-navbar/cu-navbar.vue'

	const records = ref([])
	const popup = ref(null)
	const zidingyi = ref('')

	const init = () => {
		getRecordList(1).then(res => {
			records.value = sort(res.data)
		})
	}

	onLoad(() => {
		init()
	})

	const trigger = (e) => {
		toNextPage(`/subHome/create-record/create-record?name=${e.name}&sort=${e.sort}&icon=${e.icon}&id=${e._id}&type=1`)
	}

	const add = () => {
		popup.value.open()
	}

	const addType = () => {
		const result = {
			sort: '自定义',
			type: 1,
			name: zidingyi.value,
			icon: 'https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/recordType/zidingyi.png'
		}
		showLoading()
		addRecordType(result).then(res => {
			uni.hideLoading()
			init()
			popup.value.close()
		})
	}
</script>

<style scoped>
	.zidinyi {
		width: 610rpx;
		box-sizing: border-box;
		padding: 30rpx 40rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.zidinyi-img {
		width: 72rpx;
		height: 72rpx;
		margin-bottom: 40rpx;
	}

	.c-input {
		text-align: right;
		font-size: 28rpx;
	}

	.addzidingyi {
		padding: 0 100rpx;
		height: 74rpx;
		line-height: 74rpx;
		border-radius: 100rpx;
		font-size: 30rpx;
		color: white;
		background-color: #AFC272;
	}
</style>
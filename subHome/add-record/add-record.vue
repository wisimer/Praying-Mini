<template>
	<view>
		<cuNavbar>
			<template #content>
				<view class="font-size36 color-352926 font-weight">日常记录</view>
			</template>
		</cuNavbar>
		<view class="padding30">
			<RecordCrad :records="records" @trigger="trigger" @clongpress="longpress"></RecordCrad>
		</view>

		<uni-popup ref="popup" border-radius="10px" background-color="#ffffff">
			<view class="zidinyi ">
				<view class="margin-b30 font-size28"> 自定义记录 </view>
				<image class="zidinyi-img"
					src="https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/recordType/zidingyi.png" mode="">
				</image>
				<view class="flex align-center justify-between padding-b20 border-bottom margin-b40" style="width: 100%;">
					<view class="font-size28">日常名称</view>
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
	import { onLoad } from '@dcloudio/uni-app'
	import { ref } from 'vue'
	import { getRecordList, addRecordType, removeType } from '@/cloud-api/record.js'
	import { sort } from '@/utils/tool.js'
	import { showLoading, toNextPage, showModal, showToast } from '@/core/app.js'
	import RecordCrad from '@/components/Record-crad/index.vue'
	import FixedButton from '@/components/Fixed-button/index.vue'
	import cuNavbar from '@/components/cu-navbar/cu-navbar.vue'

	const records = ref([])
	const popup = ref(null)
	const zidingyi = ref('')


	const init = () => {
		getRecordList(0).then(res => {
			records.value = sort(res.data)
		})
	}

	onLoad(() => {
		init()
	})

	const trigger = (e) => {
		toNextPage(`/subHome/create-record/create-record?name=${e.name}&sort=${e.sort}&icon=${e.icon}&id=${e._id}&type=0`)
	}

	const longpress = (ele) => {
		showModal({ content: '是否确认删除该类型？' }).then(() => {
			showLoading()
			removeType(ele._id).then(res => {
				uni.hideLoading()
				showToast('已删除')
				init()
			})
		})
	}

	const add = () => {
		zidingyi.value = ''
		popup.value.open()
	}

	const addType = () => {
		const result = {
			sort: '自定义',
			type: 0,
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
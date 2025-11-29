<template>
	<view>
		<cuNavbar>
			<template #content>
				<view class="font-size36 color-352926 font-weight">新增记录</view>
			</template>
		</cuNavbar>

		<view class="padding30">
			<view class="content">
				<view class="flex align-center justify-between padding-b20 border-bottom margin-b20">
					<view class="font-size28">爱宠</view>
					<view class="addbtn" v-if="showAddpet" @click="toNextPage('/subWode/add-pet/add-pet')">
						添加爱宠
					</view>
					<picker v-else mode="selector" :range="petList" range-key="name" @change="petChange">
						<view class="flex align-center" v-if="recordInfo.pet_id">
							<text>{{petName}}</text> <uni-icons type="right" size="15" color="gray"
								style="margin-left: 10rpx;"></uni-icons>
						</view>
						<view class="flex align-center" v-else>
							<text style="color: gray">请选择</text> <uni-icons type="right" size="15" color="gray"
								style="margin-left: 10rpx;"></uni-icons>
						</view>
					</picker>
				</view>
				<view class="flex align-center justify-between padding-b20 border-bottom margin-b20">
					<view class="font-size28">就诊时间</view>
					<picker mode="date" @change="recordDateChange">
						<view class="flex align-center" v-if="recordInfo.doctor_time">
							<text>{{recordInfo.doctor_time}}</text> <uni-icons type="right" size="15" color="gray"
								style="margin-left: 10rpx;"></uni-icons>
						</view>
						<view class="flex align-center" v-else>
							<text style="color: gray">请选择</text> <uni-icons type="right" size="15" color="gray"
								style="margin-left: 10rpx;"></uni-icons>
						</view>
					</picker>
				</view>
				<view class="flex align-center padding-b20 border-bottom margin-b20">
					<view class="font-size28">医院名称</view>
					<input class="c-input marginlauto" type="text" placeholder="请输入" v-model="recordInfo.hospital" />
				</view>

				<view class="flex align-center padding-b20 border-bottom margin-b20">
					<view class="font-size28">生病症状</view>
					<input class="c-input marginlauto" type="text" placeholder="请输入" v-model="recordInfo.symptom" />
				</view>
				<view class="flex align-center padding-b20 border-bottom margin-b20">
					<view class="font-size28">检查结果</view>
					<input class="c-input marginlauto" type="text" placeholder="请输入" v-model="recordInfo.detection" />
				</view>
				<view class="flex align-center padding-b20 border-bottom margin-b20">
					<view class="font-size28">治疗方式</view>
					<input class="c-input marginlauto" type="text" placeholder="请输入" v-model="recordInfo.treatment" />
				</view>
				<view class="flex align-center">
					<view class="font-size28">治疗药品</view>
					<input class="c-input marginlauto" type="text" placeholder="请输入" v-model="recordInfo.medicine" />
				</view>
			</view>
		</view>

		<view class="padding30" style="padding-top: 0">
			<view class="content">
				<view class="padding-b20">
					<view class="font-size28">备注</view>
					<textarea v-model="recordInfo.remark" placeholder="请输入备注~" class="c-textarea" />
				</view>
				<view class="img-box">
					<view class="uploadimg" @click="chooseimg">
						<uni-icons type="image-filled" size="30" color="#ccc0a2"></uni-icons>
					</view>
					<view class="flex flex-wrap">
						<image class="imgs" v-for="item in imgs" :key="item" :src="item">
						</image>
					</view>
				</view>
			</view>
		</view>

		<FixedButton title="保存" @trigger="save"></FixedButton>
	</view>
</template>

<script setup>
	import { reactive, ref, computed } from 'vue';
	import { onLoad } from '@dcloudio/uni-app'
	import { getPetList } from '@/cloud-api/index.js'
	import { showLoading, showToast, toNextPage, asyncUploadFile } from '@/core/app'
	import { formatDate } from '@/utils/date.js'
	import { addCase } from '@/cloud-api/index.js'
	import cuNavbar from '@/components/cu-navbar/cu-navbar.vue'
	import FixedButton from '@/components/Fixed-button/index.vue'

	const recordInfo = reactive({
		hospital: '',
		symptom: '',
		detection: '',
		treatment: '',
		medicine: '',
		pet_id: '',
		remark: '',
		imgs: '',
		doctor_time: formatDate(new Date(), 'YYYY-MM-DD'),
	})
	const petList = ref([])
	const imgs = ref([])
	const showAddpet = ref(false)

	const petName = computed(() => {
		const obj = petList.value.find(ele => ele._id === recordInfo.pet_id)
		if (obj) {
			return obj.name
		} else {
			return '请选择'
		}
	})

	onLoad(() => {
		showLoading()
		getPetList().then(res => {
			petList.value = res.data
			showAddpet.value = res.data.length === 0
			const pet = res.data.find(ele => ele.is_default === 0)
			recordInfo.pet_id = pet ? pet._id : ''
		}).finally(() => {
			uni.hideLoading()
		})
	})

	const save = () => {
		recordInfo.imgs = imgs.value.join(',')
		if (!recordInfo.pet_id) return showToast('请选择宠物')
		showLoading()
		addCase(recordInfo).then(res => {
			uni.$emit('addCase')
			uni.navigateBack()
		}).finally(() => {
			uni.hideLoading()
		})
	}
	const petChange = (e) => {
		recordInfo.pet_id = petList.value[e.detail.value]._id
	}

	const recordDateChange = (e) => {
		recordInfo.doctor_time = e.detail.value
	}

	const chooseimg = () => {
		asyncUploadFile().then(results => {
			results.forEach(result => { imgs.value.push(result.fileID) });
		})
	}
</script>

<style scoped>
	.a-image {
		width: 84rpx;
		height: 84rpx;
	}

	.content {
		background: #ffffff;
		border-radius: 24rpx;
		padding: 40rpx;
	}

	.c-input {
		text-align: right;
		font-size: 28rpx;
	}

	.img-box {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.uploadimg {
		background-color: #f3f4ee;
		display: flex;
		padding: 5rpx 0;
		justify-content: center;
		border-radius: 80rpx;
		width: 130rpx;
		box-sizing: border-box;
	}

	.c-textarea {
		padding: 20rpx 0;
		color: gray;
		font-size: 28rpx;
		height: 150rpx;
	}

	.imgs {
		width: 130rpx;
		height: 130rpx;
		margin-top: 20rpx;
		margin-right: 20rpx;
		border-radius: 10rpx;
	}

	.addbtn {
		width: 172rpx;
		height: 60rpx;
		line-height: 60rpx;
		text-align: center;
		background: #afc272;
		border-radius: 62rpx;
		font-size: 28rpx;
		color: #ffffff;
	}
</style>
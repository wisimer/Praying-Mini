<template>
	<view>
		<cuNavbar>
			<template #content>
				<view class="font-size36 color-352926 font-weight">{{ recordName }}</view>
			</template>
		</cuNavbar>
		<view class="padding40 flex align-center justify-center">
			<view class="avatar">
				<image class="a-image" :src="recordIcon"></image>
			</view>
		</view>

		<view class="padding30" style="padding-top: 0">
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
					<view class="font-size28">记录日期</view>
					<picker mode="date" @change="recordDateChange">
						<view class="flex align-center" v-if="recordInfo.record_date">
							<text>{{recordInfo.record_date}}</text> <uni-icons type="right" size="15" color="gray"
								style="margin-left: 10rpx;"></uni-icons>
						</view>
						<view class="flex align-center" v-else>
							<text style="color: gray">请选择</text> <uni-icons type="right" size="15" color="gray"
								style="margin-left: 10rpx;"></uni-icons>
						</view>
					</picker>
				</view>
				<view class="flex align-center justify-between">
					<view class="font-size28">记录时间</view>
					<picker mode="time" @change="timeDateChange">
						<view class="flex align-center" v-if="recordInfo.record_time">
							<text>{{recordInfo.record_time}}</text> <uni-icons type="right" size="15" color="gray"
								style="margin-left: 10rpx;"></uni-icons>
						</view>
						<view class="flex align-center" v-else>
							<text style="color: gray">请选择</text> <uni-icons type="right" size="15" color="gray"
								style="margin-left: 10rpx;"></uni-icons>
						</view>
					</picker>
				</view>

				<view class="flex align-center margin-t20 border-top padding-t20" v-if="recordName === '称体重'">
					<view class="font-size28">体重</view>
					<input class="c-input marginlauto" type="digit" placeholder="请输入" v-model="recordInfo.weight" />
					<view class="margin-l10" style="color: gray">kg</view>
				</view>

				<view class="flex align-center margin-t20 border-top padding-t20" v-if="recordName === '喝水'">
					<view class="font-size28">喝水量</view>
					<input class="c-input marginlauto" type="digit" placeholder="请输入" v-model="recordInfo.water" />
					<view class="margin-l10" style="color: gray">ml</view>
				</view>

				<view class="flex align-center margin-t20 border-top padding-t20" v-if="recordInfo.is_daily == 1">
					<view class="font-size28">花销金额</view>
					<input class="c-input marginlauto" type="digit" placeholder="请输入" v-model="recordInfo.money" />
					<view class="margin-l10" style="color: gray">RMB</view>
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
						<view class="imgs" v-for="(item,index) in imgs" :key="item">
							<image mode="aspectFill" style="width: 100%;height: 100%;border-radius: 10rpx;" :src="item">
							</image>
							<uni-icons class="clear" type="clear" size="20" @click="clearimgs(index)"></uni-icons>

						</view>
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
	import { addRecord, updateRecord } from '@/cloud-api/record.js'
	import cuNavbar from '@/components/cu-navbar/cu-navbar.vue'
	import FixedButton from '@/components/Fixed-button/index.vue'

	const recordInfo = reactive({
		is_daily: '0',
		type_id: '',
		pet_id: '',
		remark: '',
		imgs: '',
		sort: '',
		record_date: formatDate(new Date(), 'YYYY-MM-DD'),
		record_time: formatDate(new Date(), 'hh:mm')
	})
	const recordIcon = ref('')
	const recordName = ref('')
	const petList = ref([])
	const imgs = ref([])
	const showAddpet = ref(false)
	const record_id = ref(null)

	const petName = computed(() => {
		const obj = petList.value.find(ele => ele._id === recordInfo.pet_id)
		if (obj) {
			return obj.name
		} else {
			return '请选择'
		}
	})

	const initPet = () => {
		showLoading()
		getPetList().then(res => {
			petList.value = res.data
			showAddpet.value = res.data.length === 0
			const pet = res.data.find(ele => ele.is_default === 0)
			if (!recordInfo.pet_id) {
				recordInfo.pet_id = pet ? pet._id : ''
			}
		}).finally(() => {
			uni.hideLoading()
		})
	}

	onLoad(({
		name,
		icon,
		type,
		id,
		sort,
		record_date,
		record_time,
		money,
		pet_id,
		remark,
		record_imgs,
		recordId,
		weight,
		water
	}) => {
		recordIcon.value = icon
		recordName.value = name
		recordInfo.is_daily = type
		recordInfo.type_id = id
		recordInfo.sort = sort
		if (type == 1) {
			recordInfo.money = ''
		}


		if (recordId) {
			record_id.value = recordId
		}

		if (money) {
			recordInfo.money = money
		}
		if (record_date) {
			recordInfo.record_date = record_date
		}
		if (record_time) {
			recordInfo.record_time = record_time
		}
		if (pet_id) {
			recordInfo.pet_id = pet_id
		}
		if (remark) {
			recordInfo.remark = remark
		}
		if (record_imgs) {
			imgs.value = JSON.parse(record_imgs)
		}

		if (Number(weight)) {
			recordInfo.weight = weight
		}

		if (Number(water)) {
			recordInfo.water = water
		}

		initPet()

		uni.$on('addpet', () => {
			initPet()
		})
	})

	const save = () => {
		recordInfo.imgs = imgs.value.join(',')
		recordInfo.is_daily = Number(recordInfo.is_daily)
		if (!recordInfo.pet_id) return showToast('请选择宠物')
		if (recordInfo.is_daily == '1') {
			if (!recordInfo.money) return showToast('请输入金额')
			recordInfo.money = Number(recordInfo.money)
		}
		if (recordName.value === '称体重') {
			if (!recordInfo.weight) return showToast('请输入最新体重')
			recordInfo.weight = Number(recordInfo.weight)
		}

		if (recordName.value === '喝水') {
			if (!recordInfo.water) return showToast('请输入喝水量')
			recordInfo.water = Number(recordInfo.water)
		}

		showLoading()
		if (record_id.value) {
			updateRecord(record_id.value, recordInfo).then(res => {
				uni.navigateBack({
					delta: 1
				})
				uni.$emit('updateRecord')
			}).finally(() => {
				uni.hideLoading()
			})
		} else {
			addRecord(recordInfo).then(res => {
				uni.navigateBack({
					delta: 2
				})
				uni.$emit('saveRecord')
			}).finally(() => {
				uni.hideLoading()
			})
		}

	}
	const petChange = (e) => {
		recordInfo.pet_id = petList.value[e.detail.value]._id
	}

	const recordDateChange = (e) => {
		recordInfo.record_date = e.detail.value
	}

	const timeDateChange = (e) => {
		recordInfo.record_time = e.detail.value
	}

	const clearimgs = (index) => {
		imgs.value.splice(index, 1)
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
		position: relative;
	}

	.clear {
		position: absolute;
		top: -15rpx;
		right: -15rpx;
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
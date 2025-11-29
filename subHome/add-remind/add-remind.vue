<template>
	<view class="">

		<cuNavbar>
			<template #content>
				<view class="font-size36 color-352926 font-weight">新增提醒</view>
			</template>
		</cuNavbar>


		<view class="padding30">
			<view class="content">
				<view class="flex align-center justify-between padding-b20 border-bottom margin-b20">
					<view class="font-size28">提醒爱宠</view>
					<view class="addbtn" v-if="showAddpet" @click="toNextPage('/subWode/add-pet/add-pet')">
						添加爱宠
					</view>
					<picker mode="selector" v-else :range="pets" range-key="name" @change="petChange">
						<view class="flex align-center">{{petName}}<uni-icons type="right" size="13" color="gray"
								style="margin-left: 10rpx;" />
						</view>
					</picker>
				</view>

				<view class="flex align-center justify-between padding-b20 border-bottom margin-b20">
					<view class="font-size28">提醒事务</view>
					<picker mode="selector" :range="records" range-key="name" @change="recordChange">
						<view class="flex align-center" v-if="remindInfo.affair">
							<text>{{recordName}}</text> <uni-icons type="right" size="15" color="gray"
								style="margin-left: 10rpx;"></uni-icons>
						</view>
						<view class="flex align-center" v-else>
							<text style="color: gray">请选择</text> <uni-icons type="right" size="15" color="gray"
								style="margin-left: 10rpx;"></uni-icons>
						</view>
					</picker>
				</view>

				<view class="flex align-center justify-between padding-b20 border-bottom margin-b20">
					<view class="font-size28">提醒日期</view>
					<picker mode="date" @change="dateChange">
						<view class="flex align-center" v-if="remindInfo.warn_date">
							<text>{{remindInfo.warn_date}}</text> <uni-icons type="right" size="15" color="gray"
								style="margin-left: 10rpx;"></uni-icons>
						</view>
						<view class="flex align-center" v-else>
							<text style="color: gray">请选择</text> <uni-icons type="right" size="15" color="gray"
								style="margin-left: 10rpx;"></uni-icons>
						</view>
					</picker>
				</view>

				<view class="flex align-center justify-between padding-b20 border-bottom margin-b20">
					<view class="font-size28">提醒时间</view>
					<view class="flex align-center" @click="showTime = true">
						<view class="flex align-center" v-if="remindInfo.warn_time">
							<text>{{remindInfo.warn_time}}</text> <uni-icons type="right" size="15" color="gray"
								style="margin-left: 10rpx;"></uni-icons>
						</view>
						<view class="flex align-center" v-else>
							<text style="color: gray">请选择</text> <uni-icons type="right" size="15" color="gray"
								style="margin-left: 10rpx;"></uni-icons>
						</view>
					</view>
					<pickerTime :startH="0" :lateH="24" :step="10" v-if="showTime" @close="showTime=false" @chooseTime="bindTime">
					</pickerTime>
				</view>

				<view class="flex align-center justify-between ">
					<view class="font-size28">提醒周期</view>
					<picker mode="selector" :range="zhouqi" @change="cycleChange" range-key="name">
						<view class="flex align-center" v-if="remindInfo.cycle">
							<text>{{cycleName}}</text> <uni-icons type="right" size="15" color="gray"
								style="margin-left: 10rpx;"></uni-icons>
						</view>
						<view class="flex align-center" v-else>
							<text style="color: gray">请选择</text> <uni-icons type="right" size="15" color="gray"
								style="margin-left: 10rpx;"></uni-icons>
						</view>
					</picker>
				</view>

			</view>

			<view class="content" style="margin-top: 20rpx;">
				<view class="padding-b20">
					<view class="font-size28">备注</view>
					<textarea v-model="remindInfo.remark" placeholder="请输入备注~" class="c-textarea" />
				</view>
			</view>
		</view>
		<FixedButton :title="_id?'确定修改':'确定新增'" @trigger="addPetItem"></FixedButton>
	</view>
</template>

<script setup>
	import { reactive, ref, computed } from 'vue'
	import { showToast, showLoading, toNextPage } from '@/core/app'
	import FixedButton from '@/components/Fixed-button/index.vue'
	import pickerTime from "@/components/Picke-time/index.vue"
	import cuNavbar from '@/components/cu-navbar/cu-navbar.vue'
	import { getPetList, removePet } from '@/cloud-api/index.js'
	import { getRecordList } from '@/cloud-api/record.js'
	import { onLoad } from '@dcloudio/uni-app'
	import { addRemind } from '@/cloud-api/index.js'
	import { isMoreThanOneHourLater } from '@/utils/date.js'


	const zhouqi = ref([{
			name: '单次',
			type: 'single',
			value: 1
		},
		{
			name: '1天一次',
			type: 'day',
			value: 1
		},
		{
			name: '3天一次',
			type: 'day',
			value: 3
		},
		{
			name: '5天一次',
			type: 'day',
			value: 5
		},
		{
			name: '7天一次',
			type: 'day',
			value: 7
		},
		{
			name: '15天一次',
			type: 'day',
			value: 15
		},
		{
			name: '1月一次',
			type: 'month',
			value: 1
		},
		{
			name: '2月一次',
			type: 'month',
			value: 2
		},
		{
			name: '3月一次',
			type: 'month',
			value: 3
		},
		{
			name: '6月一次',
			type: 'month',
			value: 6
		},
		{
			name: '1年一次',
			type: 'year',
			value: 1
		}
	])
	const pets = ref([])
	const records = ref([])
	const showTime = ref(false)
	const showAddpet = ref(false)

	const _id = ref('')

	const remindInfo = reactive({
		pet_id: '',
		affair: 0,
		warn_date: 0,
		warn_time: '',
		cycle: 1,
		state: 0,
		complete_num: 0,
		remark: '',
		cycle_type: 'single'
	})


	const petName = computed(() => {
		const obj = pets.value.find(ele => ele._id === remindInfo.pet_id)
		if (obj) {
			return obj.name
		} else {
			return '请选择'
		}
	})


	const cycleName = computed(() => {
		const obj = zhouqi.value.find(ele => ele.value === remindInfo.cycle && ele.type === remindInfo.cycle_type)
		if (obj) {
			return obj.name
		} else {
			return null
		}
	})


	const recordName = computed(() => {
		const obj = records.value.find(ele => ele._id === remindInfo.affair)
		if (obj) {
			return obj.name
		} else {
			return '请选择'
		}
	})

	const dateChange = (e) => {
		remindInfo.warn_date = e.detail.value
	}

	const homeDateChange = (e) => {
		remindInfo.warn_time = e.detail.value
	}

	const petChange = (e) => {
		remindInfo.pet_id = pets.value[e.detail.value]._id
	}

	const recordChange = (e) => {
		remindInfo.affair = records.value[e.detail.value]._id
	}

	const cycleChange = (e) => {
		remindInfo.cycle = zhouqi.value[e.detail.value].value
		remindInfo.cycle_type = zhouqi.value[e.detail.value].type
		console.log(remindInfo)
	}

	const bindTime = (e) => {
		remindInfo.warn_time = e.time
		showTime.value = false
	}

	const addPetItem = () => {
		if (!remindInfo.pet_id) return showToast('请选择爱宠')
		if (!remindInfo.affair) return showToast('请选择提醒事务')
		if (!remindInfo.warn_date) return showToast('请选择提醒日期')
		if (!remindInfo.warn_time) return showToast('请选择提醒时间')
		const isMoreThanOneHour = isMoreThanOneHourLater(`${remindInfo.warn_date} ${remindInfo.warn_time}`)
		if (!isMoreThanOneHour) return showToast('请选择1小时后的时间')
		showLoading()
		addRemind(remindInfo).then(res => {
			uni.$emit('addRemind')
			uni.navigateBack()
		}).finally(() => {
			uni.hideLoading()
		})
	}

	onLoad(() => {
		getPetList().then(res => {
			pets.value = res.data
			showAddpet.value = res.data.length === 0
			const pet = res.data.find(ele => ele.is_default === 0)
			remindInfo.pet_id = pet ? pet._id : ''
		})

		getRecordList(0).then(res => {
			records.value = res.data
		})
	})
</script>

<style lang="scss" scoped>
	.avatar {
		position: relative;

		.a-image {
			width: 164rpx;
			height: 164rpx;
		}

		.paizhao {
			width: 106rpx;
			height: 106rpx;
			position: absolute;
			bottom: -30rpx;
			right: -20rpx;
		}
	}

	.content {
		background: #FFFFFF;
		border-radius: 24rpx;
		padding: 40rpx;
	}

	.c-input {
		text-align: right;
		font-size: 28rpx;
	}

	.c-pet {
		height: 92rpx;
		padding: 0 20rpx;
		background: #EBEBEB;
		border-radius: 24rpx;
		box-sizing: border-box;

		.c-img {
			width: 80rpx;
			height: 80rpx;
			margin-right: 10rpx;
		}
	}

	.pet-action {
		background: #FFF9E8;
		border: 1px solid #775047;
	}

	.addbtn {
		width: 172rpx;
		height: 60rpx;
		line-height: 60rpx;
		text-align: center;
		background: #AFC272;
		border-radius: 62rpx;
		font-size: 28rpx;
		color: #FFFFFF;
	}

	.c-textarea {
		padding: 20rpx 0;
		color: gray;
		font-size: 28rpx;
		height: 150rpx;
	}
</style>
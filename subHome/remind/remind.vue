<template>
	<view>
		<cuNavbar>
			<template #content>
				<view class="font-size36 color-352926 font-weight">要事提醒</view>
			</template>
		</cuNavbar>
		<view class="padding30">
			<view class="margin-b24 c-card" v-for="item in reminds" :key="item._id">
				<view class="flex align-center padding-b20 border-bottom margin-b20">
					<image class="d-avatar" :src="item.pet_id[0].avatar"></image>
					<view class="margin-l20">
						{{item.pet_id[0].name}}
					</view>
					<view class="state" :class="setStateColor(item)">
						{{isState(item)}}
					</view>
				</view>
				<view class="flex align-end justify-between padding-b20 border-bottom margin-b20">
					<view class="color-8C8888">
						<view class="margin-b12"> 提醒事务：<text class="color-352926">{{item.affair[0].name}}</text> </view>
						<view class="margin-b12"> 下次提醒：<text class="color-352926">{{item.warn_date}} {{item.warn_time}}</text>
						</view>
						<view> 提醒周期：<text class="color-352926">{{cycleName(item)}}</text></view>
						<view class="margin-t12" v-if="item.remark"> 备注：<text class="color-352926">{{item.remark}}</text></view>
						<view class="margin-t12" v-if="item.cycle_type !== 'single'">已完成：<text
								class="color-352926">{{item.complete_num}}次</text></view>
					</view>
				</view>

				<view class="flex justify-end">

					<view class="flex align-center margin-r40 " @click="wancheng(item)" v-if="item.state === 0">
						<image class="action margin-r10"
							src="https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/bianjipet.png">
						</image>
						<text class="font-size24 color-8C8888">立即完成</text>
					</view>
					<view class="flex align-center" @click="removeRemid(item)">
						<image class="action margin-r10"
							src="https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/shanchu.png">
						</image>
						<text class="font-size24 color-8C8888">删除</text>
					</view>
				</view>
			</view>
		</view>
		<Empty v-if="reminds.length === 0"></Empty>


		<uni-popup ref="levelModal" safe-area>
			<view class="levelModal">
				<image src="https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/modal_bg.png"
					class="modal_bg"></image>
				<view class="flex flex-direction align-center model-content">
					<view class="color-8C8888 font-size28 margin-b10 ">
						亲爱的铲屎官
					</view>
					<view class="color-8C8888 font-size28 margin-b10">
						由于新版本提醒功能将通过
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


		<!-- 	<uni-popup ref="formModal" safe-area border-radius="10px" background-color="#ffffff">
			<view class="zidinyi" v-if="remindItem">
				<image :src="remindItem.affair[0].icon" class="zidinyi-img"></image>
				<view class="flex align-center padding-b20 border-bottom margin-b40" style="width: 100%;"
					v-if="remindItem.affair[0].name === '称体重'">
					<view class="font-size28">体重</view>
					<input v-model="zidingyi" class="c-input" type="digit" placeholder="请输入" />kg
				</view>

				<view class="flex align-center padding-b20 border-bottom margin-b40" style="width: 100%;"
					v-if="remindItem.affair[0].name === '喝水'">
					<view class="font-size28">喝水量</view>
					<input v-model="zidingyi" class="c-input" type="digit" placeholder="请输入" />ml
				</view>
				<view class="addzidingyi" @click="add">
					完成
				</view>
			</view>
		</uni-popup> -->

		<FixedButton title="新增提醒" @trigger="toNextPage('/subHome/add-remind/add-remind')"></FixedButton>
	</view>
</template>

<script setup>
	import cuNavbar from '@/components/cu-navbar/cu-navbar.vue'
	import FixedButton from '@/components/Fixed-button/index.vue'
	import Empty from '@/components/Empty/index.vue'
	import { showModal, showToast, toNextPage } from '@/core/app.js'
	import { getRemind, setRemindState, removeRemind } from '@/cloud-api/index.js'
	import { addRecord } from '@/cloud-api/record.js'
	import { onLoad } from '@dcloudio/uni-app'
	import { ref } from 'vue'
	import { showLoading } from '@/core/app'
	import { isFutureDateTime, isTimeLaterThanNow } from '@/utils/date.js'
	import { formatDate } from '@/utils/date.js'

	const reminds = ref([])
	const levelModal = ref(null)
	// const formModal = ref(null)
	// const remindItem = ref(null)
	// const zidingyi = ref('')

	const initData = () => {
		showLoading()
		getRemind().then(res => {
			reminds.value = res.data
		}).finally(() => {
			uni.hideLoading()
		})
	}

	const cycleName = (item) => {
		let type = ''
		switch (item.cycle_type) {
			case 'single':
				type = '单次'
				break
			case 'day':
				type = item.cycle + '天一次'
				break
			case 'month':
				type = item.cycle + '月一次'
				break
			case 'year':
				type = item.cycle + '年一次'
				break
		}

		return type
	}

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

	// const saveRecord = () => {
	// 	const reslut = {
	// 		is_daily: 0,
	// 		type_id: remindItem.value.affair[0]._id,
	// 		pet_id: remindItem.value.pet_id[0]._id,
	// 		record_date: formatDate(new Date(), 'YYYY-MM-DD'),
	// 		record_time: formatDate(new Date(), 'hh:mm'),
	// 	}
	// 	const name = remindItem.value.affair[0].name
	// 	if (name === '喝水') {
	// 		reslut.water = Number(zidingyi.value)
	// 	} else if (name === '称体重') {
	// 		reslut.weight = Number(zidingyi.value)
	// 	}
	// 	addRecord(reslut)
	// }


	// const add = () => {
	// 	if (!zidingyi.value) return showToast('请输入')
	// 	showLoading()
	// 	setRemindState(remindItem.value._id).then(res => {
	// 		initData()
	// 		saveRecord()
	// 	}).finally(() => {
	// 		uni.hideLoading()
	// 		formModal.value.close()
	// 	})
	// }

	onLoad(() => {
		initData()
		checkFollow()
		uni.$on('addRemind', () => {
			initData()
		})
	})

	const isState = (item) => {
		const STATUS_MAP = {
			future: { 0: '未开始', 1: '已完成' },
			past: { 0: '已过期', 1: '已完成' }
		};

		const isFuture = isFutureDateTime(`${item.warn_date} ${item.warn_time}`)

		const timeStatus = isFuture ? 'future' : 'past';

		return STATUS_MAP[timeStatus][item.state];

	}

	const setStateColor = (item) => {
		// 状态映射表
		const STATUS_MAP = {
			future: { 0: 'state1', 1: 'state3' },
			past: { 0: 'state2', 1: 'state3' }
		};

		const isFuture = isFutureDateTime(`${item.warn_date} ${item.warn_time}`)

		const timeStatus = isFuture ? 'future' : 'past';

		return STATUS_MAP[timeStatus][item.state];

	}

	const wancheng = (item) => {
		// const e = item.affair[0]
		// remindItem.value = item
		// zidingyi.value = ''
		// const arr = ['称体重', '喝水']
		// if (arr.indexOf(e.name) > -1) {
		// 	formModal.value.open()
		// } else {
		// 	showModal({ content: '是否确认完成？' }).then(() => {
		// 		showLoading()
		// 		setRemindState(item._id).then(res => {
		// 			initData()
		// 			saveRecord()
		// 		}).finally(() => {
		// 			uni.hideLoading()
		// 		})
		// 	})
		// }
		showModal({ content: '是否确认完成，并自动转为记录？' }).then(() => {
			showLoading()
			setRemindState(item._id).then(res => {
				initData()
			}).finally(() => {
				uni.hideLoading()
				// const arr = ['称体重', '喝水']
				// const e = item.affair[0]
				// if (arr.indexOf(e.name) > -1) {
				// 	showToast('该类型无法转为记录，请手动记录')
				// }
			})
		})
	}


	const removeRemid = (item) => {
		showModal({ content: '删除不可恢复，是否确认？' }).then(() => {
			showLoading()
			removeRemind(item._id).finally(() => {
				uni.hideLoading()
			}).then(res => {
				initData()
			})
		})
	}
</script>

<style lang="scss" scoped>
	.d-avatar {
		width: 76rpx;
		height: 76rpx;
		border-radius: 50%;
	}

	.wanc {
		width: 182rpx;
		height: 70rpx;
		line-height: 70rpx;
		text-align: center;
		background: #AFC272;
		border-radius: 62rpx;
		font-size: 28rpx;
		color: #FFFFFF;
	}

	.state {
		padding: 0 15rpx;
		height: 44rpx;
		line-height: 44rpx;
		font-size: 22rpx;
		text-align: center;
		border-radius: 50rpx;
		margin-left: auto;
	}

	.state1 {
		background-color: #EEE9FF;
		color: #938AD5;
	}

	.state2 {
		background-color: #FFEAE6;
		color: #FB927A;
	}

	.state3 {
		background-color: #EFF4DC;
		color: #9CB05D;
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

	.action {
		width: 44rpx;
		height: 44rpx;
	}

	.zidinyi {
		width: 580rpx;
		box-sizing: border-box;
		padding: 30rpx 40rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.zidinyi-img {
		width: 72rpx;
		height: 72rpx;
		margin-bottom: 50rpx;
	}

	.c-input {
		text-align: right;
		font-size: 28rpx;
		margin-left: auto;
		margin-right: 10rpx;
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
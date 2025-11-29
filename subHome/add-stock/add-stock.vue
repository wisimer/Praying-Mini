<template>
	<view>
		<cuNavbar>
			<template #content>
				<view class="font-size36 color-352926 font-weight">新增物品</view>
			</template>
		</cuNavbar>

		<view class="padding30">
			<view class="content margin-b20">
				<view class="flex align-center padding-b20 border-bottom margin-b20">
					<view class="font-size28">物品名称</view>
					<input class="c-input marginlauto" type="text" placeholder="请输入" v-model="thingInfo.name" />
				</view>
				<view class="flex align-center padding-b20 border-bottom margin-b20">
					<view class="font-size28">物品数量</view>
					<input class="c-input marginlauto" type="number" placeholder="请输入" v-model="thingInfo.num" />
				</view>
				<view class="flex align-center justify-between padding-b20 border-bottom margin-b20">
					<view class="font-size28">单位</view>
					<picker mode="selector" :range="units" @change="unitChange">
						<text v-if="thingInfo.unit">{{ thingInfo.unit}}</text>
						<text v-else style="color: gray">请选择</text>
					</picker>
				</view>
				<view class="flex align-center justify-between padding-b20 border-bottom margin-b20">
					<view class="font-size28">购买时间</view>
					<picker mode="date" @change="timeDateChange">
						<text v-if="thingInfo.buy_date">{{ thingInfo.buy_date}}</text>
						<text v-else style="color: gray">请选择</text>
					</picker>
				</view>
				<view class="flex align-center padding-b20 border-bottom margin-b20">
					<view class="font-size28">物品金额</view>
					<input class="c-input marginlauto" type="number" placeholder="请输入" v-model="thingInfo.price" />
					<view class="margin-l10" style="color: gray">RMB</view>
				</view>
				<view class="flex align-center justify-between">
					<view class="font-size28">过期类型</view>
					<radio-group class="flex" @change="expiredTypeClick">
						<label class="flex align-center margin-r20">
							<radio style="transform: scale(0.7)" color="#AFC272" value="0" :checked="thingInfo.expired_type === 0" />
							<view>保质期(天)</view>
						</label>
						<label class="flex align-center">
							<radio style="transform: scale(0.7)" color="#AFC272" value="1" :checked="thingInfo.expired_type === 1" />
							<view>过期时间</view>
						</label>
					</radio-group>
				</view>
			</view>

			<view class="content margin-b20" v-if="thingInfo.expired_type === 0">
				<view class="flex align-center justify-between padding-b20 border-bottom margin-b20">
					<view class="font-size28">生产日期</view>
					<picker mode="date" @change="productionChange">
						<text v-if="thingInfo.production_date">{{ thingInfo.production_date}}</text>
						<text v-else style="color: gray">请选择</text>
					</picker>
				</view>
				<view class="flex align-center">
					<view class="font-size28">保质期(天)</view>
					<input class="c-input marginlauto" type="number" placeholder="请输入" v-model="thingInfo.shelf_day" />
					<view class="margin-l10" style="color: gray">天</view>
				</view>
			</view>
			<view class="content margin-b20" v-else>
				<view class="flex align-center justify-between">
					<view class="font-size28">过期时间</view>
					<picker mode="date" @change="expiredChange">
						<text v-if="thingInfo.expired_date">{{ thingInfo.expired_date}}</text>
						<text v-else style="color: gray">请选择</text>
					</picker>
				</view>
			</view>

			<view class="content">
				<view class="padding-b20">
					<view class="font-size28">备注</view>
					<textarea v-model="thingInfo.remark" placeholder="请输入备注~" class="c-textarea" />
				</view>
				<view class="img-box">
					<view class="uploadimg" @click="chooseimg">
						<uni-icons type="image-filled" size="30" color="#ccc0a2"></uni-icons>
					</view>
					<view class="flex flex-wrap">
						<image mode="aspectFill" class="imgs" v-for="item in imgs" :key="item" :src="item">
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
	import { showLoading, showToast, asyncUploadFile } from '@/core/app'
	import { addThing } from '@/cloud-api/index.js'
	import { calculateDate } from '@/utils/date.js'
	import { getDaysFromToday } from '@/utils/date.js'
	import cuNavbar from '@/components/cu-navbar/cu-navbar.vue'
	import FixedButton from '@/components/Fixed-button/index.vue'

	const thingInfo = reactive({
		expired_type: 0,
		name: '',
		img: '',
		expired_date: '',
		production_date: '',
		shelf_day: '',
		num: '',
		remark: '',
		unit: '',
		buy_date: '',
		price: '',
		state: 0
	})
	const imgs = ref([])

	const units = ['件', '个', '罐', '包', '袋', '盒', '瓶', '套', '克', '千克', '斤', '公斤', '升', '毫升', '颗', '粒', '片', '箱', '桶', '只',
		'条', '块', '张', '本', '副', '根', '支', '台', '把', '份'
	]

	const save = () => {

		if (!thingInfo.name) return showToast('请输入物品名称')
		if (!thingInfo.num) return showToast('请输入物品数量')
		if (!thingInfo.unit) return showToast('请选择物品单位')
		if (thingInfo.expired_type === 0) {
			if (!thingInfo.production_date) return showToast('请选择生产日期')
			if (!thingInfo.shelf_day) return showToast('请输入过期天数')
			thingInfo.expired_date = calculateDate(thingInfo.production_date, Number(thingInfo.shelf_day))
		}
		if (thingInfo.expired_type === 1) {
			if (!thingInfo.expired_date) return showToast('请选择过期日期')
		}
		const day = getDaysFromToday(thingInfo.expired_date)
		if (day > 7) {
			thingInfo.state = 0
		} else if (day > 0 && day <= 7) {
			thingInfo.state = 2
		} else if (day < 0) {
			thingInfo.state = 1
		}
		thingInfo.img = imgs.value.join(',')
		thingInfo.num = Number(thingInfo.num)
		thingInfo.price = Number(thingInfo.price)
		thingInfo.shelf_day = Number(thingInfo.shelf_day)

		showLoading()
		addThing(thingInfo).then(res => {
			uni.navigateBack()
			uni.$emit('addThing')
		}).finally(() => {
			uni.hideLoading()
		})
	}
	const productionChange = (e) => {
		thingInfo.production_date = e.detail.value
	}

	const expiredChange = (e) => {
		thingInfo.expired_date = e.detail.value
	}

	const timeDateChange = (e) => {
		thingInfo.buy_date = e.detail.value
	}

	const unitChange = (e) => {
		thingInfo.unit = units[e.detail.value]
	}

	const expiredTypeClick = (e) => {
		thingInfo.expired_type = Number(e.detail.value)
		thingInfo.production_date = ''
		thingInfo.shelf_day = ''
		thingInfo.expired_date = ''
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
</style>
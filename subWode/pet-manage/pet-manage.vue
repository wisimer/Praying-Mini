<template>
	<view>
		<cuNavbar>
			<template #content>
				<view class="font-size36 color-352926 font-weight">宠物管理</view>
			</template>
		</cuNavbar>
		<view class="padding20">
			<view class="margin-b20 pet_item" v-for="item in petList" :key="item._id">
				<view class="flex align-center margin-b20">
					<image :src="item.avatar" class="pet_avatar"></image>
					<text class="font-size36 margin-r20 font-weight">{{item.name}}</text>
					<text class="font-size28 margin-r20 color-8C8888" v-if="item.state == 1">(离开星球)</text>
				</view>
				<view class="info">
					<view class="desc font-size26 margin-b20">
						<view class="color-8C8888">性别：</view>
						<view class="color-352926">{{item.sex === 0 ? '妹妹' : '弟弟'}}</view>
					</view>
					<view class="desc font-size26 margin-b20">
						<view class="color-8C8888">品种：</view>
						<view class="color-352926">{{item.breed}}</view>
					</view>
					<view class="desc font-size26 margin-b20">
						<view class="color-8C8888">体重：</view>
						<view class="color-352926">{{item.weight}}kg</view>
					</view>
					<view class="desc font-size26">
						<view class="color-8C8888">生日：</view>
						<view class="color-352926">{{item.birth_time}}</view>
					</view>
					<view class="desc font-size26">
						<view class="color-8C8888">到家：</view>
						<view class="color-352926">{{ home_time(item.home_time)}}</view>
					</view>
				</view>
				<view class="flex justify-end margin-t20" v-if="item.state == 0">
					<view class="flex align-center margin-r40" @click="updete(item)">
						<image class="action margin-r10"
							src="https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/bianjipet.png">
						</image>
						<text class="font-size24 color-8C8888">编辑</text>
					</view>
					<view class="flex align-center" @click="remove(item)">
						<image class="action margin-r10"
							src="https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/shanchu.png">
						</image>
						<text class="font-size24 color-8C8888">删除</text>
					</view>
				</view>
				<view class="def-pet" v-if="item.is_default === 0">
					默认爱宠
				</view>
			</view>
		</view>

		<Empty v-if="petList.length === 0"></Empty>
		<FixedButton title="新增宠物" @trigger="toNextPage('/subWode/add-pet/add-pet')"></FixedButton>
	</view>
</template>

<script setup>
	import { onLoad } from '@dcloudio/uni-app'
	import { ref, computed } from 'vue'
	import { getPetList, removePet, updatePet } from '@/cloud-api/index.js'
	import { computeDay } from '@/utils/date.js'
	import { showLoading, toNextPage } from '@/core/app.js'
	import { showToast, showModal } from '@/core/app'
	import FixedButton from '@/components/Fixed-button/index.vue'
	import cuNavbar from '@/components/cu-navbar/cu-navbar.vue'
	import Empty from '@/components/Empty/index.vue'

	const petList = ref([])

	const initPet = () => {
		getPetList().then(res => {
			petList.value = res.data
		})
	}

	onLoad(() => {
		uni.$on('addpet', () => {
			initPet()
		})
		initPet()
	})

	const home_time = computed(() => {
		return (val) => {
			const { year, month } = computeDay(val)
			return year > 0 ? `到家${year}年${month}月` : month > 0 ? `到家${month}月` : '到家不足一月'
		}
	})

	const updete = (pet) => {
		uni.showActionSheet({
			itemList: ['编辑资料', '设为默认', '离开星球(去世)'],
			success: function(res) {
				if (res.tapIndex === 0) {
					toNextPage('/subWode/add-pet/add-pet?pet=' + JSON.stringify(pet))
				} else if (res.tapIndex === 1) {
					if (pet.is_default === 0) return showToast('爱宠当前是默认')
					showLoading()
					updatePet(pet._id, { is_default: 0 }).then(res => {
						petList.value.map(ele => {
							if (ele._id === pet._id) {
								ele.is_default = 0
							} else {
								ele.is_default = 1
							}
						})
					}).finally(() => {
						uni.hideLoading()
					})
				} else {
					showModal({ content: '爱宠设置去世不可恢复，是否确认？' }).then(() => {
						showLoading()
						updatePet(pet._id, { state: 2 }).then(res => {
							pet.state = 2
						}).finally(() => {
							uni.hideLoading()
						})
					})
				}
			}
		});
	}

	const remove = (pet) => {
		if (pet.is_default === 0) return showToast('默认爱宠不可删除')
		showModal({ content: '删除宠物将删除相关全部数据，请谨慎操作！' }).then(() => {
			removePet(pet._id).then(res => {
				const index = petList.value.findIndex(ele => pet._id === ele._id)
				petList.value.splice(index, 1)
				showToast('已删除')
			})
		})
	}
</script>

<style lang="scss" scoped>
	.pet_item {
		background-color: white;
		padding: 20rpx;
		border-radius: 10rpx;
		position: relative;

		.info {
			padding: 24rpx 20rpx;
			background: #F7F5F6;
			border-radius: 16rpx;
			display: flex;
			flex-wrap: wrap;

			.desc {
				width: 50%;
				display: flex;
				align-items: center;
			}
		}

		.def-pet {
			position: absolute;
			top: 0;
			right: 0;
			width: 108rpx;
			height: 42rpx;
			line-height: 42rpx;
			background: #F5F8EB;
			border-radius: 0px 0 0px 24rpx;
			text-align: center;
			font-size: 22rpx;
			color: #AFC272;
		}
	}

	.pet_avatar {
		width: 76rpx;
		height: 76rpx;
		border-radius: 50%;
		margin-right: 20rpx;
	}

	.action {
		width: 44rpx;
		height: 44rpx;
	}
</style>
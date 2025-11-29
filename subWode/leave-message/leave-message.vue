<template>
	<view>
		<cuNavbar>
			<template #content>
				<view class="font-size36 color-352926 font-weight">皮肤管理</view>
			</template>
		</cuNavbar>

		<view class="model-box">
			<view class="model-item" v-for="item in modelList" :key="item._id" @click="modelClick(item)">
				<image class="c-modal" :style="item.isHave ? '' : 'filter: grayscale(100%);'" :src="item.url">
				</image>
				<view class="ishave" v-if="item.isHave">已获取</view>
				<view class="ishave gray" v-else>{{ item.can }}罐头</view>
			</view>
		</view>

	</view>
</template>

<script setup>
	import { ref } from 'vue';
	import { showLoading, showModal, showToast } from '@/core/app.js'
	import { onLoad } from '@dcloudio/uni-app'
	import cuNavbar from '@/components/cu-navbar/cu-navbar.vue'
	import { getPetModel, addPetModel, updetePetModel } from '@/cloud-api/player.js'

	const modelList = ref([])

	onLoad(() => {
		showLoading()
		getPetModel().then(res => {
			const haveModels = res[1].data || []
			modelList.value = res[0].data.map(ele => {
				const itemHave = haveModels.findIndex(val => val.model_id === ele._id)
				if (itemHave > -1) {
					ele.isHave = true
				}
				return ele
			})
		}).finally(() => {
			uni.hideLoading()
		})
	})

	const modelClick = (item) => {
		if (item.isHave) {
			showModal({
				content: '是否切换皮肤'
			}).then(() => {
				showLoading()
				updetePetModel(item._id).then(res => {
					uni.hideLoading()
					showToast('已切换')
					uni.$emit('changeSkin', item.url)
				})
			})
		} else {
			showModal({
				content: '是否兑换该皮肤'
			}).then(() => {
				showLoading()
				addPetModel(item._id).then(() => {
					item.isHave = true
					uni.hideLoading()
					showToast('兑换成功')
				}).catch((err) => {
					uni.hideLoading()
					showToast(err)
				})
			})
		}
	}
</script>

<style scoped>
	.model-box {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		padding: 20rpx 32rpx;
		gap: 32rpx;
	}

	.model-item {
		display: flex;
		justify-content: center;
		padding: 38rpx 0 24rpx 0;
		background-color: white;
		border-radius: 10rpx;
		position: relative;
	}

	.ishave {
		position: absolute;
		right: 0;
		top: 0;
		height: 34rpx;
		background: #f5f8eb;
		border-bottom-left-radius: 24rpx;
		font-size: 20rpx;
		color: #afc272;
		line-height: 34rpx;
		text-align: center;
		padding: 0 20rpx;
	}


	.gray {
		background-color: #f3f3f3 !important;
		color: #bfbfbf !important;
	}


	.c-modal {
		width: 135rpx;
		height: 182rpx;
	}
</style>
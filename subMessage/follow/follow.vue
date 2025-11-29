<template>
	<view>
		<cuNavbar>
			<template #content>
				<view class="font-size36 color-352926 font-weight">已关注</view>
			</template>
		</cuNavbar>

		<view class="padding32">
			<view class="flex align-center margin-b40" v-for="item in follwList" :key="item._id" @click="toMsg(item)">
				<image class="avatar" :src="item.follow_user_id[0].avatar_file.url"></image>
				<view class="">
					<view class="margin-b10  color-352926 font-size30" style="position: relative;">
						<text>{{item.follow_user_id[0].nickname}}</text>
					</view>
					<view class="color-B3B3B3 font-size26">
						{{formatDate(item.create_date,'YYYY-MM-DD')}}
					</view>
				</view>
				<view class="marginlauto color-B3B3B3 font-size26 follow" @click.stop="remove(item)">
					取消
				</view>
			</view>
			<Empty v-if="follwList.length === 0"></Empty>
		</view>
	</view>
</template>

<script setup>
	import { ref } from 'vue';
	import { onLoad, onReachBottom } from '@dcloudio/uni-app'
	import { getUserFollow, removeFollow } from '@/cloud-api/index.js'
	import { formatDate } from '@/utils/date.js'
	import cuNavbar from '@/components/cu-navbar/cu-navbar.vue'
	import Empty from '@/components/Empty/index.vue'
	import { showLoading, showModal, showToast, toNextPage } from '../../core/app';

	const follwList = ref([])

	onLoad(() => {
		showLoading()
		getUserFollow().then(res => {
			follwList.value = res.data
		}).finally(() => {
			uni.hideLoading()
		})
	})

	const toMsg = (item) => {
		const _id = item.follow_user_id[0]._id
		toNextPage(`/subHome/personal/personal?user_id=${_id}`)
	}

	const remove = (item) => {
		const _id = item.follow_user_id[0]._id

		showModal({ content: '是否确认取消关注？' }).then(() => {
			showLoading()
			removeFollow(_id).then(res => {
				const index = follwList.value.findIndex(ele => ele.follow_user_id[0]._id === _id)
				follwList.value.splice(index, 1)
				uni.hideLoading()
				showToast('已取消')
			})
		})
	}
</script>

<style scoped>
	.avatar {
		width: 100rpx;
		height: 100rpx;
		margin-right: 20rpx;
		border-radius: 50%;
	}

	.follow {
		width: 134rpx;
		height: 60rpx;
		line-height: 60rpx;
		text-align: center;
		background: #AFC272;
		border-radius: 62rpx;
		font-size: 26rpx;
		color: #FFFFFF;
	}
</style>
<template>
	<view>
		<cuNavbar>
			<template #content>
				<view class="font-size36 color-352926 font-weight">评论消息</view>
			</template>
		</cuNavbar>
		<view class="padding32">
			<view class="c-card margin-b24" v-for="item in commnt" :key="item._id">
				<view class="flex align-center">
					<image :src="item.user_id[0].avatar_file.url" class="d-avatar"></image>
					<view class="">
						<view class="font-size28 margin-b12">{{item.user_id[0].nickname}}</view>
						<view class="font-size24 color-8C8888">{{item.comment_type === 1 ? '评论了你的动态' : '回复了你的评论'}}</view>
					</view>
				</view>
				<view class="font-size30 d-dec">
					{{item.comment_content}}
				</view>
				<view class="flex align-center margin-t20 font-size22">
					<view class="font-size28">
						{{formatDate(item.comment_date,'YYYY-MM-DD hh:mm')}}
					</view>
					<view class="marginlauto flex align-center">
						<view class="font-size28 margin-l10 flex align-center" @click="toDel(item)">
							<uni-icons type="chat" size="14" color="#8C8888"></uni-icons>
							<view style="margin-left: 5rpx;">
								回复
							</view>
						</view>
					</view>
				</view>
			</view>
			<Empty v-if="commnt.length === 0"></Empty>
		</view>
	</view>
</template>

<script setup>
	import { ref } from 'vue';
	import { onLoad, onReachBottom } from '@dcloudio/uni-app'
	import { getMyComments, updateCommentsState } from '@/cloud-api/index.js'
	import { formatDate } from '@/utils/date.js'
	import cuNavbar from '@/components/cu-navbar/cu-navbar.vue'
	import Empty from '@/components/Empty/index.vue'
	import { showLoading, toNextPage } from '../../core/app';

	const commnt = ref([])
	const userInfo = ref({})
	const total = ref(true)

	const pageNum = ref(0)

	const initData = () => {
		showLoading()
		getMyComments(pageNum.value).then(res => {
			commnt.value = [...commnt.value, ...res.data]
			if (res.data.length === 0) {
				total.value = false
			}
		}).finally(() => {
			uni.hideLoading()
		})
	}

	onLoad(() => {
		initData()
		// 将我的未读，改为全部已读
		updateCommentsState()
	})

	const toDel = (item) => {
		toNextPage(`/subShare/dynamic-details/dynamic-details?id=${item.relevance_id}`)
	}

	onReachBottom(() => {
		if (total.value) {
			pageNum.value += 1
			initData()
		}
	})
</script>

<style scoped>
	.d-avatar {
		width: 76rpx;
		height: 76rpx;
		border-radius: 50%;
		margin-right: 12rpx;
	}

	.d-dec {
		padding: 26rpx 0;
		border-bottom: 1px solid #F3F3F3;
	}
</style>
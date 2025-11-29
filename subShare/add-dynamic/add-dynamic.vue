<template>
	<view>
		<view class="hread">
			<cuNavbar bgColor="transparent" :fixed="false">
				<template #content>
					<view class="font-size36 color-352926 font-weight">新动态</view>
				</template>
			</cuNavbar>
			<view class="padding-lr20">
				<view class="padding-lr10 flex justify-between margin-b24 font-size28">
					<view class="color-775047">动态类型</view>
					<picker @change="typeChange" mode="selector" :range="typeList" range-key="name">
						<view class="color-8C8888 flex align-center">
							<text>{{ typeName }}</text>
							<uni-icons type="right" size="13"></uni-icons>
						</view>
					</picker>
				</view>
				<view class="content">
					<textarea class="c-textarea" placeholder="分享你的新鲜事~" v-model="content"></textarea>
					<view class="chooseBox">
						<view class="choseimg" @click="chooseimg"></view>
						<image mode="aspectFill" class="c-img" v-for="(item, index) in imgs" :key="index" :src="item">
						</image>
					</view>
				</view>
				<!-- <view class="margin-t30 flex">
					<view class="huati" @click="choseTopic">
						<image class="huati-icon"
							src="https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/huati.png" mode=""></image>
						<text>话题</text>
					</view>
					<view class="huati" v-if="select_topic._id">
						<text>#{{ select_topic.name }}</text>
					</view>
				</view> -->
			</view>
		</view>

		<!-- <uni-popup ref="popup" type="bottom" border-radius="10px 10px 0 0" background-color="#ffffff">
			<view class="padding-tb20 font-weight" style="text-align: center">选择话题</view>
			<scroll-view scroll-y="true" style="height: 60vh" @scrolltolower="lower">
				<view class="huati-box" style="overflow-y: auto">
					<view class="huati-item" v-for="item in topic_list" :key="item._id" @click="select(item)">
						#{{ item.name }}
					</view>
				</view>
			</scroll-view>
		</uni-popup> -->

		<FixedButton title="发布" @trigger="publish"></FixedButton>
	</view>
</template>

<script setup>
	import { onLoad } from '@dcloudio/uni-app'
	import { ref, computed } from 'vue'
	import cuNavbar from '@/components/cu-navbar/cu-navbar.vue'
	import FixedButton from '@/components/Fixed-button/index.vue'
	import { addDynamic } from '@/cloud-api/dynamic.js'
	// import { getTopic } from '@/cloud-api/index.js'
	import { showLoading, showToast, asyncUploadFile } from '@/core/app.js'


	const imgs = ref([])
	const content = ref('')
	// const topic_list = ref([])
	// const select_topic = ref({})
	// const popup = ref(null)
	// const pageNum = ref(0)
	// const total = ref(0)
	const typeList = ref([{
		name: '普通动态',
		value: 1
	}, {
		name: '问答',
		value: 2
	}, {
		name: '种草',
		value: 3
	}, {
		name: '送养',
		value: 4
	}, {
		name: '服务',
		value: 5
	}])

	const choseSort = ref(1)
	const typeChange = (e) => {
		choseSort.value = typeList.value[e.detail.value].value
	}

	const typeName = computed(() => {
		const data = typeList.value.find(ele => ele.value === choseSort.value)
		if (data) {
			return data.name
		} else {
			return ''
		}
	})

	const chooseimg = () => {
		asyncUploadFile().then(results => {
			results.forEach(result => { imgs.value.push(result.fileID) });
		})
	}

	// const initTopic = () => {
	// 	getTopic({
	// 		pageNum: pageNum.value,
	// 		pageSize: 50
	// 	}).then(res => {
	// 		topic_list.value = topic_list.value.concat(res.data)
	// 		total.value = res.count
	// 	})
	// }

	// onLoad(() => {
	// 	initTopic()
	// })

	// const choseTopic = () => {
	// 	popup.value.open()
	// }

	// const select = (item) => {
	// 	select_topic.value = item
	// 	popup.value.close()
	// }

	// const lower = () => {
	// 	if (topic_list.value.length < total.value) {
	// 		pageNum.value += 10
	// 		initTopic()
	// 	}
	// }

	const publish = () => {
		if (!content.value) return showToast('请输入你分享的内容~')
		showLoading()
		// #ifdef H5
		const obj = {
			content: content.value,
			sort: choseSort.value,
			imgs: imgs.value.join(',')
		}
		addDynamic(obj).then(res => {
			uni.navigateBack()
			uni.$emit('saveRecord')
		}).finally(() => {
			uni.hideLoading()
		})
		// #endif

		// #ifdef MP-WEIXIN
		uniCloud.callFunction({ name: 'set-check-text', data: { text: content.value } }).then(res => {
			if (res.result.errCode === 400) {
				showToast('内容不合规，请重新编辑')
			} else {
				const obj = {
					content: content.value,
					sort: choseSort.value,
					imgs: imgs.value.join(',')
				}
				addDynamic(obj).then(res => {
					uni.navigateBack()
					uni.$emit('saveRecord')
				}).finally(() => {
					uni.hideLoading()
				})
			}
		})
		// #endif
	}
</script>

<style scoped>
	.content {
		height: 976rpx;
		background-image: url('https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/share.png');
		background-size: 100% 100%;
		padding: 60rpx;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
	}

	.chooseBox {
		margin-top: 60rpx;
		gap: 20rpx;
		display: grid;
		grid-template-columns: repeat(4, 1fr);
	}

	.choseimg {
		width: 130rpx;
		height: 130rpx;
		background-image: url('https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/chooseimg.png');
		background-size: 100% 100%;
	}

	.c-textarea {
		flex: 1;
		font-size: 30rpx;
	}

	.c-img {
		width: 130rpx;
		height: 130rpx;
		border-radius: 10rpx;
	}

	.huati-icon {
		width: 32rpx;
		height: 30rpx;
		margin-right: 6rpx;
	}

	.huati {
		padding: 0 30rpx;
		height: 48rpx;
		line-height: 48rpx;
		background: #fff7f1;
		border-radius: 74rpx;
		border: 1px solid #775047;
		text-align: center;
		font-size: 24rpx;
		color: #775047;
		display: flex;
		align-items: center;
		margin-right: 20rpx;
	}

	.custom-input {
		margin: 32rpx 0;
		background-color: #f8f7f8;
		padding: 24rpx;
		display: flex;
		justify-content: space-between;
	}

	.hread {
		background: linear-gradient(180deg, #e0e8c6 0%, rgba(224, 232, 198, 0) 100%);
		border-radius: 0px 0px 0px 0px;
	}

	.huati-box {
		flex: 1;
		display: flex;
		flex-wrap: wrap;
		padding: 20rpx;
		gap: 20rpx;
	}

	.huati-item {
		border: 1px solid #8c8888;
		padding: 10rpx;
		font-size: 26rpx;
		border-radius: 50rpx;
	}
</style>
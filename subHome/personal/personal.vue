<template>
	<view>
		<view class="hread">
			<cuNavbar bgColor="transparent" :fixed="false">
				<template #content>
					<view class="font-size32 color-352926 font-weight">
						主页
					</view>
				</template>
			</cuNavbar>

			<view class="userInfo flex align-center ">
				<image class="avatar" :src="userInfo.avatar_file ? userInfo.avatar_file.url : BASE_URL_AVATAR"></image>
				<view class="margin-l20">
					<view class="font-size30 margin-b16 color-352926 font-weight"> {{userInfo.nickname || '清愿者'}} </view>
					<view class="flex">
						<view class="chenghao"> {{ palyer.achievement_id[0].name || '清愿者' }} </view>
					</view>
				</view>

			</view>

			<view class="content">
				<view class="flex justify-center margin-b40">
					<view class="menu  menu-ac" >
						动态
					</view>
				</view>
			<view class="flex margin-b30" v-for="(item,index) in dynamicList" :key="item._id" @click="toDel(item)">
						<view class="flex flex-direction align-center">
							<view class="print"></view>
							<view class="line" v-if="index<dynamicList.length-1"></view>
						</view>
						<view class="margin-l20 flex-1">
							<view class="color-8C8888 font-size28 margin-b16">
								{{ formatDate(item.publish_date) }}
							</view>
							<view class="dongtai-item">
								<view class="font-size30">
									{{item.content}}
								</view>
								<view class="margin-t20 img-box" v-if="item.imgs.length>0">
									<image mode="aspectFill" class="imgs" v-for="img in item.imgs" :key="img" :src="img">
									</image>
								</view>
								<view class="flex align-center font-size22 see">
									<view class="marginlauto flex align-center">
										<uni-icons type="chat" size="14" color="#8C8888"></uni-icons>
										<text class="font-size28 margin-l10">{{item.comment_count}}</text>
									</view>
									<!-- <view class="right-line"></view>
									<view class=" flex align-center">
										<uni-icons type="eye" size="14" color="#8C8888"></uni-icons>
										<text class="font-size28 margin-l10">{{item.view_count}}</text>
									</view> -->
								</view>
							</view>
						</view>
					</view>
			</view>
		</view>


	</view>
</template>

<script setup>
	import { reactive, ref, unref } from 'vue'
	import { showLoading, showToast, toNextPage } from '@/core/app.js'
	import { BASE_URL_AVATAR } from '@/core/config.js'
	import { onLoad, onReachBottom } from '@dcloudio/uni-app'
	import { getPlayerInfo, getUserDynamic, addRoom, follow, removeFollow } from '@/cloud-api/index.js'
	import { store } from '@/uni_modules/uni-id-pages/common/store'
	import { formatDate } from '@/utils/date.js'
	import Empty from '@/components/Empty/index.vue'
	import cuNavbar from '@/components/cu-navbar/cu-navbar.vue'

	const menuIndex = ref(1)
	const userInfo = ref({})
	const achievements = ref([])
	const userID = ref('')
	const conversationsId = ref('')
	const dynamicList = ref([])
	const challenges = ref([])
	const palyer = ref({
		achievement_id: [{ name: '', icon: '' }],
		pet_modal_id: [{ url: 'https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/petModal/modal1.png' }]
	})

	const pageNum = ref(0)
	const dynamicCount = ref(0)

	const menus = ref([ {
		id: 1,
		name: '动态'
	}])

	const stats = reactive([{
		id: 1,
		icon: 'https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/liliang.png',
		name: '力量',
		value: 0
	}, {
		id: 2,
		icon: 'https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/zhihui.png',
		name: '智慧',
		value: 0
	}, {
		id: 3,
		icon: 'https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/minjie.png',
		name: '敏捷',
		value: 0
	}])

	const imgs = ref(['https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/zhuye.png',
		'https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/zhuye.png',
		'https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/zhuye.png',
		'https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/zhuye.png'
	])

	const changeMenu = (index) => {
		menuIndex.value = index
	}

	const showPic = (url) => {
		uni.previewImage({
			indicator: "none",
			current: url,
			urls: imgs
		});
	}


	const setPalyer = (data) => {
		stats[0].value = data.strength
		stats[1].value = data.wisdom
		stats[2].value = data.agility
	}

	const initDynamic = () => {
		getUserDynamic({ id: userID.value, pageNum: pageNum.value }).then(result => {
			dynamicCount.value = result.count
			const arr = result.data.map(val => {
				val.imgs = val.imgs ? val.imgs.split(',') : []
				return val
			})
			dynamicList.value = [...dynamicList.value, ...arr]
			
		})
	}


	const fans = ref(0)
	const myFollow = ref(0)
	const isFollow = ref(false)
	const initFollow = (id) => {
		const db = uniCloud.database()
		db.collection('app-follow').where(`user_id == '${id}'`).count().then(res => {
			myFollow.value = res.result.total
		})
		db.collection('app-follow').where(`follow_user_id == '${id}'`).count().then(res => {
			fans.value = res.result.total
		})
		db.collection('app-follow').where(`follow_user_id == '${id}' && user_id == $cloudEnv_uid`).count().then(res => {
			isFollow.value = res.result.total > 0
		})
	}

	onLoad(({ user_id }) => {
		
		if (store.userInfo._id == user_id) {
			menus.value = [{
				id: 1,
				name: '动态'
			}]
			menuIndex.value = 1
		}
		showLoading()
		userID.value = user_id
		getPlayerInfo(user_id).then(res => {
			userInfo.value = res.dataList[0].data
			achievements.value = res.dataList[1].data
			palyer.value = res.dataList[2].data
			challenges.value = res.dataList[3].data
			setPalyer(palyer.value)
		}).finally(() => {
			uni.hideLoading()
		})
		initDynamic()
		// initFollow(user_id)
	})


	onReachBottom(() => {
		if (menuIndex.value === 1) {
			if (dynamicList.value.length < dynamicCount.value) {
				pageNum.value += 1
				initDynamic()
			}
		}

	})

	const toMessage = () => {
		showLoading()
		addRoom([store.userInfo._id, userInfo.value._id]).then(res => {
			conversationsId.value = res.id
		}).catch(err => {
			conversationsId.value = err
		}).finally(() => {
			uni.hideLoading()
			toNextPage(
				`/subHome/chat-room/chat-room?nickname=${userInfo.value.nickname}&avatar=${userInfo.value.avatar_file.url}&user_id=${userID.value}&conversations_id=${conversationsId.value}`
			)
		})
	}

	const toDel = (item) => {
		const userinfo = {
			...userInfo.value,
			player: [palyer.value]
		}
		toNextPage(
			`/subShare/dynamic-details/dynamic-details?id=${item._id}`
		)
	}

	const toFollow = () => {
		showLoading()
		if (isFollow.value) {
			removeFollow(userInfo.value._id).then(res => {
				fans.value--
				isFollow.value = false
				uni.hideLoading()
				showToast('已取消')
			})
		} else {
			follow(userInfo.value._id).then(res => {
				fans.value++
				isFollow.value = true
				uni.hideLoading()
				showToast('已关注')
			})
		}
	}
</script>

<style lang="scss" scoped>
	.hread {
		width: 750rpx;
		height: 312rpx;
		background-color: #dce5bf;
		background-size: 100% 100%;
		box-sizing: border-box;
	}

	.userInfo {
		padding: 30rpx;
	}

	.avatar {
		width: 102rpx;
		height: 102rpx;
		border-radius: 50%;
	}

	.chenghao {
		height: 42rpx;
		line-height: 42rpx;
		background: #F5F8EB;
		border-radius: 12rpx;
		padding: 0 20rpx;
		font-size: 22rpx;
		color: #AFC272;
	}

	.siliao {
		width: 66rpx;
		height: 66rpx;
		margin-left: auto;
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

	.model {
		width: 228rpx;
		height: 306rpx;
	}

	.jingyanzhi {
		width: 32rpx;
		height: 32rpx;
	}


	.stats-item {
		width: 120rpx;
		height: 58rpx;
		background: #FFFFFF;
		border-radius: 24rpx;
		font-weight: bold;
		margin-right: 20rpx;
	}

	.icon {
		width: 32rpx;
		height: 32rpx;
		margin-right: 10rpx;
	}

	.content {
		background-color: #F7F5F6;
		border-top-right-radius: 40rpx;
		border-top-left-radius: 40rpx;
		padding: 30rpx;
		position: relative;
	}

	.menu {
		margin-right: 44rpx;
		font-size: 32rpx;
		color: #8C8888;
	}

	.menu-ac {
		color: #000000;
		position: relative;
	}

	.menu-ac::after {
		content: ' ';
		width: 60rpx;
		height: 12rpx;
		background-image: url('../../static/icon/zhishiqi.png');
		background-size: 100% 100%;
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		bottom: -15rpx;
	}

	.chengjiu {
		background: #FFFFFF;
		border-radius: 24rpx;
		padding: 30rpx;
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 30rpx;
	}

	.c-img {
		width: 116rpx;
		height: 116rpx;
		margin-bottom: 10rpx;
	}

	.tiaozhan {
		background: #FFFFFF;
		border-radius: 24rpx;
		padding: 30rpx;
	}

	.print {
		width: 34rpx;
		height: 34rpx;
		background-image: url('https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/lineprint.png');
		background-size: 100% 100%;
		box-sizing: border-box;
		margin-top: 2rpx;
	}

	.line {
		border-left: 1px dashed #B4B4B4;
		margin-top: 20rpx;
		flex: 1;
	}


	.dongtai-item {
		background: #FFFFFF;
		padding: 24rpx;
		border-radius: 10rpx;
	}

	.right-line {
		border-right: 1px solid #8C8888;
		height: 16rpx;
		margin: 0 20rpx;
	}

	.see {
		padding-top: 20rpx;
		margin-top: 20rpx;
		border-top: 1px solid #F3F3F3;
	}

	.img-box {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 20rpx;
	}

	.imgs {
		width: 132rpx;
		height: 132rpx;
		border-radius: 12rpx;
	}

	.dengji {
		width: 38rpx;
		height: 38rpx;
		margin-right: 14rpx;
	}

	.follow-s {
		background-color: #F7F5F6;
		color: #8C8888;
	}

	.tiaozhan-img {
		width: 106rpx;
		height: 106rpx;
		margin-bottom: 10rpx;
	}
</style>
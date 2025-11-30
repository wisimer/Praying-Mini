<template>
	<view class="page-container">
		<view class="hread-box">
			<view class="hread">
				<view class="tab-bar">
					<view 
						class="tab-item" 
						v-for="(tab, index) in tabs" 
						:key="index" 
						:class="{ active: currentTab === index }"
						@click="switchTab(index)"
					>
						<text>{{ tab.name }}</text>
						<view class="active-line" v-if="currentTab === index"></view>
						<view class="badge" v-if="tab.count > 0">{{ tab.count }}</view>
					</view>
				</view>
			</view>
		</view>

		<swiper 
			class="content-swiper" 
			:current="currentTab" 
			@change="onSwiperChange"
			duration="300"
		>
			<!-- 任务 Tab -->
			<swiper-item>
				<scroll-view scroll-y class="scroll-content" @scrolltolower="loadMoreTasks">
					<view class="padding32">
						<view class="task-item margin-b24" v-for="item in taskList" :key="item._id" @click="openTaskPopup(item)">
							<view class="flex align-center">
								<image :src="item.requester.avatar ? item.requester.avatar : 'https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/avatar_default.png'" class="avatar-small"></image>
								<view class="flex-1 margin-l20">
									<view class="font-size30 font-weight text-cut" style="max-width: 400rpx;">{{ item.task_name }}</view>
									<view class="font-size24 color-8C8888 margin-t10">
										{{ getMsgTypeDesc(item.msg_type) }} - {{ item.requester.nickname }}
									</view>
								</view>
								<view class="status-tag">{{ getStatusText(item.msg_type) }}</view>
							</view>
						</view>
						<Empty v-if="taskList.length === 0 && !loadingTasks" description="暂无任务消息"></Empty>
					</view>
				</scroll-view>
			</swiper-item>

			<!-- 评论 Tab -->
			<swiper-item>
				<scroll-view scroll-y class="scroll-content" @scrolltolower="loadMoreComments">
					<view class="padding32">
						<view class="c-card margin-b24" v-for="item in commentList" :key="item._id">
							<view class="flex align-center">
								<image :src="item.user_id[0].avatar" class="d-avatar"></image>
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
						<Empty v-if="commentList.length === 0 && !loadingComments" description="暂无评论消息"></Empty>
					</view>
				</scroll-view>
			</swiper-item>

			<!-- 收藏 Tab -->
			<swiper-item>
				<scroll-view scroll-y class="scroll-content" @scrolltolower="loadMoreLikes">
					<view class="padding32">
						<view class="margin-b24" v-for="item in likeList" :key="item._id">
							<DynamicCard 
								:user-info="item.dynamicInfo[0].userInfo[0]" 
								:dynamic-detail="item.dynamicInfo[0]"
								:isDetails="true"
							></DynamicCard>
						</view>
						<Empty v-if="likeList.length === 0 && !loadingLikes" description="暂无收藏消息"></Empty>
					</view>
				</scroll-view>
			</swiper-item>
		</swiper>

		<!-- 任务详情弹窗 -->
		<uni-popup ref="taskPopup" type="center" :mask-click="true">
			<view class="popup-content">
				<view class="popup-header">
					<text class="font-size32 font-weight">任务请求</text>
					<uni-icons type="closeempty" size="24" @click="closeTaskPopup" color="#999"></uni-icons>
				</view>
				<view class="popup-body flex-col align-center" v-if="currentTask">
					<image :src="currentTask.requester.avatar ? currentTask.requester.avatar : 'https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/avatar_default.png'" class="popup-avatar margin-b20" @click="toUserHome(currentTask.requester._id)"></image>
					<view class="font-size32 margin-b10">{{ currentTask.requester.nickname }}</view>
					<view class="font-size28 color-666 margin-b30 text-center">
						{{ getPopupDesc(currentTask) }}
					</view>
					
					<!-- msg_type 0: Agree / Reject -->
					<block v-if="currentTask.msg_type === 0">
						<button class="agree-btn" @click="handleTaskAction('agree')">同意请求</button>
						<button class="reject-btn margin-t20" @click="handleTaskAction('reject')">拒绝请求</button>
					</block>

					<!-- msg_type 1: Completed / Give Up -->
					<block v-if="currentTask.msg_type === 1">
						<button class="agree-btn" @click="handleTaskAction('complete')">已完成</button>
						<button class="reject-btn margin-t20" @click="handleTaskAction('giveUp')">放弃任务</button>
					</block>

					<!-- msg_type 2: Confirm / Not Completed -->
					<block v-if="currentTask.msg_type === 2">
						<button class="agree-btn" @click="handleTaskAction('confirm')">确认完成</button>
						<button class="reject-btn margin-t20" @click="handleTaskAction('deny')">任务未完成</button>
					</block>

					<button class="visit-btn margin-t20" @click="toUserHome(currentTask.requester._id)">查看主页</button>
					<button class="visit-btn margin-t20" @click="viewTaskDetail(currentTask)">查看任务详情</button>
				</view>
			</view>
		</uni-popup>

	</view>
</template>

<script setup>
	import { ref, onMounted, computed } from 'vue'
	import { onLoad, onShow } from '@dcloudio/uni-app'
	import { store } from '@/uni_modules/uni-id-pages/common/store'
	import { getMyComments, updateCommentsState } from '@/cloud-api/index.js'
	import { getLikes } from '@/cloud-api/dynamic.js'
	import { showLoading, showToast, toNextPage } from '@/core/app.js'
	import { formatDate } from '@/utils/date.js'
	import Empty from '@/components/Empty/index.vue'
	import DynamicCard from '@/components/Dynamic-card/index.vue'

	// Tab Configuration
	const currentTab = ref(0)
	const tabs = ref([
		{ name: '任务', count: 0 },
		{ name: '评论', count: 0 },
		{ name: '收藏', count: 0 }
	])

	// Swiper Change Handler
	const onSwiperChange = (e) => {
		currentTab.value = e.detail.current
		loadTabData(currentTab.value)
	}

	const switchTab = (index) => {
		currentTab.value = index
	}

	// Data & Loading States
	const taskList = ref([])
	const loadingTasks = ref(false)
	const taskPage = ref(0)
	const taskTotal = ref(true)

	const commentList = ref([])
	const loadingComments = ref(false)
	const commentPage = ref(0)
	const commentTotal = ref(true)

	const likeList = ref([])
	const loadingLikes = ref(false)
	const likePage = ref(0)
	const likeTotal = ref(true)

	// Task Popup
	const taskPopup = ref(null)
	const currentTask = ref(null)

	// Init
	onLoad(() => {
		loadTabData(0)
		loadTabData(1)
		loadTabData(2)
		// Initialize counts if needed
		tabs.value[1].count = Number(getApp().globalData.comments || 0)
	})

	onShow(() => {
		// Update badge counts if global data changes
		tabs.value[1].count = Number(getApp().globalData.comments || 0)
	})

	const loadTabData = (index) => {
		if (index === 0 && taskList.value.length === 0) loadMoreTasks()
		if (index === 1 && commentList.value.length === 0) loadMoreComments()
		if (index === 2 && likeList.value.length === 0) loadMoreLikes()
	}

	// --- Task Logic ---
    const getMsgTypeDesc = (type) => {
        const map = {
            0: '发起任务请求',
            1: '任务进行中',
            2: '任务完成待确认',
            3: '任务已完成',
            '-1': '请求已拒绝',
            '-2': '任务已放弃',
            '-3': '任务未认可'
        }
        return map[type] || '未知状态'
    }

    const getStatusText = (type) => {
        if(type === 0) return '待处理'
        if(type === 1) return '进行中'
        if(type === 2) return '待确认'
        if(type === 3) return '已完成'
        return '已结束'
    }

    const getPopupDesc = (task) => {
        if(task.msg_type === 0) return `请求与您共同完成任务：${task.task_name}`
        if(task.msg_type === 1) return `任务正在进行中：${task.task_name}`
        if(task.msg_type === 2) return `对方标记任务已完成，请确认：${task.task_name}`
        return `任务状态变更：${task.task_name}`
    }

    const viewTaskDetail = (task) => {
        if(task.relevance_id && task.relevance_id[0]) {
            toNextPage(`/subShare/dynamic-details/dynamic-details?id=${task.relevance_id[0]._id}`)
        }
    }

	const loadMoreTasks = async () => {
		if (!taskTotal.value || loadingTasks.value) return
		loadingTasks.value = true
		
        const db = uniCloud.database()
        const taskMsg = db.collection('app-task-message').where(`to_user_id == $cloudEnv_uid`).getTemp()
        const users = db.collection('uni-id-users').field('_id,nickname,avatar').getTemp()
        const dynamics = db.collection('app-dynamic').field('_id,content,price,article_status').getTemp()

        try {
            const res = await db.collection(taskMsg, users, dynamics)
                .orderBy('request_date', 'desc')
                .skip(taskPage.value * 10)
                .limit(10)
                .get()

            const newTasks = res.result.data.map(item => ({
                ...item,
                requester: item.from_user_id && item.from_user_id[0] ? item.from_user_id[0] : {},
                task: item.relevance_id && item.relevance_id[0] ? item.relevance_id[0] : {},
                task_name: item.relevance_id && item.relevance_id[0] ? item.relevance_id[0].content : '未知任务'
            }))
			
			taskList.value = [...taskList.value, ...newTasks]
			if (newTasks.length < 10) taskTotal.value = false
			taskPage.value++
        } catch (e) {
            console.error(e)
            // showToast('获取任务列表失败')
        } finally {
            loadingTasks.value = false
        }
	}

	const openTaskPopup = (item) => {
		currentTask.value = item
		taskPopup.value.open()
	}

	const closeTaskPopup = () => {
		taskPopup.value.close()
	}

    const handleTaskAction = async (action) => {
        if(!currentTask.value) return
        
        const db = uniCloud.database()
        const task = currentTask.value
        const taskId = task.relevance_id && task.relevance_id[0] ? task.relevance_id[0]._id : ''
        const fromUserId = task.from_user_id && task.from_user_id[0] ? task.from_user_id[0]._id : ''

        if (!fromUserId) {
            showToast('无法获取对应用户信息')
            return
        }

        let newMsgType = 0
        let toUser = ''
        let dynamicStatus = null

        if (action === 'agree') {
            newMsgType = 1
            toUser = fromUserId
            dynamicStatus = 2 
        } else if (action === 'reject') {
            newMsgType = -1
            toUser = fromUserId
            dynamicStatus = -2 
        } else if (action === 'complete') {
            newMsgType = 2
            toUser = fromUserId 
        } else if (action === 'giveUp') {
            newMsgType = -2
            toUser = fromUserId
        } else if (action === 'confirm') {
            newMsgType = 3
            toUser = fromUserId
        } else if (action === 'deny') {
            newMsgType = -3
            toUser = fromUserId
        }

        showLoading()
        try {
            // Update dynamic status if needed
            if (dynamicStatus !== null && taskId) {
                 await db.collection('app-dynamic').doc(taskId).update({
                     article_status: dynamicStatus
                 })
            }

            // Insert new message
            await db.collection('app-task-message').add({
                relevance_id: taskId,
                from_user_id: store.userInfo._id,
                to_user_id: toUser,
                msg_type: newMsgType
            })
            
            showToast('操作成功')
            closeTaskPopup()
            // Refresh list
            taskPage.value = 0
            taskList.value = []
            taskTotal.value = true
            loadMoreTasks()

        } catch (e) {
            console.error(e)
            showToast('操作失败')
        } finally {
            uni.hideLoading()
        }
    }

	const toUserHome = (userId) => {
        if(userId) {
		    toNextPage(`/subHome/personal/personal?user_id=${userId}`)
        }
	}


	// --- Comment Logic ---
	const loadMoreComments = () => {
		if (!commentTotal.value || loadingComments.value) return
		loadingComments.value = true
		getMyComments(commentPage.value).then(res => {
			commentList.value = [...commentList.value, ...res.data]
			if (res.data.length === 0) {
				commentTotal.value = false
			}
			commentPage.value++
		}).finally(() => {
			loadingComments.value = false
		})
	}

	const toDel = (item) => {
		toNextPage(`/subShare/dynamic-details/dynamic-details?id=${item.relevance_id}`)
	}

	// --- Like/Collect Logic ---
	const loadMoreLikes = () => {
		if (!likeTotal.value || loadingLikes.value) return
		loadingLikes.value = true
		getLikes(likePage.value).then(result => {
			if (result.data.length === 0) {
				likeTotal.value = false
			}
			const arr = result.data.map(val => {
				if (val.dynamicInfo && val.dynamicInfo[0]) {
					val.dynamicInfo[0].imgs = val.dynamicInfo[0].imgs ? val.dynamicInfo[0].imgs.split(',') : []
				}
				return val
			})
			// Filter out items with missing dynamicInfo to prevent errors
			const validArr = arr.filter(item => item.dynamicInfo && item.dynamicInfo[0] && item.dynamicInfo[0].userInfo && item.dynamicInfo[0].userInfo[0])
			
			likeList.value = [...likeList.value, ...validArr]
			likePage.value++
		}).finally(() => {
			loadingLikes.value = false
		})
	}

</script>

<style lang="scss" scoped>
	.page-container {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background-color: #F8F8F8;
	}

	.hread-box {
		height: 352rpx;
		flex-shrink: 0;
	}

	.hread {
		width: 750rpx;
		height: 352rpx;
		background-image: url('https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/xiaoxi.png');
		background-size: 100% 100%;
		padding: 0 30rpx;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 9;
	}

	.tab-bar {
		width: 100%;
		display: flex;
		justify-content: space-around;
		padding-bottom: 20rpx;
	}

	.tab-item {
		position: relative;
		padding: 20rpx 40rpx;
		font-size: 30rpx;
		color: #352926;
		opacity: 0.7;
		transition: all 0.3s;

		&.active {
			font-weight: bold;
			opacity: 1;
			font-size: 34rpx;
		}

		.active-line {
			position: absolute;
			bottom: 10rpx;
			left: 50%;
			transform: translateX(-50%);
			width: 40rpx;
			height: 6rpx;
			background-color: #352926;
			border-radius: 3rpx;
		}
		
		.badge {
			position: absolute;
			top: 10rpx;
			right: 10rpx;
			background-color: #FF4D4F;
			color: white;
			font-size: 20rpx;
			padding: 0 8rpx;
			border-radius: 20rpx;
			min-width: 30rpx;
			text-align: center;
		}
	}

	.content-swiper {
		flex: 1;
		height: calc(100vh - 352rpx);
	}

	.scroll-content {
		height: 100%;
	}

	.padding32 {
		padding: 32rpx;
	}

	/* Reuse styles */
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

	/* Task Item Styles */
	.task-item {
		background: #fff;
		padding: 30rpx;
		border-radius: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
	}
	
	.avatar-small {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
	}

	.status-tag {
		background: #E5EDCB;
		color: #5F6B41;
		padding: 6rpx 20rpx;
		border-radius: 30rpx;
		font-size: 24rpx;
	}

	/* Popup Styles */
	.popup-content {
		background-color: #fff;
		width: 600rpx;
		border-radius: 24rpx;
		padding: 40rpx;
		overflow: hidden;
	}

	.popup-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 40rpx;
	}

	.popup-avatar {
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		border: 4rpx solid #fff;
		box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
	}

	.agree-btn {
		background-color: #afc272;
		color: white;
		border-radius: 40rpx;
		width: 80%;
		font-size: 30rpx;
		border: none;
		
		&:active {
			opacity: 0.9;
		}
	}
	
	.visit-btn {
		background-color: #f5f5f5;
		color: #666;
		border-radius: 40rpx;
		width: 80%;
		font-size: 30rpx;
		border: none;
	}
	
	.flex-col {
		display: flex;
		flex-direction: column;
	}
	
	.text-center {
		text-align: center;
	}
</style>
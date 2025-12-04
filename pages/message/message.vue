<template>
	<view class="page-container">
    <!-- Background Gradient -->
    <div class="page-bg"></div>

		<view class="hread-box" :style="headerHeight ? { height: headerHeight + 'px' } : {}">
			<view class="hread" :style="headerHeight ? { height: headerHeight + 'px', paddingTop: headerPaddingTop + 'px' } : {}">
				<view class="tab-bar">
					<view 
						class="tab-item" 
						v-for="(tab, index) in tabs" 
						:key="index" 
						:class="{ active: currentTab === index }"
						@click="switchTab(index)"
					>
						<text>{{ tab.name }}</text>
						<view class="active-indicator" v-if="currentTab === index"></view>
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
			:style="headerHeight ? { height: `calc(100vh - ${headerHeight}px)` } : {}"
		>
			<!-- 任务 Tab -->
			<swiper-item>
				<scroll-view scroll-y class="scroll-content" @scrolltolower="loadMoreTasks">
					<view class="padding32">
						<view class="task-item margin-b24" v-for="item in taskList" :key="item._id" @click="openTaskPopup(item)">
							<view class="flex align-center">
								<image :src="item.requester.avatar ? item.requester.avatar : 'https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/avatar_default.png'" class="avatar-small"></image>
								<view class="flex-1 margin-l20">
									<view class="font-size30 font-weight-bold text-cut" style="max-width: 400rpx; color: #333;">{{ item.task_name }}</view>
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
									<view class="font-size28 margin-b12 font-weight-bold">{{item.user_id[0].nickname}}</view>
									<view class="font-size24 color-8C8888">{{item.comment_type === 1 ? '评论了你的动态' : '回复了你的评论'}}</view>
								</view>
							</view>
							<view class="font-size30 d-dec">
								{{item.comment_content}}
							</view>
							<view class="flex align-center margin-t20 font-size22">
								<view class="font-size24 color-999">
									{{formatDate(item.comment_date,'YYYY-MM-DD hh:mm')}}
								</view>
								<view class="marginlauto flex align-center">
									<view class="reply-btn" @click="toDel(item)">
										<uni-icons type="chat" size="14" color="#8C8888"></uni-icons>
										<text class="margin-l10">回复</text>
									</view>
								</view>
							</view>
						</view>
						<Empty v-if="commentList.length === 0 && !loadingComments" description="暂无评论消息"></Empty>
					</view>
				</scroll-view>
			</swiper-item>

			<!-- 收藏 Tab -->
			<!-- <swiper-item>
				<scroll-view scroll-y class="scroll-content" @scrolltolower="loadMoreLikes">
					<view class="padding32">
						<view class="margin-b24 card-wrapper" v-for="item in likeList" :key="item._id">
							<DynamicCard 
								:user-info="item.dynamicInfo[0].userInfo[0]" 
								:dynamic-detail="item.dynamicInfo[0]"
								:isDetails="true"
							></DynamicCard>
						</view>
						<Empty v-if="likeList.length === 0 && !loadingLikes" description="暂无收藏消息"></Empty>
					</view>
				</scroll-view>
			</swiper-item> -->
		</swiper>

		<!-- 任务详情弹窗 -->
		<uni-popup ref="taskPopup" type="center" :mask-click="true">
			<view class="popup-card" v-if="currentTask">
				<!-- Header -->
				<view class="card-header">
					<view class="user-info">
						<image :src="currentTask.requester.avatar ? currentTask.requester.avatar : 'https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/avatar_default.png'" class="card-avatar"></image>
						<view class="user-details">
							<text class="nickname">@{{ currentTask.requester.nickname }}</text>
							<view class="profile-btn" @click="toUserHome(currentTask.requester._id)">
								<uni-icons type="person-filled" size="12" color="#fff"></uni-icons>
								<text class="btn-text">查看用户主页</text>
							</view>
						</view>
					</view>
				</view>
				
				<!-- Content Bubble -->
				<view class="content-bubble">
					<text class="bubble-text">{{ getPopupDesc(currentTask) }}</text>
				</view>
				
				<!-- Action Buttons -->
				<view class="action-buttons">
					<!-- msg_type 0: Agree / Reject -->
					<block v-if="currentTask.msg_type === 0">
						<button class="action-btn reject" @click="handleTaskAction('reject')">
                             <uni-icons type="closeempty" size="16" color="#fff"></uni-icons>
                             拒绝
                        </button>
						<button class="action-btn accept" @click="handleTaskAction('agree')">
                             <uni-icons type="checkmarkempty" size="16" color="#fff"></uni-icons>
                             接受
                        </button>
					</block>

					<!-- msg_type 1: Completed / Give Up -->
					<block v-if="currentTask.msg_type === 1">
						<button class="action-btn reject" @click="handleTaskAction('giveUp')">
                            <uni-icons type="closeempty" size="16" color="#fff"></uni-icons>
                            放弃
                        </button>
						<button class="action-btn accept" @click="handleTaskAction('complete')">
                            <uni-icons type="checkmarkempty" size="16" color="#fff"></uni-icons>
                            完成
                        </button>
					</block>

					<!-- msg_type 2: Confirm / Not Completed -->
					<block v-if="currentTask.msg_type === 2">
						<button class="action-btn reject" @click="handleTaskAction('deny')">
                            <uni-icons type="closeempty" size="16" color="#fff"></uni-icons>
                            拒绝
                        </button>
						<button class="action-btn accept" @click="handleCheckDetail(currentTask)">
                            <uni-icons type="eye" size="16" color="#fff"></uni-icons>
                            查看详情
                        </button>
					</block>
				</view>
			</view>
		</uni-popup>

	</view>
</template>

<script setup>
	import { MSG_TYPE, ARTICLE_STATUS } from '@/core/constants.js'
	import { ref, onMounted, computed } from 'vue'
	import { onLoad, onShow, onPullDownRefresh } from '@dcloudio/uni-app'
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
		// { name: '收藏', count: 0 }
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

    // Header Height Logic for MP-WEIXIN
    const headerHeight = ref(0)
    const headerPaddingTop = ref(0)

	// Init
	onLoad(() => {
        // #ifdef MP-WEIXIN
        // Calculate dynamic header height for WeChat Mini Program
        try {
            const menuButton = uni.getMenuButtonBoundingClientRect()
            const top = menuButton.bottom + 12 // Capsule bottom + spacing
            headerPaddingTop.value = top
            headerHeight.value = top + 46 // Top + Tab Bar Content Height (approx)
        } catch (e) {
            console.error('Header calculation failed:', e)
        }
        // #endif

		loadTabData(0)
		loadTabData(1)
		loadTabData(2)
		// Initialize counts if needed
		tabs.value[1].count = Number(getApp().globalData.comments || 0)

		uni.$on('refreshTasks', () => {
			taskPage.value = 0
			taskList.value = []
			taskTotal.value = true
			loadMoreTasks()
		})
		uni.$on('handleTaskCheckAction', (data) => {
			if (data && data.action) {
				handleTaskAction(data.action)
			}
		})
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
            [MSG_TYPE.REQUEST]: '发起任务请求',
            [MSG_TYPE.AGREE]: '任务进行中',
            [MSG_TYPE.COMPLETE_NOTIFY]: '任务完成待确认',
            [MSG_TYPE.CONFIRM_COMPLETE]: '任务已完成',
            [MSG_TYPE.REJECT]: '请求已拒绝',
            [MSG_TYPE.INCOMPLETE_NOTIFY]: '任务已放弃',
            [MSG_TYPE.CONFIRM_INCOMPLETE]: '任务未认可',
            [MSG_TYPE.PLATFORM_APPROVE]: '结算通知',
            [MSG_TYPE.PLATFORM_REJECT]: '审核未通过'
        }
        return map[type] || '未知状态'
    }

    const getStatusText = (type) => {
        if(type === MSG_TYPE.REQUEST) return '待处理'
        if(type === MSG_TYPE.AGREE) return '进行中'
        if(type === MSG_TYPE.COMPLETE_NOTIFY) return '待确认'
        if(type === MSG_TYPE.CONFIRM_COMPLETE) return '已完成'
        return '已结束'
    }

    const getPopupDesc = (task) => {
        if(task.msg_type === MSG_TYPE.REQUEST) return `请求与您共同完成任务：${task.task_name}`
        if(task.msg_type === MSG_TYPE.AGREE) return `任务正在进行中：${task.task_name}`
        if(task.msg_type === MSG_TYPE.COMPLETE_NOTIFY) return `对方标记任务已完成，请确认：${task.task_name}`
        return `任务状态变更：${task.task_name}`
    }

    const viewTaskDetail = (task) => {
        if(task.relevance_id && task.relevance_id[0]) {
            toNextPage(`/subShare/dynamic-details/dynamic-details?id=${task.relevance_id[0]._id}`)
        }
    }

    const handleCheckDetail = (task) => {
        const taskId = task.relevance_id && task.relevance_id[0] ? task.relevance_id[0]._id : ''
        if (taskId) {
            closeTaskPopup() // 点击查看详情后关闭弹窗
            toNextPage(`/pages/publish/task-check?taskId=${taskId}`)
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
        const task = item.task || {}
        const status = task.article_status !== undefined ? task.article_status : 0
        const msgType = item.msg_type !== undefined ? item.msg_type : 0

        if (Math.abs(status) > Math.abs(msgType) + 1) {
            showToast('该消息已处理，不可重复处理')
            return
        }

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

        let newMsgType = MSG_TYPE.REQUEST
        let toUser = ''
        let dynamicStatus = null

        if (action === 'agree') {
            newMsgType = MSG_TYPE.AGREE
            toUser = fromUserId
            dynamicStatus = ARTICLE_STATUS.APPROVED_EXECUTING 
        } else if (action === 'reject') {
            newMsgType = MSG_TYPE.REJECT
            toUser = fromUserId
            dynamicStatus = ARTICLE_STATUS.REJECTED 
        } else if (action === 'complete') {
            // Navigate to complete task page
            const taskId = task.relevance_id && task.relevance_id[0] ? task.relevance_id[0]._id : ''
            const toUserId = fromUserId
            closeTaskPopup()
            toNextPage(`/pages/publish/complete-task?taskId=${taskId}&toUserId=${toUserId}`)
            return // Stop further execution
        } else if (action === 'giveUp') {
            newMsgType = MSG_TYPE.INCOMPLETE_NOTIFY
            toUser = fromUserId
        } else if (action === 'confirm') {
            newMsgType = MSG_TYPE.CONFIRM_COMPLETE
            toUser = fromUserId
        } else if (action === 'deny') {
            newMsgType = MSG_TYPE.CONFIRM_INCOMPLETE
            toUser = fromUserId
        }

        showLoading()
        try {
            // Update dynamic status if needed
            if (dynamicStatus !== null && taskId) {
                 await db.collection('app-dynamic').doc(taskId).update({
                     article_status: dynamicStatus
                 })

				 if (action === 'agree') {
					// Update task status to accepted
					await db.collection('app-dynamic').doc(taskId).update({
						fullfill_user_id: toUser
					})
				}	
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
		if (!commentTotal.value || loadingComments.value) return Promise.resolve()
		loadingComments.value = true
		return getMyComments(commentPage.value).then(res => {
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
		if (!likeTotal.value || loadingLikes.value) return Promise.resolve()
		loadingLikes.value = true
		return getLikes(likePage.value).then(result => {
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

	onPullDownRefresh(async () => {
		const index = currentTab.value
		if (index === 0) {
			taskPage.value = 0
			taskList.value = []
			taskTotal.value = true
			loadingTasks.value = false
			await loadMoreTasks()
		} else if (index === 1) {
			commentPage.value = 0
			commentList.value = []
			commentTotal.value = true
			loadingComments.value = false
			await loadMoreComments()
		} else if (index === 2) {
			likePage.value = 0
			likeList.value = []
			likeTotal.value = true
			loadingLikes.value = false
			await loadMoreLikes()
		}
		uni.stopPullDownRefresh()
	})
</script>

<style lang="scss" scoped>
	.page-container {
		height: 100vh;
		display: flex;
		flex-direction: column;
		background-color: #f5f7fa;
        position: relative;
	}

    .page-bg {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        background: #f6f6f6;
        z-index: 0;
        opacity: 0.8;
    }

	.hread-box {
		height: 160rpx;
		flex-shrink: 0;
        position: relative;
        z-index: 10;
        padding-top: env(safe-area-inset-top);
	}

	.hread {
		width: 100%;
		height: 160rpx;
		padding: 0 30rpx;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 9;
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        padding-top: calc(40rpx + env(safe-area-inset-top));
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
		color: #676767;
		opacity: 0.8;
		transition: all 0.3s;

		&.active {
			font-weight: 800;
			opacity: 1;
			font-size: 34rpx;
            color: #333;
		}

		.active-indicator {
			position: absolute;
			bottom: 10rpx;
			left: 50%;
			transform: translateX(-50%);
			width: 40rpx;
			height: 8rpx;
			background-color: #FFD700; /* Yellow accent */
			border-radius: 4rpx;
		}
		
		.badge {
			position: absolute;
			top: 10rpx;
			right: 10rpx;
			background: linear-gradient(135deg, #FF6B81 0%, #FF8E9E 100%);
			color: white;
			font-size: 20rpx;
			padding: 0 10rpx;
			border-radius: 20rpx;
			min-width: 30rpx;
			text-align: center;
            box-shadow: 0 2rpx 6rpx rgba(255, 107, 129, 0.3);
		}
	}

	.content-swiper {
		flex: 1;
		height: calc(100vh - 160rpx);
        position: relative;
        z-index: 1;
	}

	.scroll-content {
		height: 100%;
	}

	.padding32 {
		padding: 32rpx;
	}

	/* Reuse styles */
	.d-avatar {
		width: 88rpx;
		height: 88rpx;
		border-radius: 50%;
		margin-right: 20rpx;
        border: 2rpx solid #eee;
	}

	.d-dec {
		padding: 20rpx 0;
        color: #555;
        line-height: 1.6;
	}

	/* Task Item Styles */
	.task-item, .c-card, .card-wrapper {
		background: #fff;
		padding: 32rpx;
		border-radius: 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
        margin-bottom: 24rpx;
        transition: transform 0.2s;
	}
    
    .task-item:active, .c-card:active {
        transform: scale(0.99);
    }
	
	.avatar-small {
		width: 88rpx;
		height: 88rpx;
		border-radius: 50%;
        border: 2rpx solid #f0f0f0;
	}

	.status-tag {
		background: #E6F7FF;
		color: #1890FF;
		padding: 8rpx 20rpx;
		border-radius: 30rpx;
		font-size: 24rpx;
        font-weight: 600;
	}

    .reply-btn {
        display: flex;
        align-items: center;
        padding: 8rpx 20rpx;
        background-color: #f5f7fa;
        border-radius: 20rpx;
        color: #666;
    }

	/* Popup Styles */
	.popup-card {
		background-color: #fff;
		width: 640rpx;
		border-radius: 32rpx;
		padding: 40rpx;
		overflow: hidden;
        box-shadow: 0 8rpx 32rpx rgba(0,0,0,0.1);
	}

	.card-header {
		margin-bottom: 30rpx;
	}

	.user-info {
		display: flex;
		align-items: center;
	}

	.card-avatar {
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		margin-right: 24rpx;
		border: 4rpx solid #fff;
        box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
	}

	.user-details {
		flex: 1;
	}

	.nickname {
		font-size: 36rpx;
		font-weight: 800;
		color: #333;
		display: block;
		margin-bottom: 12rpx;
	}

	.profile-btn {
		display: inline-flex;
		align-items: center;
		background: linear-gradient(135deg, #6FCFFB 0%, #B59DFF 100%);
		padding: 10rpx 24rpx;
		border-radius: 30rpx;
        box-shadow: 0 4rpx 10rpx rgba(181, 157, 255, 0.3);
		
		.btn-text {
			color: #fff;
			font-size: 24rpx;
			margin-left: 8rpx;
            font-weight: 600;
		}
	}

	.content-bubble {
		background-color: #F9FAFB;
		padding: 32rpx;
		border-radius: 24rpx;
        border: 2rpx solid #f0f0f0;
		margin-bottom: 40rpx;
		position: relative;
	}

	.bubble-text {
		font-size: 30rpx;
		color: #555;
		line-height: 1.6;
	}

	.action-buttons {
		display: flex;
		justify-content: space-between;
		gap: 24rpx;
	}

	.action-btn {
		flex: 1;
		height: 96rpx;
		border-radius: 48rpx; /* Pill shape */
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 32rpx;
		font-weight: 800;
		color: #fff;
		border: none;
		gap: 12rpx;
        transition: all 0.2s;
        box-shadow: 0 6rpx 16rpx rgba(0,0,0,0.1);
		
		&.reject {
			background: linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%); /* Pink */
            color: #fff;
            box-shadow: 0 6rpx 16rpx rgba(255, 154, 158, 0.3);
		}
		
		&.accept {
			background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); /* Yellow/Orange */
            color: #fff;
            box-shadow: 0 6rpx 16rpx rgba(255, 165, 0, 0.3);
		}
		
		&:active {
			transform: scale(0.98);
            opacity: 0.95;
		}
	}
	
	.flex-col {
		display: flex;
		flex-direction: column;
	}
	
	.text-center {
		text-align: center;
	}
    
    .font-weight-bold {
        font-weight: bold;
    }
    
    .color-999 {
        color: #999;
    }
    
    .color-333 {
        color: #333;
    }
</style>
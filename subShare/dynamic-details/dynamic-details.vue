<template>
	<view class="detail-container">
    <!-- Background Gradient -->
    <div class="page-bg"></div>

		<cuNavbar :bgColor="'rgba(0,0,0,0)'" :isBack="true">
		</cuNavbar>

    <!-- Header Image -->
    <view class="header-image-box">
      <image 
        mode="aspectFill" 
        :src="dynamicDetail.imgs && dynamicDetail.imgs.length > 0 ? dynamicDetail.imgs[0] : 'https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/share.png'" 
        class="header-image"
      ></image>
      <div class="header-overlay"></div>
    </view>

    <view class="content-wrapper">
      <!-- User Info -->
      <view class="user-info-section" @click="toNextPage(`/subHome/personal/personal?user_id=${userInfo._id}`)">
        <image class="user-avatar" :src="userInfo?.avatar_file ? userInfo.avatar_file.url : BASE_URL_AVATAR"></image>
        <view class="user-name">{{ userInfo.nickname }}</view>
      </view>

      <!-- Task Content -->
      <view class="task-content">
        <text selectable user-select>{{ dynamicDetail.content }}</text>
      </view>

      <!-- Task Info -->
      <view class="task-info-card" v-if="dynamicDetail.sort >= 11 && dynamicDetail.sort <= 14">
        <view class="info-header">任务信息</view>
        
        <!-- Progress Bar -->
        <view class="progress-container">
          <view class="progress-steps">
            <view class="step-item" :class="{ active: currentStep >= 0, completed: currentStep > 0 }">
              <view class="step-circle"></view>
              <text class="step-label">已发布</text>
            </view>
            <view class="step-line" :class="{ active: currentStep >= 1 }"></view>
            <view class="step-item" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
              <view class="step-circle"></view>
              <text class="step-label">已接单</text>
            </view>
            <view class="step-line" :class="{ active: currentStep >= 2 }"></view>
            <view class="step-item" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
              <view class="step-circle"></view>
              <text class="step-label">已完成</text>
            </view>
            <view class="step-line" :class="{ active: currentStep >= 3 }"></view>
            <view class="step-item" :class="{ active: currentStep >= 3, completed: currentStep > 3 }">
              <view class="step-circle"></view>
              <text class="step-label">已确认</text>
            </view>
            <view class="step-line" :class="{ active: currentStep >= 4 }"></view>
            <view class="step-item" :class="{ active: currentStep >= 4, completed: currentStep > 4 }">
              <view class="step-circle"></view>
              <text class="step-label">已结算</text>
            </view>
          </view>
        </view>

        <view class="info-row">
          <view class="label">任务状态</view>
          <view class="status-tag" :class="`status-${dynamicDetail.article_status || 0}`">
            {{ getStatusText(dynamicDetail.article_status) }}
          </view>
        </view>
        
        <view class="info-row">
          <view class="label">悬赏金额</view>
          <view class="price-display">
            <text class="currency">¥</text>
            <text class="amount">{{ (dynamicDetail.price / 100).toFixed(2) }}</text>
          </view>
        </view>
        
        <view class="info-row" v-if="dynamicDetail.deadline_date">
          <view class="label">截止日期</view>
          <view class="value">{{ formatDate(dynamicDetail.deadline_date, 'YYYY-MM-DD hh:mm') }}</view>
        </view>

        <view class="info-row" v-if="dynamicDetail.publish_date">
          <view class="label">发布日期</view>
          <view class="value">{{ formatDate(dynamicDetail.publish_date, 'YYYY-MM-DD hh:mm') }}</view>
        </view>

        <!-- Action Buttons -->
        <view class="action-buttons">
          <view class="action-btn outline" :class="{ active: isLike }" @click="toggleLike">
            <uni-icons :type="isLike ? 'heart-filled' : 'heart'" :color="isLike ? '#ff0000' : '#333'" size="18"></uni-icons>
            <text>{{ isLike ? '已收藏' : '收藏' }}</text>
          </view>
          
          <view class="action-btn primary" @click="handleAccept">
            <text>接单</text>
          </view>
          
          <view class="action-btn outline" @click="openShare">
            <uni-icons type="redo" color="#333" size="18"></uni-icons>
            <text>分享</text>
          </view>
        </view>
      </view>

      <!-- Comments Section -->
      <view class="comments-section">
        <view class="section-title">评论列表</view>
        <CommentList :list="comments" @recover="recover"></CommentList>
        <Empty title="暂无评论~" v-if="comments.length === 0"></Empty>
      </view>
    </view>

    <!-- Bottom Input Bar -->
    <view class="bottom-bar">
      <view class="input-box">
        <textarea 
          :value="inputContent"
          @input="onInput"
          :placeholder="placeholder" 
          class="comment-input" 
          auto-height 
          :maxlength="200"
          :cursor-spacing="20"
          :show-confirm-bar="false"
        ></textarea>
      </view>
      <view class="send-btn" :class="{ disabled: !inputContent.trim() }" @click="handleSend">发送</view>
    </view>
    
    <!-- Share Popup -->
    <uni-popup ref="sharePopup" type="bottom">
      <view class="share-popup bg-FFFFFF">
        <view class="padding30 text-center font-size32 font-weight">分享任务</view>
        <view class="padding30 flex justify-around">
          <button open-type="share" class="share-btn flex flex-direction align-center">
            <view class="icon-box bg-green">
              <uni-icons type="weixin" size="30" color="#fff"></uni-icons>
            </view>
            <text class="font-size24 margin-t10">分享给好友</text>
          </button>
          <view class="share-btn flex flex-direction align-center" @click="generatePoster">
            <view class="icon-box bg-blue">
              <uni-icons type="image" size="30" color="#fff"></uni-icons>
            </view>
            <text class="font-size24 margin-t10">生成海报</text>
          </view>
        </view>
        <view class="padding30 text-center border-top" @click="$refs.sharePopup.close()">取消</view>
      </view>
    </uni-popup>
	</view>
</template>

<script setup>
	import { reactive, ref, computed } from 'vue';
	import { MSG_TYPE, ARTICLE_STATUS } from '@/core/constants.js'
	import { onLoad, onShareAppMessage } from '@dcloudio/uni-app'
	import { store } from '@/uni_modules/uni-id-pages/common/store'
	import { showToast, showLoading, toNextPage } from '@/core/app.js'
	import { getDynamicListDelAggregate, setLike, removeLike, getLikeDel } from '@/cloud-api/dynamic.js'
	import { getCommentsList, addComments } from '@/cloud-api/index.js'
	import { arrayToTree } from '@/utils/tool.js'
  import { formatDate } from '@/utils/date.js'
	import CommentList from '@/components/comment-list/index.vue'
	import cuNavbar from '@/components/cu-navbar/cu-navbar.vue'
	import Empty from '@/components/Empty/index.vue'
	import { BASE_URL_AVATAR } from '@/core/config.js'

	const reply = ref({})
	const placeholder = ref('说点啥~')
	const dynamicDetail = ref({})
	const userInfo = ref({})
	const relevance_id = ref('')
	const comments = ref([])
	const isLike = ref(false)
  const sharePopup = ref(null)
  const inputContent = ref('')

  const currentStep = computed(() => {
    const status = dynamicDetail.value.article_status || 0
    
    if (status >= ARTICLE_STATUS.PLATFORM_PASS_SETTLED) return 4
    if (status >= ARTICLE_STATUS.VERIFY_PASS_WAIT_PLATFORM) return 3
    if (status >= ARTICLE_STATUS.EXECUTED_WAIT_VERIFY) return 2
    if (status >= ARTICLE_STATUS.APPROVED_EXECUTING) return 1
    if (status >= ARTICLE_STATUS.PUBLISHED) return 0
    
    return -1
  })

  const getStatusText = (status) => {
    const statusMap = {
      [ARTICLE_STATUS.AUDITING]: '审核中',
      [ARTICLE_STATUS.PUBLISHED]: '待接单',
      [ARTICLE_STATUS.AUDIT_REJECT]: '审核驳回',
      [ARTICLE_STATUS.APPROVED_EXECUTING]: '进行中',
      [ARTICLE_STATUS.REJECTED]: '已拒绝',
      [ARTICLE_STATUS.EXECUTED_WAIT_VERIFY]: '已完成',
      [ARTICLE_STATUS.FAILED_TIMEOUT]: '已失败',
      [ARTICLE_STATUS.VERIFY_PASS_WAIT_PLATFORM]: '待审核',
      [ARTICLE_STATUS.VERIFY_FAIL_WAIT_PLATFORM]: '验证失败',
      [ARTICLE_STATUS.PLATFORM_PASS_SETTLED]: '已结算',
      [ARTICLE_STATUS.PLATFORM_FAIL]: '审核失败'
    }
    return statusMap[status] || '待接单'
  }

  const openShare = () => {
    sharePopup.value.open()
  }
  
  const generatePoster = () => {
    showToast('海报生成功能开发中')
    sharePopup.value.close()
  }

  const toggleLike = () => {
    if (isLike.value) {
      remove()
    } else {
      like()
    }
  }

  const handleAccept = async () => {
    if (!store.hasLogin) {
      showToast('请先登录')
      return
    }
    // Check if current user is the author
    if (userInfo.value._id === store.userInfo._id) {
      showToast('不能接自己的单哦')
      return
    }

    showLoading()
    const db = uniCloud.database()
    try {
      await db.collection('app-task-message').add({
        relevance_id: dynamicDetail.value._id,
        to_user_id: userInfo.value._id,
        from_user_id: store.userInfo._id,
        msg_type: MSG_TYPE.REQUEST
      })
      showToast('请求已发送')
    } catch (e) {
      console.error(e)
      showToast('请求发送失败')
    } finally {
      uni.hideLoading()
    }
  }

  const onInput = (e) => {
    inputContent.value = e.detail.value
  }

  const handleSend = () => {
    if (!inputContent.value.trim()) return
    send(inputContent.value)
    inputContent.value = ''
  }
  
  onShareAppMessage(() => {
    return {
      title: dynamicDetail.value.content || '分享一个任务',
      path: `/subShare/dynamic-details/dynamic-details?id=${dynamicDetail.value._id}`,
      imageUrl: dynamicDetail.value.imgs && dynamicDetail.value.imgs.length > 0 ? dynamicDetail.value.imgs[0] : ''
    }
  })

	const recover = (item) => {
		reply.value = item
		placeholder.value = `回复:${item.user_id[0].nickname}`
	}

	const clearMsg = () => {
		reply.value = {}
		placeholder.value = `说点啥~`
	}

	const send = (msg) => {
		showLoading()
		// #ifdef MP-WEIXIN
		uniCloud.callFunction({ name: 'set-check-text', data: { text: msg } }).then(res => {
			if (res.result.errCode === 400) {
				showToast('内容不合规，请重新编辑')
			} else {
				const reslut = {
					relevance_id: relevance_id.value,
					comment_type: 1,
					comment_content: msg,
					author_id: userInfo.value._id,
				}
				if (reply.value._id) {
					reslut.reply_comment_id = reply.value._id
					reslut.comment_type = 2
					reslut.reply_user_id = reply.value.user_id[0]._id
				}
				addComments(reslut).then(res => {
					const new_comments = {
						comment_content: msg,
						user_id: [{
							_id: store.userInfo._id,
							nickname: store.userInfo.nickname,
							avatar_file: store.userInfo.avatar_file,
						}],
						_id: res.result.id,
						comment_date: new Date().getTime()
					}
					showToast('评论成功')
					if (reply.value._id) {
						const data = comments.value.find(ele => ele._id === reply.value._id)
						if (!data.replys) {
							data.replys = []
						}
						data.replys.push(new_comments)
					} else {
						comments.value.push(new_comments)
					}
          clearMsg()
				}).finally(() => {
					uni.hideLoading()
				})
			}
		}).catch(err => {
			console.log(err)
			uni.hideLoading()
			showToast('请先登录,再发表评论')
		})
		// #endif

		// #ifdef H5
		const reslut = {
			relevance_id: relevance_id.value,
			comment_type: 1,
			comment_content: msg,
			author_id: userInfo.value._id,

		}
		if (reply.value._id) {
			reslut.reply_comment_id = reply.value._id
			reslut.comment_type = 2
			reslut.reply_user_id = reply.value.user_id[0]._id
		}
		addComments(reslut).then(res => {
			const new_comments = {
				comment_content: msg,
				user_id: [{
					_id: store.userInfo._id,
					nickname: store.userInfo.nickname,
					avatar_file: store.userInfo.avatar_file,
				}],
				_id: res.result.id,
				comment_date: new Date().getTime()
			}
			showToast('评论成功')
			if (reply.value._id) {
				const data = comments.value.find(ele => ele._id === reply.value._id)
				if (!data.replys) {
					data.replys = []
				}
				data.replys.push(new_comments)
			} else {
				comments.value.push(new_comments)
			}
      clearMsg()
		}).catch(err => {
			showToast('请先登录,再发表评论')
		}).finally(() => {
			uni.hideLoading()
		})
		// #endif
	}

	const like = () => {
		showLoading()
		setLike(relevance_id.value).then(res => {
			isLike.value = true
      dynamicDetail.value.like_count = (dynamicDetail.value.like_count || 0) + 1
		}).finally(() => {
			uni.hideLoading()
		})
	}

	const remove = () => {
		showLoading()
		removeLike(relevance_id.value).then(res => {
			isLike.value = false
      dynamicDetail.value.like_count = Math.max(0, (dynamicDetail.value.like_count || 0) - 1)
		}).finally(() => {
			uni.hideLoading()
		})
	}


	onLoad(({ id }) => {
		showLoading()
		relevance_id.value = id
		getDynamicListDelAggregate(id).then(result => {
			const obj = result.data[0]
			obj.imgs = obj.imgs ? obj.imgs.split(',') : []
			dynamicDetail.value = obj
			userInfo.value = obj.user_id[0]
		}).finally(() => {
			uni.hideLoading()
		})

		getCommentsList(id).then(res => {
			comments.value = arrayToTree(res.data)
		})

		getLikeDel(id).then(res => {
			if (res.data) {
				isLike.value = true
			} else {
				isLike.value = false
			}
		})
	})
</script>

<style lang="scss" scoped>
  .detail-container {
    min-height: 100vh;
    background-color: #f5f7fa;
    padding-bottom: 120rpx;
    position: relative;
  }

  .page-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: linear-gradient(180deg, #6FCFFB 0%, #B59DFF 100%);
    z-index: 0;
    opacity: 0.8;
  }

  .header-image-box {
    width: 100%;
    aspect-ratio: 16/9;
    overflow: hidden;
    position: relative;
    z-index: 0;
    
    .header-image {
      width: 100%;
      height: 100%;
      background-color: #eee;
    }

    .header-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(255,255,255,0.8) 100%);
    }
  }

  .content-wrapper {
    position: relative;
    margin-top: -40rpx;
    background-color: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 40rpx 40rpx 0 0;
    padding: 0 30rpx;
    min-height: 500rpx;
    z-index: 1;
  }

  .user-info-section {
    position: relative;
    top: -40rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: -20rpx;

    .user-avatar {
      width: 160rpx;
      height: 160rpx;
      border-radius: 50%;
      border: 6rpx solid #fff;
      background-color: #fff;
      box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
    }

    .user-name {
      font-size: 36rpx;
      font-weight: 800;
      color: #333;
      margin-top: 16rpx;
    }
  }

  .task-content {
    font-size: 30rpx;
    color: #333;
    line-height: 1.6;
    margin-bottom: 40rpx;
    white-space: pre-wrap;
    padding: 20rpx;
    background: rgba(255,255,255,0.5);
    border-radius: 20rpx;
  }

  .task-info-card {
    background-color: #fff;
    border-radius: 24rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
    margin-bottom: 40rpx;
    border: 2rpx solid rgba(0,0,0,0.02);

    .info-header {
      font-size: 32rpx;
      font-weight: 800;
      margin-bottom: 30rpx;
      padding-left: 20rpx;
      border-left: 8rpx solid #FFD700; /* Yellow */
      color: #333;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24rpx;
      padding-bottom: 24rpx;
      border-bottom: 1px dashed #f0f0f0;
      
      &:last-child {
        border-bottom: none;
        margin-bottom: 0;
      }

      .label {
        font-size: 28rpx;
        color: #666;
        font-weight: 500;
      }

      .value {
        font-size: 28rpx;
        color: #333;
        font-weight: 600;
      }
    }
  }

  .action-buttons {
    display: flex;
    justify-content: space-between;
    gap: 20rpx;
    margin-top: 40rpx;

    .action-btn {
      flex: 1;
      height: 80rpx;
      border-radius: 40rpx; /* Pill shape */
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      gap: 8rpx;
      transition: all 0.2s;
      font-weight: 600;

      &:active {
        opacity: 0.9;
        transform: scale(0.98);
      }

      &.primary {
        background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); /* Yellow/Orange */
        color: #fff;
        box-shadow: 0 6rpx 16rpx rgba(255, 165, 0, 0.3);
      }

      &.outline {
        background-color: #fff;
        border: 2rpx solid #eee;
        color: #666;
        box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);

        &.active {
          border-color: #FF6B81;
          color: #FF6B81;
          background-color: #FFF0F5;
        }
      }
    }
  }

  .comments-section {
    margin-top: 40rpx;
    background-color: #fff;
    padding: 30rpx;
    border-radius: 24rpx;
    box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
    
    .section-title {
      font-size: 32rpx;
      font-weight: 800;
      margin-bottom: 20rpx;
      padding-left: 10rpx;
      color: #333;
    }
  }

  .bottom-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    padding: 20rpx 30rpx;
    padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
    box-shadow: 0 -4rpx 20rpx rgba(0,0,0,0.05);
    display: flex;
    align-items: flex-end;
    gap: 20rpx;
    z-index: 100;

    .input-box {
      flex: 1;
      background-color: #f5f5f5;
      border-radius: 40rpx;
      padding: 20rpx 30rpx;
      min-height: 80rpx;
      display: flex;
      align-items: center;

      .comment-input {
        width: 100%;
        font-size: 28rpx;
        line-height: 1.4;
        max-height: 200rpx;
      }
    }

    .send-btn {
      width: 120rpx;
      height: 80rpx;
      background: linear-gradient(135deg, #6FCFFB 0%, #B59DFF 100%);
      color: #fff;
      border-radius: 40rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      font-weight: 600;
      transition: all 0.3s;
      box-shadow: 0 4rpx 12rpx rgba(181, 157, 255, 0.3);

      &.disabled {
        background: #ccc;
        color: #fff;
        box-shadow: none;
      }
    }
  }

  .price-display {
    color: #FF6B81;
    font-weight: bold;
  }
  
  .currency {
    font-size: 24rpx;
    margin-right: 4rpx;
  }
  
  .amount {
    font-size: 40rpx;
  }
  
  .status-tag {
    font-size: 24rpx;
    padding: 6rpx 16rpx;
    border-radius: 8rpx;
  }
  
  /* Auditing (0), Published (1) */
  .status-0, .status-1 {
    color: #1890FF;
    background-color: #E6F7FF;
    border: 1px solid #91D5FF;
  }
  
  /* Approved Executing (2) */
  .status-2 {
    color: #FAAD14;
    background-color: #FFFBE6;
    border: 1px solid #FFE58F;
  }
  
  /* Completed (3), Verified (4), Settled (5) */
  .status-3, .status-4, .status-5 {
    color: #52C41A;
    background-color: #F6FFED;
    border: 1px solid #B7EB8F;
  }

  /* Failures (-1, -2, -3, -4, -5) */
  .status--1, .status--2, .status--3, .status--4, .status--5 {
     color: #FF4D4F;
     background-color: #FFF1F0;
     border: 1px solid #FFA39E;
  }

  .progress-container {
    margin-bottom: 40rpx;
    padding: 0 10rpx;
    
    .progress-steps {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      position: relative;
    }
    
    .step-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index: 2;
      position: relative;
      flex: 0 0 auto;
      
      .step-circle {
        width: 24rpx;
        height: 24rpx;
        border-radius: 50%;
        background-color: #fff;
        border: 4rpx solid #D9D9D9;
        margin-bottom: 12rpx;
        transition: all 0.3s;
      }
      
      .step-label {
        font-size: 22rpx;
        color: #999;
        white-space: nowrap;
      }
      
      &.active {
        .step-circle {
          border-color: #FFD700;
        }
        .step-label {
          color: #333;
          font-weight: 600;
        }
      }
      
      &.completed {
        .step-circle {
          background-color: #FFD700;
          border-color: #FFD700;
        }
      }
    }
    
    .step-line {
      flex: 1;
      height: 4rpx;
      background-color: #E8E8E8;
      margin-top: 12rpx;
      margin-left: -10rpx;
      margin-right: -10rpx;
      z-index: 1;
      
      &.active {
        background-color: #FFD700;
      }
    }
  }

  .share-popup {
    border-radius: 20rpx 20rpx 0 0;
    
    .share-btn {
      background: none;
      border: none;
      padding: 0;
      margin: 0;
      line-height: 1.5;
      
      &::after {
        border: none;
      }
      
      .icon-box {
        width: 100rpx;
        height: 100rpx;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 10rpx;
        
        &.bg-green {
          background-color: #07C160;
        }
        
        &.bg-blue {
          background-color: #1890FF;
        }
      }
    }
  }
</style>

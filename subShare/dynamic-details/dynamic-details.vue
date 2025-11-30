<template>
	<view class="detail-container">
		<cuNavbar :bgColor="'transparent'" :isBack="true">
		</cuNavbar>

    <!-- Header Image -->
    <view class="header-image-box">
      <image 
        mode="aspectFill" 
        :src="dynamicDetail.imgs && dynamicDetail.imgs.length > 0 ? dynamicDetail.imgs[0] : 'https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/share.png'" 
        class="header-image"
      ></image>
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
	import { reactive, ref } from 'vue';
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

  const getStatusText = (status) => {
    const statusMap = {
      0: '待接单',
      1: '进行中',
      2: '已完成'
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
        msg_type: 0
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
    background-color: #f8f9fa;
    padding-bottom: 120rpx;
  }

  .header-image-box {
    width: 100%;
    aspect-ratio: 16/9;
    overflow: hidden;
    
    .header-image {
      width: 100%;
      height: 100%;
      background-color: #eee;
    }
  }

  .content-wrapper {
    position: relative;
    margin-top: -40rpx;
    background-color: #fff;
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
      font-weight: bold;
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
    padding: 0 10rpx;
  }

  .task-info-card {
    background-color: #fff;
    border-radius: 24rpx;
    padding: 30rpx;
    box-shadow: 0 2rpx 20rpx rgba(0,0,0,0.03);
    margin-bottom: 40rpx;
    border: 1px solid #f0f0f0;

    .info-header {
      font-size: 32rpx;
      font-weight: bold;
      margin-bottom: 30rpx;
      padding-left: 20rpx;
      border-left: 8rpx solid #FFD563;
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
      }

      .value {
        font-size: 28rpx;
        color: #333;
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
      border-radius: 12rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      gap: 8rpx;
      transition: all 0.2s;

      &:active {
        opacity: 0.8;
        transform: scale(0.98);
      }

      &.primary {
        background-color: #333;
        color: #fff;
        font-weight: 500;
      }

      &.outline {
        background-color: #fff;
        border: 1px solid #ddd;
        color: #333;

        &.active {
          border-color: #ff0000;
          color: #ff0000;
          background-color: #fff0f0;
        }
      }
    }
  }

  .comments-section {
    margin-top: 40rpx;
    
    .section-title {
      font-size: 32rpx;
      font-weight: bold;
      margin-bottom: 20rpx;
      padding-left: 10rpx;
    }
  }

  .bottom-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #fff;
    padding: 20rpx 30rpx;
    padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
    box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
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
      background-color: #333;
      color: #fff;
      border-radius: 40rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      font-weight: 500;
      transition: all 0.3s;

      &.disabled {
        background-color: #ccc;
        color: #fff;
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
  
  .status-0 {
    color: #1890FF;
    background-color: #E6F7FF;
    border: 1px solid #91D5FF;
  }
  
  .status-1 {
    color: #FAAD14;
    background-color: #FFFBE6;
    border: 1px solid #FFE58F;
  }
  
  .status-2 {
    color: #52C41A;
    background-color: #F6FFED;
    border: 1px solid #B7EB8F;
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
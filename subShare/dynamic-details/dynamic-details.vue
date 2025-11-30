<template>
	<view>
		<cuNavbar>
			<template #content>
				<view class="font-size36 color-352926 font-weight">详情</view>
			</template>
		</cuNavbar>

		<view class="padding30">
			<DynamicCard :user-info="userInfo" :dynamicDetail="dynamicDetail"></DynamicCard>
		</view>

		<view class=" padding30 bg-FFFFFF">
			<view class="padding-b30 border-bottom margin-b30 flex justify-between align-center">
				<view class="color-352926 font-size30 font-weight">评论</view>
        <view class="flex align-center">
          <view class="margin-r20 font-size24 color-8C8888" v-if="dynamicDetail.like_count">{{ dynamicDetail.like_count }}</view>
          <uni-icons type="heart" color="#949494" size="20" @click="like" v-if="!isLike"></uni-icons>
          <uni-icons type="heart-filled" color="red" size="20" @click="remove" v-else></uni-icons>
        </view>
			</view>
			<CommentList :list="comments" @recover="recover"></CommentList>
			<Empty title="暂无评论~" v-if="comments.length === 0"></Empty>
		</view>

    <!-- Task Details Section -->
    <view class="padding30 bg-FFFFFF margin-t20" v-if="dynamicDetail.sort >= 11 && dynamicDetail.sort <= 14">
      <view class="font-size30 font-weight margin-b20">任务信息</view>
      
      <view class="flex justify-between margin-b20">
        <view class="color-8C8888 font-size26">任务状态</view>
        <view class="status-tag" :class="`status-${dynamicDetail.article_status || 0}`">
          {{ getStatusText(dynamicDetail.article_status) }}
        </view>
      </view>
      
      <view class="flex justify-between margin-b20">
        <view class="color-8C8888 font-size26">悬赏金额</view>
        <view class="price-display">
          <text class="currency">¥</text>
          <text class="amount">{{ (dynamicDetail.price / 100).toFixed(2) }}</text>
        </view>
      </view>
      
      <view class="flex justify-between margin-b20" v-if="dynamicDetail.deadline_date">
        <view class="color-8C8888 font-size26">截止日期</view>
        <view class="font-size26">{{ formatDate(dynamicDetail.deadline_date, 'YYYY-MM-DD hh:mm') }}</view>
      </view>
    </view>

		<ButtonComment @send="send" :placeholder="placeholder" @clearMsg="clearMsg"></ButtonComment>
    
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

    <FixedButton title="分享" @trigger="openShare"></FixedButton>
	</view>
</template>

<script setup>
	import { reactive, ref } from 'vue';
	import { onLoad, onShareAppMessage } from '@dcloudio/uni-app'
	import { store } from '@/uni_modules/uni-id-pages/common/store'
	import { showToast, showLoading } from '@/core/app.js'
	import { getDynamicListDelAggregate, setLike, removeLike, getLikeDel } from '@/cloud-api/dynamic.js'
	import { getCommentsList, addComments } from '@/cloud-api/index.js'
	import { arrayToTree } from '@/utils/tool.js'
  import { formatDate } from '@/utils/date.js'
	import CommentList from '@/components/comment-list/index.vue'
	import ButtonComment from '@/components/Button-comment/index.vue'
	import DynamicCard from '@/components/Dynamic-card/index.vue'
	import cuNavbar from '@/components/cu-navbar/cu-navbar.vue'
	import Empty from '@/components/Empty/index.vue'
  import FixedButton from '@/components/Fixed-button/index.vue'
	import { BASE_URL_AVATAR } from '@/core/config.js'

	const reply = ref({})
	const placeholder = ref('说点啥~')
	const dynamicDetail = ref({})
	const userInfo = ref({})
	const relevance_id = ref('')
	const comments = ref([])
	const isLike = ref(false)
  const sharePopup = ref(null)

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
		console.log()
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
		}).finally(() => {
			uni.hideLoading()
		})
	}

	const remove = () => {
		showLoading()
		removeLike(relevance_id.value).then(res => {
			isLike.value = false
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
  .price-display {
    color: #FF6B81;
    font-weight: bold;
  }
  
  .currency {
    font-size: 24rpx;
    margin-right: 4rpx;
  }
  
  .amount {
    font-size: 32rpx;
  }
  
  .status-tag {
    font-size: 22rpx;
    padding: 4rpx 12rpx;
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
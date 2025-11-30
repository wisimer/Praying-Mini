<template>
	<view class="dynamic-card">
		<view class="flex align-center">
			<view class="flex align-center" @click.stop="toNextPage(`/subHome/personal/personal?user_id=${userInfo._id}`)">
				<image class="d-avatar" :src="userInfo?.avatar_file ? userInfo.avatar_file.url : BASE_URL_AVATAR">
				</image>

				<view class="font-size28 color-8C8888 margin-r20">
					{{userInfo.nickname}}
				</view>
				<view class="d-title">
					{{userInfo.player? userInfo.player[0].achievement_id[0].name:''}}
				</view>
			</view>
      <view class="marginlauto" v-if="dynamicDetail.sort >= 11 && dynamicDetail.sort <= 14">
        <view class="status-tag" :class="`status-${dynamicDetail.article_status || 0}`">
          {{ getStatusText(dynamicDetail.article_status) }}
        </view>
      </view>
		</view>
		<view @click="isTo">
			<view class="font-size30 d-dec">
				<view class="">{{dynamicDetail.content}}</view>
        
        <!-- Price display for tasks -->
        <view v-if="dynamicDetail.price" class="price-display margin-t10">
          <text class="currency">¥</text>
          <text class="amount">{{ (dynamicDetail.price / 100).toFixed(2) }}</text>
        </view>

				<view class="img-box">
					<image mode="aspectFill" :src="`${img}?x-oss-process=image/resize,p_40`" class="remark-img margin-t20"
						v-for="(img,index) in dynamicDetail.imgs" :key="index" @click.stop="showPic(img)">
					</image>
				</view>
			</view>
			<view class="flex align-center margin-t20 font-size22">
				<view class="font-size28">
					{{dynamicDetail.publish_date?formatDate(dynamicDetail.publish_date,'YYYY-MM-DD hh:mm'):''}}
				</view>
				<view class="marginlauto flex align-center">
					<uni-icons type="chat" size="14" color="#8C8888"></uni-icons>
					<text class="font-size28 margin-l10">{{dynamicDetail.comment_count}}</text>
				</view>
				<!-- <view class="right-line"> </view>
				<view class=" flex align-center">
					<uni-icons type="eye" size="14" color="#8C8888"></uni-icons>
					<text class="font-size28 margin-l10">{{dynamicDetail.view_count}}</text>
				</view> -->
			</view>
		</view>
	</view>
</template>

<script setup>
	import { computed } from 'vue'
	import { BASE_URL_AVATAR } from '@/core/config.js'
	import { toNextPage, showLoading } from '@/core/app.js'
	import { formatDate } from '@/utils/date.js'
	import { store } from '@/uni_modules/uni-id-pages/common/store'
	import { addFollow } from '@/cloud-api/follow.js'

	const porp = defineProps({
		dynamicDetail: {
			type: Object,
			default: () => {}
		},
		userInfo: {
			type: Object,
			default: () => {
				avatar: ''
			}
		},
		isDetails: {
			type: Boolean,
			default: false
		}
	})

  const getStatusText = (status) => {
    const statusMap = {
      0: '待接单',
      1: '进行中',
      2: '已完成'
    }
    return statusMap[status] || '待接单'
  }

	const isTo = () => {
		if (porp.isDetails) {
			toNextPage(
				`/subShare/dynamic-details/dynamic-details?id=${porp.dynamicDetail._id}`
			)
		}
	}

	const showPic = (url) => {
		uni.previewImage({
			indicator: "none",
			current: url,
			urls: porp.dynamicDetail.imgs
		});
	}
</script>

<style scoped>
	.dynamic-card {
		background: #FFFFFF;
		border-radius: 24rpx;
		padding: 26rpx;
	}

	.d-avatar {
		width: 76rpx;
		height: 76rpx;
		border-radius: 50%;
		margin-right: 12rpx;
	}

	.d-title {
		height: 42rpx;
		line-height: 42rpx;
		padding: 0 20rpx;
		background: #F5F8EB;
		border-radius: 22rpx;
		font-size: 22rpx;
		color: #AFC272;
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

	.d-dec {
		padding: 26rpx 0;
		border-bottom: 1px solid #F3F3F3;
	}


	.icon {
		width: 30rpx;
		height: 30rpx;
		margin-right: 10rpx;
	}

	.img-box {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
	}

	.remark-img {
		width: 198rpx;
		height: 198rpx;
		border-radius: 12rpx;
	}

	.right-line {
		border-right: 1px solid #8C8888;
		height: 16rpx;
		margin: 0 20rpx;
	}

	.huati {
		padding: 10rpx 16rpx;
		border-radius: 20rpx;
		background: rgba(235, 247, 244, 1);
	}

	.icon-fuhao {
		background: rgba(235, 247, 244, 1);
		border-radius: 8rpx;
		font-size: 24rpx;
		padding: 5rpx 10rpx;
	}
</style>
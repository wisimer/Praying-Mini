<template>
	<view class="home">
		<view class="search-bar">
			<text class="icon">🔍</text>
			<input class="search-input" v-model="searchQuery" placeholder="搜索需求或祈福内容" />
		</view>

		<view class="quick-actions">
			<view
				class="action"
				v-for="(item, idx) in actions"
				:key="idx"
				:class="{ disabled: item.disabled }"
				@click="go(item)"
			>
				<text class="action-icon">{{ item.icon }}</text>
				<text class="action-text">{{ item.text }}</text>
			</view>
		</view>

		<view class="recommend">
			<text class="section-title">推荐需求列表</text>
			<view class="card" v-for="(req, i) in recommendations" :key="i">
				<view class="card-head">
					<text class="card-title">{{ req.title }}</text>
					<text class="reward">¥{{ req.reward }}</text>
				</view>
				<text class="card-desc">{{ req.desc }}</text>
				<text class="card-meta">地点：{{ req.location }}</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			searchQuery: '',
			actions: [
				{ icon: '🏮', text: '赛博烧香', page: '/pages/incense/incense' },
				{ icon: '📝', text: '发布需求', page: '/pages/request/publish' },
				{ icon: '📋', text: '需求市场', disabled: true },
				{ icon: '👤', text: '我的空间', disabled: true }
			],
			recommendations: [
				{ title: '线下代拜求学业', desc: '本周到寺庙为孩子祈福，求学业进步', location: '杭州灵隐寺', reward: 88 },
				{ title: '陪伴祈福视频连线', desc: '需要远程视频祈福，陪伴一起许愿', location: '线上', reward: 66 }
			]
		}
	},
	methods: {
		go(item) {
			if (item.disabled || !item.page) {
				uni.showToast({ title: '暂未开放', icon: 'none' })
				return
			}
			uni.navigateTo({ url: item.page })
		}
	}
}
</script>

<style lang="scss">
.home {
	padding: 24rpx;
	background: $uni-bg-color;
	color: $uni-text-color;
}

.search-bar {
	display: flex;
	align-items: center;
	gap: 16rpx;
	padding: 16rpx 20rpx;
	background: #fff;
	border: 2rpx solid $brand-secondary;
	border-radius: 16rpx;
}
.icon { font-size: 32rpx; }
.search-input {
	flex: 1;
	height: 64rpx;
	font-size: 28rpx;
}

.quick-actions {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 20rpx;
	margin: 24rpx 0;
}
.action {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 28rpx 0;
	background: #fff;
	border: 2rpx solid $uni-color-primary;
	border-radius: 20rpx;
}
.action.disabled { opacity: 0.5; }
.action-icon { font-size: 44rpx; }
.action-text { margin-top: 12rpx; font-size: 28rpx; }

.recommend { margin-top: 12rpx; }
.section-title { font-size: 30rpx; color: $brand-secondary; }
.card {
	margin-top: 16rpx;
	padding: 20rpx;
	background: #fff;
	border: 2rpx solid $brand-secondary;
	border-radius: 16rpx;
}
.card-head { display: flex; justify-content: space-between; align-items: center; }
.card-title { font-size: 30rpx; }
.reward { color: $brand-accent; font-weight: 600; }
.card-desc { margin-top: 10rpx; color: #555; font-size: 26rpx; }
.card-meta { margin-top: 8rpx; color: #777; font-size: 24rpx; }
</style>

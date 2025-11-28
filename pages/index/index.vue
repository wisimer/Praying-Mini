<template>
	<view :class="['home', themeClass]">
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
			<view class="card" v-for="(req, i) in recommendations" :key="i" @click="openDetail(req)">
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
			theme: 'light',
			searchQuery: '',
			actions: [
				{ icon: '🏮', text: '赛博烧香', page: '/pages/incense/incense' },
				{ icon: '📝', text: '发布需求', page: '/pages/request/publish' },
				{ icon: '📋', text: '需求市场', page: '/pages/market/market' },
				{ icon: '👤', text: '我的空间', page: '/pages/me/me' }
			],
			recommendations: [
				{ title: '线下代拜求学业', desc: '本周到寺庙为孩子祈福，求学业进步', location: '杭州灵隐寺', reward: 88 },
				{ title: '陪伴祈福视频连线', desc: '需要远程视频祈福，陪伴一起许愿', location: '线上', reward: 66 }
			]
		}
	},
	computed: {
		themeClass() { return `page theme-${this.theme}` }
	},
	onShow() {
		const t = uni.getStorageSync('theme') || 'light'
		this.theme = t
		this.applyNavColor()
	},
	methods: {
		go(item) {
			if (item.disabled || !item.page) {
				uni.showToast({ title: '暂未开放', icon: 'none' })
				return
			}
			uni.navigateTo({ url: item.page })
		},
		openDetail(req) {
			const item = encodeURIComponent(JSON.stringify(req))
			uni.navigateTo({ url: `/pages/request/detail?item=${item}` })
		},
		applyNavColor() {
			if (this.theme==='dark') {
				uni.setNavigationBarColor({ frontColor: '#ffffff', backgroundColor: '#0F1115' })
			} else {
				uni.setNavigationBarColor({ frontColor: '#000000', backgroundColor: '#E6B89C' })
			}
		}
	}
}
</script>

<style lang="scss">
.home { padding: 24rpx; }

.search-bar {
	display: flex;
	align-items: center;
	gap: 16rpx;
	padding: 16rpx 20rpx;
	background: var(--surface);
	border: 2rpx solid var(--border);
	border-radius: 20rpx;
	box-shadow: $shadow-sm;
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
	background: var(--surface);
	border: 2rpx solid var(--border);
	border-radius: 24rpx;
	box-shadow: $shadow-sm;
  transition: transform .08s ease;
}
.action.disabled { opacity: 0.5; }
.action:active { transform: scale(0.98); }
.action-icon { font-size: 44rpx; }
.action-text { margin-top: 12rpx; font-size: 28rpx; }

.recommend { margin-top: 12rpx; }
.section-title { font-size: 32rpx; color: var(--muted); }
.card {
	margin-top: 16rpx;
	padding: 24rpx;
	background: var(--surface);
	border: 2rpx solid var(--border);
	border-radius: 24rpx;
	box-shadow: $shadow-sm;
}
.card-head { display: flex; justify-content: space-between; align-items: center; }
.card-title { font-size: 30rpx; }
.reward { color: var(--accent); font-weight: 700; font-size: 30rpx; }
.card-desc { margin-top: 10rpx; color: #555; font-size: 26rpx; }
.card-meta { margin-top: 8rpx; color: #777; font-size: 24rpx; }
</style>

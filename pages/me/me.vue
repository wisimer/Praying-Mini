<template>
	<view :class="['me', themeClass]">
		<view class="user-card">
			<image class="avatar" :src="user.avatar" mode="aspectFill" />
			<view class="info">
				<text class="name">{{ user.name }}</text>
				<button class="ghost small" @click="editProfile">编辑</button>
				<view class="stats">
					<text>信用分：{{ user.credit }}</text>
					<text>钱包余额：¥{{ user.balance }}</text>
				</view>
			</view>
		</view>

		<view class="quick">
			<button class="quick-btn" @click="openMine('published')">📋 我发布的</button>
			<button class="quick-btn" @click="openMine('accepted')">🙏 我接单的</button>
			<button class="quick-btn" @click="openWallet">💰 我的钱包</button>
			<button class="quick-btn" @click="openFavorites">⭐ 收藏夹</button>
		</view>

		<view class="orders">
			<text class="section">订单管理</text>
			<view class="tabs">
				<view v-for="t in tabs" :key="t" class="tab" :class="{active: tab===t}" @click="tab=t">{{ t }}</view>
			</view>
			<view class="order-list">
				<view class="order" v-for="(o,i) in filteredOrders" :key="i">
					<text class="order-title">{{ o.title }}</text>
					<text class="order-meta">状态：{{ o.status }} · 金额：¥{{ o.reward }}</text>
				</view>
			</view>
		</view>

		<view class="more">
			<text class="section">其他功能</text>
			<view class="list">
				<button class="list-item" @click="invite">邀请好友</button>
				<button class="list-item" @click="service">客服中心</button>
				<button class="list-item" @click="settings">设置</button>
				<view class="theme">
					<text class="section">主题风格</text>
					<view class="theme-choices">
						<view class="chip" :class="{ 'chip-active': theme==='light' }" @click="setTheme('light')">温暖清新风</view>
						<view class="chip" :class="{ 'chip-active': theme==='dark' }" @click="setTheme('dark')">暗黑赛博风</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			theme: 'light',
			user: { name: '善愿新手', avatar: '/static/logo.png', credit: 86, balance: 128.5 },
			tabs: ['待接单','进行中','待确认','已完成'],
			tab: '进行中',
			orders: [
				{ title: '线下代拜求学业', status: '进行中', reward: 88 },
				{ title: '视频祈福陪伴', status: '待确认', reward: 66 },
				{ title: '邮寄护身符', status: '已完成', reward: 35 },
				{ title: '禅修一日体验', status: '待接单', reward: 199 }
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
	computed: {
		filteredOrders() { return this.orders.filter(o => o.status===this.tab) }
	},
	methods: {
		editProfile() { uni.showToast({ title: '编辑资料', icon: 'none' }) },
		openMine(type) { uni.showToast({ title: type==='published' ? '我发布的' : '我接单的', icon: 'none' }) },
		openWallet() { uni.showToast({ title: '我的钱包', icon: 'none' }) },
		openFavorites() { uni.showToast({ title: '收藏夹', icon: 'none' }) },
		invite() { uni.showShareMenu && uni.showShareMenu() || uni.showToast({ title: '邀请好友', icon: 'none' }) },
		service() { uni.showToast({ title: '联系客服', icon: 'none' }) },
		settings() { uni.showToast({ title: '设置', icon: 'none' }) },
		applyNavColor() {
			if (this.theme==='dark') {
				uni.setNavigationBarColor({ frontColor: '#ffffff', backgroundColor: '#0F1115' })
			} else {
				uni.setNavigationBarColor({ frontColor: '#000000', backgroundColor: '#E6B89C' })
			}
		},
		setTheme(t) {
			this.theme = t
			uni.setStorageSync('theme', t)
			this.applyNavColor()
		}
	}
}
</script>

<style lang="scss">
.me { padding: 24rpx; }
.user-card { display: flex; gap: 16rpx; background: #fff; border: 2rpx solid $brand-secondary; border-radius: 24rpx; padding: 20rpx; box-shadow: $shadow-sm; }
.avatar { width: 120rpx; height: 120rpx; border-radius: 60rpx; border: 2rpx solid $brand-secondary; box-shadow: $shadow-sm; }
.info { flex: 1; }
.name { font-size: 32rpx; color: var(--text); }
.ghost.small { background: #fff; color: $brand-secondary; border: 2rpx solid $brand-secondary; border-radius: 16rpx; height: 52rpx; font-size: 24rpx; margin-top: 8rpx; box-shadow: $shadow-sm; }
.stats { margin-top: 8rpx; display: flex; gap: 20rpx; color: var(--secondary); }

.quick { margin-top: 20rpx; display: grid; grid-template-columns: repeat(2, 1fr); gap: 12rpx; }
.quick-btn { background: var(--surface); border: 2rpx solid var(--border); border-radius: 20rpx; height: 84rpx; font-size: 28rpx; box-shadow: $shadow-sm; }

.orders { margin-top: 24rpx; }
.section { font-size: 28rpx; color: var(--secondary); }
.tabs { display: flex; gap: 12rpx; margin-top: 12rpx; }
.tab { padding: 12rpx 20rpx; background: var(--surface); border: 2rpx solid var(--border); border-radius: 999rpx; font-size: 26rpx; box-shadow: $shadow-sm; }
.tab.active { background: var(--secondary); color: #fff; border-color: var(--secondary); }
.order-list { margin-top: 12rpx; background: var(--surface); border: 2rpx solid var(--border); border-radius: 24rpx; box-shadow: $shadow-sm; }
.order { padding: 20rpx; border-bottom: 2rpx solid #eee; }
.order:last-child { border-bottom: none; }
.order-title { font-size: 28rpx; }
.order-meta { margin-top: 6rpx; font-size: 24rpx; color: #777; }

.more { margin-top: 24rpx; }
.list { display: grid; grid-template-columns: 1fr; gap: 12rpx; margin-top: 12rpx; }
.list-item { background: var(--surface); border: 2rpx solid var(--border); border-radius: 20rpx; height: 80rpx; font-size: 26rpx; box-shadow: $shadow-sm; }
</style>
.theme-choices { display: flex; gap: 12rpx; margin-top: 12rpx; }

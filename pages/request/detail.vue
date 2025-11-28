<template>
	<view class="detail">
		<view class="header">
			<text class="title">{{ item.title }}</text>
			<text class="reward">¥{{ item.reward }}</text>
		</view>
		<view class="meta">
			<text class="badge">{{ item.type || '未分类' }}</text>
			<text class="location">地点：{{ item.location || '未填写' }}</text>
			<text class="time" v-if="item.time">时间：{{ formatTime(item.time) }}</text>
		</view>
		<view class="desc">
			<text>{{ item.desc }}</text>
		</view>
		<view class="actions">
			<button class="accent" @click="accept">我要接单</button>
			<button class="ghost" @click="contact">联系发布者</button>
			<button class="ghost" @click="favorite">收藏</button>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return { item: {} }
	},
	onLoad(query) {
		try { this.item = JSON.parse(decodeURIComponent(query.item || '{}')) } catch(e) { this.item = {} }
	},
	methods: {
		formatTime(t) {
			const d = new Date(Number(t) * (String(t).length>10 ? 1 : 1000))
			const pad = n => (n<10?('0'+n):n)
			return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
		},
		accept() { uni.showToast({ title: '已接单', icon: 'success' }) },
		contact() { uni.showToast({ title: '联系发布者', icon: 'none' }) },
		favorite() { uni.showToast({ title: '已收藏', icon: 'success' }) }
	}
}
</script>

<style lang="scss">
.detail { padding: 24rpx; background: $uni-bg-color; color: $uni-text-color; }
.header { display: flex; justify-content: space-between; align-items: center; }
.title { font-size: 34rpx; }
.reward { color: $brand-accent; font-weight: 600; font-size: 30rpx; }
.meta { margin-top: 12rpx; display: grid; grid-template-columns: 1fr; gap: 6rpx; color: $brand-secondary; }
.badge { display: inline-block; padding: 8rpx 16rpx; background: #fff; border: 2rpx solid $brand-secondary; border-radius: 999rpx; width: fit-content; }
.location, .time { font-size: 24rpx; }
.desc { margin-top: 16rpx; background: #fff; border: 2rpx solid $brand-secondary; border-radius: 16rpx; padding: 16rpx; font-size: 26rpx; color: #555; }
.actions { margin-top: 20rpx; display: flex; gap: 12rpx; }
.accent { background: $brand-accent; color: #fff; border: none; border-radius: 12rpx; height: 80rpx; font-size: 28rpx; flex: 1; }
.ghost { background: #fff; color: $brand-secondary; border: 2rpx solid $brand-secondary; border-radius: 12rpx; height: 80rpx; font-size: 28rpx; flex: 1; }
</style>

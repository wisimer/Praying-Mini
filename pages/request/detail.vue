<template>
	<view :class="['detail', themeClass]">
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
			<button class="accent" @click="publishSame">我也要发布同款</button>
		</view>

		<view class="sub-actions">
			<button class="ghost small" @click="share">分享</button>
			<button class="ghost small" @click="report">举报</button>
		</view>

		<view class="extra" v-if="item.tags && item.tags.length">
			<text class="section">标签</text>
			<view class="chips">
				<text v-for="(t,i) in item.tags" :key="i" class="chip">{{ t }}</text>
			</view>
		</view>

		<view class="gallery" v-if="item.images && item.images.length">
			<text class="section">相关图片</text>
			<view class="imgs">
				<image v-for="(src,i) in item.images" :key="i" :src="src" mode="aspectFill" class="img" />
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return { item: {}, theme: 'light' }
	},
	computed: {
		themeClass() { return `page theme-${this.theme}` }
	},
	onLoad(query) {
		try { this.item = JSON.parse(decodeURIComponent(query.item || '{}')) } catch(e) { this.item = {} }
	},
	onShow() {
		const t = uni.getStorageSync('theme') || 'light'
		this.theme = t
		this.applyNavColor()
	},
	methods: {
		formatTime(t) {
			const d = new Date(Number(t) * (String(t).length>10 ? 1 : 1000))
			const pad = n => (n<10?('0'+n):n)
			return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
		},
		accept() { uni.showToast({ title: '已接单', icon: 'success' }) },
		contact() { uni.showToast({ title: '联系发布者', icon: 'none' }) },
		favorite() { uni.showToast({ title: '已收藏', icon: 'success' }) },
		publishSame() {
			const item = encodeURIComponent(JSON.stringify({
				type: this.item.type,
				title: this.item.title,
				desc: this.item.desc,
				location: this.item.location,
				reward: this.item.reward
			}))
			uni.navigateTo({ url: `/pages/request/publish?item=${item}` })
		},
		share() { uni.showShareMenu && uni.showShareMenu() || uni.showToast({ title: '分享', icon: 'none' }) },
		report() {
			uni.showActionSheet({
				itemList: ['虚假信息','违法违规','骚扰欺诈','其他'],
				success: () => uni.showToast({ title: '已提交举报', icon: 'success' })
			})
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
.detail { padding: 24rpx; }
.header { display: flex; justify-content: space-between; align-items: center; }
.title { font-size: 34rpx; }
.reward { color: var(--accent); font-weight: 600; font-size: 30rpx; }
.meta { margin-top: 12rpx; display: grid; grid-template-columns: 1fr; gap: 6rpx; color: var(--secondary); }
.badge { display: inline-block; padding: 8rpx 16rpx; background: var(--surface); border: 2rpx solid var(--border); border-radius: 999rpx; width: fit-content; }
.location, .time { font-size: 24rpx; }
.desc { margin-top: 16rpx; background: #fff; border: 2rpx solid $brand-secondary; border-radius: 24rpx; padding: 20rpx; font-size: 26rpx; color: #555; box-shadow: $shadow-sm; }
.actions { margin-top: 20rpx; display: flex; gap: 12rpx; }
.accent { background: var(--primary); color: #fff; border: none; border-radius: 20rpx; height: 84rpx; font-size: 30rpx; flex: 1; box-shadow: $shadow-sm; }
.ghost { background: var(--surface); color: var(--secondary); border: 2rpx solid var(--border); border-radius: 20rpx; height: 84rpx; font-size: 28rpx; flex: 1; box-shadow: $shadow-sm; }
.sub-actions { margin-top: 12rpx; display: flex; gap: 12rpx; }
.ghost.small { height: 56rpx; font-size: 24rpx; box-shadow: $shadow-sm; border-radius: 16rpx; }
.section { margin-top: 20rpx; font-size: 28rpx; color: $brand-secondary; }
.chips { margin-top: 8rpx; display: flex; gap: 12rpx; flex-wrap: wrap; }
.chip { padding: 10rpx 16rpx; background: #fff; border: 2rpx solid $brand-secondary; border-radius: 999rpx; font-size: 24rpx; box-shadow: $shadow-sm; }
.gallery { margin-top: 16rpx; }
.imgs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8rpx; }
.img { width: 100%; height: 160rpx; border-radius: 16rpx; box-shadow: $shadow-sm; }
</style>

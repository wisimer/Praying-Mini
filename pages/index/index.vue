<template>
	<view :class="['home', themeClass]">
		<view class="topbar">
			<text class="logo">祈福社区</text>
			<button class="ghost" @click="goIncense">祈福</button>
		</view>

		<view v-if="loading" class="loading">加载中...</view>
		<view v-else-if="!cards.length" class="empty">暂无内容</view>
		<view v-else class="feed">
			<view class="wish-card" v-for="(c,i) in cards" :key="i" @click="openWish(c)">
				<image :src="c.image" mode="aspectFill" class="bg" />
				<view class="content">
					<text class="text" :class="{'text-two': true}">{{ c.text }}</text>
					<view class="meta">
						<text class="author">{{ c.anonymous ? '匿名' : c.author }}</text>
						<text class="time">{{ formatTime(c.time) }}</text>
					</view>
					<view class="actions" @click.stop>
						<button class="like" @click="like(c)">{{ c.liked ? '已赞' : '点赞' }} · {{ c.likes }}</button>
					</view>
				</view>
			</view>
		</view>

		<view class="completed">
			<text class="section">已完成任务</text>
			<view class="list">
				<view class="item" v-for="(t,i) in completedTasks" :key="i">
					<text class="item-title">{{ t.title }}</text>
					<text class="item-meta">¥{{ t.reward }} · {{ t.location }}</text>
				</view>
			</view>
		</view>

		<button class="fab" @click="goBlessing">开始祈福</button>
	</view>
</template>

<script>
export default {
	data() {
		return {
			theme: 'light',
			loading: false,
			cards: [],
			completedTasks: [
				{ title: '线下代拜求学业', reward: 88, location: '杭州灵隐寺' },
				{ title: '视频陪伴祈福', reward: 66, location: '线上' }
			]
		}
	},
	computed: {
		themeClass() { return `page theme-${this.theme}` }
	},
	created() {
		this.refresh()
	},
	onShow() {
		const t = uni.getStorageSync('theme') || 'light'
		this.theme = t
		this.applyNavColor()
	},
	onPullDownRefresh() {
		this.refresh().then(() => {
			uni.stopPullDownRefresh()
		})
	},
	methods: {
		async fetchCards(type) {
			return new Promise(resolve => {
				setTimeout(() => {
					resolve([
						{ image: 'https://images.unsplash.com/photo-1520974692412-663cc6b4eab1?w=800', text: '希望家人健康平安', author: '缘起', anonymous: false, time: Date.now()-3600*1000, likes: 23, liked: false },
						{ image: 'https://images.unsplash.com/photo-1540744271482-7d8b1797a5fd?w=800', text: '求学业进步，考研顺利', author: '匿名', anonymous: true, time: Date.now()-7200*1000, likes: 45, liked: false },
						{ image: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800', text: '事业顺利，升职加薪', author: '善愿者', anonymous: false, time: Date.now()-5400*1000, likes: 12, liked: false },
						{ image: 'https://images.unsplash.com/photo-1482192505345-5655af888cc4?w=800', text: '愿天下太平，众生安乐', author: '行者', anonymous: false, time: Date.now()-8600*1000, likes: 67, liked: true }
					])
				}, 600)
			})
		},
		async refresh() {
			this.loading = true
			const list = await this.fetchCards('hot')
			this.cards = list
			this.loading = false
		},
		openWish(c) {
			const item = encodeURIComponent(JSON.stringify(c))
			uni.navigateTo({ url: `/pages/wish/detail?item=${item}` })
		},
		like(c) {
			const liked = !!c.liked
			c.liked = !liked
			c.likes = (c.likes || 0) + (liked ? -1 : 1)
		},
		goBlessing() { uni.navigateTo({ url: '/pages/wish/scene' }) },
		goIncense() { uni.navigateTo({ url: '/pages/incense/incense' }) },
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
.topbar { position: sticky; top: 0; z-index: 10; display: flex; justify-content: space-between; align-items: center; padding: 12rpx 0; background: var(--bg); }
.logo { font-size: 34rpx; color: var(--text); }
.ghost { background: var(--surface); color: var(--secondary); border: 2rpx solid var(--border); border-radius: 16rpx; height: 56rpx; font-size: 26rpx; padding: 0 20rpx; box-shadow: $shadow-sm; }

.loading, .empty { margin-top: 20rpx; text-align: center; color: var(--muted); }

.feed { column-count: 2; column-gap: 16rpx; }
.wish-card { display: inline-block; width: 100%; margin: 0 0 16rpx; background: var(--surface); border: 2rpx solid var(--border); border-radius: 24rpx; overflow: hidden; box-shadow: $shadow-sm; }
.bg { width: 100%; height: 260rpx; }
.content { padding: 16rpx; }
.text { font-size: 30rpx; color: var(--text); }
.text-two { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.meta { margin-top: 8rpx; display: flex; justify-content: space-between; color: var(--muted); font-size: 24rpx; }
.actions { margin-top: 12rpx; display: flex; }
.like { background: var(--surface); color: var(--secondary); border: 2rpx solid var(--border); border-radius: 999rpx; height: 56rpx; font-size: 26rpx; padding: 0 20rpx; box-shadow: $shadow-sm; }

.completed { margin-top: 20rpx; }
.section { font-size: 28rpx; color: var(--muted); }
.list { display: grid; grid-template-columns: 1fr; gap: 12rpx; margin-top: 12rpx; }
.item { background: var(--surface); border: 2rpx solid var(--border); border-radius: 24rpx; padding: 20rpx; box-shadow: $shadow-sm; }
.item-title { font-size: 28rpx; color: var(--text); }
.item-meta { margin-top: 6rpx; font-size: 24rpx; color: var(--muted); }

.fab { position: fixed; right: 24rpx; bottom: 120rpx; background: var(--primary); color: #fff; border: none; border-radius: 999rpx; height: 84rpx; padding: 0 28rpx; font-size: 28rpx; box-shadow: $shadow-md; }
</style>

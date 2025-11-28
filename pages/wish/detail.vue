<template>
	<view :class="['wish-detail', themeClass]">
		<image :src="item.image" mode="aspectFill" class="bg" />
		<view class="content">
			<text class="title">{{ item.text }}</text>
			<view class="meta">
				<text class="author">{{ item.anonymous ? '匿名' : item.author }}</text>
				<text class="time">{{ formatTime(item.time) }}</text>
			</view>
			<view class="actions">
				<button class="accent" @click="like">{{ item.liked ? '已点赞' : '点赞' }} · {{ item.likes }}</button>
				<button class="ghost" @click="publish">发布愿望</button>
				<button class="ghost" @click="goIncense">祈福</button>
			</view>
		</view>
	</view>
</template>

<script>
export default {
  data() {
    return { item: {}, theme: 'light' }
  },
  computed: { themeClass() { return `page theme-${this.theme}` } },
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
      const d = new Date(Number(t))
      const pad = n => (n<10?('0'+n):n)
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
    },
    like() {
      const liked = !!this.item.liked
      this.item.liked = !liked
      this.item.likes = (this.item.likes || 0) + (liked ? -1 : 1)
    },
    publish() { uni.navigateTo({ url: '/pages/request/publish' }) },
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
.wish-detail { display: flex; flex-direction: column; }
.bg { width: 100%; height: 360rpx; }
.content { padding: 24rpx; }
.title { font-size: 34rpx; color: var(--text); }
.meta { margin-top: 8rpx; display: flex; gap: 12rpx; color: var(--muted); font-size: 24rpx; }
.actions { margin-top: 16rpx; display: flex; gap: 12rpx; }
.accent { background: var(--primary); color: #fff; border: none; border-radius: 20rpx; height: 84rpx; font-size: 30rpx; flex: 1; box-shadow: $shadow-sm; }
.ghost { background: var(--surface); color: var(--secondary); border: 2rpx solid var(--border); border-radius: 20rpx; height: 84rpx; font-size: 28rpx; flex: 1; box-shadow: $shadow-sm; }
</style>

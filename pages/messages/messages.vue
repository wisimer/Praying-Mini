<template>
	<view :class="['messages', themeClass]">
		<view class="top">
			<text class="title">消息</text>
		</view>
		<view v-if="items.length" class="list">
			<view class="item" v-for="(m,i) in items" :key="i">
				<text class="item-title">{{ m.title }}</text>
				<text class="item-desc">{{ m.desc }}</text>
				<text class="item-time">{{ formatTime(m.time) }}</text>
			</view>
		</view>
		<view v-else class="empty">暂无消息</view>
	</view>
</template>

<script>
export default {
  data() {
    return {
      theme: 'light',
      items: [
        { title: '订单更新', desc: '线下代拜已完成', time: Date.now()-3600*1000 },
        { title: '系统通知', desc: '欢迎来到祈福社区', time: Date.now()-7200*1000 }
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
    formatTime(t) {
      const d = new Date(Number(t))
      const pad = n => (n<10?('0'+n):n)
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
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
.messages { padding: 24rpx; }
.top { display: flex; justify-content: space-between; align-items: center; }
.title { font-size: 34rpx; color: var(--text); }
.list { display: grid; grid-template-columns: 1fr; gap: 12rpx; margin-top: 12rpx; }
.item { background: var(--surface); border: 2rpx solid var(--border); border-radius: 24rpx; padding: 20rpx; box-shadow: $shadow-sm; }
.item-title { font-size: 30rpx; color: var(--text); }
.item-desc { margin-top: 6rpx; font-size: 24rpx; color: var(--muted); }
.item-time { margin-top: 6rpx; font-size: 22rpx; color: var(--muted); }
.empty { margin-top: 40rpx; text-align: center; color: var(--muted); }
</style>

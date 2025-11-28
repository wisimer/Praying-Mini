<template>
	<view :class="['tasks', themeClass]">
		<view class="topbar">
			<text class="title">可接任务</text>
		</view>
		<view class="filters">
			<view v-for="t in types" :key="t" class="chip" :class="{active: selectedType===t}" @click="selectType(t)">{{ t }}</view>
		</view>

		<view v-if="loading && !list.length" class="skeletons">
			<view class="skeleton" v-for="n in 6" :key="n">
				<view class="sk-icon"></view>
				<view class="sk-lines">
					<view class="sk-line"></view>
					<view class="sk-line short"></view>
				</view>
			</view>
		</view>

		<view v-else-if="!list.length" class="empty">暂无任务</view>
		<view v-else class="list">
			<view class="card" v-for="(item,i) in list" :key="i" @click="openDetail(item)">
				<text class="icon">{{ typeIcon(item.type) }}</text>
				<view class="info">
					<text class="card-title">{{ item.title }}</text>
					<view class="meta">
						<text class="reward">¥{{ item.reward }}</text>
						<text class="type">{{ item.type }}</text>
						<text class="time">{{ formatTime(item.time) }}</text>
					</view>
				</view>
			</view>
			<view class="loadmore" v-if="hasMore">
				<text class="lm-text">{{ loading ? '加载中...' : '上拉加载更多' }}</text>
			</view>
		</view>

		<button class="fab" @click="openPublish">发布愿望任务</button>
	</view>
</template>

<script>
export default {
  data() {
    return {
      theme: 'light',
      types: ['全部','祈福','实物','陪伴'],
      selectedType: '全部',
      list: [],
      page: 1,
      pageSize: 10,
      hasMore: true,
      loading: false
    }
  },
  computed: {
    themeClass() { return `page theme-${this.theme}` }
  },
  created() { this.refresh() },
  onShow() {
    const t = uni.getStorageSync('theme') || 'light'
    this.theme = t
    this.applyNavColor()
  },
  onPullDownRefresh() {
    this.refresh().then(() => { uni.stopPullDownRefresh() })
  },
  onReachBottom() {
    this.loadMore()
  },
  methods: {
    typeIcon(t) {
      if (t==='祈福') return '🏮'
      if (t==='实物') return '🎁'
      if (t==='陪伴') return '🤝'
      return '📋'
    },
    formatTime(ts) {
      const d = new Date(Number(ts))
      const p = n => (n<10?('0'+n):n)
      return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
    },
    async fetchTaskListAPI(type, page, pageSize) {
      return new Promise(resolve => {
        setTimeout(() => {
          const all = [
            { title: '线下代拜求学业', type: '祈福', reward: 88, time: Date.now()-3600*1000, location: '杭州灵隐寺' },
            { title: '邮寄护身符', type: '实物', reward: 35, time: Date.now()-8600*1000, location: '成都文殊院' },
            { title: '陪同祈福探访', type: '陪伴', reward: 120, time: Date.now()-5400*1000, location: '北京雍和宫' },
            { title: '远程视频祈福', type: '祈福', reward: 66, time: Date.now()-7200*1000, location: '线上' }
          ]
          const filtered = type==='全部' ? all : all.filter(x => x.type===type)
          const start = (page-1)*pageSize
          const slice = filtered.slice(start, start+pageSize)
          resolve(slice)
        }, 500)
      })
    },
    async refresh() {
      this.page = 1
      this.hasMore = true
      this.list = []
      this.loading = true
      const data = await this.fetchTaskListAPI(this.selectedType, this.page, this.pageSize)
      this.list = data
      this.hasMore = data.length === this.pageSize
      this.loading = false
    },
    async loadMore() {
      if (!this.hasMore || this.loading) return
      this.loading = true
      const nextPage = this.page + 1
      const data = await this.fetchTaskListAPI(this.selectedType, nextPage, this.pageSize)
      this.list = this.list.concat(data)
      this.page = nextPage
      this.hasMore = data.length === this.pageSize
      this.loading = false
    },
    selectType(t) {
      this.selectedType = t
      this.refresh()
    },
    openDetail(item) {
      const q = encodeURIComponent(JSON.stringify(item))
      uni.navigateTo({ url: `/pages/request/detail?item=${q}` })
    },
    openPublish() { uni.navigateTo({ url: '/pages/request/publish' }) },
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
.tasks { padding: 24rpx; }
.topbar { display: flex; justify-content: space-between; align-items: center; }
.title { font-size: 34rpx; color: var(--text); }
.filters { display: flex; gap: 12rpx; margin: 16rpx 0; flex-wrap: wrap; }
.chip { padding: 12rpx 20rpx; border: 2rpx solid var(--border); background: var(--surface); border-radius: 999rpx; font-size: 26rpx; box-shadow: $shadow-sm; }
.chip.active { background: var(--secondary); color: #fff; border-color: var(--secondary); }

.skeletons { display: grid; grid-template-columns: 1fr; gap: 12rpx; }
.skeleton { display: flex; gap: 12rpx; background: var(--surface); border: 2rpx solid var(--border); border-radius: 24rpx; padding: 16rpx; overflow: hidden; }
.sk-icon { width: 56rpx; height: 56rpx; border-radius: 12rpx; background: linear-gradient(90deg, #eaeaea, #f6f6f6, #eaeaea); animation: shimmer 1.4s infinite; }
.sk-lines { flex: 1; display: grid; gap: 8rpx; }
.sk-line { height: 24rpx; border-radius: 8rpx; background: linear-gradient(90deg, #eaeaea, #f6f6f6, #eaeaea); animation: shimmer 1.4s infinite; }
.sk-line.short { width: 60%; }
@keyframes shimmer { 0% { background-position: -200rpx 0 } 100% { background-position: 200rpx 0 } }

.list { display: grid; grid-template-columns: 1fr; gap: 12rpx; }
.card { display: flex; gap: 12rpx; background: var(--surface); border: 2rpx solid var(--border); border-radius: 24rpx; padding: 16rpx; box-shadow: $shadow-sm; }
.icon { width: 56rpx; height: 56rpx; display: flex; align-items: center; justify-content: center; font-size: 32rpx; }
.info { flex: 1; }
.card-title { font-size: 30rpx; color: var(--text); }
.meta { margin-top: 6rpx; display: flex; gap: 12rpx; align-items: center; font-size: 24rpx; color: var(--muted); }
.reward { color: var(--accent); font-weight: 700; }

.empty { margin-top: 40rpx; text-align: center; color: var(--muted); }
.loadmore { margin: 12rpx 0; text-align: center; color: var(--muted); }
.fab { position: fixed; right: 24rpx; bottom: 120rpx; background: var(--primary); color: #fff; border: none; border-radius: 999rpx; height: 84rpx; padding: 0 28rpx; font-size: 28rpx; box-shadow: $shadow-md; }
</style>

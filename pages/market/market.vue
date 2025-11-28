<template>
	<view :class="['market', themeClass]">
		<view class="topbar">
			<view class="search">
				<text class="icon">🔍</text>
				<input class="search-input" v-model="query" placeholder="搜索需求" @input="applyFilter" />
			</view>
			<view class="actions">
				<button class="ghost" @click="openFilter">筛选</button>
				<button class="ghost" @click="openSort">排序</button>
			</view>
		</view>

		<view class="types">
			<view
				v-for="(t,i) in types"
				:key="i"
				class="chip"
				:class="{ active: selectedType===t }"
				@click="selectType(t)"
			>{{ t }}</view>
		</view>

		<view class="grid">
			<view class="card" v-for="(item,idx) in visible" :key="idx" @click="openDetail(item)">
				<text class="card-title">{{ item.title }}</text>
				<text class="card-desc">{{ item.desc }}</text>
				<view class="meta">
					<text class="type">{{ item.type }}</text>
					<text class="reward">¥{{ item.reward }}</text>
				</view>
				<text class="location">地点：{{ item.location }}</text>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			theme: 'light',
			query: '',
			types: ['全部','线下祈福','实物获取','陪伴服务','音视频','特殊体验'],
			selectedType: '全部',
			sort: '默认',
			records: [
				{ title: '线下代拜求学业', type: '线下祈福', desc: '周末到寺庙为孩子祈福', location: '杭州灵隐寺', reward: 88, time: 1730000000 },
				{ title: '邮寄护身符', type: '实物获取', desc: '帮忙购买并邮寄护身符', location: '成都文殊院', reward: 35, time: 1731000000 },
				{ title: '远程视频祈福', type: '音视频', desc: '视频连线陪伴祈福', location: '线上', reward: 66, time: 1732000000 },
				{ title: '禅修一日体验', type: '特殊体验', desc: '寺院禅修入门陪同', location: '苏州寒山寺', reward: 199, time: 1733000000 },
				{ title: '陪伴服务探访', type: '陪伴服务', desc: '陪同前往寺庙祈福', location: '北京雍和宫', reward: 120, time: 1732500000 }
			],
			visible: []
		}
	},
	computed: {
		themeClass() { return `page theme-${this.theme}` }
	},
	created() { this.applyFilter() },
	onShow() {
		const t = uni.getStorageSync('theme') || 'light'
		this.theme = t
		this.applyNavColor()
	},
	methods: {
		selectType(t) {
			this.selectedType = t
			this.applyFilter()
		},
		applyFilter() {
			let list = this.records.filter(r => {
				const typeOk = this.selectedType==='全部' || r.type===this.selectedType
				const q = this.query.trim()
				const qOk = !q || r.title.includes(q) || r.desc.includes(q)
				return typeOk && qOk
			})
			if (this.sort==='价格优先') list.sort((a,b)=>b.reward-a.reward)
			else if (this.sort==='最新优先') list.sort((a,b)=>b.time-a.time)
			this.visible = list
		},
		openFilter() {
			uni.showActionSheet({
				itemList: ['全部','线下祈福','实物获取','陪伴服务','音视频','特殊体验'],
				success: res => { this.selectType(this.types[res.tapIndex]) }
			})
		},
		openSort() {
			uni.showActionSheet({
				itemList: ['默认','价格优先','最新优先'],
				success: res => { this.sort = ['默认','价格优先','最新优先'][res.tapIndex]; this.applyFilter() }
			})
		},
		openDetail(item) {
			const q = encodeURIComponent(JSON.stringify(item))
			uni.navigateTo({ url: `/pages/request/detail?item=${q}` })
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
.market { padding: 24rpx; }
.topbar { display: flex; align-items: center; justify-content: space-between; gap: 20rpx; }
.search { flex: 1; display: flex; align-items: center; gap: 12rpx; background: var(--surface); border: 2rpx solid var(--border); border-radius: 20rpx; padding: 12rpx 16rpx; box-shadow: $shadow-sm; }
.icon { font-size: 30rpx; }
.search-input { flex: 1; height: 56rpx; font-size: 26rpx; }
.actions { display: flex; gap: 12rpx; }
.ghost { background: var(--surface); color: var(--secondary); border: 2rpx solid var(--border); border-radius: 16rpx; height: 60rpx; font-size: 26rpx; box-shadow: $shadow-sm; }

.types { display: flex; flex-wrap: wrap; gap: 12rpx; margin: 20rpx 0; }
.chip { padding: 12rpx 20rpx; border: 2rpx solid var(--border); border-radius: 999rpx; background: var(--surface); font-size: 26rpx; box-shadow: $shadow-sm; }
.chip.active { background: var(--secondary); color: #fff; border-color: var(--secondary); }

.grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16rpx; }
.card { background: var(--surface); border: 2rpx solid var(--border); border-radius: 24rpx; padding: 20rpx; box-shadow: $shadow-sm; }
.card-title { font-size: 30rpx; color: var(--text); }
.card-desc { margin-top: 8rpx; font-size: 24rpx; color: #555; }
.meta { margin-top: 10rpx; display: flex; justify-content: space-between; align-items: center; }
.type { color: var(--secondary); font-size: 24rpx; }
.reward { color: var(--accent); font-weight: 700; }
.location { margin-top: 6rpx; font-size: 22rpx; color: #777; }
</style>

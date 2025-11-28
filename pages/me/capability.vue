<template>
	<view :class="['capability', themeClass]">
		<view class="card">
			<text class="section-title">发布愿望服务能力</text>
			<view class="form">
				<view class="field">
					<text class="label">服务类型</text>
					<radio-group @change="e => form.type = e.detail.value">
						<label class="radio-item"><radio value="线下祈福" :checked="form.type==='线下祈福'" />线下祈福</label>
						<label class="radio-item"><radio value="实物获取" :checked="form.type==='实物获取'" />实物获取</label>
						<label class="radio-item"><radio value="陪伴服务" :checked="form.type==='陪伴服务'" />陪伴服务</label>
						<label class="radio-item"><radio value="音视频" :checked="form.type==='音视频'" />音视频</label>
						<label class="radio-item"><radio value="特殊体验" :checked="form.type==='特殊体验'" />特殊体验</label>
					</radio-group>
				</view>

				<view class="field">
					<text class="label">技能标题</text>
					<input class="input-field" v-model="form.title" placeholder="例如：线下代拜·求学业" />
				</view>
				<view class="field">
					<text class="label">能力描述</text>
					<textarea class="input-field" v-model="form.desc" placeholder="详细介绍你的服务内容、流程与注意事项" auto-height />
				</view>
				<view class="field">
					<text class="label">覆盖范围</text>
					<input class="input-field" v-model="form.scope" placeholder="城市/区域，例如：杭州·灵隐寺周边" />
				</view>
				<view class="field two">
					<view class="sub">
						<text class="label">起价（元）</text>
						<input class="input-field" type="digit" v-model="form.price" placeholder="例如：88" />
					</view>
					<view class="sub">
						<text class="label">联系方式</text>
						<input class="input-field" v-model="form.contact" placeholder="微信/手机号" />
					</view>
				</view>
				<view class="field">
					<text class="label">可预约时间</text>
					<input class="input-field" v-model="form.schedule" placeholder="例如：周末全天，工作日晚间" />
				</view>
				<view class="field">
					<text class="label">标签（逗号分隔）</text>
					<input class="input-field" v-model="tagsText" placeholder="例如：学业,健康,护身符" />
				</view>
			</view>
		</view>

		<button class="btn-accent" @click="submit">发布能力</button>
	</view>
</template>

<script>
export default {
	data() {
		return {
			theme: 'light',
			form: {
				type: '线下祈福', title: '', desc: '', scope: '', price: '', contact: '', schedule: ''
			},
			tagsText: ''
		}
	},
	computed: { themeClass() { return `page theme-${this.theme}` } },
	onShow() {
		const t = uni.getStorageSync('theme') || 'light'
		this.theme = t
		this.applyNavColor()
	},
	methods: {
		applyNavColor() {
			if (this.theme==='dark') {
				uni.setNavigationBarColor({ frontColor: '#ffffff', backgroundColor: '#0A0A0F' })
			} else {
				uni.setNavigationBarColor({ frontColor: '#000000', backgroundColor: '#FFB6A3' })
			}
		},
		submit() {
			if (!this.form.title || !this.form.desc) {
				uni.showToast({ title: '请填写标题与描述', icon: 'none' })
				return
			}
			const tags = this.tagsText.split(',').map(s => s.trim()).filter(Boolean)
			const capability = { ...this.form, tags, time: Date.now() }
			const list = uni.getStorageSync('capabilities') || []
			list.unshift(capability)
			uni.setStorageSync('capabilities', list)
			uni.showToast({ title: '已发布能力', icon: 'success' })
			setTimeout(()=>{ uni.navigateBack() }, 300)
		}
	}
}
</script>

<style lang="scss">
.capability { padding: 24rpx; }
.card { background: var(--surface); border: 2rpx solid var(--border); border-radius: 24rpx; box-shadow: $shadow-sm; padding: 20rpx; }
.form { margin-top: 12rpx; }
.field { margin-bottom: 18rpx; }
.field.two { display: grid; grid-template-columns: 1fr 1fr; gap: 12rpx; }
.label { display: block; margin-bottom: 8rpx; color: var(--muted); font-size: 26rpx; }
.radio-item { margin-right: 16rpx; font-size: 26rpx; padding: 8rpx 14rpx; background: var(--surface); border: 2rpx solid var(--border); border-radius: 999rpx; }
.btn-accent { @extend .btn-accent; margin-top: 24rpx; }
</style>

<template>
	<view :class="['incense', themeClass]">
		<view class="scene">
			<text class="scene-label">3D场景展示</text>
		</view>

		<view class="group">
			<text class="group-title">香类型</text>
			<radio-group @change="onTypeChange">
				<label class="radio-item"><radio value="普通" :checked="type==='普通'" />普通</label>
				<label class="radio-item"><radio value="许愿" :checked="type==='许愿'" />许愿</label>
			</radio-group>
		</view>

		<view class="group">
			<text class="group-title">场景</text>
			<radio-group @change="onSceneChange">
				<label class="radio-item"><radio value="寺庙" :checked="scene==='寺庙'" />寺庙</label>
				<label class="radio-item"><radio value="竹林" :checked="scene==='竹林'" />竹林</label>
			</radio-group>
		</view>

		<view class="group">
			<text class="group-title">神明</text>
			<radio-group @change="onDeityChange">
				<label class="radio-item"><radio value="学业" :checked="deity==='学业'" />学业</label>
				<label class="radio-item"><radio value="健康" :checked="deity==='健康'" />健康</label>
			</radio-group>
		</view>

		<view class="wish-box">
			<textarea class="wish-input" v-model="wish" placeholder="输入愿望..." maxlength="120" auto-height />
		</view>

		<button class="accent-btn" @click="submitWish">许愿</button>
	</view>
</template>

<script>
export default {
	data() {
		return {
			theme: 'light',
			type: '普通',
			scene: '寺庙',
			deity: '学业',
			wish: ''
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
		onTypeChange(e) { this.type = e.detail.value },
		onSceneChange(e) { this.scene = e.detail.value },
		onDeityChange(e) { this.deity = e.detail.value },
		submitWish() {
			if (!this.wish) {
				uni.showToast({ title: '请先输入愿望', icon: 'none' })
				return
			}
			uni.showToast({ title: '愿望已送出', icon: 'success' })
			this.wish = ''
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
.incense { padding: 24rpx; }
.scene {
	height: 360rpx;
	border: 2rpx dashed $brand-secondary;
	border-radius: 24rpx;
	background: var(--surface);
	border-color: var(--border);
	box-shadow: $shadow-sm;
	display: flex; align-items: center; justify-content: center;
}
.scene-label { color: var(--muted); font-size: 28rpx; }

.group { margin-top: 24rpx; }
.group-title { font-size: 28rpx; color: var(--muted); margin-bottom: 12rpx; display: block; }
.radio-item { margin-right: 24rpx; font-size: 26rpx; padding: 10rpx 16rpx; background: var(--surface); border: 2rpx solid var(--border); border-radius: 999rpx; }

.wish-box { margin-top: 24rpx; }
.wish-input {
	width: 100%;
	min-height: 120rpx;
	background: var(--surface);
	border: 2rpx solid var(--border);
	border-radius: 20rpx;
	padding: 20rpx;
	box-shadow: $shadow-sm;
	font-size: 26rpx;
}


.accent-btn {
	margin-top: 28rpx;
	background: var(--primary);
	color: #fff;
	border: none;
	border-radius: 20rpx;
	height: 84rpx;
	font-size: 30rpx;
	box-shadow: $shadow-sm;
}
</style>

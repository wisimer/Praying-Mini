<template>
	<view class="incense">
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
			type: '普通',
			scene: '寺庙',
			deity: '学业',
			wish: ''
		}
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
		}
	}
}
</script>

<style lang="scss">
.incense { padding: 24rpx; background: $uni-bg-color; color: $uni-text-color; }
.scene {
	height: 360rpx;
	border: 2rpx dashed $brand-secondary;
	border-radius: 20rpx;
	background: #fff;
	display: flex; align-items: center; justify-content: center;
}
.scene-label { color: $brand-secondary; font-size: 28rpx; }

.group { margin-top: 24rpx; }
.group-title { font-size: 28rpx; color: $brand-secondary; margin-bottom: 12rpx; display: block; }
.radio-item { margin-right: 24rpx; font-size: 26rpx; }

.wish-box { margin-top: 24rpx; }
.wish-input {
	width: 100%;
	min-height: 120rpx;
	background: #fff;
	border: 2rpx solid $brand-secondary;
	border-radius: 16rpx;
	padding: 16rpx;
	font-size: 26rpx;
}

.accent-btn {
	margin-top: 28rpx;
	background: $brand-accent;
	color: #fff;
	border: none;
	border-radius: 16rpx;
	height: 80rpx;
	font-size: 28rpx;
}
</style>

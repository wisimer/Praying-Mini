<template>
	<view class="publish">
		<view class="group">
			<text class="group-title">需求类型选择</text>
			<radio-group @change="onTypeChange">
				<label class="radio-item"><radio value="线下祈福" :checked="form.type==='线下祈福'" />线下祈福</label>
				<label class="radio-item"><radio value="实物获取" :checked="form.type==='实物获取'" />实物获取</label>
				<label class="radio-item"><radio value="陪伴服务" :checked="form.type==='陪伴服务'" />陪伴服务</label>
				<label class="radio-item"><radio value="音视频" :checked="form.type==='音视频'" />音视频</label>
			</radio-group>
		</view>

		<view class="form">
			<view class="field">
				<text class="label">标题</text>
				<input class="input" v-model="form.title" placeholder="填写标题" />
			</view>
			<view class="field">
				<text class="label">描述</text>
				<textarea class="textarea" v-model="form.desc" placeholder="详细描述需求" auto-height />
			</view>
			<view class="field">
				<text class="label">地点</text>
				<input class="input" v-model="form.location" placeholder="城市/具体地点" />
			</view>
			<view class="field">
				<text class="label">悬赏</text>
				<input class="input" type="digit" v-model="form.reward" placeholder="金额（元）" />
			</view>
		</view>

		<button class="accent-btn" @click="submit">发布</button>
	</view>
</template>

<script>
export default {
	data() {
		return {
			form: {
				type: '线下祈福',
				title: '',
				desc: '',
				location: '',
				reward: ''
			}
		}
	},
	methods: {
		onTypeChange(e) { this.form.type = e.detail.value },
		submit() {
			if (!this.form.title || !this.form.desc) {
				uni.showToast({ title: '请填写标题和描述', icon: 'none' })
				return
			}
			uni.showToast({ title: '已发布', icon: 'success' })
			this.form = { type: '线下祈福', title: '', desc: '', location: '', reward: '' }
		}
	}
}
</script>

<style lang="scss">
.publish { padding: 24rpx; background: $uni-bg-color; color: $uni-text-color; }
.group { margin-bottom: 24rpx; }
.group-title { font-size: 28rpx; color: $brand-secondary; margin-bottom: 12rpx; display: block; }
.radio-item { margin-right: 24rpx; font-size: 26rpx; }

.form { background: #fff; border: 2rpx solid $brand-secondary; border-radius: 16rpx; padding: 20rpx; }
.field { margin-bottom: 18rpx; }
.label { display: block; margin-bottom: 8rpx; color: $brand-secondary; font-size: 26rpx; }
.input, .textarea {
	width: 100%;
	border: 2rpx solid $brand-secondary;
	border-radius: 12rpx;
	padding: 16rpx;
	font-size: 26rpx;
	background: #fff;
}

.accent-btn {
	margin-top: 24rpx;
	background: $brand-accent;
	color: #fff;
	border: none;
	border-radius: 16rpx;
	height: 80rpx;
	font-size: 28rpx;
}
</style>

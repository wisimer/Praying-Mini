<template>
	<view :class="['publish', themeClass]">
		<view class="group">
			<text class="group-title">任务类型</text>
			<picker mode="selector" :range="types" @change="onTypePick">
				<view class="picker">
					<text>{{ form.type || '请选择任务类型' }}</text>
				</view>
			</picker>
		</view>

		<view class="form">
			<view class="field">
				<text class="label">愿望标题</text>
				<input class="input" v-model="form.title" placeholder="填写标题" />
			</view>
			<view class="field">
				<text class="label">愿望描述</text>
				<textarea class="textarea" v-model="form.desc" placeholder="详细描述你的愿望与要求" auto-height />
			</view>
			<view class="field">
				<text class="label">预算（元）</text>
				<input class="input" type="digit" v-model="form.reward" placeholder="例如：88" />
			</view>

			<view class="field">
				<text class="label">上传图片（1-3张）</text>
				<view class="imgs">
					<view class="img" v-for="(src,i) in form.images" :key="i">
						<image :src="src" mode="aspectFill" class="thumb" />
						<text class="del" @click="removeImage(i)">✕</text>
					</view>
					<view v-if="form.images.length<3" class="add" @click="chooseImages">
						<text class="plus">＋</text>
					</view>
				</view>
			</view>
		</view>

		<view class="footer">
			<button class="primary" :disabled="publishing" @click="submit">{{ publishing ? '发布中...' : '发布愿望' }}</button>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			theme: 'light',
			types: ['线下祈福','实物代办','陪伴情感'],
			form: { type: '', title: '', desc: '', reward: '', images: [] },
			publishing: false
		}
	},
	computed: {
		themeClass() { return `page theme-${this.theme}` }
	},
	onLoad(query) {
		if (query && query.item) {
			try {
				const it = JSON.parse(decodeURIComponent(query.item))
				this.form = {
					type: it.type || '',
					title: it.title || '',
					desc: it.desc || '',
					reward: it.reward || '',
					images: it.images || []
				}
			} catch(e) {}
		}
	},
	onShow() {
		const t = uni.getStorageSync('theme') || 'light'
		this.theme = t
		this.applyNavColor()
	},
	methods: {
		onTypePick(e) { this.form.type = this.types[e.detail.value] },
		async chooseImages() {
			const remain = 3 - this.form.images.length
			if (remain<=0) return
			const res = await uni.chooseImage({ count: remain })
			const paths = (res.tempFilePaths || res.tempFiles || []).map(x => (typeof x==='string' ? x : x.path))
			this.form.images = this.form.images.concat(paths).slice(0,3)
		},
		removeImage(i) { this.form.images.splice(i,1) },
		async publishWishAPI(form) {
			return new Promise(resolve => setTimeout(() => {
				resolve({
					title: form.title,
					desc: form.desc,
					type: form.type,
					reward: Number(form.reward||0),
					images: form.images,
					location: form.location || '',
					time: Date.now()
				})
			}, 600))
		},
		async submit() {
			const title = (this.form.title||'').trim()
			const desc = (this.form.desc||'').trim()
			const type = (this.form.type||'').trim()
			const reward = Number(this.form.reward)
			if (!title || !desc) { uni.showToast({ title: '请填写标题和描述', icon: 'none' }); return }
			if (!type) { uni.showToast({ title: '请选择任务类型', icon: 'none' }); return }
			if (!reward || reward<=0) { uni.showToast({ title: '请输入有效预算', icon: 'none' }); return }
			this.publishing = true
			const item = await this.publishWishAPI(this.form)
			this.publishing = false
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
.publish { padding: 24rpx; padding-bottom: 140rpx; }
.group { margin-bottom: 24rpx; }
.group-title { font-size: 28rpx; color: var(--muted); margin-bottom: 12rpx; display: block; }
.picker { background: var(--surface); border: 2rpx solid var(--border); border-radius: 20rpx; padding: 16rpx; box-shadow: $shadow-sm; }

.form { background: var(--surface); border: 2rpx solid var(--border); border-radius: 24rpx; padding: 24rpx; box-shadow: $shadow-sm; }
.field { margin-bottom: 18rpx; }
.label { display: block; margin-bottom: 8rpx; color: var(--muted); font-size: 26rpx; }

.input, .textarea {
  width: 100%;
  border: 2rpx solid var(--border);
  border-radius: 20rpx;
  padding: 20rpx;
  font-size: 26rpx;
  background: var(--surface);
  box-shadow: $shadow-sm;
}

.imgs { display: flex; gap: 12rpx; flex-wrap: wrap; }
.img { position: relative; }
.thumb { width: 160rpx; height: 160rpx; border-radius: 16rpx; box-shadow: $shadow-sm; }
.del { position: absolute; right: 6rpx; top: 6rpx; background: rgba(0,0,0,0.6); color: #fff; border-radius: 999rpx; font-size: 24rpx; padding: 2rpx 8rpx; }
.add { width: 160rpx; height: 160rpx; border: 2rpx dashed var(--border); border-radius: 16rpx; display: flex; align-items: center; justify-content: center; }
.plus { font-size: 42rpx; color: var(--muted); }

.footer { position: fixed; left: 0; right: 0; bottom: 0; padding: 16rpx 24rpx; background: var(--bg); box-shadow: 0 -8rpx 16rpx rgba(0,0,0,0.06); }
.primary { width: 100%; background: var(--primary); color: #fff; border: none; border-radius: 20rpx; height: 84rpx; font-size: 30rpx; box-shadow: $shadow-sm; }
</style>

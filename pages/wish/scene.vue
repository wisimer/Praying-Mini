<template>
	<view :class="['scene', themeClass]">
		<view v-if="!animating" class="input-area">
			<view class="bg"></view>
			<textarea class="input" v-model="text" placeholder="请输入你的愿望" :maxlength="100" />
			<view class="hint">20-100 字</view>
			<button class="start" :disabled="disabled || loading" @click="startBlessing">{{ loading ? '准备中...' : '开始祈福' }}</button>
		</view>
		<view v-else class="anim-area">
			<blessing-anim :text="text" />
		</view>
	</view>
</template>

<script>
export default {
  components: {
    'blessing-anim': {
      props: ['text'],
      data() { return { particles: Array.from({ length: 24 }).map(() => ({ left: Math.random()*100, delay: Math.random()*1.2 })) } },
      template: `
        <view class=anim>
          <text class=wish>{{ text }}</text>
          <view class=field>
            <view v-for="(p,i) in particles" :key="i" class=dot :style="{ left: p.left+'%', animationDelay: p.delay+'s' }"></view>
          </view>
        </view>
      `
    }
  },
  data() {
    return { theme: 'light', text: '', loading: false, animating: false }
  },
  computed: {
    themeClass() { return `page theme-${this.theme}` },
    disabled() { const n = (this.text||'').trim().length; return n < 20 || n > 100 }
  },
  onShow() {
    const t = uni.getStorageSync('theme') || 'light'
    this.theme = t
    this.applyNavColor()
  },
  methods: {
    async startBlessing() {
      if (this.disabled) { uni.showToast({ title: '请输入 20-100 字愿望', icon: 'none' }); return }
      this.loading = true
      this.animating = true
      await new Promise(r => setTimeout(r, 3000))
      const wish = await this.createWishAPI(this.text)
      const card = await this.generateCardAPI(wish)
      const item = encodeURIComponent(JSON.stringify(card))
      this.loading = false
      this.animating = false
      uni.navigateTo({ url: `/pages/wish/detail?item=${item}` })
    },
    async createWishAPI(text) {
      return { text, time: Date.now(), author: '我', anonymous: false }
    },
    async generateCardAPI(wish) {
      const images = [
        'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800',
        'https://images.unsplash.com/photo-1482192505345-5655af888cc4?w=800',
        'https://images.unsplash.com/photo-1520974692412-663cc6b4eab1?w=800'
      ]
      return { image: images[Math.floor(Math.random()*images.length)], text: wish.text, author: wish.author, anonymous: wish.anonymous, time: wish.time, likes: 0, liked: false }
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
.scene { padding: 24rpx; min-height: 100vh; position: relative; }
.bg { position: absolute; inset: 0; background: radial-gradient(1200rpx 600rpx at 50% 0%, rgba(168,216,185,0.25), transparent), linear-gradient(180deg, rgba(0,240,255,0.12), transparent), linear-gradient(180deg, var(--bg), var(--bg)); filter: blur(2rpx); }
.input-area { position: relative; display: flex; flex-direction: column; gap: 12rpx; }
.input { width: 100%; min-height: 160rpx; background: var(--surface); border: 2rpx solid var(--border); border-radius: 20rpx; padding: 16rpx; font-size: 28rpx; box-shadow: $shadow-sm; }
.hint { font-size: 24rpx; color: var(--muted); }
.start { background: var(--primary); color: #fff; border: none; border-radius: 20rpx; height: 84rpx; font-size: 30rpx; box-shadow: $shadow-sm; }
.start[disabled] { opacity: .6 }

.anim-area { display: flex; align-items: center; justify-content: center; height: 60vh; }
.anim { position: relative; width: 80%; max-width: 600rpx; height: 320rpx; background: var(--surface); border: 2rpx solid var(--border); border-radius: 24rpx; box-shadow: $shadow-sm; overflow: hidden; }
.wish { position: absolute; bottom: 24rpx; left: 50%; transform: translateX(-50%); font-size: 30rpx; color: var(--text); animation: rise 3s ease forwards; text-align: center; width: 90%; }
.field { position: absolute; inset: 0; }
.dot { position: absolute; bottom: 0; width: 8rpx; height: 8rpx; background: var(--secondary); border-radius: 999rpx; left: 50%; animation: float 3s ease infinite; opacity: .9 }
@keyframes rise { 0% { transform: translate(-50%, 0); opacity: 0.6 } 50% { opacity: 1 } 100% { transform: translate(-50%, -220rpx); opacity: 0 } }
@keyframes float { 0% { transform: translateY(0); opacity: .8 } 100% { transform: translateY(-320rpx); opacity: 0 } }
</style>

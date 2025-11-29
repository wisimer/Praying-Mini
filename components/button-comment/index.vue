<template>
	<view class="fixed_bnt">
		<view class="flex align-center justify-between bg-white padding20 comment">
			<uni-icons type="clear" size="20" color="gray" class="clear" v-if="isClear" @click="clearMsg"></uni-icons>
			<input v-model="msg" class="pinglun flex-1 margin-r30" type="text" :placeholder="placeholder" />
			<view class="send" @click="send">发送</view>
		</view>
	</view>

</template>

<script setup>
	import { ref, computed } from 'vue'
	import { showToast } from '@/core/app.js'

	const porp = defineProps({
		placeholder: {
			type: String,
			default: '说点啥~'
		}
	})

	const msg = ref('')

	const emit = defineEmits(['send', 'clearMsg'])

	const isClear = computed(() => {
		if (msg.value || porp.placeholder !== '说点啥~') {
			return true
		} else {
			return false
		}
	})

	const send = (item) => {
		if (!msg.value) return showToast('不能发送空内容')
		emit('send', msg.value)
		msg.value = ''
	}

	const clearMsg = () => {
		msg.value = ''
		emit('clearMsg', msg.value)
	}
</script>

<style lang="scss" scoped>
	.fixed_bnt {
		height: 130rpx;

	}

	.comment {
		position: fixed;
		bottom: 0;
		width: 100%;
		padding: 20rpx;
		z-index: 9;
	}

	.pinglun {
		background-color: #F0F7F5;
		border-radius: 200rpx;
		height: 74rpx;
		line-height: 74rpx;
		padding: 0 24rpx;
	}

	.clear {
		position: absolute;
		right: 280rpx;
		z-index: 999;
	}

	.send {
		padding: 0 70rpx;
		height: 74rpx;
		line-height: 74rpx;
		border-radius: 100rpx;
		font-size: 30rpx;
		color: white;
		background-color: #AFC272;
	}
</style>
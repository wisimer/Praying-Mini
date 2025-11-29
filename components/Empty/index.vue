<template>
	<view class="flex flex-direction align-center color-8C8888">
		<image src="https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/kongzt.png" mode=""
			class="kong">
		</image>
		<text>{{porp.title}}</text>
	</view>
</template>

<script setup>
	const porp = defineProps({
		title: {
			type: String,
			default: '暂无数据~'
		}
	})
</script>

<style scoped>
	.kong {
		width: 136rpx;
		height: 136rpx;
		margin-bottom: 10rpx;
	}
</style>
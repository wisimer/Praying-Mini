<template>
	<view class="margin-b30" v-for="item in records" :key="item.sort">
		<view class="margin-b20">
			<text class="title">{{item.sort}}</text>
			<text v-if="item.sort === '自定义'" class="margin-l10 font-size22 color-8C8888">长按删除自定义类型</text>
		</view>
		<view class="card">
			<view class="card-item" v-for="ele in item.list" :key="ele._id" @click="trigger(ele)"
				@longpress="longpress(ele,item)">
				<image class="icon" :src="ele.icon"></image>
				<text class="name">{{ele.name}}</text>
			</view>
		</view>
	</view>
</template>

<script setup>
	const porp = defineProps({
		records: {
			type: Array,
			default: () => []
		}
	})

	const emit = defineEmits(['trigger', 'clongpress'])

	const trigger = (ele) => {
		emit('trigger', ele)
	}

	const longpress = (ele, item) => {
		if (item.sort === '自定义') {
			emit('clongpress', ele)
		}
	}
</script>

<style scoped>
	.title {
		font-size: 32rpx;
		color: #352926;
		font-weight: bold;
	}

	.card {
		background: #FFFFFF;
		border-radius: 24rpx;
		padding: 30rpx;
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 34rpx;
	}

	.card-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
	}

	.icon {
		width: 72rpx;
		height: 72rpx;
		margin-bottom: 8rpx;
	}

	.name {
		font-size: 12px;
		color: #775047;
	}

	.colse {
		position: absolute;
		right: 0;
		top: 0;
	}
</style>
<template>
	<view>
		<cuNavbar>
			<template #content>
				<view class="font-size32 color-352926 font-weight">
					挑战说明
				</view>
			</template>
		</cuNavbar>
		<view class="padding30">
			<view class="font-size26 color-8C8888 margin-b10">玩法介绍:</view>
			<view class="font-size26 color-8C8888 margin-b10">玩家可通过日常记录、花销记录、发布动态对Boss造成伤害，一种操作每天只能造成一次伤害</view>
			<view class="font-size26 color-8C8888 margin-b30">注：发布动态可造成双倍伤害</view>
			<view class="font-size26 color-8C8888 margin-b10">属性介绍:</view>
			<view class="font-size26 color-8C8888">力量: 权重值 = 0.5</view>
			<view class="font-size26 color-8C8888">智慧: 权重值 = 0.01</view>
			<view class="font-size26 color-8C8888 margin-b30">敏捷: 权重值 = 0.01</view>
			<view class="font-size26 color-8C8888 margin-b10">伤害计算公式:</view>
			<view class="font-size26 color-8C8888">基础伤害=力量×力量权重；例：100×0.5=50</view>
			<view class="font-size26 color-8C8888">智慧加成=1+智慧×智慧权重；例：1+50×0.01=1.5</view>
			<view class="font-size26 color-8C8888">敏捷修正=1+敏捷×敏捷权重；例：1+80×0.01=1.8</view>
			<view class="font-size26 color-8C8888">最终伤害=基础伤害×智慧加成×敏捷修正</view>
			<view class="font-size26 color-8C8888">例如：50×1.5×1.8=135</view>
		</view>
	</view>
</template>

<script setup>
	import cuNavbar from '@/components/cu-navbar/cu-navbar.vue'
</script>

<style>

</style>
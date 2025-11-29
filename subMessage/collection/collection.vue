<template>
	<view>
		<cuNavbar>
			<template #content>
				<view class="font-size36 color-352926 font-weight">点赞收藏</view>
			</template>
		</cuNavbar>
		<view class="padding32">
			<view class="margin-b24" v-for="item in shares" :key="item.id">
				<DynamicCard :user-info="item.dynamicInfo[0].userInfo[0]" :dynamic-detail="item.dynamicInfo[0]"
					:isDetails="true">
				</DynamicCard>
			</view>
			<Empty v-if="shares.length === 0"></Empty>
		</view>
	</view>
</template>

<script setup>
	import { onLoad, onReachBottom } from '@dcloudio/uni-app'
	import { getLikes } from '@/cloud-api/dynamic.js'
	import cuNavbar from '@/components/cu-navbar/cu-navbar.vue'
	import Empty from '@/components/Empty/index.vue'
	import DynamicCard from '@/components/Dynamic-card/index.vue'
	import { ref } from 'vue'
	import { showLoading } from '../../core/app'

	const shares = ref([])
	const pageNum = ref(0)
	const isQuery = ref(true)

	const init = () => {
		showLoading()
		getLikes(pageNum.value).then(result => {
			uni.hideLoading()
			if (result.data.length === 0) {
				isQuery.value = false
			}
			const arr = result.data.map(val => {
				val.dynamicInfo[0].imgs = val.dynamicInfo[0].imgs ? val.dynamicInfo[0].imgs.split(',') : []
				return val
			})
			shares.value = [...shares.value, ...arr]
		}).finally(() => {
			uni.hideLoading()
		})
	}

	onLoad(() => {
		init()
	})


	onReachBottom(() => {
		if (isQuery.value) {
			pageNum.value += 1
			init()
		}
	})
</script>

<style>

</style>
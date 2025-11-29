<template>
	<view class=" flex flex-direction">
		<cuNavbar>
			<template #content>
				<view class="font-size36 color-352926 font-weight">选择品种</view>
			</template>
		</cuNavbar>

		<scroll-view :scroll-into-view="scrollIntoView" scroll-y="true" style="height: 100vh;">
			<view v-for="(item,index) in types" :key="item.sort" :id="item.sort === '热' ? 'RI' : item.sort">
				<view class="margin-b10 font-size30 font-weight  sort-index">
					{{item.sort}}
				</view>
				<template v-if="item.sort === '热'">
					<view class="hots">
						<view class="bg-white hots-item font-size24" v-for="breed in item.list" :key="breed"
							@click="confirm(breed)">
							{{breed}}
						</view>
					</view>
				</template>
				<template v-else>
					<view class="padding32 border-bottom bg-white font-size28" v-for="breed in item.list" :key="breed"
						@click="confirm(breed)">
						{{breed}}
					</view>
				</template>

			</view>
		</scroll-view>

		<view class="chose">
			<view class="margin-b5 font-size22" v-for="item in types" :key="item.sort" @click="toScroll(item)">
				{{item.sort}}
			</view>
		</view>

	</view>
</template>

<script setup>
	import { ref } from 'vue';
	import { onLoad } from '@dcloudio/uni-app'
	import { showLoading } from '@/core/app.js'
	import cuNavbar from '@/components/cu-navbar/cu-navbar.vue'

	const scrollIntoView = ref('RI')
	const confirm = (breed) => {
		uni.$emit('choseBreed', breed)
		uni.navigateBack()
	}

	const toScroll = (item) => {
		const sort = item.sort === '热' ? 'RI' : item.sort
		scrollIntoView.value = sort
	}

	const types = ref([])
	onLoad(({ type }) => {
		showLoading()
		uniCloud.callFunction({ name: 'choose-breed', data: { type: type } }).then(res => {
			types.value = res.result.data
		}).finally(() => {
			uni.hideLoading()
		})

	})
</script>

<style scoped lang="scss">
	.chose {
		position: fixed;
		right: 10rpx;
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-top: 30rpx;
		font-size: 22rpx;
	}

	.sort-index {
		padding: 24rpx 32rpx;
	}

	.hots {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 15rpx;
		color: #775047;
		padding: 0 42rpx;
	}

	.hots-item {
		border-radius: 10rpx;
		padding: 10rpx 0;
		text-align: center;
	}
</style>
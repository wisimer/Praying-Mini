<template>
	<view>
		<cuNavbar>
			<template #content>
				<view class="font-size36 color-352926 font-weight">病例记录</view>
			</template>
		</cuNavbar>

		<view class="padding30">
			<view class="flex margin-b20" v-for="(item,index) in list" :key="item._id">
				<view class="margin-r20">
					<view class="print">
						<view class="s-print"></view>
					</view>
					<view class="line" v-if="index < list.length -1"></view>
				</view>
				<view class="flex-1">
					<view class="margin-b20 font-size28">
						{{item.doctor_time}}
					</view>
					<view class="record-item margin-b20">
						<view class="flex align-center padding-b20 border-bottom margin-b20">
							<image class="touxiang" :src="item.pet_id[0].avatar" mode=""></image>
							<view class="font-size28">
								<text>{{item.pet_id[0].name}}</text>
								<text v-if="item.pet_id[0].state === 1" style="color: red;">（已删除）</text>
							</view>
						</view>
						<view class="margin-b20 font-size28 ">
							<text class="color-8C8888">医院名称：</text>
							<text>{{ item.hospital }}</text>
						</view>
						<view class="margin-b20 font-size28 ">
							<text class="color-8C8888">生病症状：</text>
							<text>{{ item.symptom }}</text>
						</view>

						<view class="margin-b20 font-size28 ">
							<text class="color-8C8888">检查结果：</text>
							<text>{{ item.detection }}</text>
						</view>
						<view class="margin-b20 font-size28 ">
							<text class="color-8C8888">治疗方式：</text>
							<text>{{ item.treatment }}</text>
						</view>

						<view class="margin-b20 font-size28 ">
							<text class="color-8C8888">治疗药品：</text>
							<text>{{ item.medicine }}</text>
						</view>
						<view class="font-size28" v-if="item.remark">
							<text class="color-8C8888">备注：</text>
							<text>{{item.remark}}</text>
						</view>
						<view class="img-box" :class="item.imgs.length>0?'margin-t30':''">
							<image mode="aspectFill" class="imgs " @click="showPic(img,item.imgs)" v-for="(img,index) in item.imgs"
								:key="index" :src="`${img}?x-oss-process=image/resize,p_50`">
							</image>
						</view>
					</view>


				</view>
			</view>

			<!-- <view class="record-item margin-b20" v-for="item in list" :key="item._id">
				<view class="flex align-center padding-b20 border-bottom margin-b20">
					<image class="touxiang" :src="item.pet_id[0].avatar" mode=""></image>
					<view class="font-size34">
						{{ item.pet_id[0].name }}
					</view>
					<view class="marginlauto color-8C8888 font-size24">
						{{ item.doctor_time }}
					</view>
				</view>
				<view class="margin-b10 font-size28">
					<text class="color-8C8888">医院名称：</text>
					<text>{{ item.hospital }}</text>
				</view>
				<view class="margin-b10 font-size28">
					<text class="color-8C8888">生病症状：</text>
					<text>{{ item.symptom }}</text>
				</view>

				<view class="margin-b10 font-size28">
					<text class="color-8C8888">检查结果：</text>
					<text>{{ item.detection }}</text>
				</view>
				<view class="margin-b10 font-size28">
					<text class="color-8C8888">治疗方式：</text>
					<text>{{ item.treatment }}</text>
				</view>

				<view class="margin-b10 font-size28">
					<text class="color-8C8888">治疗药品：</text>
					<text>{{ item.medicine }}</text>
				</view>

				<view class="font-size28">
					<text class="color-8C8888">备注：</text>
					<text>{{ item.remark }}</text>
				</view>
				<view class="img-box">
					<image mode="aspectFill" class="imgs margin-t20" @click="showPic(img,item.imgs)"
						v-for="(img,index) in item.imgs" :key="index" :src="img">
					</image>
				</view>
			</view> -->
		</view>

		<Empty v-if="list.length === 0"></Empty>

		<FixedButton title="新增记录" @trigger="toNextPage('/subHome/add-case/add-case')"></FixedButton>
	</view>
</template>

<script setup>
	import { ref } from 'vue';
	import { onLoad, } from '@dcloudio/uni-app'
	import { toNextPage } from '@/core/app.js'
	import { getCase } from '@/cloud-api/index.js'
	import { showLoading } from '@/core/app';
	import cuNavbar from '@/components/cu-navbar/cu-navbar.vue'
	import FixedButton from '@/components/Fixed-button/index.vue'
	import Empty from '@/components/Empty/index.vue'


	const list = ref([])
	const pageNum = ref(0)

	const init = () => {
		showLoading()
		getCase(pageNum.value, 0).then(res => {
			const arr = res.data.map(val => {
				val.imgs = val.imgs ? val.imgs.split(',') : []
				return val
			})
			list.value = arr
			uni.hideLoading()
		})
	}

	onLoad(() => {
		init()
		uni.$on('addCase', () => {
			init()
		})
	})

	const showPic = (url, imgs) => {
		uni.previewImage({
			indicator: "none",
			current: url,
			urls: imgs
		});
	}
</script>

<style scoped>
	.tabs-box {
		height: 50rpx;
	}

	.tabs {
		display: flex;
		background-color: #EDF5D5;
		position: fixed;
		left: 0;
		right: 0;
		z-index: 999;
	}

	.tab-item {
		width: 50%;
		text-align: center;
		padding-bottom: 16rpx;
		font-size: 14px;
		color: #352926;
		/* line-height: 16px; */
	}

	.record-item {
		background: #FFFFFF;
		border-radius: 24rpx;
		padding: 28rpx;
	}

	.touxiang {
		width: 50rpx;
		height: 50rpx;
		margin-right: 20rpx;
		border-radius: 50%;
	}


	.img-box {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		row-gap: 20rpx;
	}

	.imgs {
		width: 108rpx;
		height: 108rpx;
		border-radius: 10rpx;
	}


	.width50 {
		width: 50%;
	}

	.fenxi {
		width: 134rpx;
		height: 46rpx;
		line-height: 46rpx;
		text-align: center;
		background: #AFC272;
		color: white;
		font-size: 24rpx;
		border-radius: 62rpx;
		margin-left: auto;
	}

	.print {
		width: 30rpx;
		height: 30rpx;
		border-radius: 50%;
		border: 1px solid #7c5e07;
		background-color: #EDF5D5;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-top: 3rpx;
	}

	.s-print {
		width: 10rpx;
		height: 10rpx;
		border-radius: 50%;
		background-color: #7c5e07;
	}

	.line {
		height: 80%;
		border-left: 1px solid #e9e8e2;
		margin-left: 14rpx;
		margin-top: 20rpx;
	}
</style>
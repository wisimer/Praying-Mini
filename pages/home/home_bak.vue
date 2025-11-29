<template>
	<view>
		<view class="pet-model">
			<image src="@/static/imgs/petbg.png" class="pet-model-bg"></image>
			<cuNavbar bgColor="transparent" :fixed="false">
				<template #left>
					<view class="jindutiao">
						<image class="dengji"
							src="https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/jingyanzhi.png" mode="">
						</image>
						<view class="num">
							<view class="best-hollow-text"
								:data-text="`${palyerInfo.empirical || 0}/${palyerInfo.next_empirical || 0}`">
								{{ palyerInfo.empirical || 0 }}/{{ palyerInfo.next_empirical || 0 }}
							</view>
						</view>
					</view>
				</template>
				<template #content>
					<view class="jindutiao">
						<image class="dengji" style="margin-left: 0"
							src="https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/dengji.png" mode="">
						</image>
						<view class="num">
							<view class="best-hollow-text" :data-text="`Lv.${palyerInfo.level || 0}`">
								Lv.{{ palyerInfo.level || 0 }}
							</view>
						</view>
					</view>
				</template>
			</cuNavbar>
			<image class="modal" :src="palyerInfo.pet_modal_id[0].url">
			</image>

			<view class="stats-box flex justify-between">
				<view class="stats-item flex align-center padding-lr10 font-size26" v-for="item in stats" :key="item.id">
					<image class="icon" :src="item.icon"></image>
					<view class="">
						{{ item.name }}
					</view>
					<view class="marginlauto margin-r10">
						{{ item.value }}
					</view>
				</view>
			</view>
		</view>

		<!-- <button @click="toNextPage('/subHome/weight-analysis/weight-analysis')">体重分析</button> -->
		<view class="content">
			<view class="font-size32 font-weight color-352926 margin-b24">日常记录</view>
			<view class="richang margin-b20 flex justify-between align-center" v-for="item in menus" :key="item.id">
				<view class="records flex flex-direction align-center" style="z-index: 9" v-for="sub in item.sublevel"
					:key="sub.id" @click="toNextPage(sub.url)">
					<image class="records-icon margin-b12" :src="sub.icon">
					</image>
					<view class="color-775047 font-size24 font-weight"> {{ sub.name }} </view>
				</view>
				<view class="addbtn" @click="toNextPage(item.url)">
					<image class="addicon font-size28"
						src="https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/addicon.png">
					</image>
					<view class="color-ffffff font-weight margin-l10">{{ item.name }} </view>
				</view>
				<image class="richang_bg" :src="item.baimg"></image>
			</view>
			<view class="font-size32 font-weight color-352926 margin-b24 margin-t30">实用工具</view>
			<view class="flex margin-b24">
				<image class="aibox" src="@/static/imgs/ai.png" @click="toNextPage('/subHome/ai-helper/ai-helper')">
				</image>
				<view class="flex flex-direction justify-between">
					<image class="right-icon" @click="toNextPage('/subHome/case/case')" src="@/static/imgs/binli.png">
					</image>


					<view class="flex justify-between">
						<image class="right-icon-btn" @click="toNextPage('/subHome/weight-analysis/weight-analysis')"
							src="@/static/imgs/tzfx.png">
						</image>
						<image class="right-icon-btn" @click="toNextPage('/subHome/stock-up/stock-up')"
							src="@/static/imgs/thsn.png">
						</image>
					</view>

				</view>
			</view>
			<!-- <view class="yuetiaozhan margin-b24" @click="toChallenge">
				<image class="is-join" v-if="isJoinChallenge"
					src="https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/isJoin.png" mode="">
				</image>
				<view class="shanghai font-size24 color-BAA58F" v-if="isJoinChallenge">
					已造成伤害: {{ isJoinChallenge.damage }}
				</view>
				<view class="shanghai font-size24 color-BAA58F" v-else>
					未加入挑战
				</view>
			</view> -->

			<image class="mrqd" @click="toNextPage(`/subHome/day-signin/day-signin?can=${palyerInfo.can}`)"
				src="https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/mrqd.png" mode="">
			</image>
		</view>


	</view>
</template>

<script setup>
	import { onLoad } from '@dcloudio/uni-app'
	import { reactive, ref } from 'vue'
	import { showLoading, showModal, showToast, toNextPage } from '@/core/app.js'
	import { addPetModel, updetePetModel, getChallenge, getPageHomeLogin } from '@/cloud-api/player.js'
	import cuNavbar from '@/components/cu-navbar/cu-navbar.vue'


	const stats = reactive([{
		id: 1,
		icon: '../../static/imgs/liliang.png',
		name: '力量',
		value: 10
	}, {
		id: 2,
		icon: '../../static/imgs/zhihui.png',
		name: '智慧',
		value: 0
	}, {
		id: 3,
		icon: '../../static/imgs/minjie.png',
		name: '敏捷',
		value: 0
	}])

	const menus = ref([{
		id: 1,
		baimg: '../../static/imgs/richang.png',
		name: '记日常',
		url: '/subHome/add-record/add-record',
		sublevel: [{
			id: '1-1',
			icon: '../../static/imgs/rcmx.png',
			name: '日常明细',
			url: '/subHome/records-detail/records-detail'
		}, {
			id: '1-2',
			icon: '../../static/imgs/ystx.png',
			name: '要事提醒',
			url: '/subHome/remind/remind'
		}]
	}, {
		id: 2,
		baimg: '../../static/imgs/huaxiao.png',
		name: '记花销',
		url: '/subHome/add-expense/add-expense',
		sublevel: [{
			id: '2-1',
			icon: '../../static/imgs/hxmx.png',
			name: '花销明细',
			url: '/subHome/expense-detail/expense-detail'
		}, {
			id: '2-2',
			icon: '../../static/imgs/zdtj.png',
			name: '账单统计',
			url: '/subHome/expense-statistics/expense-statistics'
		}]
	}])

	const palyerInfo = ref({
		empirical: 0,
		next_empirical: 0,
		level: 0,
		can: 0,
		pet_modal_id: [{
			url: 'https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/petModal/modal1.png'
		}]
	})

	const modelList = ref([])
	const challenge = ref({})
	const isJoinChallenge = ref(null)

	const toChallenge = () => {
		const url =
			`/subHome/challenge/challenge?monthChallenge=${JSON.stringify(challenge.value)}&isJoinChallenge=${isJoinChallenge.value ? JSON.stringify(isJoinChallenge.value) : -1}`
		toNextPage(url)
	}

	const setPalyer = (data) => {
		stats[0].value = data.strength
		stats[1].value = data.wisdom
		stats[2].value = data.agility
	}

	const initData = () => {
		getPageHomeLogin().then(res => {
			if (res[0].data) {
				palyerInfo.value = res[0].data
				setPalyer(palyerInfo.value)
				isJoinChallenge.value = res[1].data
			}
		}).finally(() => {
			uni.hideLoading()
		})
	}

	onLoad(() => {
		showLoading()
		initData()
		getChallenge().then(res => {
			challenge.value = res.data
		})
		uni.$on('saveRecord', () => {
			initData()
		})
		uni.$on('addChallenge', () => {
			isJoinChallenge.value = {
				damage: 0
			}
		})
		uni.$on('changeSkin', (url) => {
			palyerInfo.value.pet_modal_id[0].url = url
		})
	})

	// uni.getLocation({
	// 	type: 'wgs84',
	// 	success: function(res) {
	// 		console.log('当前位置的经度：' + res.longitude);
	// 		console.log('当前位置的纬度：' + res.latitude);
	// 	}
	// })
</script>

<style scoped>
	.color-BAA58F {
		color: #baa58f;
	}

	.pet-model {
		width: 750rpx;
		height: 752rpx;
		/* background-image: url('https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/petbg.png'); */
		/* background-size: 100% 100%; */
		position: relative;
	}

	.pet-model-bg {
		width: 100%;
		height: 100%;
		position: absolute;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
	}

	.modal {
		width: 270rpx;
		height: 364rpx;
		position: absolute;
		left: 240rpx;
		top: 258rpx;
	}

	.model-box {
		/* height: 50vh; */
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		padding: 20rpx 32rpx;
		gap: 32rpx;
	}

	.model-item {
		display: flex;
		justify-content: center;
		padding: 38rpx 0 24rpx 0;
		background-color: #fbf9fa;
		border-radius: 10rpx;
		position: relative;
	}

	.ishave {
		position: absolute;
		right: 0;
		top: 0;
		height: 34rpx;
		background: #f5f8eb;
		border-bottom-left-radius: 24rpx;
		font-size: 20rpx;
		color: #afc272;
		line-height: 34rpx;
		text-align: center;
		padding: 0 20rpx;
	}

	.gray {
		background-color: #f3f3f3 !important;
		color: #bfbfbf !important;
	}

	.c-modal {
		width: 135rpx;
		height: 182rpx;
	}

	.stats-box {
		position: absolute;
		left: 48rpx;
		right: 48rpx;
		bottom: 20rpx;
	}

	.stats-item {
		width: 192rpx;
		height: 74rpx;
		background: #ffffff;
		border-radius: 24rpx;
		font-weight: bold;
	}

	.icon {
		width: 40rpx;
		height: 40rpx;
		margin-right: 5rpx;
	}

	.content {
		padding: 40rpx 30rpx;
	}

	.richang {
		width: 690rpx;
		height: 148rpx;
		background-size: 100% 100%;
		padding-left: 160rpx;
		padding-right: 24rpx;
		position: relative;
	}

	.richang_bg {
		position: absolute;
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
	}

	.records-icon {
		width: 72rpx;
		height: 72rpx;
	}

	.addbtn {
		width: 168rpx;
		height: 78rpx;
		background: #fb927a;
		border-radius: 62rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9;
	}

	.addicon {
		width: 20rpx;
		height: 20rpx;
	}

	.aibox {
		width: 334rpx;
		height: 322rpx;
		margin-right: 22rpx;
	}

	.right-icon {
		width: 334rpx;
		height: 152rpx;
	}

	.right-icon-btn {
		width: 160rpx;
		height: 152rpx;
	}

	.yuetiaozhan {
		width: 100%;
		height: 156rpx;
		position: relative;
		background-image: url('https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/yuetiaozhan.png');
		background-size: 100% 100%;
		display: flex;
		align-items: center;
	}

	.mrqd {
		width: 100%;
		height: 156rpx;
	}

	.is-join {
		position: absolute;
		top: 0;
		right: 0;
		width: 76rpx;
		height: 74rpx;
		z-index: 99;
	}

	.shanghai {
		padding: 0 16rpx;
		height: 48rpx;
		line-height: 46rpx;
		background: #fdfad7;
		border-radius: 56rpx;
		border: 1px solid #775047;
		margin-top: 60rpx;
		margin-left: 30rpx;
	}

	.jindutiao {
		/* width: 180rpx; */
		/* height: 40rpx; */
		/* background: #FDFAD7; */
		/* border-radius: 56rpx; */
		/* border: 6rpx solid #775047; */
		box-sizing: border-box;
		/* margin-left: 44rpx; */
		/* position: relative; */
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.jdt {
		width: 28rpx;
		height: 44rpx;
		margin-right: 14rpx;
		margin-left: 44rpx;
	}

	.dengji {
		width: 44rpx;
		height: 44rpx;
		margin-right: 14rpx;
		margin-left: 44rpx;
		/* position: absolute; */
		/* top: -9rpx; */
		/* left: -6rpx; */
	}

	.best-hollow-text {
		position: relative;
		font-size: 32rpx;
		font-weight: bold;
	}

	.best-hollow-text::before,
	.best-hollow-text::after {
		content: attr(data-text);
		position: absolute;
		top: 0;
		left: 0;
	}

	.best-hollow-text::before {
		-webkit-text-stroke: 2px #775047;
		color: transparent;
	}

	.best-hollow-text::after {
		color: white;
		-webkit-text-stroke: 0;
	}

	/* .levelModal {
		width: 696rpx;
		height: 562rpx;
		background-image: url('https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/shengjibg.png');
		background-size: 100% 100%;
		box-sizing: border-box;
	} */

	.shengjimodal {
		width: 236rpx;
		height: 192rpx;
		background-image: url('https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/shengjimodal.png');
		background-size: 100% 100%;
		margin-bottom: 50rpx;
	}

	.shengjilv {
		width: 332rpx;
		height: 56rpx;
		background-image: url('https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/shengjilv.png');
		background-size: 100% 100%;
		box-sizing: border-box;
		padding: 0 70rpx;
	}

	.xiangyou {
		width: 11px;
		height: 16rpx;
	}
</style>
<template>
	<view>

		<cuNavbar>
			<template #content>
				<view class="font-size36 color-352926 font-weight">
					<text>体重分析</text>
				</view>
			</template>
		</cuNavbar>

		<view class="padding32" v-if="show">
			<view class="font-size32 color-352926 padding-lr10 margin-b20">萌宠信息</view>
			<view class="c-card margin-b32">
				<view class="margin-b20 flex align-center  padding-b20 border-bottom margin-b20">
					<image class="touxiang" :src="petItem.avatar"></image>
					<view class="margin-l10">
						<view class="font-size30 margin-b10">{{petItem.name}}</view>
						<view class="font-size26 color-8C8888">{{weightObj.statusName}}</view>
					</view>
					<picker style="margin-left: auto;" mode="selector" :range="petList" range-key="name" @change="petChange">
						<view class="flex align-center chosePet">
							<text>切换宠物</text>
						</view>
					</picker>

				</view>
				<view class="flex justify-between">
					<view class="font-size24">
						<text class="color-8C8888">当前体重:</text>
						<text>{{petItem.weight}}kg</text>
					</view>
					<view class="font-size24">
						<text class="color-8C8888">最佳体重区间:</text>
						<text>{{weightList[0]}}kg-{{weightList[1]}}kg</text>
					</view>

				</view>
			</view>

			<view class="font-size32 color-352926 padding-lr10 margin-b20 flex justify-between">
				<text>体重曲线图</text>
				<text class="font-size28 color-8C8888">单位:kg</text>
			</view>
			<view class="card">
				<lineCharts style="margin-top: auto;" :chartData="chartData"></lineCharts>
			</view>


			<view class="" v-if="weightObj.dataAnalysis">
				<view class="font-size32 color-352926 padding-lr10 margin-b20">温馨提示</view>
				<view class="c-card">
					<view class="margin-b10">
						数据分析：
					</view>
					<view class="margin-b10  lineHeight" :style="`color:${colorState}`">
						{{weightObj.dataAnalysis}}
					</view>
					<view class="margin-b10">
						健康评估：
					</view>
					<view class="margin-b10 lineHeight">
						{{weightObj.healthAssessment}}
					</view>
					<view class="margin-b10">
						喂养建议：
					</view>
					<view class="lineHeight" v-for="(item,index) in weightObj.careRecommendations">
						<view class="print" :style="`background-color:${colorState}`"></view>
						{{item}}
					</view>
				</view>
			</view>

		</view>

		<Empty v-else title="暂无宠物"></Empty>
	</view>
</template>

<script setup>
	import cuNavbar from '@/components/cu-navbar/cu-navbar.vue'
	import { onLoad } from '@dcloudio/uni-app'
	import { ref, computed } from 'vue'
	import { showLoading } from '@/core/app.js'
	import lineCharts from '../line-charts/line-charts.vue'
	import { getPetList, } from '@/cloud-api/index.js'
	import { getPetWeightList } from '@/cloud-api/record.js'
	import Empty from '@/components/Empty/index.vue'

	function determineWeightStatus(actualWeight, idealMin, idealMax) {
		const idealMedian = (idealMin + idealMax) / 2;
		const percentageOfMedian = (actualWeight / idealMedian) * 100;

		// 调整判断逻辑，考虑理想范围
		const lowerBound = (idealMin / idealMedian) * 100; // 约82.35%
		const upperBound = (idealMax / idealMedian) * 100; // 约117.65%

		if (percentageOfMedian < 80) {
			return { status: "严重消瘦", key: 'severely_underweight' };
		} else if (percentageOfMedian < lowerBound) {
			return { status: "偏瘦", key: 'underweight' };
		} else if (percentageOfMedian >= lowerBound && percentageOfMedian <= upperBound) {
			return { status: "理想", key: 'ideal' };
		} else if (percentageOfMedian <= upperBound * 1.15) {
			return { status: "超重", key: 'overweight' };
		} else {
			return { status: "肥胖", key: 'obese' };
		}
	}

	const weightAnalysisTemplates = {
		severely_underweight: {
			statusName: "严重消瘦",
			dataAnalysis: "您爱犬的体重远低于该品种健康标准的下限，仅相当于理想体重的80%以下。这种程度的体重不足通常意味着严重的能量负平衡，可能已影响到基础生理功能。",
			healthAssessment: "紧急关注！这不仅是偏瘦，而是一种医疗状况。可能存在营养不良、消化吸收障碍、牙齿疾病导致无法进食，或其他消耗性疾病。身体无法储备必要的营养和能量，会导致器官功能受损、免疫力急剧下降，需立即医疗干预。",
			careRecommendations: [
				"立即就医：这不是通过简单增加喂食能解决的。必须尽快前往动物医院进行全面检查，查明根本原因。",
				"医疗级营养支持：在兽医指导下，可能需要喂食高能量、易消化的处方罐头、营养膏或甚至通过输液提供营养。",
				"温和护理：保证温暖、舒适、安静的休息环境，避免任何剧烈活动。少食多餐，提供优质、适口性好的食物。"
			]
		},
		underweight: {
			statusName: "偏瘦",
			dataAnalysis: "您爱犬的体重低于该品种的理想健康范围，大约在理想体重的80%-95%之间。虽然不像严重消瘦那样危急，但仍未达到最佳健康状态。",
			healthAssessment: "需要改善。肋骨可能易于触摸到且脂肪层很薄，肌肉量可能不足。偏瘦的体质意味着营养储备不足，在应对压力、疾病或寒冷天气时抵抗力会较弱。",
			careRecommendations: [
				"兽医咨询：建议进行一次体检，排除寄生虫或其他潜在健康问题。",
				"增加营养摄入：循序渐进地增加每日食量。可以考虑换成营养更丰富、蛋白质和脂肪含量更高的幼犬粮或运动犬粮。",
				"少食多餐：将每日的食物分成3-4顿喂食，减轻肠胃负担，提高吸收效率。",
				"监测体重：每周称重，目标是体重稳步、缓慢地增长，直到进入理想范围。"
			]
		},
		ideal: {
			statusName: "理想",
			dataAnalysis: "恭喜！您爱犬的体重完美地落在该品种的健康标准范围内（理想体重的95%-105%）。这是维持长期健康和长寿的最佳状态。",
			healthAssessment: "非常健康！体型匀称，肋骨容易摸到但不可见，从上方看有明显的腰线，从侧面看腹部自然上收。这个体重可以最大程度地降低关节负担、心脏压力和代谢疾病的风险。",
			careRecommendations: [
				"保持现状：继续坚持您当前科学的喂养和运动习惯。一致性是关键。",
				"定期监测：建议每月进行一次体重监测，确保体重稳定。任何持续性的上升或下降趋势都值得关注。",
				"均衡饮食与运动：继续提供优质犬粮，并保证每日适度的运动量。避免喂食过多零食。"
			]
		},
		overweight: {
			statusName: "超重",
			dataAnalysis: "您爱犬的体重已超出健康标准的上限，约为理想体重的105%-115%。它可能已经积累了过多的体脂，但尚未达到病态肥胖的程度。",
			healthAssessment: "需要警惕。肋骨需要用力才能摸到，腰线模糊，腹部脂肪开始堆积。超重会持续增加关节、心脏和呼吸系统的负担，是发展为肥胖和糖尿病的前期阶段。",
			careRecommendations: [
				"控制饮食：立即开始减少约10%的日常食量，或更换为“体重管理”或“低脂”配方的犬粮。彻底杜绝餐桌食物和高热量零食。",
				"增加运动：每天保证至少30分钟的低强度运动，如散步、游泳，以消耗多余热量。",
				"制定计划：设定一个目标体重（如回到理想范围上限），并每周跟踪进展。体重下降应缓慢而稳定（每周减重1-2%）。",
				"咨询兽医：制定减肥计划前最好咨询兽医，以获得更专业的建议。"
			]
		},
		obese: {
			statusName: "肥胖",
			dataAnalysis: "警告！您爱犬的体重严重超标，超过理想体重的115%。它的身体已被过多的脂肪组织所负担。",
			healthAssessment: "高危状态！肥胖是一种疾病。肋骨完全摸不到，被厚脂肪覆盖，没有腰线，腹部下垂。这会极大缩短寿命，并极高概率地导致关节疾病、心脏病、呼吸窘迫、糖尿病、高血压和某些癌症，严重影响生活质量。",
			careRecommendations: [
				"立即就医：必须首先寻求兽医帮助。进行体检，排除因内分泌失调导致的肥胖，并在医生指导下制定安全的减肥方案。",
				"处方减肥粮：通常需要使用专门的兽医处方减肥粮。这种粮高纤维、低脂肪、低热量，既能保证饱腹感又能控制热量摄入。严禁自行极端节食。",
				"严格控制与运动：用厨房秤精确测量每日食物。从短距离、温和的散步开始，逐步增加运动量，避免给关节造成突然的冲击。",
				"长期管理：减肥是一个漫长的过程，需要极大的耐心。目标是每周减重1-2%。成功后需永久性地改变喂养习惯，防止反弹。"
			]
		}
	}


	const petList = ref([])
	const petItem = ref({})
	const weightList = ref([])
	const weightObj = ref({})
	const show = ref(false)
	const chartData = ref({
		categories: [],
		series: [{
			name: "体重",
			data: [],
			textSize: 12
		}]
	})

	const colorState = computed(() => {
		if (weightObj.value.statusName === '理想') {
			return '#12C17D';
		} else if (weightObj.value.statusName === '偏瘦' || weightObj.value.statusName === '超重') {
			return '#fb927a';
		} else {
			return '#FF4C2C';
		}
	})

	const init = () => {
		getPetWeightList(petItem.value._id, petItem.value.breed).then(res => {
			const categories = []
			const seriesData = []
			res[0].data.map(ele => {
				categories.push(ele.record_date.replaceAll('-', '/').slice(5))
				seriesData.push(ele.weight)
			})
			chartData.value.categories = categories
			chartData.value.series[0].data = seriesData


			weightList.value = res[1].data[0].weight_interval

			const key = determineWeightStatus(petItem.value.weight, weightList.value[0], weightList.value[1]).key
			weightObj.value = weightAnalysisTemplates[key]
			console.log(weightObj.value)
		})

	}

	const petChange = (e) => {
		petItem.value = petList.value[e.detail.value]
		init()
	}

	onLoad(() => {
		showLoading()
		getPetList().then(res => {
			petList.value = res.data
			show.value = petList.value.length > 0
			const pet = res.data.find(ele => ele.is_default === 0)
			petItem.value = pet
			if (show.value) {
				init()
			}
		}).finally(() => {
			uni.hideLoading()
		})
	})
</script>

<style scoped>
	.hread {
		background-color: rgb(237, 245, 213);
		border-bottom-right-radius: 300rpx;
	}

	.touxiang {
		width: 76rpx;
		height: 76rpx;
		border-radius: 50%;
		margin-right: 12rpx;
	}

	.card {
		height: 554rpx;
		border-radius: 24rpx;
		background-image: url('https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/tongji.png');
		background-size: 100% 100%;
		margin-bottom: 32rpx;
	}

	.chosePet {
		background-color: #fb927a;
		color: white;
		font-size: 26rpx;
		border-radius: 50rpx;
		padding: 12rpx 24rpx;
	}

	.lineHeight {
		padding-left: 25rpx;
		position: relative;
		font-size: 26rpx;
	}

	.print {
		width: 15rpx;
		height: 15rpx;
		border-radius: 50%;
		position: absolute;
		left: 0;
		top: 10rpx;
	}
</style>
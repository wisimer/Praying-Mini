<template>
	<qiun-data-charts type="ring" :opts="opts" :chartData="chartData" :canvas2d="true" />
</template>

<script setup>
	import { ref, computed } from "vue";
	import qiunDataCharts from "@/subHome/qiun-data-charts/qiun-data-charts.vue";

	const props = defineProps({
		chartData: {
			type: Object,
			default: {}
		},
		totalMoney: {
			type: Number,
			default: 0
		}
	})

	const opts = computed(() => {

		let num = 0
		if (props.chartData.series) {
			props.chartData.series[0].data.map(res => {
				num += res.value
			})
		}
		return {
			rotate: false,
			rotateLock: false,
			color: ["#1890FF", '#FFB13D'],
			padding: [20, 20, 0, 20],
			dataLabel: true,
			enableScroll: false,
			legend: {
				show: true,
				position: "bottom",
				lineHeight: 25
			},
			title: {
				name: "总花销",
				fontSize: 12,
				color: "#666666"
			},
			subtitle: {
				name: props.totalMoney + '元',
				fontSize: 15,
				color: "#7cb5ec"
			},
			extra: {
				ring: {
					ringWidth: 10,
					activeOpacity: 0.5,
					activeRadius: 0,
					offsetAngle: 20,
					customRadius: 65
				}
			}
		}
	})
</script>

<style>
</style>
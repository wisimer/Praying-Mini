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
	})

	const opts = computed(() => {

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
				lineHeight: 25,
				bottom: 0
			},
			title: {
				name: "",
				fontSize: 12,
				color: "#666666"
			},
			subtitle: {
				name: '',
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
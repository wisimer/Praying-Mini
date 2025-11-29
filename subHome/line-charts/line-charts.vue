<template>
	<qiun-data-charts type="line" :opts="opts" :chartData="chartData" />
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
			color: ["#FAC858"],
			padding: [40, 15, 15, 10],
			enableScroll: false,
			dataLabel: true,
			enableScroll: false,
			legend: {
				show: false,
			},
			xAxis: {
				disableGrid: true,
				fontSize: 12,
				labelCount: 5,
			},
			yAxis: {
				gridType: "dash",
				dashLength: 2,
				disableGrid: true,
				data: [{
					fontSize: 12
				}]
			},
			extra: {
				tooltip: {
					show: true,
				},
				line: {
					type: "curve",
					width: 1,
				}
			}
		}
	})
</script>

<style scoped>

</style>
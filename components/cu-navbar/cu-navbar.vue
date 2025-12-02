<template>
	<view>
		<view class="cu-custom" :style="[{height: isPlaceholder ? CustomBar + 'px' : '0'}]">
			<view class="cu-bar" :class="fixed ? 'fixed' : ''" :style="style+`background-color:${bgColor}`">
				<slot name="left">
					<view class="action">
						<image src="@/static/icon/back.png" class="back" @tap="BackPage"></image>
						<slot name="backText"></slot>
					</view>
				</slot>
				<view class="content" :style="[{top:StatusBar + 'px'}]">
					<slot name="content">
					</slot>
				</view>
				<slot name="right"></slot>
			</view>
		</view>
	</view>

</template>

<script setup>
	import { ref, computed } from 'vue'
	import { onPageScroll } from '@dcloudio/uni-app'

	const props = defineProps({
		bgColor: {
			type: String,
			default: '#EDF5D5'
		},
		fixed: {
			type: Boolean,
			default: true
		},
    isPlaceholder: {
      type: Boolean,
      default: true
    }
	})

	const StatusBar = ref(0)
	const CustomBar = ref(0)

	uni.getSystemInfo({
		success: function(e) {
			// #ifdef H5
			StatusBar.value = e.statusBarHeight;
			CustomBar.value = 64;
			// #endif

			// #ifdef MP-WEIXIN
			StatusBar.value = e.statusBarHeight;
			let custom = wx.getMenuButtonBoundingClientRect();
			CustomBar.value = custom.bottom + custom.top - e.statusBarHeight + 4;
			// #endif		
		}
	});

	const style = computed(() => {
		var style = `height:${CustomBar.value}px;padding-top:${StatusBar.value}px;`;
		return style
	})

	const BackPage = () => {
		uni.navigateBack({
			delta: 1
		});
	}
</script>

<style lang="scss" scoped>
	.back {
		width: 54rpx;
		height: 54rpx;
	}
</style>
<template>
	<view class="fixed_bnt">
		<view class="bnt_box">
			<slot>
				<view class="text-align font-size32 l_height" @click="emit">
					<image class="addicon"
						src="https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/addicon.png"></image>
					<view class="">
						{{title}}
					</view>
				</view>
			</slot>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			title: {
				type: String,
				default: ''
			}
		},
		methods: {
			emit() {
				this.$emit('trigger')
			}
		}
	}
</script>

<style lang="scss" scoped>
	.fixed_bnt {
		height: 150rpx;

	}

	.bnt_box {
		position: fixed;
		bottom: 0;
		width: 100%;
		padding: 20rpx;
		z-index: 9;
		background-color: white;
	}

	.l_height {
		height: 96rpx;
		border-radius: 50rpx;
		color: white;
		background-color: #AFC272;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.addicon {
		width: 26rpx;
		height: 26rpx;
		margin-right: 10px;
	}
</style>
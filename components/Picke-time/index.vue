<template>
	<view class="backSel-model">
		<view class="picker-bottom">
			<view class="flex">
				<view class="btn-picker" style="color: #999" @click="close">取消</view>
				<view class="btn-picker confirm" @click="chooseTime">确认</view>
			</view>
			<picker-view @change="pickerChange" :value="[startH,0]" style="height: 80%;width: 100%;">
				<picker-view-column>
					<view class="item-picker" v-for="(item,index) in hours" :key="index">{{item}}时</view>
				</picker-view-column>
				<picker-view-column>
					<view class="item-picker" v-for="(item2,index) in minutes" :key="index">{{item2}}分</view>
				</picker-view-column>
			</picker-view>
		</view>
	</view>
</template>


<script>
	export default {
		name: "pickerTime",
		props: {
			step: { //分钟间隔
				type: Number,
				value: 10
			},
			startH: { //可选择的开始时间（小时）
				type: Number,
				value: 7
			},
			lateH: { //可选择的结束时间（小时）
				type: Number,
				value: 21
			}
		},
		data() {
			return {
				hours: [], // 存储小时的数据
				minutes: [],
				selectedHour: '', //选中时
				selectedMinute: '00' //选中分
			};
		},
		created() {
			//小时数组，从开始时间开始，到结束时间截止
			for (let i = this.startH; i < this.lateH; i++) {
				this.hours.push(i.toString().padStart(2, "0"));
			}
			//分钟数组，时间间隔，padStart()用于头部补全，第一个参数用来指定字符串的最小长度，第二个参数是用来补全字符串
			for (let i = 0; i < 60; i += this.step) {
				this.minutes.push(i.toString().padStart(2, "0"));
			}
		},
		methods: {
			pickerChange(e) {
				// 当用户选择时间时触发该方法
				const val = e.detail.value;
				this.selectedHour = this.hours[val[0]];
				this.selectedMinute = this.minutes[val[1]];
			},
			//确认按钮
			chooseTime() {
				//判断是否是进入change方法，没有进入时初始值若格式单一，将格式统一
				if (!this.selectedHour) {
					this.selectedHour = this.startH < 10 ? '0' + this.startH : this.startH
				}
				this.$emit('chooseTime', {
					time: this.selectedHour + ':' + this.selectedMinute
				})
			},
			//取消按钮
			close() {
				this.$emit('close')
			}
		}
	}
</script>

<style scoped>
	.flex {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.btn-picker {
		line-height: 60rpx;
		width: 100rpx;
		height: 60rpx;
	}

	.confirm {
		color: #00B642;
		font-weight: bold;
	}

	.backSel-model {
		position: fixed;
		top: 0;
		right: 0;
		left: 0;
		bottom: 0;
		z-index: 100;
		background: rgba(0, 0, 0, .55);
	}

	.picker-bottom {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 500rpx;
		background: #fff;
		padding: 20rpx;
	}

	.item-picker {
		line-height: 70rpx;
		text-align: center;
	}
</style>
<template>
	<view>
		<cuNavbar>
			<template #content>
				<view class="font-size36 color-352926 font-weight">{{title}}</view>
			</template>
		</cuNavbar>
		<view class="padding30">
			<view class="c-card margin-b24" style="position: relative;" v-for="(item,index) in list" :key="item._id">
				<view class="def-pet" :style="getTypeColor(item.state)"> {{getType(item.state)}} </view>
				<view class="flex justify-between margin-b20">
					<view class="flex align-center">
						<image src="/static/icon/wuping.png" style="width: 38rpx;height: 38rpx;"></image>
						<view class="margin-l16 font-size30">
							{{item.name}}
						</view>
					</view>
				</view>
				<view class="info margin-b20">
					<view class="desc font-size26">
						<view class="color-8C8888">购买金额：</view>
						<view class="color-352926">{{item.price ? item.price+'元':'暂无数据'}}</view>
					</view>
					<view class="desc font-size26 ">
						<view class="color-8C8888">保质期：</view>
						<view class="color-352926"> {{item.shelf_day ? item.shelf_day+'天':'暂无数据'}}</view>
					</view>
					<view class="desc font-size26 margin-t20" style="width: 100%;">
						<view class="color-8C8888">生产日期：</view>
						<view class="color-352926">{{item.production_date ? item.production_date:'暂无数据'}}</view>
					</view>
					<view class="desc font-size26 margin-t20" style="width: 100%;">
						<view class="color-8C8888">购买日期：</view>
						<view class="color-352926">{{item.buy_date ? item.buy_date:'暂无数据'}}</view>
					</view>
					<view class="desc font-size26 margin-t20" style="width: 100%;">
						<view class="color-8C8888">过期时间：</view>
						<view class="color-352926">{{item.expired_date}}</view>
					</view>
					<view class="desc font-size26 margin-t20" style="width: 100%;" v-if="item.remark">
						<view class="color-8C8888">备注：</view>
						<view class="color-352926">{{item.remark}}</view>
					</view>
					<view class="img-box" v-if="item.img">
						<image mode="aspectFill" @click="showPic(item.img,itemImg)" class="imgs" v-for="(itemImg,index) in item.img"
							:key="index" :src="`${itemImg}?x-oss-process=image/resize,p_50`">
						</image>
					</view>
				</view>
				<view class="flex align-center">
					<view class="font-size28 color-352926">
						<text class="color-8C8888">剩余:</text>
						<text>{{item.num}}{{item.unit}}</text>
					</view>
					<view class="flex align-center marginlauto" @click="updete(item)" v-if="item.state !== 4">
						<image class="action margin-r10"
							src="https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/bianjipet.png">
						</image>
						<text class="font-size24 color-8C8888">库存更新</text>
					</view>
					<view class="flex align-center margin-l20" @click="remove(item,index)">
						<image class="action margin-r10"
							src="https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/shanchu.png">
						</image>
						<text class="font-size24 color-8C8888">删除</text>
					</view>
				</view>
			</view>
			<Empty v-if="list.length === 0"></Empty>
		</view>

		<uni-popup ref="popup" type="bottom" border-radius="10px 10px 0 0" background-color="#ffffff" safe-area>
			<view style="padding: 40rpx;">
				<view class="flex align-start margin-b30">
					<view class="action-box">
						<view class="action-item font-size30" v-for="(item,index) in actionList" :key="item"
							:class="actionIndex === index ? 'action-item-a':''" @click="actionClick(index)">{{item}}</view>
					</view>
					<view class="marginlauto font-size28">
						<text class="color-8C8888">当前库存：</text>{{stockItem.num}} > {{afterNum}}
					</view>
				</view>
				<view class="flex align-center justify-between margin-b30">
					<view class="font-size30">数量</view>
					<view class="flex align-center" :style="actionIndex === 2 ? 'opacity: 0.5;' : ''">
						<view class="jiajian flex align-center justify-center" @click="changeNum(0)">
							<image src="@/static/icon/jian.png" style="width: 32rpx;height: 32rpx;"></image>
						</view>
						<view class="margin-lr20">{{actionNum}}</view>
						<view class="jiajian flex align-center justify-center" @click="changeNum(1)">
							<image src="@/static/icon/jia.png" style="width: 32rpx;height: 32rpx;"></image>
						</view>
					</view>
				</view>
				<view class="flex justify-between margin-b30">
					<view class="font-size30">备注</view>
					<input v-model="actionRemark" class="flex-1 marginlauto font-size30" type="text" placeholder="请输入"
						style="text-align: right;" />
				</view>
				<view class="action-submit" @click="submit">
					确定
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script setup>
	import { ref, computed } from 'vue';
	import { onLoad } from '@dcloudio/uni-app'
	import { getThingAll, setStockAction, removeStock } from '@/cloud-api/index.js'
	import { showLoading, showModal, showToast } from '@/core/app';
	import Empty from '@/components/Empty/index.vue'


	import cuNavbar from '@/components/cu-navbar/cu-navbar.vue'

	const title = ref('全部物品')
	const list = ref([])
	const stockItem = ref({})
	const popup = ref(null)
	const actionList = ['出库', '入库', '丢弃']
	const actionIndex = ref(0)
	const actionNum = ref(1)
	const actionRemark = ref('')

	onLoad(({ state }) => {
		switch (Number(state)) {
			case 0:
				title.value = '未过期';
				break;
			case 1:
				title.value = '已过期';
				break;
			case 2:
				title.value = '已临期';
				break;
			case 3:
				title.value = '已用完';
				break;
			case 4:
				title.value = '已丢弃';
				break;
		}

		showLoading()
		getThingAll(Number(state)).then(res => {
			list.value = res.data.map(val => {
				if (val.img) {
					val.img = val.img ? val.img.split(',') : []
				}

				return val
			})
		}).finally(() => {
			uni.hideLoading()
		})
	})

	const getType = computed(() => {
		return (state) => {
			switch (state) {
				case 0:
					return '未过期';
					break;
				case 1:
					return '已过期';
					break;
				case 2:
					return '已临期';
					break;
				case 3:
					return '已用完';
					break;
				case 4:
					return '已丢弃';
					break;
			}
		}
	})

	const getTypeColor = computed(() => {
		return (state) => {
			switch (state) {
				case 1:
					return 'background:#FB927A;color:#ffffff';
					break;
				case 2:
					return 'background:#FDDE84;color:#ffffff';
					break;
				case 3:
					return 'background:#FB927A;color:#ffffff';
					break;
				case 4:
					return 'background:#FB927A;color:#ffffff';
					break;
			}
		}
	})

	const afterNum = computed(() => {
		if (actionIndex.value === 1) {
			return Number(stockItem.value.num) + Number(actionNum.value)
		} else {
			return Number(stockItem.value.num) - Number(actionNum.value) > 0 ? Number(stockItem.value.num) - Number(
				actionNum.value) : 0
		}
	})

	const actionClick = (index) => {
		actionIndex.value = index
		if (index === 2) {
			actionNum.value = stockItem.value.num
		} else {
			actionNum.value = 1
		}
	}

	const updete = (item) => {
		stockItem.value = item
		actionRemark.value = ''
		actionNum.value = 1
		actionIndex.value = 0
		popup.value.open()
	}

	const changeNum = (state) => {
		if (actionIndex.value !== 2) {
			if (state == 0) {
				if (actionNum.value > 1) {
					actionNum.value--
				}
			} else {
				if (actionIndex.value === 1) {
					actionNum.value++
				} else {
					if (actionNum.value < stockItem.value.num) {
						actionNum.value++
					}
				}
			}
		}

	}


	const submit = () => {
		if (actionIndex.value !== 1) {
			if (Number(stockItem.value.num) === 0) return showToast('当前库存为空，无法出库或丢弃')
		}
		const reslut = {
			stock_id: stockItem.value._id,
			num: actionNum.value,
			remark: actionRemark.value,
			action: actionIndex.value
		}
		showLoading()
		setStockAction(reslut).then(res => {
			showToast('更新成功')
			popup.value.close()
			const index = list.value.findIndex(ele => ele._id === stockItem.value._id)
			if (actionIndex.value === 1) {
				list.value[index].num = Number(stockItem.value.num) + Number(actionNum.value)
			} else {
				list.value[index].num = Number(stockItem.value.num) - Number(actionNum.value) > 0 ? Number(stockItem.value
					.num) - Number(
					actionNum.value) : 0
			}
			uni.$emit('isAction')
		}).finally(() => {
			uni.hideLoading()
		})
	}


	const showPic = (urls, img) => {
		uni.previewImage({
			indicator: "none",
			current: img,
			urls: urls
		});
	}

	const remove = (item, index) => {
		showModal({ content: '删除不可恢复，是否确认？' }).then(() => {
			showLoading()
			removeStock(item._id).then(res => {
				showToast('已删除')
				list.value.splice(index, 1)
			}).finally(() => {
				uni.hideLoading()
			})
		})
	}
</script>

<style scoped>
	.info {
		padding: 24rpx 20rpx;
		background: #F7F5F6;
		border-radius: 16rpx;
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
	}

	.desc {
		width: 50%;
		display: flex;
		align-items: center;
	}

	.action {
		width: 44rpx;
		height: 44rpx;
	}

	.def-pet {
		position: absolute;
		top: 0;
		right: 0;
		height: 42rpx;
		padding: 0 20rpx;
		line-height: 42rpx;
		background: #F5F8EB;
		border-radius: 0px 0 0px 24rpx;
		text-align: center;
		font-size: 22rpx;
		color: #AFC272;
	}

	.img-box {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		margin-top: 20rpx;
	}

	.imgs {
		width: 108rpx;
		height: 108rpx;
		border-radius: 10rpx;
	}

	.action-box {
		display: flex;
		background-color: #f6f7f2;
		padding: 10rpx;
		border-radius: 5rpx;
	}

	.action-item {
		color: #9fa09b;
		padding: 0 20rpx;
	}

	.action-item-a {
		background-color: white;
		color: #000000;
	}

	.jiajian {
		background-color: #f6f7f2;
		width: 62rpx;
		height: 62rpx;
		border-radius: 5rpx;
	}

	.action-submit {
		height: 66rpx;
		border-radius: 50rpx;
		padding: 0 80rpx;
		color: white;
		background-color: #AFC272;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
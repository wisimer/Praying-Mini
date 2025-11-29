<template>
	<view class="">
		<cuNavbar>
			<template #content>
				<view class="font-size36 color-352926 font-weight">{{_id?'编辑资料':'新增爱宠'}}</view>
			</template>
		</cuNavbar>

		<view class="padding40 flex align-center justify-center">
			<view class="avatar" @click="chooseimg">
				<image class="a-image" :src="petInfo.avatar"></image>
				<image class="paizhao"
					src="https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/paizhao.png"></image>
			</view>
		</view>

		<view class="padding30" style="padding-top: 0">
			<view class="content">
				<view class="flex justify-between margin-b30">
					<view class="c-pet flex align-center" :class="index === petInfo.type ? 'pet-action' : ''"
						v-for="(item, index) in pets" :key="item.id" @click="choosepet(index)">
						<image class="c-img" :src="index === petInfo.type ? item.aicon : item.icon"></image>
						<text>{{ item.name }}</text>
					</view>
				</view>
				<view class="flex align-center justify-between padding-b20 border-bottom margin-b20">
					<view class="font-size28">名称</view>
					<input class="c-input" type="text" placeholder="请输入" v-model="petInfo.name" />
				</view>
				<view class="flex align-center justify-between padding-b20 border-bottom margin-b20">
					<view class="font-size28">性别</view>
					<radio-group class="flex" @change="sexChange">
						<label class="flex align-center margin-r20">
							<radio style="transform: scale(0.7)" color="#AFC272" value="0" :checked="petInfo.sex === 0" />
							<view>妹妹</view>
						</label>
						<label class="flex align-center">
							<radio style="transform: scale(0.7)" color="#AFC272" value="1" :checked="petInfo.sex === 1" />
							<view>弟弟</view>
						</label>
					</radio-group>
				</view>

				<view class="flex align-center padding-b20 border-bottom margin-b20">
					<view class="font-size28">体重</view>
					<input class="c-input marginlauto" type="digit" placeholder="请输入" v-model="petInfo.weight" />
					<view class="margin-l10" style="color: gray">kg</view>
				</view>

				<view class="flex align-center justify-between padding-b20 border-bottom margin-b20">
					<view class="font-size28">品种</view>
					<view @click="changeBreed">
						<view class="flex align-center" v-if="petInfo.breed">
							<text>{{petInfo.breed}}</text> <uni-icons type="right" size="15" color="gray"
								style="margin-left: 10rpx;"></uni-icons>
						</view>
						<view class="flex align-center" v-else>
							<text style="color: gray">请选择</text> <uni-icons type="right" size="15" color="gray"
								style="margin-left: 10rpx;"></uni-icons>
						</view>
					</view>
				</view>

				<view class="flex align-center justify-between padding-b20 border-bottom margin-b20">
					<view class="font-size28">出生日期</view>
					<picker mode="date" @change="birthDateChange">
						<view class="flex align-center" v-if="petInfo.birth_time">
							<text>{{petInfo.birth_time}}</text> <uni-icons type="right" size="15" color="gray"
								style="margin-left: 10rpx;"></uni-icons>
						</view>
						<view class="flex align-center" v-else>
							<text style="color: gray">请选择</text> <uni-icons type="right" size="15" color="gray"
								style="margin-left: 10rpx;"></uni-icons>
						</view>
					</picker>
				</view>
				<view class="flex align-center justify-between padding-b20 border-bottom margin-b20">
					<view class="font-size28">到家日期</view>
					<picker mode="date" @change="homeDateChange">
						<view class="flex align-center" v-if="petInfo.home_time">
							<text>{{petInfo.home_time}}</text> <uni-icons type="right" size="15" color="gray"
								style="margin-left: 10rpx;"></uni-icons>
						</view>
						<view class="flex align-center" v-else>
							<text style="color: gray">请选择</text> <uni-icons type="right" size="15" color="gray"
								style="margin-left: 10rpx;"></uni-icons>
						</view>
					</picker>
				</view>
				<view class="flex align-center justify-between padding-b20 border-bottom margin-b20">
					<view class="font-size28">简介</view>
					<input class="c-input" type="text" placeholder="请输入" v-model="petInfo.desc" />
				</view>

				<view class="flex align-center justify-between padding-b20 border-bottom margin-b20">
					<view class="font-size28">是否绝育</view>
					<radio-group class="flex" @change="neuterChange">
						<label class="flex align-center margin-r20">
							<radio style="transform: scale(0.7)" color="#AFC272" value="0" :checked="petInfo.neuter === 0" />
							<view>是</view>
						</label>
						<label class="flex align-center">
							<radio style="transform: scale(0.7)" color="#AFC272" value="1" :checked="petInfo.neuter === 1" />
							<view>否</view>
						</label>
					</radio-group>
				</view>
				<view class="flex align-center justify-between">
					<view class="font-size28">默认爱宠</view>
					<radio-group class="flex" @change="delChange">
						<label class="flex align-center margin-r20">
							<radio style="transform: scale(0.7)" color="#AFC272" value="0" :checked="petInfo.is_default === 0" />
							<view>是</view>
						</label>
						<label class="flex align-center">
							<radio style="transform: scale(0.7)" color="#AFC272" value="1" :checked="petInfo.is_default === 1" />
							<view>否</view>
						</label>
					</radio-group>
				</view>
			</view>
		</view>
		<FixedButton :title="_id ? '确定修改' : '确定新增'" @trigger="addPetItem"></FixedButton>
	</view>
</template>

<script setup>
	import {
		reactive,
		ref
	} from 'vue'
	import {
		addPet,
		getPetOne,
		updatePet
	} from '@/cloud-api/index.js'
	import {
		onLoad
	} from '@dcloudio/uni-app'
	import {
		BASE_URL_AVATAR
	} from '@/core/config.js'
	import {
		showLoading,
		showToast,
		toNextPage
	} from '@/core/app'
	import FixedButton from '@/components/Fixed-button/index.vue'
	import cuNavbar from '@/components/cu-navbar/cu-navbar.vue'

	const pets = ref([{
		icon: 'https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/gou.png',
		aicon: 'https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/a-gou.png',
		name: '小狗',
		id: 1
	}, {
		icon: 'https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/mao.png',
		aicon: 'https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/a-mao.png',
		name: '猫咪',
		id: 2
	}, {
		icon: 'https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/qita.png',
		aicon: 'https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/a-qita.png',
		name: '其他',
		id: 3
	}])

	const _id = ref('')

	const petInfo = reactive({
		name: '',
		avatar: 'https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/d-avatar.png',
		sex: 0,
		type: 0,
		breed: '',
		neuter: 0,
		weight: '',
		desc: '',
		is_default: 0,
		birth_time: '',
		home_time: '',
		state: 0
	})

	const delChange = (e) => {
		petInfo.is_default = Number(e.detail.value)
	}

	const neuterChange = (e) => {
		petInfo.neuter = Number(e.detail.value)
	}

	const sexChange = (e) => {
		petInfo.sex = Number(e.detail.value)
	}

	const choosepet = (index) => {
		petInfo.type = index
		petInfo.breed = ''
	}

	const birthDateChange = (e) => {
		petInfo.birth_time = e.detail.value
	}

	const homeDateChange = (e) => {
		petInfo.home_time = e.detail.value
	}

	const addPetItem = () => {
		if (!petInfo.name) return showToast('请输入名称')
		if (!petInfo.breed) return showToast('请选择品种')
		if (!petInfo.weight) return showToast('请输入体重')
		if (!petInfo.birth_time) return showToast('请选择出生日期')
		if (!petInfo.home_time) return showToast('请选择到家日期')
		petInfo.weight = Number(petInfo.weight)
		showLoading()
		if (_id.value) {
			updatePet(_id.value, petInfo).then(res => {
				uni.$emit('addpet')
				uni.navigateBack()
			}).finally(() => {
				uni.hideLoading()
			})
		} else {
			addPet(petInfo).then(res => {
				uni.$emit('addpet')
				uni.navigateBack()
			}).finally(() => {
				uni.hideLoading()
			})
		}

	}

	onLoad(({
		pet
	}) => {
		if (pet) {
			_id.value = JSON.parse(pet)._id
			const petItem = JSON.parse(pet)
			for (let key in petItem) {
				if (key !== '_id') {
					petInfo[key] = petItem[key]
				}
			}
		}

		uni.$on('choseBreed', data => {
			petInfo.breed = data
			console.log(petInfo)
		})
	})

	const chooseimg = () => {
		uni.chooseImage({
			count: 1,
			success: async (res) => {
				if (res.tempFilePaths.length > 0) {
					showLoading()
					const filePath = res.tempFilePaths[0]

					const result = await uniCloud.uploadFile({
						filePath: filePath,
						cloudPath: new Date().getTime().toString(),
					});
					uni.hideLoading()
					petInfo.avatar = result.fileID
				}
			}
		});
	}

	const changeBreed = () => {
		toNextPage('/subWode/choose-breed/choose-breed?type=' + petInfo.type)
	}
</script>

<style lang="scss" scoped>
	.avatar {
		position: relative;

		.a-image {
			width: 164rpx;
			height: 164rpx;
			border-radius: 50%;
		}

		.paizhao {
			width: 106rpx;
			height: 106rpx;
			position: absolute;
			bottom: -30rpx;
			right: -20rpx;
		}
	}

	.content {
		background: #ffffff;
		border-radius: 24rpx;
		padding: 40rpx;
	}

	.c-input {
		text-align: right;
		font-size: 28rpx;
	}

	.c-pet {
		height: 92rpx;
		padding: 0 20rpx;
		background: #ebebeb;
		border-radius: 24rpx;
		box-sizing: border-box;

		.c-img {
			width: 80rpx;
			height: 80rpx;
			margin-right: 10rpx;
		}
	}

	.pet-action {
		background: #fff9e8;
		border: 1px solid #775047;
	}
</style>
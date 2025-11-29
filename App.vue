<script>
	import { getUnreadComments } from '@/cloud-api/index.js'
	export default {
		globalData: {
			comments: 0
		},
		onLaunch: function() {
			// const uniIdCo = uniCloud.importObject('uni-id-co', { customUI: true })
			// uni.getPushClientId({
			// 	success: (res) => {
			// 		uniIdCo.setPushCid({
			// 			pushClientId: res.cid
			// 		})
			// 	},
			// 	fail(err) {
			// 		console.log(err)
			// 	}
			// })

			// uni.onPushMessage((res) => {
			// 	uni.$emit('onMessages', res)
			// })

			// #ifdef MP-WEIXIN
			const updateManager = uni.getUpdateManager();

			updateManager.onCheckForUpdate(function(res) {
				if (res.hasUpdate) {
					uni.showLoading({
						title: '小程序更新中'
					})
				}
			});

			updateManager.onUpdateReady(function(res) {
				uni.hideLoading()
				uni.showModal({
					title: '更新提示',
					content: '新版本已经准备好，是否重启应用？',
					success(res) {
						if (res.confirm) {
							updateManager.applyUpdate();
						}
					}
				});

			});

			updateManager.onUpdateFailed(function(res) {
				uni.hideLoading()
				uni.showModal({
					title: '版本更新失败',
					content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
				})
			});
			// #endif
			getUnreadComments().then(res => {
				const total = res.total
				if (total > 0) {
					getApp().globalData.comments = total

					uni.setTabBarBadge({
						index: 2,
						text: total > 99 ? '99+' : `${total}`
					})
				}
			})
		},
	}
</script>

<style lang="scss">
	@import "./static/css/main.css";
</style>
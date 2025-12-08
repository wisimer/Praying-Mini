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
			
			// 获取APP配置，控制Tab显示
			uniCloud.callFunction({
				name: 'get-app-config',
				success: (res) => {
					if (res.result && res.result.enableExtraTabs === false) {
						// 隐藏 任务(index=1)、消息(index=2)、我的(index=3)
						// 注意：隐藏tabBarItem需按照index倒序或者并行执行，这里直接指定index
						
						// #ifdef MP-WEIXIN
						uni.hideTabBar()
						// #endif
						
						// #ifndef MP-WEIXIN
						uni.setTabBarItem({ index: 1, visible: false })
						uni.setTabBarItem({ index: 2, visible: false })
						uni.setTabBarItem({ index: 3, visible: false })
						// #endif
					}
				},
				fail: (err) => {
					console.error('get-app-config failed', err)
				}
			})

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
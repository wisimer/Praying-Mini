/**
 * 显示成功提示框
 */
export const showSuccess = (msg, duration = 1500) => {
	return new Promise((resolve) => {
		uni.showToast({
			title: msg,
			icon: 'success',
			mask: true,
			duration: duration,
			success() {
				resolve(null)
			}
		})
	})

}

/**
 * 显示失败提示框
 */
export const showError = (msg) => {
	return new Promise((resolve) => {
		uni.showModal({
			title: '友情提示',
			content: msg,
			showCancel: false,
			success() {
				resolve(null)
			}
		})
	})
}

/**
 * 显示纯文字提示框
 */
export const showToast = (msg, duration = 2000, mask = true) => {
	return new Promise((resolve) => {
		uni.showToast({
			title: msg, // 提示的内容
			icon: 'none',
			mask, // 是否显示透明蒙层，防止触摸穿透
			duration, // 提示的延迟时间，单位毫秒，默认：1500  
			success() {
				resolve(null)
			}
		})
	})
}

// 加载
export const showLoading = (msg = '加载中', mask = true) => {
	return new Promise((resolve) => {
		uni.showLoading({
			title: msg,
			mask: mask
		})
		resolve(null)
	})
}

// 拨打电话
export const mackPhone = (msg = '联系商家', phone) => {
	return new Promise((resolve) => {
		uni.showModal({
			title: msg,
			content: `是否拨打：${phone}`,
			success: function(res) {
				if (res.confirm) {
					uni.makePhoneCall({
						phoneNumber: phone,
						success: () => {
							resolve(null)
						}
					})
				}
			}
		});
	})
}

export const showModal = (optios) => {
	const { title = '提示', content } = optios
	return new Promise((resolve) => {
		uni.showModal({
			title: title,
			content: content,
			success: function(res) {
				if (res.confirm) {
					resolve()
				}
			}
		})
	})
}

export const toNextPage = (url) => {
	if (!url) return showToast('请输入URL地址')
		
	uni.navigateTo({
		url: url
	})
}

function compressImage(tempFilePath) {
	return new Promise((resolve) => {
		uni.compressImage({
			src: tempFilePath,
			quality: 75,
			success: (compressedRes) => {
				const compressedFilePath = compressedRes.tempFilePath; // 压缩后的路径
				resolve(compressedFilePath); // 上传图片
			},
			fail: (err) => {
				// 如果压缩失败，直接上传原图
				resolve(tempFilePath);
			}
		});
	})

}

export const asyncUploadFile = (count = 9) => {
	return new Promise((resolve) => {
		uni.chooseImage({
			count: count,
			success: async (res) => {
				if (res.tempFilePaths.length > 0) {
					showLoading('上传中')
					try {
						// #ifdef H5
						const uploadPromises = res.tempFilePaths.map((ele, index) => {
							const filePath = ele;
							const cloudPath = `${new Date().getTime()}`;
							return uniCloud.uploadFile({ filePath: filePath, cloudPath: cloudPath });
						});
						// #endif

						// #ifdef MP-WEIXIN
						const uploadPromises = []
						for (const ele of res.tempFilePaths) {
							const cloudPath = `${new Date().getTime()}`;
							const newfile = await compressImage(ele)
							uploadPromises.push(uniCloud.uploadFile({ filePath: newfile, cloudPath: cloudPath }));
						}
						// #endif

						// 等待所有上传完成
						const results = await Promise.all(uploadPromises);
						// 将所有 fileID 返回
						resolve(results)
					} catch (error) {
						console.error('上传失败:', error);
					} finally {
						uni.hideLoading();
					}
				}
			},
			fail: (error) => {
				console.error('选择图片失败:', error);
			}
		});
	})

}
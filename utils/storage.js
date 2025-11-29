export function setStorageSyc(key, data) {
	return new Promise((resolve, reject) => {
		uni.setStorage({
			key: key,
			data: data,
			success: function() {
				resolve()
			},
			fail: function() {
				reject()
			}
		})
	})
}

export function getStorageSyc(key) {
	return new Promise((resolve, reject) => {
		uni.getStorage({
			key: key,
			success: function(res) {
				resolve(res)
			},
			fail: function(e) {
				reject()
			}
		})
	})
}
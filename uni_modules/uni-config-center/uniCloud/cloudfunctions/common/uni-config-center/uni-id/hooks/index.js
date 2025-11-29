async function beforeRegister({
	userRecord,
	clientInfo
} = {}) {
	if (clientInfo.appId === '__UNI__5955E4C') {
		const randomNum = Math.floor(Date.now() % 1000000);
		const num = String(randomNum).padStart(6, '0');
		if (!userRecord.nickname) {
			userRecord.nickname = '毛星人' + num
		}
		if (!userRecord.avatar_file) {
			userRecord.avatar_file = {
				extname: "png",
				name: num,
				url: "https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/d-avatar.png"
			}
		}
	}
	return userRecord
}

module.exports = {
	beforeRegister
}
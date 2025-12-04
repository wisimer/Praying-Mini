async function beforeRegister({
	userRecord,
	clientInfo
} = {}) {
	const randomNum = Math.floor(Date.now() % 1000000);
	const num = String(randomNum).padStart(6, '0');
	if (!userRecord.nickname) {
		userRecord.nickname = '清愿者' + num
	}
	if (!userRecord.avatar_file) {
		userRecord.avatar_file = {
			extname: "png",
			name: num,
			url: "https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/d-avatar.png"
		}
	}
	return userRecord
}

module.exports = {
	beforeRegister
}
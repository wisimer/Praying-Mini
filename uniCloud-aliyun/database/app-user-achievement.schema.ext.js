module.exports = {
	trigger: {
		beforeCreate: async function({
			collection,
			docId,
			addDataList,
			clientInfo,
			userInfo
		} = {}) {
			// const obj = addDataList[0]
			// const db = uniCloud.database()
			// const userAchievement = await db.collection('app-user-achievement').where({
			// 	user_id: obj.user_id,
			// 	achievement_id: obj.achievement_id
			// }).get()
			// if (userAchievement.data.length > 0) {
			// 	throw new Error('已获得该成就')
			// }
		}
	}
}
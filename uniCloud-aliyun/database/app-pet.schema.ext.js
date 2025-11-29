module.exports = {
	trigger: {
		beforeCreate: async function({
			collection,
			docId,
			addDataList,
			clientInfo,
			userInfo
		} = {}) {
			const obj = addDataList[0]
			if (obj.is_default === 0) {
				const db = uniCloud.database()
				const dbCmd = db.command
				await db.collection('app-pet').where({ user_id: dbCmd.eq(userInfo.uid) }).update({
					is_default: 1
				})
			}
		},
		beforeUpdate: async function({
			collection,
			docId,
			updateData,
			clientInfo,
			userInfo
		} = {}) {
			if (updateData.is_default === 0) {
				const db = uniCloud.database()
				const dbCmd = db.command
				await db.collection('app-pet').where({ user_id: dbCmd.eq(userInfo.uid) }).update({
					is_default: 1
				})
			}
		},
		afterDelete: async function({
			collection,
			docId,
			updateData,
			clientInfo,
			userInfo
		} = {}) {
			const dbJQL = uniCloud.databaseForJQL({
				clientInfo: clientInfo,
			})
			dbJQL.collection('app-user-record').where(`pet_id == '${docId}'`).remove()
			dbJQL.collection('app-remind').where(`pet_id == '${docId}'`).remove()
			dbJQL.collection('app-case').where(`pet_id == '${docId}'`).remove()
		}
	}
}
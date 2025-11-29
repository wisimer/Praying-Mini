module.exports = {
	trigger: {
		afterCreate: async function({
			collection,
			docId,
			addDataList,
			clientInfo,
		} = {}) {
			const dbJQL = uniCloud.databaseForJQL({
				clientInfo: clientInfo,
			})
			const cases = await dbJQL.collection('app-case').where(`user_id == $cloudEnv_uid`).count()
			if (cases.total === 3) {
				dbJQL.collection('app-user-achievement').add({
					achievement_id: '67f5dd450d2b31bbd87135e5'
				});
			}
		}
	}
}
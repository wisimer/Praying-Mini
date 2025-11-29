module.exports = {
	trigger: {
		afterCreate: async function({
			collection,
			docId,
			addDataList,
			clientInfo,
			userInfo
		} = {}) {
			const id = addDataList[0].relevance_id
			const db = uniCloud.database()
			await db.collection('app-dynamic').doc(id).update({
				comment_count: db.command.inc(1)
			})
		}
	}
}
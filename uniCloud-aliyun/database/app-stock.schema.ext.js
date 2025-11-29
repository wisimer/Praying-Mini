module.exports = {
	trigger: {
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
			dbJQL.collection('app-action-stock').where(`stock_id == '${docId}'`).remove()
		}
	}
}
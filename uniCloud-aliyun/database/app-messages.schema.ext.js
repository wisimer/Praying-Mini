module.exports = {
	trigger: {
		afterCreate: async function({
			collection,
			docId,
			addDataList,
			clientInfo,
			userInfo,
			result
		} = {}) {
			const obj = addDataList[0]
			const dbJQL = uniCloud.databaseForJQL({
				clientInfo: clientInfo,
			})
			dbJQL.collection('app-pet').doc(obj.pet_id).update({
				last_msg: new Date().getTime()
			})
		},
		// afterRead: async function({
		// 	collection,
		// 	field,
		// 	where,
		// 	skip,
		// 	clientInfo
		// } = {}) {
		// 	const dbJQL = uniCloud.databaseForJQL({
		// 		clientInfo: clientInfo,
		// 	})
		// 	dbJQL.collection('app-messages').where(where).update({
		// 		state: 2
		// 	})
		// }
	}
}
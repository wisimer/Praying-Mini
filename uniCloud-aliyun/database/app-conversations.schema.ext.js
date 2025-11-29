module.exports = {
	trigger: {
		beforeCreate: async function({
			collection,
			operation,
			addDataList,
			clientInfo
		} = {}) {
			const sender = addDataList[0].sender
			const recipient = addDataList[0].recipient
			const dbJQL = uniCloud.databaseForJQL({
				clientInfo: clientInfo,
			})
			this.doc = dbJQL.collection('app-conversations')
			const usersArr = await this.doc.where(`users == '${sender}' && users == '${recipient}'`).get()
			if (usersArr.data.length > 0) {
				throw new Error(usersArr.data[0]._id)
			}
		}
	}
}
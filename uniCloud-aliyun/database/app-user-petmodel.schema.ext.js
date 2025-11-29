module.exports = {
	trigger: {
		beforeCreate: async function({
			collection,
			docId,
			field,
			clientInfo,
			where,
			addDataList,
			result
		} = {}) {
			const modelId = addDataList[0].model_id
			const dbJQL = uniCloud.databaseForJQL({ clientInfo: clientInfo })
			const model = await dbJQL.collection('app-pet-model').where(`_id == '${modelId}'`).get({ getOne: true })
			const player = await dbJQL.collection('app-player').where(`user_id == $cloudEnv_uid`).get({ getOne: true })
			if (player.data.can < model.data.can) {
				throw new Error('罐头数量不足')
			}
		},
		afterCreate: async function({
			collection,
			docId,
			addDataList,
			clientInfo,
			userInfo,
			result
		} = {}) {
			const model_id = addDataList[0].model_id
			const dbJQL = uniCloud.databaseForJQL({
				clientInfo: clientInfo,
			})
			const model = await dbJQL.collection('app-pet-model').where(`_id ==  '${model_id}'`)
				.get({ getOne: true })
			const player = await dbJQL.collection('app-player').where(`user_id ==  $cloudEnv_uid`)
				.get({ getOne: true })

			await dbJQL.collection('app-player').where(`user_id ==  $cloudEnv_uid`).update({
				can: player.data.can - model.data.can
			})

			const data = await dbJQL.collection('app-user-petmodel').where(`user_id ==  $cloudEnv_uid`).count()
			if (data.total === 3) {
				await dbJQL.collection('app-user-achievement').add({
					achievement_id: '68467a2d337a9f5121883d4c'
				});
			}
		}
	}
}
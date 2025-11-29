module.exports = {
	trigger: {
		beforeCreate: async function({
			addDataList,
			clientInfo,

		} = {}) {
			const check_date = addDataList[0].check_date
			const dbJQL = uniCloud.databaseForJQL({
				clientInfo: clientInfo,
			})
			const doc = dbJQL.collection('app-signin')
			const signinList = await doc.where(`user_id == $cloudEnv_uid && check_date == '${check_date}'`).get()
			if (signinList.data.length > 0) {
				throw new Error('今天已签到')
			}
		},
		afterCreate: async function({
			addDataList,
			clientInfo,
			userInfo
		}) {
			const day = new Date().getDay()
			const can = day === 0 ? 50 : 10
			const db = uniCloud.database()
			await db.collection('app-player').where({ user_id: userInfo.uid }).update({
				can: db.command.inc(can),
			})

			const dbJQL = uniCloud.databaseForJQL({
				clientInfo: clientInfo,
			})
			const doc = dbJQL.collection('app-signin')
			const count = await doc.where(`user_id == $cloudEnv_uid`).count()
			if (count.total === 20) {
				await dbJQL.collection('app-user-achievement').add({
					achievement_id: '67ea0df83d029cfd0d845096'
				});
			}
		}
	}
}
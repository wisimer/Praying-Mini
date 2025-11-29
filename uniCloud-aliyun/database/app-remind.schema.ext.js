const { getBeijingTime } = require('dayjs-utils')

const arr = ['6612397a55b3372a1fdfc08d', '66123989fe975f74402d7d3f']

module.exports = {
	trigger: {
		afterUpdate: async function({
			collection,
			docId,
			addDataList,
			clientInfo,
			userInfo,
			result
		} = {}) {
			const db = uniCloud.database()
			await db.collection('app-remind').doc(docId).update({
				complete_num: db.command.inc(1)
			})
			const dbJQL = uniCloud.databaseForJQL({
				clientInfo: clientInfo,
			})
			const re = await dbJQL.collection('app-remind').doc(docId).get({ getOne: true })
			const index = arr.findIndex(ele => ele === re.data.affair)
			if (index === -1) {
				const reocd = {
					is_daily: 0,
					type_id: re.data.affair,
					pet_id: re.data.pet_id,
					record_date: getBeijingTime().date,
					record_time: getBeijingTime().time
				}
				await dbJQL.collection('app-user-record').add(reocd)
			}

		}
	}
}
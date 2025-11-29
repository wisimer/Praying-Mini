'use strict';
const { getLastMonth } = require('dayjs-utils')

exports.main = async (event, context) => {
	const dbJQL = uniCloud.databaseForJQL({ event, context })
	const db = uniCloud.database()
	const lastMonth = getLastMonth()
	const challenge = await dbJQL.collection('app-challenge').where(`month == '${lastMonth}'`).get({ getOne: true })
	const joinChallenge = await dbJQL.collection('app-join-challenge').where(
			`challenge_month == '${lastMonth}' && damage > ${challenge.data.damage}`)
		.get()
	for (let item of joinChallenge.data) {
		if (item.damage > challenge.data.damage) {
			await dbJQL.collection('app-user-challenge').add({ challenge_id: challenge.data._id, user_id: item.user_id })
			await db.collection('app-player').where({ user_id: item.user_id }).update({
				can: db.command.inc(challenge.data.award_num)
			})
			const obj = await db.collection('app-user-achievement').where({
				user_id: item.user_id,
				achievement_id: '67ea0dc07ad52d3f79c7f828',
			}).get({ getOne: true })
			if (!obj.data[0]) {
				await db.collection('app-user-achievement').add({
					achievement_id: '67ea0dc07ad52d3f79c7f828',
					user_id: item.user_id
				});
			}
		}
	}
	return event
};
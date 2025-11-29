'use strict';
const { getBeijingTime } = require('dayjs-utils')

exports.main = async (event, context) => {
	const db = uniCloud.database()
	const dbCmd = db.command
	const warns = db.collection('app-remind')
	const { date } = getBeijingTime()

	const where = {
		state: 1,
		warn_date: dbCmd.eq(date)
	}
	const arr = await warns.where(where).get()
	// await warns.where(where).update({
	// 	state: 0
	// })
	console.log(arr)
	return event
};
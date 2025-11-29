'use strict';
const UniSubscribemsg = require('uni-subscribemsg');
const { getBeijingTime, dayjs } = require('dayjs-utils')
let uniSubscribemsg = new UniSubscribemsg({
	dcloudAppid: "__UNI__5955E4C",
	provider: "weixin-h5",
});

function getNextDate(date, value, type) {
	return dayjs(date).add(value, type).format('YYYY-MM-DD')
}

async function send(options) {
	const { wx_openid, name, time, pet } = options
	await uniSubscribemsg.sendTemplateMessage({
		touser: wx_openid,
		template_id: "_pjapqstgYMHNHrD0Vid2p7tlAtOBTGflDb0R8bIfc8",
		miniprogram: {
			appid: "wx9a96f0ff49d93656",
			pagepath: "pages/home/home",
		},
		data: {
			thing11: {
				value: pet
			},
			time16: {
				value: time
			},
			thing7: {
				value: name
			}
		}
	});
}

exports.main = async (event, context) => {
	const dbJQL = uniCloud.databaseForJQL({ event, context })
	const db = uniCloud.database()
	const nowDate = getBeijingTime()

	const user = dbJQL.collection('uni-id-users').field('_id,nickname,wx_openid').getTemp()
	const type = dbJQL.collection('app-record-type').getTemp()
	const pet = dbJQL.collection('app-pet').getTemp()
	const result = await dbJQL.collection('app-remind', type, user, pet).where(
		`warn_date == '${nowDate.date}' && warn_time == '${nowDate.time}'`).get()

	for (let item of result.data) {
		const pet = item.pet_id[0].name
		const name = item.affair[0].name
		let wx_openid = ''
		if (item.user_id[0].wx_openid && item.user_id[0].wx_openid.h5) {
			wx_openid = item.user_id[0].wx_openid.h5
		}
		const time = `${item.warn_date} ${item.warn_time}`
		const date = `${nowDate.date} ${nowDate.time}`

		await send({ wx_openid, name, time, pet })

		if (item.cycle_type !== 'single') {
			await db.collection('app-remind').doc(item._id).update({
				warn_date: getNextDate(item.warn_date, item.cycle, item.cycle_type),
				state: 0
			})
		}


	}
	return event
};
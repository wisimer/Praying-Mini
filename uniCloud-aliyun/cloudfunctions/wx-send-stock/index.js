'use strict';
const UniSubscribemsg = require('uni-subscribemsg');
const { get7day } = require('dayjs-utils')

let uniSubscribemsg = new UniSubscribemsg({
	dcloudAppid: "__UNI__5955E4C",
	provider: "weixin-h5",
});

async function send(options) {
	const { wx_openid, name, time, num, unit } = options
	await uniSubscribemsg.sendTemplateMessage({
		touser: wx_openid,
		template_id: "W04zuASpoDpyVVgRiGPj27v_8HmelhwWrbwN_dAIlLs",
		miniprogram: {
			appid: "wx9a96f0ff49d93656",
			pagepath: "pages/home/home",
		},
		data: {
			thing2: {
				value: name,
			},
			time3: {
				value: time
			},
			const8: {
				value: '临期（7天后过期）'
			},
			character_string6: {
				value: num
			}
		}
	});
}

exports.main = async (event, context) => {
	const dbJQL = uniCloud.databaseForJQL({ event, context })
	const day = get7day()
	const user = dbJQL.collection('uni-id-users').field('_id,nickname,wx_openid').getTemp()
	const stock = await dbJQL.collection('app-stock', user).where(`expired_date == '${day}'`).get()

	for (let item of stock.data) {
		let wx_openid = ''
		if (item.user_id[0].wx_openid && item.user_id[0].wx_openid.h5) {
			wx_openid = item.user_id[0].wx_openid.h5
		}
		await send({ wx_openid, name: item.name, time: item.expired_date, num: item.num, unit: item.unit })
	}

	return event
};
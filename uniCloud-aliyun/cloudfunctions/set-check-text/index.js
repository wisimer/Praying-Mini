'use strict';
const UniSecCheck = require('uni-sec-check');
exports.main = async (event, context) => {
	const dbJQL = uniCloud.databaseForJQL({ event, context })
	const user = await dbJQL.collection('uni-id-users').where('_id == $cloudEnv_uid').field('_id,nickname,wx_openid')
		.get({ getOne: true })

	const openid = user.data.wx_openid.mp

	const uniSecCheck = new UniSecCheck({
		provider: 'mp-weixin',
		requestId: context.requestId,
	});
	const checkRes = await uniSecCheck.textSecCheck({
		content: event.text,
		openid,
		scene: event.scene || 2,
		version: 2
	})

	if (checkRes.errCode === 'uni-sec-check-risk-content') {
		return {
			errCode: 400,
			errMsg: '内容不合规',
			result: checkRes.result
		}
	} else if (checkRes.errCode) {
		return {
			errCode: 400,
			errMsg: checkRes.errMsg,
			result: checkRes.result
		}
	}
	return {
		errCode: 0,
		errMsg: ''
	};
};
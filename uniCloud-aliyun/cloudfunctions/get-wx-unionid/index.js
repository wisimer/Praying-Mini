'use strict';
const uobc = require('uni-open-bridge-common')
const crypto = require("crypto");
const xml2js = require('wx-xml2js')

const token = '692993465620447bb31eed45d1efb672'

const key = {
	dcloudAppid: '__UNI__8F1BB0E',
	platform: 'weixin-h5'
}

function sha1(data) {
	return crypto.createHash('sha1').update(data).digest('hex');
}

async function getUnionid(openid) {
	const { access_token } = await uobc.getAccessToken(key)
	const url =
		`https://api.weixin.qq.com/cgi-bin/user/info?access_token=${access_token}&openid=${openid}&lang=zh_CN`
	const unionid = await uniCloud.httpclient.request(url, {
		method: 'GET',
		dataType: 'json',
	})
	return unionid
}

async function receiveWX(body, event, context) {
	//解析xml
	const xmlObj = await xml2js(body)
	//判断微信推送事件类型
	if (xmlObj.Event === 'subscribe') {
		// 获取微信用户的信息，包含 openid 和 unionid
		const userH5 = await getUnionid(xmlObj.FromUserName)
		// 查询数据库 匹配 unionid 的用户，并且设置公众号openid
		const db = uniCloud.database()
		const dbCmd = db.command
		const ueses = await db.collection('uni-id-users')
		const relsut = await ueses.where({ wx_unionid: dbCmd.eq(userH5.data.unionid) }).update({
			wx_openid: {
				h5: userH5.data.openid
			}
		})
	}
}

exports.main = async (event, context) => {
	let { queryStringParameters, body } = event;
	let { signature, echostr, timestamp, nonce } = queryStringParameters;
	//字典排序
	const str = [token, timestamp, nonce].sort().join('');
	const result = sha1(str);
	if (result === signature) {
		if (body) {
			await receiveWX(body, event, context)
		}
		return echostr
	} else {
		return 'error';
	}
};
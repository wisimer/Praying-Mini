'use strict';

const {
	hex_md5
} = require('bpageUtils')

function wxJSPaySign(paramsArrsString, key) {
	return hex_md5(paramsArrsString, 32).toUpperCase().toString();
}

function mapProductId(productId, quantity) {
	let totalFee = 69
	if (quantity > 1) {
		totalFee = 69 + 40 * (quantity - 1)
	}
	return {
		"total_fee": totalFee.toString(),
		"body": "Waxiu 专属实体卡片",
		"notify_url": "https://env-00jxh1vznd3h.dev-hz.cloudbasefunction.cn/bpage_order_listener"
	}
}

exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)
	let db = uniCloud.database()

	let body = event.body

	let bodyObj = JSON.parse(body)

	let userId = bodyObj.userId
	let userName = bodyObj.userName
	let userPhone = bodyObj.userPhone
	let selectedAddress = bodyObj.selectedAddress
	let addressDetail = bodyObj.addressDetail
	let productId = bodyObj.productId
	let quantity = bodyObj.quantity
	let createdTime = new Date().getTime()
	let updatedTime = createdTime

	//构造订单参数
	let matchKey = "1af1e23462f165824e3c4467f84fb432"

	let ts = Math.floor(new Date().getTime() / 1000).toString()

	let product = mapProductId(productId)

	let out_trade_no = Math.random().toString(36).substr(2, 10) + "-" + userId
	let reqParams = {
		// "attach": api_data.OpenId.toString(),
		"mch_id": "1695436159",
		"out_trade_no": out_trade_no,
		"total_fee": product.total_fee,
		"body": product.body,
		"timestamp": ts,
		"notify_url": product.notify_url
	}

	const paramsArr = Object.keys(reqParams);
	paramsArr.sort();
	const stringArr = [];
	paramsArr.map(key => {
		stringArr.push(key + '=' + reqParams[key]);
	});
	// 最后加上商户Key
	stringArr.push("key=" + matchKey);

	const paramsArrsString = stringArr.join('&');
	let sign = wxJSPaySign(paramsArrsString, matchKey)
	let signUrl = paramsArrsString + "&sign=" + sign
	signUrl = signUrl + "&attach=" + bodyObj.userId
	console.log("reqParams : ", signUrl)

	// 向蓝兔发起支付请求
	let reqUrl = 'https://api.ltzf.cn/api/wxpay/jsapi_convenient'
	let res = await uniCloud.request({
		url: reqUrl,
		method: 'POST',
		header: {
			'Access-Control-Allow-Origin': '*',
			'content-type': 'application/x-www-form-urlencoded'
		},
		data: signUrl,
	});

	console.log(res);
	let orderUrl = res.data.data.order_url
	let QRcode_url = res.data.data.QRcode_url
	console.log(orderUrl, QRcode_url);


	// uuid

	let qu = await db.collection('bpage_user')
		.where({
			"userId": userId
		}).get()

	let users = qu.data

	if (users == null || users.length == 0) {
		return {
			code: 3,
			message: '用户不存在'
		}
	}

	let uuid = users[0]._id


	// 保存到订单表
	let orderStatus = '待支付'
	let orderData = {
		userId,
		userName,
		userPhone,
		selectedAddress,
		addressDetail,
		productId,
		createdTime,
		updatedTime,
		orderStatus,
		out_trade_no,
		uuid,
		quantity,
		"totalFee": product.total_fee
	}
	await db.collection('bpage_order').add(orderData)

	//返回数据给客户端
	return {
		"orderUrl": orderUrl,
		"QRcode_url": QRcode_url
	}
};
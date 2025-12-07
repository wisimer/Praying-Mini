const {
	w_md5,
	wxPaySign,
} = require('prayingUtils')

'use strict';
// 蓝兔那边会回调两次，需要做一下幂等。
// 并且需要手动调一下订单查询接口看看支付结果，因为取消支付蓝兔那边也会调用这个接口
exports.main = async (event, context) => {
	console.log('event : ', event)
	let body = event.body

	// code=0&timestamp=1729013749&mch_id=1695436159&order_no=WX202410160134359845545325&out_trade_no=ga8ohk79twb&pay_no=4200002408202410167053494387&total_fee=0.01&sign=3B97FEFE09B4885D723AD6884D283D2F&pay_channel=wxpay&trade_type=MINIPROGRAM&success_time=2024-10-16+01%3A34%3A45&attach=&openid=o5zsK5Oq-CFEI5zSGN4-C54NhdLo
	const params = new URLSearchParams(body);
	const attach = params.get('attach');
	const attachParams = new URLSearchParams(attach);
	const uid = attachParams.get("uid");
	const product_id = attachParams.get("product_id");
	const order_no = params.get('order_no');
	const out_trade_no = params.get('out_trade_no');
	const code = params.get('code')

	console.log('Extracted params:', uid, order_no, code);

	let db = uniCloud.database()
	let orders = await db.collection('app-order').where({
		'order_no': db.command.eq(order_no)
	}).get()

	let res = orders.data

	if (res == null && res.length == 0) {
		//订单不存在
		return {
			code: 200,
			data: "SUCCESS"
		}
	}

	if (res.status === '支付成功') {
		// 订单已支付
		return { code: 200, data: 'SUCCESS' };
	}

	// 主动查单，确认真实支付状态
	const mch_id = "1695436159";
	const timestamp = String(Math.floor(Date.now() / 1000));
	// 组装 JSON 格式参数
	const reqParams = { mch_id, out_trade_no, timestamp };
	const sign = wxPaySign(reqParams);

	const form = new URLSearchParams();
	form.append('mch_id', mch_id);
	form.append('out_trade_no', out_trade_no);
	form.append('timestamp', timestamp);
	form.append('sign', sign);
	console.log('form:', form.toString());

	// 发送 application/x-www-form-urlencoded 格式数据
	const orderPaymentRsp = await uniCloud.httpclient.request('https://api.ltzf.cn/api/wxpay/get_pay_order', {
		method: 'POST',
		content: form.toString(),
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		dataType: 'json'
	});
	console.log('orderPaymentRsp:', orderPaymentRsp);

	if (orderPaymentRsp.code == 1) {
		// 接口失败
		return {
			code: 200,
			data: "SUCCESS"
		}
	}

	// 解析 JSON 响应 
	const orderPaymentData = orderPaymentRsp.data.data;
	console.log('orderPaymentJson:', orderPaymentData);
	// 仅当查单返回 code=0 且 data.pay_status=1 才认为支付成功
	if (orderPaymentData.pay_status === 0) {
		// 未支付
		return {
			code: 200,
			data: "SUCCESS"
		}
	}

	// 支付成功
	await db.collection('app-order').where({
		'out_trade_no': db.command.eq(out_trade_no),
		'order_status': db.command.eq("待支付")
	}).update({
		'order_status': "支付成功",
		"updated_time": Date.now()
	})

	// 查询app-player增加金币，增加愿力
	await db.collection('app-player').where({
		'user_id': db.command.eq(uid)
	}).update({
		'can': db.command.inc(parseInt(product_id)),
		'coin': db.command.inc(parseInt(product_id)),
		"updated_time": Date.now()
	})

	//返回数据给客户端
	return {
		code: 200,
		data: "SUCCESS"
	}
};
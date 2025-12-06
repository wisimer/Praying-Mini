'use strict';
exports.main = async (event, context) => {
	console.log('event : ', event)
	let body = event.body

	// code=0&timestamp=1729013749&mch_id=1695436159&order_no=WX202410160134359845545325&out_trade_no=ga8ohk79twb&pay_no=4200002408202410167053494387&total_fee=0.01&sign=3B97FEFE09B4885D723AD6884D283D2F&pay_channel=wxpay&trade_type=MINIPROGRAM&success_time=2024-10-16+01%3A34%3A45&attach=&openid=o5zsK5Oq-CFEI5zSGN4-C54NhdLo
	const params = new URLSearchParams(body);
	const attach = params.get('attach');
	const attachParams = new URLSearchParams(attach);
	const uid =attachParams.get("uid");
	const product_id =attachParams.get("product_id");
	const order_no = params.get('order_no');
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

	await db.collection('app-order').where({
		'order_no': db.command.eq(order_no)
	}).update({
		'order_status': code == 0 ? "支付成功" : "支付失败",
		"updated_time": Date.now()
	})

	if (code == 0) {
		// 查询app-player增加金币，增加愿力
		await db.collection('app-player').where({
			'user_id': db.command.eq(uid)
		}).update({
			'can': db.command.inc(parseInt(product_id)),
			'coin': db.command.inc(parseInt(product_id)),
			"updated_time": Date.now()	
		})
	}

	//返回数据给客户端
	return {
		code: 200,
		data: "SUCCESS"
	}
};
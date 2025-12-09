'use strict';

const {
	w_md5,
	wxPaySign,
} = require('prayingUtils')

function mapproduct_id(product_id) {
	let totalFee = 90 // 100ge 金币，90元人民币，暂时这么测试
	if (product_id == 10) {
		// 10个金币，9元人民币
		totalFee = 9
	} else if (product_id == 1) {
		// 1个金币，1元人民币
		totalFee = 1
	}
	return {
		"total_fee": totalFee.toString(),
		"body": "愿力岛" + product_id + "个金币"
	}
}


exports.main = async (event, context) => {
	//event为客户端上传的参数
	let db = uniCloud.database()

	const {
		product_id,
		uid
	} = event
	const created_time = new Date().getTime()
	const updated_time = created_time

	if (uid == null || uid.length == 0) {
		return {
			code: 3,
			message: '用户未登录'
		}
	}
	const userInfo = await db.collection('uni-id-users')
		.doc(uid)
		.field({
			_id: 1,
			wx_openid: 1
		})
		.get({
			getOne: true
		});
	console.log("userInfo : ", userInfo)

	if (userInfo == null || userInfo.length == 0) {
		return {
			code: 3,
			message: '用户不存在'
		}
	}

	let ts = Math.floor(new Date().getTime() / 1000).toString()

	let product = mapproduct_id(product_id)

	// 长度6-32位
	let out_trade_no =uid + "-" +  Math.random().toString(16).substr(2, 6)
	// 这里有个注意点，reqParams只能先设置这6个必要参数，然后再签名，再附加其他参数
	let reqParams = {
		"mch_id": "1695436159",
		"out_trade_no": out_trade_no,
		"total_fee": product.total_fee,
		"body": product.body,
		"timestamp": ts,
		"notify_url": "https://fc-mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.next.bspapp.com/payment_lt_order_listener"
	}
	// 签名算法
	const sign = wxPaySign(reqParams)
	// 签完名在附加一下sign和其他信息
	reqParams["sign"]=sign
	reqParams["attach"]=`uid=${uid}&product_id=${product_id}`
	reqParams["title"]="愿力岛",
	
	console.log("reqParams : ", reqParams)

	// 保存到订单表
	let order_status = '待支付'
	let orderData = {
		user_id:uid,
		product_id,
		created_time,
		updated_time,
		order_status,
		out_trade_no,
		"total_fee": product.total_fee
	}
	const addRes = await db.collection('app-order').add(orderData)
	console.log("addRes : "+JSON.stringify(addRes))
	const orderId = addRes.id
	//返回数据给客户端
	return {
		code: 0,
		"reqParams": reqParams,
		"orderId": orderId
	}
};
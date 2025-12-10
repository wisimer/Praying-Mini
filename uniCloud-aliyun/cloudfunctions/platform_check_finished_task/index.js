'use strict';
const db = uniCloud.database();
exports.main = async (event, context) => {
	// 解构传入参数
	const {
		taskId,
		passed
	} = JSON.parse(event.body);
	if (!taskId || passed === undefined) {
		return {
			code: -1,
			msg: '缺少必要参数'
		};
	}

	// 查询 app-dynamic 记录
	const dynamicRes = await db.collection('app-dynamic').doc(taskId).get();
	if (!dynamicRes.data || dynamicRes.data.length === 0) {
		return {
			code: -1,
			msg: '未找到对应的动态任务'
		};
	}
	const dynamic = dynamicRes.data[0];

	let msgType = passed ? 4 : -4;
	if (passed) {
		// 执行转账逻辑
		const amount = dynamic.price / 100;
		// 扣除发布者余额
		await db.collection('app-player').where({
			user_id: dynamic.user_id
		}).update({
			coin: db.command.inc(-amount)
		});
		// 增加完成者余额
		await db.collection('app-player').where({
			user_id: dynamic.fullfill_user_id
		}).update({
			coin: db.command.inc(amount)
		});

		// 更新dynamicRes的status为VERIFY_PASS_WAIT_PLATFORM
		await db.collection('app-dynamic').doc(taskId).update({
			article_status: passed ? 5 : -5
		});
	}

	const now = Date.now();
	// 插入两条 app-task-message 记录
	await db.collection('app-task-message').add([{
			msg_type: msgType,
			state: false,
			relevance_id: taskId,
			from_user_id: dynamic.user_id,
			to_user_id: dynamic.fullfill_user_id,
			request_date: now
		},
		{
			msg_type: msgType,
			state: false,
			relevance_id: taskId,
			from_user_id: dynamic.fullfill_user_id,
			to_user_id: dynamic.user_id,
			request_date: now
		}
	]);

	// 返回数据给客户端
	return {
		code: 0,
		msg: '处理成功'
	};
};
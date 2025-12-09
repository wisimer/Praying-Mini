'use strict';
const db = uniCloud.database()
const dbCmd = db.command
const {
	dayjs
} = require('dayjs-utils')
const uniID = require('uni-id-common')

exports.main = async (event, context) => {
	// 获取用户信息
	const uniIDIns = uniID.createInstance({ // 创建uni-id实例
		context: context,
		// config: {} // 完整uni-id配置信息，使用config.json进行配置时无需传此参数
	})
	const payload = await uniIDIns.checkToken(event.uniIdToken)

	if (payload.errCode) {
		throw payload
	}
	const user_id = payload.uid

	// 动态数据
	// 剔除 _id, user_id 等敏感或系统字段，防止恶意覆盖
	// 允许传入的字段需根据实际业务调整，这里假设 event 本身包含了动态的字段
	// 参考 publish_wish，通常会解构需要的字段
	
	// 根据 addDynamic 的调用方式，传入的是一个 obj
	// 我们需要将 obj 中的字段提取出来，或者直接使用 event (需注意安全性)
	// 为了安全起见，我们最好只提取已知字段，或者排除系统字段
	
	const dynamicObj = {
		...event,
		user_id, // 强制使用当前登录用户ID
		publish_date: Date.now(),
		// 确保不包含 _id, 否则可能会与自动生成的冲突或被恶意指定
	}
	delete dynamicObj._id
	delete dynamicObj.uniIdToken // 删除 token
    delete dynamicObj.clientInfo // 删除客户端信息

	let result
	try {
		result = await db.collection('app-dynamic').add(dynamicObj)
	} catch (e) {
		return {
			code: -2,
			msg: '发布动态失败',
			err: e
		}
	}

	// 更新每日任务
	try {
		// 获取今日0点时间戳
		const todayStart = dayjs().tz('Asia/Shanghai').startOf('day').valueOf()

		const dailyTaskRes = await db.collection('app-daily-tasks')
			.where({
				user_id: user_id,
				date_timestamp: todayStart
			})
			.get()

		if (dailyTaskRes.data.length > 0) {
			const task = dailyTaskRes.data[0]
			// publish_task_force 最大值为 9
			if ((task.publish_task_force || 0) < 9) {
				// 每次加3分
				// 还需要判断加上3分后是否超过9分?
				// 题目要求：publish_task_force加3分，并且每天最多加9分。
				// 如果当前是 6，加 3 变成 9，没问题。
				// 如果当前是 7 (假设异常情况)，加 3 变成 10，是否允许？
				// 通常每日任务是计数，这里是分数。假设每次发布固定加3分，直到达到或超过9分不再加。
				// 或者严格控制不超过9分。
				// 参考 publish_wish: publish_wish_force < 2，则 inc(2)。
				// 这里 publish_task_force < 9, 则 inc(3)。
				
				await db.collection('app-daily-tasks').doc(task._id).update({
					publish_task_force: dbCmd.inc(3)
				})
				// 同时增加app-player的can值
				await db.collection('app-player').where({
					user_id
				}).update({
					can: dbCmd.inc(3)
				})
			}
		} else {
			// 不存在则创建
			await db.collection('app-daily-tasks').add({
				user_id,
				date_timestamp: todayStart,
				login_force: 0,
				publish_wish_force: 0,
				fulfill_wish_force: 0,
				publish_task_force: 3,
				complete_task_force: 0,
				create_date: Date.now()
			})
			// 同时增加app-player的can值
			await db.collection('app-player').where({
				user_id
			}).update({
				can: dbCmd.inc(3)
			})
		}

	} catch (e) {
		console.error('更新每日任务失败', e)
	}

	return {
		code: 0,
		msg: '发布成功',
		result: result
	}
};

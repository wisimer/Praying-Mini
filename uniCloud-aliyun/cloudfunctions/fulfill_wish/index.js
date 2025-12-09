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

	// 参数
	const {
		id,
		content,
		aiMessage
	} = event

	if (!id) {
		return {
			code: -1,
			msg: '缺少参数id'
		}
	}

	// 更新愿望
	let updateResult
	try {
		updateResult = await db.collection('app-wish').doc(id).update({
			fullfilled: true,
			fullfill_content: content,
			fullfill_ai_message: aiMessage,
			fullfill_date: Date.now()
		})
	} catch (e) {
		return {
			code: -2,
			msg: '还愿失败',
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
			// fulfill_wish_force 最大值为 2
			if ((task.fulfill_wish_force || 0) < 2) {
				await db.collection('app-daily-tasks').doc(task._id).update({
					fulfill_wish_force: dbCmd.inc(2)
				})
				// 同时增加app-player的can值
				await db.collection('app-player').where({
					user_id
				}).update({
					can: dbCmd.inc(2)
				})
			}
		} else {
			// 不存在则创建
			await db.collection('app-daily-tasks').add({
				user_id,
				date_timestamp: todayStart,
				login_force: 0,
				publish_wish_force: 0,
				fulfill_wish_force: 2,
				publish_task_force: 0,
				complete_task_force: 0,
				create_date: Date.now()
			})
			// 同时增加app-player的can值
			await db.collection('app-player').where({
				user_id
			}).update({
				can: dbCmd.inc(2)
			})
		}

	} catch (e) {
		console.error('更新每日任务失败', e)
	}

	return {
		code: 0,
		msg: '还愿成功',
		result: updateResult
	}
};

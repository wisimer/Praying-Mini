'use strict';
const db = uniCloud.database()
const dbCmd = db.command
const {
	dayjs
} = require('dayjs-utils')

exports.main = async (event, context) => {
	// 获取用户信息
	let user_id = event.user_id

	// 如果没有传user_id，尝试从uni-id token获取（如果集成了uni-id）
	// 这里为了兼容性，主要依赖event.user_id，但在实际生产中建议校验token
	if (!user_id) {
		return {
			code: -1,
			msg: '缺少user_id'
		}
	}

	// 构造wish数据
	// 排除不相关字段
	const {
		content,
		imgs,
		deadline_date,
		ai_message,
		ai_god,
		price,
		content_style
	} = event

	const wishObj = {
		user_id,
		content,
		imgs,
		deadline_date,
		ai_message,
		ai_god,
		price,
		content_style,
		publish_date: Date.now(),
		last_modify_date: Date.now(),
		fullfilled: false
	}

	let wishResult
	try {
		wishResult = await db.collection('app-wish').add(wishObj)
	} catch (e) {
		return {
			code: -2,
			msg: '发布愿望失败',
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
			// publish_wish_force 最大值为 2
			if ((task.publish_wish_force || 0) < 2) {
				await db.collection('app-daily-tasks').doc(task._id).update({
					publish_wish_force: dbCmd.inc(2)
				})
			}
		} else {
			// 不存在则创建
			await db.collection('app-daily-tasks').add({
				user_id,
				date_timestamp: todayStart,
				login_force: 0,
				publish_wish_force: 1,
				fulfill_wish_force: 0,
				publish_task_force: 0,
				complete_task_force: 0,
				create_date: Date.now()
			})
		}

	} catch (e) {
		console.error('更新每日任务失败', e)
		// 每日任务更新失败不影响愿望发布成功，但可以记录日志
	}

	return {
		code: 0,
		msg: '发布成功',
		result: wishResult
	}
};

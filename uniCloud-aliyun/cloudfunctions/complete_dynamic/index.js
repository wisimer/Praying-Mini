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
		taskId,
		article_status,
		fullfill_content,
		fullfill_imgs
	} = event

	if (!taskId) {
		return {
			code: -1,
			msg: '缺少参数taskId'
		}
	}

	// 更新动态
	let updateResult
	try {
		updateResult = await db.collection('app-dynamic').doc(taskId).update({
			article_status,
			fullfill_content,
			fullfill_imgs
		})
	} catch (e) {
		return {
			code: -2,
			msg: '完成任务失败',
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
			// complete_task_force 最大值为 9
			if ((task.complete_task_force || 0) < 9) {
				// 每次加3分
				await db.collection('app-daily-tasks').doc(task._id).update({
					complete_task_force: dbCmd.inc(3)
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
				publish_task_force: 0,
				complete_task_force: 3,
				create_date: Date.now()
			})
		}

	} catch (e) {
		console.error('更新每日任务失败', e)
	}

	return {
		code: 0,
		msg: '完成任务提交成功',
		result: updateResult
	}
};

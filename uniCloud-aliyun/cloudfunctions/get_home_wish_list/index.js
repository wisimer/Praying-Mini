'use strict';
const db = uniCloud.database()
const dbCmd = db.command
const $ = db.command.aggregate
const {
	dayjs
} = require('dayjs-utils')
const uniID = require('uni-id-common')

exports.main = async (event, context) => {
	// 尝试获取用户信息，用于每日任务
	// getHomeWishList 可能是公开的，所以如果 checkToken 失败（如未登录），不应报错，而是跳过任务逻辑
	let user_id = null
	if (event.uniIdToken) {
		const uniIDIns = uniID.createInstance({
			context: context,
		})
		try {
			const payload = await uniIDIns.checkToken(event.uniIdToken)
			if (payload.uid) {
				user_id = payload.uid
			}
		} catch (e) {
			console.log('Check token failed or guest user:', e)
		}
	}

	const {
		pageNum = 0,
		pageSize = 20,
		fullfilled
	} = event

	const matchObj = {}
	if (fullfilled !== undefined) {
		matchObj.fullfilled = fullfilled
	}

	// 1. 执行查询逻辑
	let wishListResult
	try {
		let agg = db.collection('app-wish').aggregate()
			.match(matchObj)
			.lookup({
				from: 'uni-id-users',
				let: {
					user_id: '$user_id'
				},
				pipeline: $.pipeline()
					.match(dbCmd.expr($.eq(['$_id', '$$user_id'])))
					.project({
						nickname: 1,
						avatar_file: 1
					})
					.done(),
				as: 'userInfo'
			})

		agg = agg.addFields({
			isLiked: false,
			user: $.arrayElemAt(['$userInfo', 0])
		})

		wishListResult = await agg.sort({
				view_count: -1
			})
			.skip(pageNum * pageSize)
			.limit(pageSize)
			.end()
	} catch (e) {
		return {
			code: -1,
			msg: '获取愿望列表失败',
			err: e
		}
	}

	// 2. 异步执行每日任务 (登录积分)
	// 只有当获取到了 user_id 时才执行
	if (user_id) {
		try {
			const todayStart = dayjs().tz('Asia/Shanghai').startOf('day').valueOf()

			const dailyTaskRes = await db.collection('app-daily-tasks')
				.where({
					user_id: user_id,
					date_timestamp: todayStart
				})
				.get()

			if (dailyTaskRes.data.length > 0) {
				const task = dailyTaskRes.data[0]
				// login_force 最大值为 1
				if ((task.login_force || 0) < 1) {
					await db.collection('app-daily-tasks').doc(task._id).update({
						login_force: dbCmd.inc(1)
					})
				}
			} else {
				// 不存在则创建
				await db.collection('app-daily-tasks').add({
					user_id,
					date_timestamp: todayStart,
					login_force: 1,
					publish_wish_force: 0,
					fulfill_wish_force: 0,
					publish_task_force: 0,
					complete_task_force: 0,
					create_date: Date.now()
				})
			}
		} catch (e) {
			console.error('更新每日任务失败', e)
		}
	}

	return {
		code: 0,
		msg: '获取成功',
		result: wishListResult.data // aggregate returns { data: [] }
	}
};

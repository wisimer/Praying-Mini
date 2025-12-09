const db = uniCloud.database()
const doc = db.collection('app-dynamic')
import { SHARE_MENUS, TASK_TYPE } from '@/core/constants.js'


// 查询当前登录用户已发布的动态
export async function getUserDynamicList(option) {
	const article = db.collection('app-dynamic')
	return new Promise((resolve) => {
		article.where("user_id == $cloudEnv_uid").skip(option.pageNum).limit(option.pageSize).get({
			getCount: true
		})
			.then(res => {
				resolve(res.result)
			})
	})
}

export function addWish(obj) {
	return new Promise((resolve, reject) => {
		uniCloud.callFunction({
			name: 'publish_wish',
			data: {
				...obj,
			}
		}).then((res) => {
			if (res.result.code === 0) {
				resolve(res.result.result)
			} else {
				reject(res.result.msg)
			}
		}).catch(err => {
			reject(err.errMsg || err)
		})
	})
}

// 新建动态
export function addDynamic(obj) {

	return new Promise((resolve, reject) => {
		uniCloud.callFunction({
			name: 'publish_dynamic',
			data: {
				...obj
			}
		}).then((res) => {
			if (res.result.code === 0) {
				resolve(res.result.result)
			} else {
				reject(res.result.msg)
			}
		}).catch(err => {
			reject(err.errMsg || err)
		})
	})
}

// 查询动态详情
export async function getDynamicDel(id) {

	const user = await db.collection('uni-id-users')
		.field('_id,avatar_file,nickname,achievement_title')
		.getTemp()

	const article = db.collection('app-dynamic', user)

	return new Promise((resolve) => {
		article.where(`_id == '${id}'`).get({
			getOne: true
		}).then(res => {
			resolve(res.result)
		})
	})
}


// 根据话题获取相关动态
export async function getTopicDynamicList(option) {

	const user = await db.collection('uni-id-users')
		.field('_id,avatar_file,nickname,achievement_title')
		.getTemp()

	const article = db.collection('app-dynamic', user)

	return new Promise((resolve) => {
		article.where(`topic_id == '${option.id}'`).skip(option.pageNum).limit(option.pageSize)
			.get({
				getCount: true
			})
			.then(
				res => {
					resolve(res.result)
				})
	})
}


// 聚合查询
export async function getDynamicListAggregate(option) {
	const db = uniCloud.database()
	const dbCmd = db.command
	const $ = db.command.aggregate

	const pageNum = option.pageNum
	const where = {}
	const sort = TASK_TYPE.map(item => item.id)
	// 对应了 TASK_TYPE 的任务类型，如果大于就是指定类别，否则就是查询全部（但是这里有个点就是状态0表示审核中）
	if (sort.indexOf(option.state) > 0) {
		where.sort = option.state
	} else {
		where.article_status = dbCmd.gt(0)
	}

	return new Promise((resolve) => {
		db.collection('app-dynamic').aggregate()
			.match(where)
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
					.lookup({
						from: 'app-player',
						let: {
							player_id: '$_id'
						},
						pipeline: $.pipeline()
							.match(dbCmd.expr($.eq(['$user_id', '$$player_id'])))
							.lookup({
								from: 'app-achievement',
								let: {
									achievement_id: '$achievement_id'
								},
								pipeline: $.pipeline()
									.match(dbCmd.expr($.eq(['$_id', '$$achievement_id'])))
									.done(),
								as: 'achievement_id',
							})
							.done(),
						as: 'player',
					})
					.done(),
				as: 'user_id',
			})
			.sort({
				publish_date: -1,
			})
			.skip(pageNum * 10)
			.limit(10)
			.end()
			.then(res => {
				resolve(res.result)
			})
	})
}


// 聚合查询动态详情
export async function getDynamicListDelAggregate(id) {
	// return new Promise((resolve, reject) => {
	// 	db.collection('app-dynamic').where(`_id == '${id}'`).get().then((res) => {
	// 		resolve(res.result)
	// 	}).catch(err => {
	// 		reject(err.errMsg)
	// 	})
	// })

	const db = uniCloud.database()
	const dbCmd = db.command
	const $ = db.command.aggregate

	return new Promise((resolve) => {
		db.collection('app-dynamic').aggregate()
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
					.lookup({
						from: 'app-player',
						let: {
							player_id: '$_id'
						},
						pipeline: $.pipeline()
							.match(dbCmd.expr($.eq(['$user_id', '$$player_id'])))
							.lookup({
								from: 'app-achievement',
								let: {
									achievement_id: '$achievement_id'
								},
								pipeline: $.pipeline()
									.match(dbCmd.expr($.eq(['$_id', '$$achievement_id'])))
									.done(),
								as: 'achievement_id',
							})
							.done(),
						as: 'player',
					})
					.done(),
				as: 'user_id',
			})
			.match(dbCmd.expr($.eq(['$_id', id])))
			.end()
			.then(res => {
				resolve(res.result)
			})
	})
}


// 首页愿望卡片列表
export async function getHomeWishList(option) {
	return new Promise((resolve, reject) => {
		uniCloud.callFunction({
			name: 'get_home_wish_list',
			data: {
				...option
			}
		}).then((res) => {
			if (res.result.code === 0) {
				resolve({
					data: res.result.result
				}) // 适配原有的返回格式，原逻辑 res.result 是 aggregate 的结果 {data: []}，这里我直接返回了 data 数组，或者需要包装一下？
                // 查看 cloud function implementation: result: wishListResult.data
                // 原逻辑 resolve(res.result) 其中 res 是 aggregate.end() 的结果，结构为 { data: [...], requestId: ... }
                // 所以原函数的 caller 期望得到 { data: [...] } 还是 [...] ?
                // 让我们看原代码: resolve(res.result)
                // db...end().then(res => resolve(res.result))
                // res.result from aggregate is { data: [...] }
                // My cloud function returns { code: 0, result: [...] } (array directly)
                // Wait, in my cloud function: result: wishListResult.data. So it is an Array.
                // The original code returned an object { data: [...] } ?
                // db...end() returns { result: { data: [...] } }
                // So original resolve(res.result) resolves to { data: [...] }
                // My cloud function result.result is [...] (Array).
                // So I should resolve({ data: res.result.result }) to match { data: [...] } structure if caller expects it.
                // Or I can change cloud function to return { data: wishListResult.data }.
                // Let's adjust client code to match original behavior.
                // Original: resolve({ data: ... })
			} else {
				reject(res.result.msg)
			}
		}).catch(err => {
			reject(err.errMsg || err)
		})
	})
}


// 查看已关注动态
export async function getLikes(Num) {
	const pageNum = Num || 0
	const db = uniCloud.database()
	const dbCmd = db.command
	const $ = db.command.aggregate
	return new Promise((resolve, reject) => {
		db.collection('app-like-dynamic').aggregate()
			.lookup({
				from: 'app-dynamic',
				let: {
					dynamic_id: '$dynamic_id'
				},
				pipeline: $.pipeline()
					.match(dbCmd.expr($.eq(['$_id', '$$dynamic_id'])))
					.lookup({
						from: 'app-topic',
						let: {
							topic_id: '$topic_id'
						},
						pipeline: $.pipeline()
							.match(dbCmd.expr($.eq(['$_id', '$$topic_id'])))
							.project({
								name: 1,
							})
							.done(),
						as: 'topic_id',
					})
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
							.lookup({
								from: 'app-player',
								let: {
									player_id: '$_id'
								},
								pipeline: $.pipeline()
									.match(dbCmd.expr($.eq(['$user_id', '$$player_id'])))
									.lookup({
										from: 'app-achievement',
										let: {
											achievement_id: '$achievement_id'
										},
										pipeline: $.pipeline()
											.match(dbCmd.expr($.eq(['$_id',
												'$$achievement_id'
											])))
											.done(),
										as: 'achievement_id',
									})
									.done(),
								as: 'player',
							})
							.done(),
						as: 'userInfo',
					})
					.done(),
				as: 'dynamicInfo',
			})
			.match({
				user_id: db.getCloudEnv('$cloudEnv_uid')
			})
			.skip(pageNum * 10)
			.limit(10)
			.end()
			.then(res => {
				resolve(res.result)
			})
			.catch(err => {
				reject(err.errMsg)
			})
	})
}

// 查看已关注动态
export async function getLikeDel(dynamicId) {
	return new Promise((resolve, reject) => {
		db.collection('app-like-dynamic').where(`dynamic_id == '${dynamicId}' && user_id == $cloudEnv_uid`)
			.get({
				getOne: true
			}).then(res => {
				resolve(res.result)
			}).catch(err => {
				reject(err.errMsg)
			})
	})
}

// 设置点赞
export async function setLike(dynamicId) {
	return new Promise((resolve, reject) => {
		db.collection('app-like-dynamic').add({
			dynamic_id: dynamicId
		}).then(res => {
			resolve(res.result)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}

// 删除点赞
export async function removeLike(dynamicId) {
	return new Promise((resolve, reject) => {
		db.collection('app-like-dynamic').where(`dynamic_id == '${dynamicId}'`).remove().then(res => {
			resolve(res.result)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}

// 获取未还愿列表
export async function getUnfulfilledWishes() {
	return new Promise((resolve, reject) => {
		db.collection('app-wish')
			.where({
				user_id: db.getCloudEnv('$cloudEnv_uid'),
				fullfilled: db.command.neq(true)
			})
			.orderBy('publish_date', 'desc')
			.get()
			.then(res => {
				resolve(res.result)
			})
			.catch(err => {
				reject(err.errMsg)
			})
	})
}

// 许愿还愿
export async function fulfillWish(id, content, aiMessage) {
	return new Promise((resolve, reject) => {
		uniCloud.callFunction({
			name: 'fulfill_wish',
			data: {
				id,
				content,
				aiMessage
			}
		}).then(res => {
			if (res.result.code === 0) {
				resolve(res.result.result)
			} else {
				reject(res.result.msg)
			}
		}).catch(err => {
			reject(err.errMsg || err)
		})
	})
}
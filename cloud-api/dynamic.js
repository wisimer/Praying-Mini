const db = uniCloud.database()
const doc = db.collection('app-dynamic')


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
	const wish = db.collection('app-wish')

	return new Promise((resolve, reject) => {
		wish.add(obj).then((res) => {
			resolve(res.result)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}

// 新建动态
export function addDynamic(obj) {

	return new Promise((resolve, reject) => {
		doc.add(obj).then((res) => {
			resolve(res.result)
		}).catch(err => {
			reject(err.errMsg)
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
	const sort = [1, 2, 3, 4, 5]
	if (sort.indexOf(option.state) > -1) {
		where.sort = option.state
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
	const db = uniCloud.database()
	const dbCmd = db.command
	const $ = db.command.aggregate
	const pageNum = option.pageNum || 0
	const pageSize = option.pageSize || 20
	
	const matchObj = {
		
	}
	if (option.fullfilled !== undefined) {
		matchObj.fullfilled = option.fullfilled
	}

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
	

	return new Promise((resolve) => {
		agg.sort({
				view_count: -1
			})
			.skip(pageNum * pageSize)
			.limit(pageSize)
			.end()
			.then(res => {
				resolve(res.result)
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
		db.collection('app-wish').doc(id).update({
			fullfilled: true,
			fullfill_content: content,
			fullfill_ai_message: aiMessage,
			fullfill_date: Date.now()
		}).then(res => {
			resolve(res.result)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}
import { formatDate } from '@/utils/date.js'
const db = uniCloud.database()

// 新增聊天房间
export function addRoom(users) {
	const conversations = db.collection('app-conversations')
	return new Promise((resolve, reject) => {
		conversations.add({ users: users, sender: users[0], recipient: users[1], lastMessage_id: '' }).then(res => {
			resolve(res.result)
		}).catch((err) => {
			reject(err.errMsg)
		})
	})
}

// 获取我的聊天室
export function getRooms(users) {
	const user = db.collection('uni-id-users').field('avatar_file,nickname,_id').getTemp()
	const meeage = db.collection('app-messages').getTemp()
	const conversations = db.collection('app-conversations', user, meeage)
	return new Promise((resolve, reject) => {
		conversations.where('users == $cloudEnv_uid').get().then(res => {
			resolve(res.result)
		}).catch((err) => {
			reject(err.errMsg)
		})
	})
}

// 新增聊天记录
export function addMessage(obj) {
	const conversations = db.collection('app-messages')
	return new Promise((resolve, reject) => {
		conversations.add(obj).then(res => {
			resolve(res.result)
		}).catch((err) => {
			reject(err.errMsg)
		})
	})
}


// 获取一对一聊天记录
export function getMessage(skip, pet_id) {
	const num = skip * 20
	const conversations = db.collection('app-messages')
	return new Promise((resolve, reject) => {
		conversations.where(`user_id == $cloudEnv_uid && pet_id =='${pet_id}'`).orderBy('create_date desc').skip(num)
			.limit(20).get({ getCount: true }).then(res => {
				resolve(res.result)
			}).catch((err) => {
				reject(err.errMsg)
			})
	})
}

// 获取当前用户的角色表
export function getPlayer() {
	const achievement = db.collection('app-achievement').getTemp()
	const player = db.collection('app-player', achievement)
	return new Promise((resolve, reject) => {
		player.where(`user_id == $cloudEnv_uid`).get({ getOne: true }).then(res => {
			resolve(res.result)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}

// 查询以获取的成就
export function getHaveAchievement() {
	const achievements = db.collection('app-achievement').getTemp()
	const userAchievement = db.collection('app-user-achievement', achievements)

	return new Promise((resolve, reject) => {
		userAchievement.where("user_id == $cloudEnv_uid").get().then(res => {
			resolve(res.result)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}

// 切换显示的成就
export function changeAchievement(id) {
	const player = db.collection('app-player')
	return new Promise((resolve, reject) => {
		player.where("user_id == $cloudEnv_uid").update({
			achievement_id: id
		}).then(res => {
			resolve(res.result)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}

// 更新玩家愿力值
export function updatePlayerCan(can) {
	const player = db.collection('app-player')
	return new Promise((resolve, reject) => {
		player.where("user_id == $cloudEnv_uid").update({
			can: can
		}).then(res => {
			resolve(res.result)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}


// 查询我的页面全部信息
export function getWodePage() {
	const achievements = db.collection('app-achievement').getTemp()
	// 查询已经获取的成就
	const userAchievement = db.collection('app-user-achievement', achievements).where("user_id == $cloudEnv_uid")
		.getTemp()
	// 查询当前用户的玩表
	const player = db.collection('app-player', achievements).where(`user_id == $cloudEnv_uid`).getTemp({ getOne: true })

	// const totalMoney = db.collection('app-user-record').where(`user_id == $cloudEnv_uid && is_daily == 1`).groupBy(
	// 		'is_daily')
	// 	.groupField('sum(money) as totalMoney').getTemp({ getOne: true })


	const recordNumber = db.collection('app-user-record').where(`user_id == $cloudEnv_uid && is_daily == 0`).skip(0)
		.limit(1).getTemp({ getCount: true })


	const tiaozhan = db.collection('app-challenge').getTemp()
	const userchallenge = db.collection('app-user-challenge', tiaozhan).where(`user_id == $cloudEnv_uid`).getTemp()

	return new Promise((resolve, reject) => {
		db.multiSend(userAchievement, player, recordNumber, userchallenge).then(res => {
			resolve(res.result.dataList)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}

// 查询全部成就和已获取的成就
export function getUserAchievement() {
	const achievements = db.collection('app-achievement').getTemp()
	const userAchievement = db.collection('app-user-achievement').where("user_id == $cloudEnv_uid")
		.getTemp()

	return new Promise((resolve, reject) => {
		db.multiSend(achievements, userAchievement).then(res => {
			resolve(res.result.dataList)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}


// 新增AI提问
export function addQuestion(obj) {
	const question = db.collection('app-ai-question')
	return new Promise((resolve, reject) => {
		question.add(obj).then(res => {
			resolve(res.result)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}

// 获取当前用户的历史提问
export function getUserQuestion(skip) {
	const num = skip * 10
	const question = db.collection('app-ai-question')
	return new Promise((resolve, reject) => {
		question.where("user_id == $cloudEnv_uid").orderBy('create_date desc').skip(num)
			.limit(10).get({ getCount: true }).then(res => {
				resolve(res.result)
			}).catch(err => {
				reject(err.errMsg)
			})
	})
}


// 新增签到
export function addSignin(obj) {
	const doc = db.collection('app-signin')
	return new Promise((resolve, reject) => {
		doc.add(obj).then((res) => {
			resolve(res.result)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}
// 查询本周签到
export function getWeekSignin(option) {
	const doc = db.collection('app-signin')
	return new Promise((resolve, reject) => {
		const { firstDay, lastDay } = option
		const where = {
			user_id: db.getCloudEnv('$cloudEnv_uid'),
			check_date: db.command.gte(firstDay).and(db.command.lte(lastDay))
		}

		doc.where(where).get().then(res => {
			resolve(res.result)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}

// 查询全部签到数量
export function getSigninNum() {
	const doc = db.collection('app-signin')
	return new Promise((resolve, reject) => {
		doc.where('user_id == $cloudEnv_uid').count().then(res => {
			resolve(res.result)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}


// 获取评论列表
export async function getCommentsList(id) {
	const users = await db.collection('uni-id-users')
		.field('_id,nickname,avatar_file')
		.getTemp()

	const comments = db.collection('app-comments', users)
	return new Promise((resolve) => {
		comments.where(`relevance_id == "${id}"`).get().then(res => {
			resolve(res.result)
		})
	})
}

// 新增评论
export function addComments(obj) {
	const doc = db.collection('app-comments')
	return new Promise((resolve, reject) => {
		doc.add(obj).then((e) => {
			resolve(e)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}

// 获取话题列表
// export function getTopic(option) {
// 	const doc = db.collection('app-topic')
// 	return new Promise((resolve) => {
// 		doc.skip(option.pageNum).limit(option.pageSize).field("_id,name").get({ getCount: true }).then(res => {
// 			resolve(res.result)
// 		})
// 	})
// }


// 查询用户提醒
export function getRemind() {
	const pet = db.collection('app-pet').getTemp()
	const affair = db.collection('app-record-type').getTemp()
	const doc = db.collection('app-remind', pet, affair)

	return new Promise((resolve) => {
		doc.where("user_id == $cloudEnv_uid").orderBy('warn_date asc,warn_time asc').get().then(res => {
			resolve(res.result)
		})
	})
}

// 更新提醒状态
export function setRemindState(id) {
	const doc = db.collection('app-remind')
	return new Promise((resolve, reject) => {
		doc.doc(id).update({
			state: 1
		}).then(res => {
			resolve(res.result)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}

// 添加用户提醒
export function addRemind(obj) {
	const doc = db.collection('app-remind')
	return new Promise((resolve, reject) => {
		doc.add(obj).then(res => {
			resolve(res.result)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}

// 删除用户提醒
export function removeRemind(id) {
	const doc = db.collection('app-remind')
	return new Promise((resolve, reject) => {
		doc.doc(id).remove().then(res => {
			resolve(res.result)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}


// 查询用户信息
export function getPlayerInfo(id) {
	const user = db.collection('uni-id-users').where(`_id == '${id}'`).field('avatar_file,nickname,_id')
		.getTemp({ getOne: true })

	const achievements = db.collection('app-achievement').getTemp()
	const userAchievement = db.collection('app-user-achievement', achievements).where(`user_id == '${id}'`)
		.getTemp()

	const model = db.collection('app-pet-model').getTemp()
	const palyer = db.collection('app-player', model, achievements).where(`user_id == '${id}'`).getTemp({ getOne: true })

	const tiaozhan = db.collection('app-challenge').getTemp()
	const userchallenge = db.collection('app-user-challenge', tiaozhan).where(`user_id == '${id}'`).getTemp()

	return new Promise((resolve, reject) => {
		db.multiSend(user, userAchievement, palyer, userchallenge).then(res => {
			resolve(res.result)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}

// 查询其他用户的动态
export function getUserDynamic(options) {
	const { id, pageNum } = options
	const doc = db.collection('app-dynamic')
	return new Promise((resolve) => {
		doc.where(`user_id == '${id}'`).orderBy('publish_date desc').skip(pageNum * 10).limit(10)
			.get({ getCount: true }).then(res => {
				resolve(res.result)
			}).catch(err => {
				reject(err.errMsg)
			})
	})
}

// 添加病例记录
export function addCase(obj) {
	const doc = db.collection('app-case')
	return new Promise((resolve, reject) => {
		doc.add(obj).then(res => {
			resolve(res.result)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}

// 获取病例记录
export function getCase(pageNum) {
	const pet = db.collection('app-pet').getTemp()
	const doc = db.collection('app-case', pet)
	const skip = pageNum * 10
	return new Promise((resolve, reject) => {
		doc.where("user_id == $cloudEnv_uid").skip(skip)
			.limit(10).get({ getCount: true }).then(res => {
				resolve(res.result)
			}).catch(err => {
				reject(err.errMsg)
			})
	})
}

// 加入挑战
export function addChallenge(challenge_id) {
	const doc = db.collection('app-join-challenge')
	return new Promise((resolve, reject) => {
		doc.add({ challenge_month: formatDate(new Date(), 'YYYY-MM') }).then(res => {
			resolve(res.result)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}

// 查询用户伤害排行榜
export function getUserChallenge(pageNum, pageSize) {
	const limit = pageSize ? pageSize : 10
	const skip = pageNum ? pageNum * limit : 0
	const user = db.collection('uni-id-users').field('avatar_file,nickname,_id')
		.getTemp({ getOne: true })
	const doc = db.collection('app-join-challenge', user)
	const challenge_month = formatDate(new Date(), 'YYYY-MM')
	return new Promise((resolve, reject) => {
		doc.where(`challenge_month == '${challenge_month}'`).orderBy('damage desc').skip(skip)
			.limit(limit).get({ getCount: true }).then(res => {
				resolve(res.result)
			}).catch(err => {
				reject(err.errMsg)
			})
	})
}

// 查询花销统计页数据  改用云对象处理
// export function getStatistics(option) {
// 	const types = db.collection('app-record-type').getTemp()
// 	const doc = db.collection('app-user-record', types)
// 	return new Promise((resolve, reject) => {
// 		const { firstDay, lastDay, pet_id } = option
// 		const where = {
// 			user_id: db.getCloudEnv('$cloudEnv_uid'),
// 			is_daily: 1,
// 			record_date: db.command.gte(firstDay).and(db.command.lte(lastDay))
// 		}

// 		if (pet_id !== 0) {
// 			where.pet_id = pet_id
// 		}

// 		doc.where(where).groupBy('type_id')
// 			.groupField('sum(money) as totalMoney').get().then(res => {
// 				resolve(res.result)
// 			}).catch(err => {
// 				reject(err.errMsg)
// 			})
// 	})
// }

// -----------------------------宠物相关接口------------------------------
// 获取宠物列表
export function getPetList() {
	const doc = db.collection('app-pet')
	return new Promise((resolve) => {
		doc.where("user_id == $cloudEnv_uid").get({ getCount: true }).then(res => {
			resolve(res.result)
		})
	})
}

// 新增宠物
export function addPet(obj) {
	const doc = db.collection('app-pet')
	return new Promise((resolve, reject) => {
		doc.add(obj).then((res) => {
			resolve(res.result)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}

// 修改宠物信息
export function updatePet(id, obj) {
	const doc = db.collection('app-pet')
	return new Promise((resolve, reject) => {
		doc.doc(id).update(obj).then(() => {
			resolve(null)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}

// 查询宠物详情
export function getPetOne(id) {
	const doc = db.collection('app-pet')
	return new Promise((resolve, reject) => {
		doc.doc(id).get({ getOne: true }).then((res) => {
			resolve(res.result)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}

// 删除宠物
export function removePet(id) {
	const doc = db.collection('app-pet')
	return new Promise((resolve, reject) => {
		doc.doc(id).remove().then((res) => {
			resolve(res.result)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}

// -----------------------------囤货收纳接口------------------------------
// 新增货物
export function addThing(obj) {
	const doc = db.collection('app-stock')
	return new Promise((resolve, reject) => {
		doc.add(obj).then((res) => {
			resolve(res.result)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}

// 查询货物
export function getThingFen() {
	const doc = db.collection('app-stock')
	return new Promise((resolve, reject) => {
		doc.where("user_id == $cloudEnv_uid").groupBy('state')
			.groupField('count(*) as count').get().then((res) => {
				resolve(res.result)
			}).catch(err => {
				reject(err.errMsg)
			})
	})
}

// 查询全部物品
export function getThingAll(state) {
	const doc = db.collection('app-stock')
	let where = 'user_id == $cloudEnv_uid'
	if (state !== 9) {
		where += ` && state == ${state}`
	}
	return new Promise((resolve, reject) => {
		doc.where(where).orderBy('create_date desc').get().then((res) => {
			resolve(res.result)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}

// 查询物品操作记录
export function getStockAction(pageNum, pageSize) {
	const skip = pageNum ? pageNum : 0
	const limit = pageSize ? pageSize : 10
	const st = db.collection('app-stock').getTemp()
	const doc = db.collection('app-action-stock', st)
	return new Promise((resolve, reject) => {
		doc.where('user_id == $cloudEnv_uid').orderBy('create_date desc').skip(skip * 10).limit(limit)
			.get({ getCount: true }).then((res) => {
				resolve(res.result)
			}).catch(err => {
				reject(err.errMsg)
			})
	})
}

// 物品操作：出库，入库，丢弃
export function setStockAction(obj) {
	const doc = db.collection('app-action-stock')
	return new Promise((resolve, reject) => {
		doc.add(obj).then((res) => {
			resolve(res.result)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}

// 删除物品
export function removeStock(id) {
	const stock = db.collection('app-stock')
	return new Promise((resolve, reject) => {
		stock.doc(id).remove().then((res) => {
			resolve(res.result)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}


// 关注用户
export function follow(id) {
	const doc = db.collection('app-follow')
	return new Promise((resolve, reject) => {
		doc.add({ follow_user_id: id }).then((res) => {
			resolve(res.result)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}

// 取消关注
export function removeFollow(id) {
	const doc = db.collection('app-follow')
	return new Promise((resolve, reject) => {
		doc.where(`follow_user_id == '${id}' && user_id == $cloudEnv_uid`).remove().then((res) => {
			resolve(res.result)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}

// 查询已关注
export function getUserFollow() {
	const user = db.collection('uni-id-users').field('avatar_file,nickname,_id').getTemp()
	const doc = db.collection('app-follow', user)
	return new Promise((resolve, reject) => {
		doc.where(`user_id == $cloudEnv_uid`).get().then((res) => {
			resolve(res.result)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}

// 留言反馈
export function getFeedback() {
	const users = db.collection('uni-id-users')
		.field('_id,nickname,avatar_file')
		.getTemp()
	const doc = db.collection('app-feedback', users)
	return new Promise((resolve, reject) => {
		doc.orderBy('comment_date desc').get().then((res) => {
			resolve(res.result)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}

export function addFeedback(obj) {
	const doc = db.collection('app-feedback')
	return new Promise((resolve, reject) => {
		doc.add(obj).then((res) => {
			resolve(res.result)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}

// 获取我的全部评论
export function getMyComments(pageNum) {
	const skip = pageNum ? pageNum : 0
	const db = uniCloud.database()
	const dbCmd = db.command
	const $ = db.command.aggregate
	return new Promise((resolve, reject) => {
		db.collection('app-comments').aggregate()
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

			.match(dbCmd.expr($.cond({
				if: $.eq(['$comment_type', 1]),
				then: $.eq(['$author_id', db.getCloudEnv('$cloudEnv_uid')]),
				else: $.eq(['$reply_user_id', db.getCloudEnv('$cloudEnv_uid')]),
			})))
			.sort({
				comment_date: -1,
			})
			.skip(skip * 20)
			.limit(20)
			.end()
			.then(res => {
				resolve(res.result)
			})
	})
}

// 获取未读评论数
export function getUnreadComments() {
	const doc = db.collection('app-comments')
	return new Promise((resolve, reject) => {
		doc.where({
				state: 0,
				$or: [{
						comment_type: 1,
						author_id: db.getCloudEnv('$cloudEnv_uid')
					},
					{
						comment_type: db.command.neq(1),
						reply_user_id: db.getCloudEnv('$cloudEnv_uid')
					}
				]
			})
			.count().then((
				res) => {
				resolve(res.result)
			}).catch(err => {
				reject(err.errMsg)
			})
	})
}

// 将我的未读，改为全部已读
export function updateCommentsState() {
	const doc = db.collection('app-comments')
	return new Promise((resolve, reject) => {
		doc.where({
			state: 0,
			$or: [{
					comment_type: 1,
					author_id: db.getCloudEnv('$cloudEnv_uid')
				},
				{
					comment_type: db.command.neq(1),
					reply_user_id: db.getCloudEnv('$cloudEnv_uid')
				}
			]
		}).update({
			state: 1
		}).then((res) => {
			resolve(res.result)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}
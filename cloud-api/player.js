import { formatDate } from '@/utils/date.js'
const db = uniCloud.database()


export function getPlayer() {
	const model = db.collection('app-pet-model').getTemp()
	const doc = db.collection('app-player', model)

	return new Promise((resolve, reject) => {
		doc.where(`user_id == $cloudEnv_uid`).get({ getOne: true }).then(res => {
			resolve(res.result)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}

export function getPetModel() {
	const model = db.collection('app-pet-model').getTemp()
	const haveModel = db.collection('app-user-petmodel').where(`user_id == $cloudEnv_uid`).getTemp()
	return new Promise((resolve, reject) => {
		db.multiSend(model, haveModel).then(res => {
			resolve(res.result.dataList)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}

export function addPetModel(model_id) {
	return new Promise((resolve, reject) => {
		db.collection('app-user-petmodel').add({
			model_id,
		}).then(res => {
			resolve(res.result)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}

export function updetePetModel(model_id) {
	return new Promise((resolve, reject) => {
		db.collection('app-player').where(`user_id == $cloudEnv_uid`).update({
			pet_modal_id: model_id,
		}).then(res => {
			resolve(res.result)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}

// 查询首页不需要登录的数据
export function getChallenge() {

	const month = formatDate(new Date(), 'YYYY-MM')

	return new Promise((resolve, reject) => {
		db.collection('app-challenge').where(`month == '${month}'`).get({ getOne: true }).then(res => {
			resolve(res.result)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}

// 查询首页登录的数据
export function getPageHomeLogin() {
	// 宠物模型
	const model = db.collection('app-pet-model').getTemp()
	// 玩家属性
	const player = db.collection('app-player', model).where(`user_id == $cloudEnv_uid`).getTemp({ getOne: true })
	// 用户是否加入挑战
	const month = formatDate(new Date(), 'YYYY-MM')
	const where = `user_id == $cloudEnv_uid && challenge_month == '${month}'`
	const joinChallenge = db.collection('app-join-challenge').where(where)
		.getTemp({ getOne: true })
	return new Promise((resolve, reject) => {
		db.multiSend(player, joinChallenge).then(res => {
			resolve(res.result.dataList)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}
// import { store } from '@/uni_modules/uni-id-pages/common/store'
const db = uniCloud.database()
const doc = db.collection('app-record-type')
import { getMonthBoundaries } from '@/utils/date.js'

// 获取日常列表
export async function getRecordList(type) {
	return new Promise((resolve) => {
		doc.where(`type == ${type} && (user_id == '0' || user_id == $cloudEnv_uid)`).get().then(
			res => {
				resolve(res.result)
			})
	})
}

// 新增日常列表
export async function addRecordType(obj) {
	return new Promise((resolve, reject) => {
		doc.add(obj).then(res => {
			resolve(res.result)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}


// 删除自定义
export async function removeType(id) {
	return new Promise((resolve, reject) => {
		doc.doc(id).remove().then(res => {
			resolve(res.result)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}

// 新建记录
export async function addRecord(obj) {
	const record = db.collection('app-user-record')
	return new Promise((resolve, reject) => {
		record.add(obj).then(res => {
			resolve(res.result)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}

// 修改记录
export async function updateRecord(id, obj) {
	const record = db.collection('app-user-record')
	return new Promise((resolve, reject) => {
		record.doc(id).update(obj).then(res => {
			resolve(res.result)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}

// 聚合查询已保存记录
export async function getUserRecord(options) {

	const { pageNum, is_daily, typeId, petId, sort, month, datetype } = options

	const db = uniCloud.database()
	const dbCmd = db.command
	const $ = db.command.aggregate
	const where = {
		user_id: db.getCloudEnv('$cloudEnv_uid'),
		is_daily: is_daily,
	}

	if (typeId) {
		where.type_id = typeId
	}

	if (petId) {
		where.pet_id = petId
	}

	if (sort) {
		where.sort = sort
	}

	if (datetype) {
		if (Number(datetype) === 0) {
			const { firstDay, lastDay } = getMonthBoundaries(month)
			where.record_date = db.command.gte(firstDay).and(db.command.lte(lastDay))
		} else {
			const firstDay = `${month}-01-01`
			const lastDay = `${month}-12-31`
			where.record_date = db.command.gte(firstDay).and(db.command.lte(lastDay))
		}
	}


	return new Promise((resolve) => {
		db.collection('app-user-record').aggregate()
			.lookup({
				from: 'app-pet',
				let: {
					pet_id: '$pet_id'
				},
				pipeline: $.pipeline()
					.match(dbCmd.expr($.eq(['$_id', '$$pet_id'])))
					.done(),
				as: 'petInfo',
			})
			.lookup({
				from: 'app-record-type',
				let: {
					type_id: '$type_id'
				},
				pipeline: $.pipeline()
					.match(dbCmd.expr($.eq(['$_id', '$$type_id'])))
					.done(),
				as: 'typeInfo',
			})
			.match(where)
			.sort({
				record_date: -1,
				record_time: -1
			})
			.skip(pageNum * 10)
			.limit(10)
			.end()
			.then(res => {
				resolve(res.result)
			})
	})
}

// 查询总金额
export async function getTotelMoney(pageNum, is_daily) {
	const record = db.collection('app-user-record')
	return new Promise((resolve, reject) => {
		record.where(`user_id == $cloudEnv_uid && is_daily == 1`).groupBy('is_daily')
			.groupField('sum(money) as totalMoney').get({ getOne: true }).then(res => {
				resolve(res.result)
			}).catch(err => {
				reject(err.errMsg)
			})
	})
}

// 删除记录
export async function removeRecord(id) {
	const record = db.collection('app-user-record')
	return new Promise((resolve, reject) => {
		record.doc(id).remove().then(res => {
			resolve(res.result)
		}).catch(err => {
			reject(err.errMsg)
		})
	})
}

// 获取体重记录
export async function getPetWeightList(pet_id, breed) {
	const record = db.collection('app-user-record').where(
			`user_id == $cloudEnv_uid && type_id == "6612397a55b3372a1fdfc08d" && pet_id == '${pet_id}'`)
		.limit(10).getTemp()

	const basic = db.collection('app-pet-basic').where(`name == '${breed}'`).getTemp()

	console.log(breed);
	return new Promise((resolve, reject) => {
		db.multiSend(record, basic).then(res => {
			resolve(res.result.dataList)
		}).catch(err => {
			reject(err.errMsg)
		})
		// record.where(`user_id == $cloudEnv_uid && type_id == "6612397a55b3372a1fdfc08d" && pet_id == '${pet_id}'`)
		// 	.limit(10).get().then(res => {
		// 		resolve(res.result)
		// 	}).catch(err => {
		// 		reject(err.errMsg)
		// 	})
	})
}
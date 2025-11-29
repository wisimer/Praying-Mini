const { dayjs } = require('dayjs-utils')

function getDateDifference(targetDateStr) {
	const targetDate = dayjs(targetDateStr);
	const today = dayjs().startOf('day');
	const diff = targetDate.diff(today, 'day');
	return diff
}

module.exports = {
	trigger: {
		afterCreate: async function({
			collection,
			docId,
			addDataList,
			clientInfo,
			userInfo,
			result
		} = {}) {
			const obj = addDataList[0]
			const dbJQL = uniCloud.databaseForJQL({
				clientInfo: clientInfo,
			})
			const stockItem = await dbJQL.collection('app-stock').where(
				`user_id == $cloudEnv_uid && _id == '${obj.stock_id}'`).get({ getOne: true })


			const action = Number(obj.action);
			const stockNum = Number(stockItem.data.num);

			let afterNum = action === 1 ? stockNum + Number(obj.num) : stockNum - Number(obj.num)
			const updateObj = {
				num: afterNum
			}

			if (action === 1 && stockNum === 0) {
				const daysRemaining = getDateDifference(stockItem.data.expired_date);
				updateObj.state =
					daysRemaining > 7 ? 0 : // 未过期（>7天）
					daysRemaining > 0 ? 2 : // 即将过期（1~7天）
					1; // 已过期（<=0天）
			} else {
				switch (action) {
					case 0:
						if (afterNum === 0) updateObj.state = 3; // 库存耗尽
						break;
					case 2:
						updateObj.state = 4;
						break;
				}
			}

			dbJQL.collection('app-stock').where(`user_id == $cloudEnv_uid && _id == '${obj.stock_id}'`).update(updateObj)
		}
	}
}
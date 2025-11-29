const { Decimal } = require('decimal')


function categorizeAndSumAsArrayWithDecimalAdvanced(data, totalAmount, options = {}) {
	const {
		returnAsNumber = true, // 默认返回数字类型
			precision = 2, // 默认保留2位小数
			roundMode = Decimal.ROUND_HALF_UP,
			includePercentage = true // 是否包含百分比计算
	} = options;

	const tempResult = {};
	const grandTotal = new Decimal(totalAmount || 0);

	// 先按照对象方式统计
	data.forEach(item => {
		if (item.type_id && item.type_id.length > 0) {
			const sort = item.type_id[0].sort;
			const moneyValue = item.money || 0;
			const money = new Decimal(Number(moneyValue) || 0);

			if (!tempResult[sort]) {
				tempResult[sort] = {
					sort: sort,
					total: new Decimal(0),
					count: 0,
				};
			}

			tempResult[sort].total = tempResult[sort].total.plus(money);
			tempResult[sort].count += 1;
		}
	});

	// 处理结果
	return Object.values(tempResult).map(category => {
		let processedTotal;

		if (returnAsNumber) {
			processedTotal = category.total.toDecimalPlaces(precision, roundMode).toNumber();
		} else {
			processedTotal = category.total.toFixed(precision);
		}

		const result = {
			sort: category.sort,
			total: processedTotal,
			count: category.count,
			preciseTotal: category.total.toString(),
		};

		// 计算百分比（如果启用且总数大于0）
		if (includePercentage && grandTotal.greaterThan(0)) {
			const percentage = category.total.dividedBy(grandTotal).times(100);
			const formattedPercentage = percentage.toDecimalPlaces(precision, roundMode).toString() + '%';

			result.percentage = formattedPercentage;
			result.percentageValue = percentage.toDecimalPlaces(precision, roundMode).toNumber();
		}

		return result;
	});
}


function categorizeByNameWithPercentage(data, totalAmount, options = {}) {
	const {
		returnAsNumber = false, // 默认返回字符串避免精度问题
			precision = 2, // 默认保留2位小数
			roundMode = Decimal.ROUND_HALF_UP,
			includePercentage = true
	} = options;

	const tempResult = {};
	const grandTotal = new Decimal(totalAmount || 0);

	// 按照name属性进行分类统计
	data.forEach(item => {
		if (item.type_id && item.type_id.length > 0) {
			const typeName = item.type_id[0].name;
			const sortCategory = item.type_id[0].sort; // 保留sort信息
			const moneyValue = item.money || 0;
			const money = new Decimal(Number(moneyValue) || 0);

			if (!tempResult[typeName]) {
				tempResult[typeName] = {
					name: typeName,
					sort: sortCategory, // 包含sort信息
					total: new Decimal(0),
					count: 0,
					icon: item.type_id[0].icon,
					type_id: item.type_id[0]._id
				};
			}

			tempResult[typeName].total = tempResult[typeName].total.plus(money);
			tempResult[typeName].count += 1;
		}
	});

	// 处理结果
	return Object.values(tempResult).map(category => {
		console.log(category)
		let processedTotal;

		if (returnAsNumber) {
			processedTotal = category.total.toDecimalPlaces(precision, roundMode).toNumber();
		} else {
			processedTotal = category.total.toFixed(precision);
		}

		const result = {
			name: category.name,
			sort: category.sort, // 包含分类信息
			total: processedTotal,
			count: category.count,
			preciseTotal: category.total.toString(),
			icon: category.icon,
			type_id: category.type_id
		};

		// 计算百分比
		if (includePercentage && grandTotal.greaterThan(0)) {
			const percentage = category.total.dividedBy(grandTotal).times(100);
			const formattedPercentage = percentage.toDecimalPlaces(precision, roundMode).toString() + '%';

			result.percentage = formattedPercentage;
			result.percentageValue = percentage.toDecimalPlaces(precision, roundMode).toNumber();
		}

		return result;
	});
}


module.exports = {
	_before: function() {

	},
	getTotalMoney: async function() {
		const dbJQL = uniCloud.databaseForJQL({
			clientInfo: this.getClientInfo()
		})

		const records = await dbJQL.collection('app-user-record').where(`user_id == $cloudEnv_uid && is_daily == 1`)
			.get()



		let total = new Decimal(0)
		records.data.forEach(order => {
			total = total.plus(new Decimal(order.money))
		})

		return {
			code: 0,
			errCode: 0,
			errMsg: "",
			message: "",
			totalMoney: total.toNumber()
		}
	},

	getSortMoney: async function(option) {

		const dbJQL = uniCloud.databaseForJQL({
			clientInfo: this.getClientInfo()
		})

		const db = uniCloud.database()

		const { firstDay, lastDay, pet_id } = option

		let where =
			`user_id == $cloudEnv_uid && is_daily == 1 && record_date >= '${firstDay}' && record_date <= '${lastDay}'`

		if (pet_id !== 0) {
			where += ` && pet_id == '${pet_id}'`
		}

		const types = dbJQL.collection('app-record-type').getTemp()
		const records = await dbJQL.collection('app-user-record', types).where(where)
			.get()

		console.log(records.data)
		let total = new Decimal(0)
		records.data.forEach(order => {
			total = total.plus(new Decimal(order.money))
		})

		const chatData = categorizeAndSumAsArrayWithDecimalAdvanced(records.data, total, {
			precision: 2
		})

		const sortMoney = categorizeByNameWithPercentage(records.data, total, {
			returnAsNumber: false,
			precision: 2,
			includePercentage: true
		})

		return {
			code: 0,
			errCode: 0,
			errMsg: "",
			message: "",
			totalMoney: total.toNumber(),
			sortMoney: sortMoney || [],
			chatData: chatData || []
		}
	}
}
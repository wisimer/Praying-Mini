const { getBeijingTime } = require('dayjs-utils')

const month = getBeijingTime().month

const params = {
	strengthWeight: 0.5, // 力量权重
	wisdomWeight: 0.01, // 智慧权重（控制加成比例）
	agilityWeight: 0.01, // 敏捷权重（控制修正比例）
};

function getRandomElement() {
	const arr = [1, 2, 3, 4, 5, 6, 7, 8];
	const randomIndex = Math.floor(Math.random() * arr.length);
	return arr[randomIndex];
}

// 计算基础伤害
function calculateBaseDamage(strength, strengthWeight) {
	return strength * strengthWeight;
}

// 计算智慧加成
function calculateWisdomBonus(wisdom, wisdomWeight) {
	return 1 + wisdom * wisdomWeight; // 例如 1 + 50 * 0.01 = 1.5
}

// 计算敏捷修正
function calculateAgilityModifier(agility, agilityWeight) {
	return 1 + agility * agilityWeight; // 例如 1 + 80 * 0.005 = 1.4
}

// 计算单次攻击伤害
function calculateDamage(player, params) {
	const {
		strength,
		wisdom,
		agility
	} = player;
	const {
		strengthWeight,
		wisdomWeight,
		agilityWeight
	} = params;

	// 计算基础伤害
	const baseDamage = calculateBaseDamage(strength, strengthWeight);

	// 计算智慧加成
	const wisdomBonus = calculateWisdomBonus(wisdom, wisdomWeight);

	// 计算敏捷修正
	const agilityModifier = calculateAgilityModifier(agility, agilityWeight);

	// 计算最终伤害
	const damage = baseDamage * wisdomBonus * agilityModifier;

	return Math.round(damage);
}

function getSequenceValue(n) {
	if (n < 1) return 0;
	return 10 + (n - 1) * 10;
}


const achievements = {
	LEVEL_10: {
		id: '67f5dd879755e3ea18091ad4',
		check: (data) => data.level === 10
	},
	LEVEL_30: {
		id: '67ea0dd8189f86798f7f70c0',
		check: (data) => data.level === 30
	},
	BALANCED: {
		id: '67ea0d926e5d2dd0d14480aa',
		check: (data) => data.strength >= 50 && data.wisdom >= 50 && data.agility >= 50
	},
	DYNAMIC_NUM: {
		id: '67ea0d5ff2949ccbd17ba21c',
		check: (data) => data.dynamic_num === 10
	}
}

module.exports = {
	trigger: {
		beforeCreate: async function({
			clientInfo
		}) {
			console.log(clientInfo.clientIP)
		},
		afterCreate: async function({
			collection,
			docId,
			addDataList,
			clientInfo,
			userInfo,
			result
		} = {}) {
			// 在返回中添加新的信息给前端
			const obj = addDataList[0]
			const dbJQL = uniCloud.databaseForJQL({
				clientInfo: clientInfo,
			})
			const db = uniCloud.database()

			if (obj.weight) {
				await dbJQL.collection('app-pet').where(`_id ==  '${obj.pet_id}'`).update({
					weight: obj.weight
				})
			}

			// 获取当前玩家信息
			const player = await dbJQL.collection('app-player').where(`user_id ==  $cloudEnv_uid`)
				.get({ getOne: true })

			// 处理月挑战信息
			const damage = calculateDamage(player.data, params);
			const data = await db.collection('app-join-challenge')
				.where({
					user_id: obj.user_id,
					challenge_month: month
				})
				.update({ damage: db.command.inc(damage) })


			// 更新玩家信息
			const isUpgrade = player.data.empirical + 10 >= player.data.next_empirical
			const newEmpirical = isUpgrade ? 0 : player.data.empirical + 10
			const newLevel = isUpgrade ? player.data.level + 1 : player.data.level
			const newNextEmpirical = isUpgrade ? getSequenceValue(player.data.level + 1) : player.data.next_empirical
			const newStrength = isUpgrade ? player.data.strength + getRandomElement() : player.data.strength
			const newWisdom = isUpgrade ? player.data.wisdom + getRandomElement() : player.data.wisdom
			const newAgility = isUpgrade ? player.data.agility + getRandomElement() : player.data.agility
			await db.collection('app-player')
				.where({
					user_id: obj.user_id,
				}).update({
					can: db.command.inc(20),
					strength: newStrength,
					wisdom: newWisdom,
					agility: newAgility,
					empirical: newEmpirical,
					level: newLevel,
					next_empirical: newNextEmpirical
				})

			const dynamic_num = await dbJQL.collection('app-dynamic').where(`user_id ==  $cloudEnv_uid`).count()

			// 添加所在城市
			// const res = await uniCloud.request({
			// 	url: `http://api.tianditu.gov.cn/geocoder?postStr={'lon':	104.066284,'lat':30.572938,'ver':1}&type=geocode&tk=66f12c39c9d240ae1ffa61174b8d27b7`,
			// })
			// console.log(res.data.result.addressComponent.city)

			const userData = {
				dynamic_num: dynamic_num.total,
				level: newLevel,
				strength: newStrength,
				wisdom: newWisdom,
				agility: newAgility,
			}
			const achievementsToUnlock = Object.values(achievements)
				.filter(achievement => achievement.check(userData));

			for (const achievement of achievementsToUnlock) {
				const isHave = await dbJQL.collection('app-user-achievement')
					.where(`user_id ==  $cloudEnv_uid && achievement_id == '${achievement.id}'`)
					.count()
				if (isHave.total === 0) {
					await dbJQL.collection('app-user-achievement').add({
						achievement_id: achievement.id
					});
				}
			}

		},
		afterRead: async function({
			collection,
			docId,
			field,
			clientInfo,
		} = {}) {
			const db = uniCloud.database()
			if (typeof docId === 'string' && field.includes('content')) {
				await db.collection('app-dynamic').doc(docId).update({
					view_count: db.command.inc(3)
				})
			}
		}
	}
}
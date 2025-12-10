module.exports = {
	trigger: {
		afterRead: async function({
			collection,
			docId,
			field,
			clientInfo,
			where,
			result
		} = {}) {
			if (!result.data) {
				const dbJQL = uniCloud.databaseForJQL({ clientInfo: clientInfo })
				const obj = {
					strength: 10,
					wisdom: 0,
					agility: 0,
					can: 10,
					achievement_id: '67ea0e24149854a900153f56',
					level: 1,
					empirical: 0,
					next_empirical: 10,
					pet_modal_id: '682199feeef9cbdc978f78b7',
					modal_bg_url: ''
				}
				await dbJQL.collection('app-player').add(obj)
				await dbJQL.collection('app-user-achievement').add({ achievement_id: '67ea0e24149854a900153f56' })
				await dbJQL.collection('app-user-petmodel').add({ model_id: '682199feeef9cbdc978f78b7' })
				obj.pet_modal_id = [{
					_id: "682199feeef9cbdc978f78b7",
					name: "春和和煦",
					url: "https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/petModal/modal1.png",
					can: 0
				}]
				result.data = obj
			}
		},
	}
}
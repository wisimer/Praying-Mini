const db = uniCloud.database()



// 添加获取的新成就
export function addFollow(follow_user_id) {
	const doc = db.collection('app-follow')
	return new Promise((resolve) => {
		doc.add({ follow_user_id: follow_user_id }).then(res => {
			resolve(res.result)
		})
	})
}
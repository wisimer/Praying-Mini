export function sort(arr) {
	let newArr = []
	if (arr.length === 0) {
		return newArr
	}
	arr.map(oneDim => {
		if (newArr.length == 0) {
			newArr.push({
				sort: oneDim.sort,
				list: [oneDim]
			})
		} else {
			let res = newArr.some(item => { // 判断相同，有就添加到当前项
				if (item.sort == oneDim.sort) {
					item.list.push(oneDim)
					return true
				}
			})
			if (!res) { // 如果没找相同添加一个新对象
				newArr.push({
					sort: oneDim.sort,
					list: [oneDim]
				})
			}
		}
	})
	return newArr
}

export function arrayToTree(list, rootValue) {
	const arr = [];
	list.forEach((item) => {
		if (item.reply_comment_id === rootValue) {
			// 递归调用
			const replys = arrayToTree(list, item._id);
			if (replys.length) {
				item.replys = replys;
			}
			arr.push(item);
		}
	});
	return arr;
}
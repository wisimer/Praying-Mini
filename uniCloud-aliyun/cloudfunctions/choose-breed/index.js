'use strict';
const { dogs, cats, other } = require('breed')

exports.main = async (event, context) => {

	let arr = []

	const type = event.type

	if (Number(type) === 0) {
		arr = dogs
	} else if (Number(type) === 1) {
		arr = cats
	} else {
		arr = other
	}

	return {
		code: 0,
		data: arr,
		msg: 'success'
	}
};
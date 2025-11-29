const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Shanghai')

/**
 * 获取当前北京时间
 * @param {string} format - 格式字符串，默认为 'YYYY-MM-DD HH:mm'
 * @returns {string} 格式化后的时间字符串
 */
function getBeijingTime() {
	return {
		date: dayjs().tz('Asia/Shanghai').format('YYYY-MM-DD'),
		month: dayjs().tz('Asia/Shanghai').format('YYYY-MM'),
		time: dayjs().tz('Asia/Shanghai').format('HH:mm')
	}
}

function getLastMonth() {
	return dayjs().tz('Asia/Shanghai').subtract(1, 'month').format('YYYY-MM')
}

function getCalculateDays(day) {
	const today = dayjs().tz('Asia/Shanghai').startOf('day');
	const tomorrow = dayjs(day).tz('Asia/Shanghai').startOf('day');
	const daysDiff = tomorrow.diff(today, 'day');
	return daysDiff
}

function get7day() {
	return dayjs().tz('Asia/Shanghai').add(7, 'day').format('YYYY-MM-DD')
}

module.exports = {
	dayjs,
	getBeijingTime,
	getLastMonth,
	getCalculateDays,
	get7day
}
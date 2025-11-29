export function formatDate(timestamp, format = 'YYYY-MM-DD hh:mm:ss') {
	const date = new Date(timestamp);

	const year = date.getFullYear().toString();
	const month = ('0' + (date.getMonth() + 1)).slice(-2);
	const day = ('0' + date.getDate()).slice(-2);
	const hours = ('0' + date.getHours()).slice(-2);
	const minutes = ('0' + date.getMinutes()).slice(-2);
	const seconds = ('0' + date.getSeconds()).slice(-2);

	const formatOptions = {
		'YYYY': year,
		'MM': month,
		'DD': day,
		'hh': hours,
		'mm': minutes,
		'ss': seconds,
	};

	const formattedTime = format.replace(/YYYY|MM|DD|hh|mm|ss/g, (match) => {
		return formatOptions[match];
	});

	return formattedTime;
}


// 判断一个时间距今多少年多少月
export function computeDay(date) {

	const startTime = new Date(date).getTime();
	const endTime = new Date().getTime();

	const diff = Math.abs(endTime - startTime);

	const year = parseInt(diff / (1000 * 60 * 60 * 24 * 365));
	const month = parseInt((diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));

	return {
		year: year > 0 ? year : 0,
		month: month > 0 ? month : 0
	}
}

// 判断时间戳是否超过当前时间30分钟
export function formatChatMessages(messages) {
	if (!messages.length) return [];

	const formattedMessages = [];
	let lastDisplayedTime = null; // 记录上次显示的时间

	messages.forEach((msg, index) => {
		const currentTime = new Date(msg.create_date);
		const showTime =
			// 第一条消息 || 时间差 ≥30分钟
			index === 0 || currentTime - lastDisplayedTime >= 60 * 60 * 1000;

		if (showTime) {
			msg.showTime = true; // 标记是否显示时间
			lastDisplayedTime = currentTime; // 更新上次显示时间
		} else {
			msg.showTime = false;
		}

		formattedMessages.push(msg);
	});

	return formattedMessages;
}

/**
 * 根据YYYY-MM格式字符串获取该月第一天和最后一天
 */
export function getMonthBoundaries(yearMonth) {
	// 验证输入格式
	if (!/^\d{4}-\d{2}$/.test(yearMonth)) {
		throw new Error('请输入有效的YYYY-MM格式年月字符串');
	}

	// 分割年份和月份
	const [year, month] = yearMonth.split('-').map(Number);

	// 验证月份范围
	if (month < 1 || month > 12) {
		throw new Error('月份必须在1-12之间');
	}

	// 获取当月第一天（月份从0开始，所以month-1）
	const firstDay = new Date(year, month - 1, 1);

	// 获取下个月的第一天，然后减去1天得到当月的最后一天
	const lastDay = new Date(year, month, 0);

	// 返回格式化的日期字符串（YYYY-MM-DD）
	return {
		firstDay: formatDate(firstDay, 'YYYY-MM-DD'),
		lastDay: formatDate(lastDay, 'YYYY-MM-DD'),
	};
}


/**
 * 计算日期加减天数后的日期（输入输出均为 YYYY-MM-DD 格式）
 */
export function calculateDate(dateStr, days) {
	// 1. 验证输入格式
	if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
		throw new Error('日期格式必须为 YYYY-MM-DD');
	}

	// 2. 转换为 Date 对象（注意时区问题，使用本地时间）
	const date = new Date(dateStr);
	if (isNaN(date.getTime())) {
		throw new Error('无效的日期');
	}

	// 3. 计算新日期
	date.setDate(date.getDate() + days);

	// 4. 格式化为 YYYY-MM-DD
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份补零
	const day = String(date.getDate()).padStart(2, '0'); // 日期补零

	return `${year}-${month}-${day}`;
}

// 判断一个日期距离今天多少天
export function getDaysFromToday(dateStr) {
	// 1. 验证输入格式
	if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
		throw new Error('日期格式必须为 YYYY-MM-DD');
	}

	// 2. 解析输入日期（按本地时区）
	const [year, month, day] = dateStr.split('-').map(Number);
	const inputDate = new Date(year, month - 1, day);
	if (isNaN(inputDate.getTime())) {
		throw new Error('无效的日期');
	}

	// 3. 获取今天的日期（时间归零）
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	// 4. 计算天数差（保留正负）
	const timeDiff = inputDate - today;
	return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
}

// 获取本周星期一到星期天
export function getWeekDates() {
	const today = new Date();
	const dayOfWeek = today.getDay(); // 0 (周日) 到 6 (周六)
	// 计算本周周一（如果今天是周日，则取上周一）
	const monday = new Date(today);
	monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

	const weekDates = [];
	// 生成周一至周日的日期
	for (let i = 0; i < 7; i++) {
		const date = new Date(monday);
		date.setDate(monday.getDate() + i);

		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');

		weekDates.push(`${year}-${month}-${day}`);
	}

	return weekDates;
}


// 计算YYYY-MM-DD hh:mm的日期是否大于当前时间
export function isFutureDateTime(dateTimeStr) {
	// 将输入字符串转换为Date对象
	const inputDate = new Date(dateTimeStr);

	// 获取当前时间的Date对象
	const now = new Date();

	// 比较两个Date对象
	return inputDate > now;
}

// 计算hh:mm的时分是否大于当前时间
export function isTimeLaterThanNow(timeStr) {
	// 获取当前时间的总分钟数
	const now = new Date();
	const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

	// 解析输入时间的总分钟数
	const [hours, minutes] = timeStr.split(':').map(Number);
	const inputTotalMinutes = hours * 60 + minutes;

	return inputTotalMinutes > currentTotalMinutes;
}

// 当月最后一天距离当天还有多少天
export function daysUntilEndOfMonth() {
	// 获取当前日期
	const today = new Date();

	// 获取当前月份的下个月的第一天
	const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

	// 获取当月的最后一天（下个月第一天减去1天）
	const lastDayOfMonth = new Date(nextMonth - 1);

	// 计算剩余天数（最后一天减去当前日期）
	const diffInTime = lastDayOfMonth - today;
	const diffInDays = Math.ceil(diffInTime / (1000 * 60 * 60 * 24));

	return diffInDays;
}


// 判断时间是否大于当前时间1小时后
export function isMoreThanOneHourLater(timeString) {
	// 解析输入的时间字符串
	const inputTime = new Date(timeString.replace(' ', 'T'));

	// 获取当前时间
	const currentTime = new Date();

	// 计算时间差（毫秒）
	const timeDifference = inputTime - currentTime;

	// 判断是否大于1小时（3600000毫秒）
	return timeDifference > 3600000;
}

export function formatTimeDifference(timestamp) {
	console.log(timestamp)
	const now = Date.now();
	const diff = now - timestamp; // 时间差（毫秒）

	// 如果时间戳是未来的时间，可以处理为0或返回特定信息
	if (diff < 0) {
		return '未来时间';
	}

	const minutes = Math.floor(diff / (1000 * 60));
	const hours = Math.floor(diff / (1000 * 60 * 60));
	const days = Math.floor(diff / (1000 * 60 * 60 * 24));
	const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
	const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));

	if (minutes < 60) {
		return `${minutes}分钟`;
	} else if (hours < 24) {
		return `${hours}小时`;
	} else if (days < 30) {
		return `${days}天`;
	} else if (months < 12) {
		return `${months}月`;
	} else {
		return `${years}年`;
	}
}

// 获取当前月和前23个月
export function getLast24Months() {
	const months = [];
	const currentDate = new Date();

	for (let i = 0; i < 24; i++) {
		// 创建新的日期对象，避免修改原始对象
		const date = new Date(currentDate);

		// 减去i个月
		date.setMonth(date.getMonth() - i);

		// 获取年份和月份
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需要+1

		// 格式化为 YYYY-MM
		const formattedDate = `${year}-${month}`;

		months.unshift(formattedDate);
	}

	return months;
}

// 获取3年年份
export function getLast3YearsChronological() {
	const years = [];
	const currentYear = new Date().getFullYear();

	for (let i = 2; i >= 0; i--) {
		const year = currentYear - i;
		years.push(year.toString());
	}

	return years;
}
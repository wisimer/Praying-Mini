'use strict';
const OpenAI = require("openai");
const { dayjs } = require('dayjs-utils')

const openai = new OpenAI({
	baseURL: "https://api.deepseek.com",
	apiKey: "sk-f1735a8eb28d4e08926d6ba9db76db54",
});

function getRandomElement(arr) {
	if (!Array.isArray(arr) || arr.length === 0) {
		return undefined;
	}

	const randomIndex = Math.floor(Math.random() * arr.length);
	return arr[randomIndex];
}

// 使用示例
const roles = [
	"霸道总裁",
	"河南人(河南话)",
	"迪迦奥特曼",
	"反派修仙者",
	"学术界的大佬",
	"唐僧",
	"经济学家",
	"E人",
	"蜡笔小新",
	"火隐忍者鸣人",
	"程序员",
	"网红博主",
	"直播带货主播",
	"老艺术家"
];


async function getAiComments(msg) {

	const stream = await openai.chat.completions.create({
		messages: [{
			content: msg,
			role: "system",
		}, ],
		model: "deepseek-chat",
	});

	return stream.choices[0].message.content
}

exports.main = async (event, context) => {

	const befor = dayjs().subtract(10, 'minute').valueOf()
	const nowDate = dayjs().valueOf()

	const db = uniCloud.database()
	const dbCmd = db.command
	const reslut = await db.collection('app-dynamic')
		.where({
			publish_date: dbCmd.gte(befor).and(dbCmd.lte(nowDate))
		})
		.get()

	for (const item of reslut.data) {
		const pet = await db.collection('app-pet').where({ user_id: item.user_id }).get()
		const petObj = pet.data[0]
		const str = getRandomElement(roles);
		const TURTLE_SOUP_PROMPT = `我现在需要你进行角色扮演。
		你的行为准则：用户在平台发布宠物日常分享，你需要评论用户的分享动态
		- 评论风格：抽象网络用语，无厘头、搞怪、结合网络热梗，夸奖用户发布的内容。
		- 评论内容：结合下方的宠物品种、宠物姓名、和用户发布的分享动态内。
		- 评论字数：不超过50个字。
		### 你的角色：
		- ${str}
		### 宠物信息
		- 品种：${petObj ? petObj.breed : ''}
		- 姓名：${petObj ? petObj.name : ''}
		### 用户发布的动态内容
		- ${item.content}
		`;
		if (item.sort === 1) {
			const msg = await getAiComments(TURTLE_SOUP_PROMPT)
			await db.collection('app-comments').add({
				relevance_id: item._id,
				comment_type: 1,
				comment_content: msg,
				author_id: item.user_id,
				state: 0,
				user_id: '68bfd3722eea65b0f1ec5a31',
				comment_date: nowDate
			})

			await db.collection('app-dynamic').doc(item._id).update({
				comment_count: db.command.inc(1)
			})
		}

	}

	//返回数据给客户端
	return event
};
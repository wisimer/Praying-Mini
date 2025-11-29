'use strict';
const { getBeijingTime } = require('dayjs-utils')
exports.main = async (event, context) => {
	const dbJQL = uniCloud.databaseForJQL({ event, context })

	const month = getBeijingTime().month

	const arr = [{
			username: 'wang1',
			nickname: '喵喵饲养员',
			challenge_month: month,
			user_id: '688079d73d029cca22d1f81c',
			damage: Math.floor(Math.random() * 99) + 1
		},
		{
			username: 'wang2',
			nickname: '狗子拆家',
			challenge_month: month,
			user_id: '68807a9e0d2b3178f867c34a',
			damage: Math.floor(Math.random() * 99) + 1
		},
		{
			username: 'wang3',
			nickname: '',
			challenge_month: month,
			user_id: '68807be1c3b5c9ccb025ae10',
			damage: Math.floor(Math.random() * 99) + 1
		},
		{
			username: 'wwj4',
			nickname: '胖橘',
			challenge_month: month,
			user_id: '688087f6149854d2e0a541d9',
			damage: Math.floor(Math.random() * 99) + 1
		},
		{
			username: 'wang5',
			nickname: '',
			challenge_month: month,
			user_id: '68808a4db9fb230b038c91d5',
			damage: Math.floor(Math.random() * 99) + 1
		},
		{
			username: 'wang6',
			nickname: '醉里挑灯看剑',
			challenge_month: month,
			user_id: '6880927f189f86d5e1c95472',
			damage: Math.floor(Math.random() * 99) + 1
		},
		{
			username: 'wang7',
			nickname: '',
			challenge_month: month,
			user_id: '688093f8337a9f51218cb644',
			damage: Math.floor(Math.random() * 99) + 1
		},
		{
			username: 'wang8',
			nickname: '',
			challenge_month: month,
			user_id: '6880942af2949c1a83c33104',
			damage: Math.floor(Math.random() * 99) + 1
		},
		{
			username: 'wang9',
			nickname: 'Max',
			challenge_month: month,
			user_id: '6880945cfe975fd64c8bf198',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang10',
			nickname: '小爱同学',
			challenge_month: month,
			user_id: '688b2d5cbd02209f5b16ba80',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang11',
			nickname: '',
			challenge_month: month,
			user_id: '688c543d189f86d5e1fece00',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang12',
			nickname: '7秒的鱼',
			challenge_month: month,
			user_id: '688c5488286f7cb2b822f65f',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang13',
			nickname: '',
			challenge_month: month,
			user_id: '688c58fa09664cca98989de3',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang14',
			nickname: '一只阿狸',
			challenge_month: month,
			user_id: '688c59772eea65b0f1da03cd',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang15',
			nickname: '',
			challenge_month: month,
			user_id: '689079b11c90b6a2f1e69cb0',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang16',
			nickname: '',
			challenge_month: month,
			user_id: '6891a119a7c43263da82a23d',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang17',
			nickname: '',
			challenge_month: month,
			user_id: '6891a1fec3b5c9ccb0e9b450',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang18',
			nickname: '',
			challenge_month: month,
			user_id: '6891a49e3d029cca2295c80e',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang19',
			nickname: '',
			challenge_month: month,
			user_id: '6891a55f862066586cb7ecf6',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang20',
			nickname: '',
			challenge_month: month,
			user_id: '6892fc03c3b5c9ccb00ccb24',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang21',
			nickname: '',
			challenge_month: month,
			user_id: '6892fd61eef9cbdc97265c82',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang22',
			nickname: '',
			challenge_month: month,
			user_id: '6892fe84a09a9b16db212b6d',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang23',
			nickname: '',
			challenge_month: month,
			user_id: '6893053a21821be1762fb57b',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang24',
			nickname: '',
			challenge_month: month,
			user_id: '68930a23e0ec192f194c06c3',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang25',
			nickname: '',
			challenge_month: month,
			user_id: '68930b55189f86d5e1aa44db',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang26',
			nickname: '',
			challenge_month: month,
			user_id: '68930b8b286f7cb2b8cdf3a6',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang27',
			nickname: '',
			challenge_month: month,
			user_id: '689555ec89bd277b762b37ae',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang28',
			nickname: '七崽',
			challenge_month: month,
			user_id: '6895b939286f7cb2b8163f7d',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang29',
			nickname: '',
			challenge_month: month,
			user_id: '689943c37c8de468d1f23d2b',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang30',
			nickname: '',
			challenge_month: month,
			user_id: '68994484ee97ef4a762b1998',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang31',
			nickname: '',
			challenge_month: month,
			user_id: '6899493e6523417562c61847',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang32',
			nickname: '',
			challenge_month: month,
			user_id: '68994a8c55b33785617d3c9d',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang33',
			nickname: '',
			challenge_month: month,
			user_id: '68994b267c8de468d1f30831',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang34',
			nickname: '',
			challenge_month: month,
			user_id: '68994c2fe0ec192f19e8be02',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang35',
			nickname: '',
			challenge_month: month,
			user_id: '68994e62f08210a1fe926e47',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang36',
			nickname: '',
			challenge_month: month,
			user_id: '68994edceef9cbdc97c59afe',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang37',
			nickname: '',
			challenge_month: month,
			user_id: '689951d5e0ec192f19e966cc',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang38',
			nickname: '',
			challenge_month: month,
			user_id: '6899ab87e0ec192f19f3c090',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang39',
			nickname: '',
			challenge_month: month,
			user_id: '6899ae10a674f439f91a1435',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		// 新数据
		{
			username: 'wang40',
			nickname: '',
			challenge_month: month,
			user_id: '689ab4be55b33785619fa992',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang41',
			nickname: '',
			challenge_month: month,
			user_id: '689ab4fe7ad52db7e70569c1',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang42',
			nickname: '',
			challenge_month: month,
			user_id: '689ab570ce5ec9e58ddb2a69',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang43',
			nickname: '',
			challenge_month: month,
			user_id: '689ab593816a3feaea83be4e',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang44',
			nickname: '',
			challenge_month: month,
			user_id: '68a286b4bd02209f5b677296',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang45',
			nickname: '',
			challenge_month: month,
			user_id: '68a28737a7c43263da2bba1d',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang46',
			nickname: '',
			challenge_month: month,
			user_id: '68a287919755e3437a8ef2e3',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang47',
			nickname: '',
			challenge_month: month,
			user_id: '68a288ebee97ef4a76127f15',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang48',
			nickname: '',
			challenge_month: month,
			user_id: '68a28a2aa7c43263da2c13d4',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang49',
			nickname: '',
			challenge_month: month,
			user_id: '68a28a81a674f439f9f962ca',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang50',
			nickname: '',
			challenge_month: month,
			user_id: '68a28b718a5c782a2b7635b5',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang51',
			nickname: '',
			challenge_month: month,
			user_id: '68a2bba37ae7086a3d342cba',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang52',
			nickname: '',
			challenge_month: month,
			user_id: '68a2bc34a674f439f9ff54cf',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang53',
			nickname: '',
			challenge_month: month,
			user_id: '68a2caa7a7c43263da340335',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang54',
			nickname: '',
			challenge_month: month,
			user_id: '68a2cd3c8a5c782a2b7e8f48',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang55',
			nickname: '',
			challenge_month: month,
			user_id: '68a2cdac7c8de468d1e69a3a',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang56',
			nickname: '',
			challenge_month: month,
			user_id: '68a2d43ba674f439f9021892',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang57',
			nickname: '',
			challenge_month: month,
			user_id: '68a2db26a7c43263da360923',
			damage: Math.floor(Math.random() * 99) + 1,
		},
		{
			username: 'wang58',
			nickname: '',
			challenge_month: month,
			user_id: '68a2e8208b0da441dc289d05',
			damage: Math.floor(Math.random() * 99) + 1,
		}
	];

	const list = arr.map(res => {
		return {
			challenge_month: month,
			user_id: res.user_id,
			damage: Math.floor(Math.random() * 99) + 1
		}
	})

	await dbJQL.collection('app-join-challenge').add(list)
	//返回数据给客户端
	return event
};
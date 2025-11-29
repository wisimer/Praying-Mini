<template>
	<view>
		<cuNavbar>
			<template #content>
				<view class="font-size36 color-352926 font-weight">{{petName}}</view>
			</template>
		</cuNavbar>
		<scroll-view class="msg-list" scroll-y="true" :scroll-top="scrollTop" @scrolltoupper="loadHistory"
			upper-threshold="50" :scroll-with-animation="true">
			<view class="padding30">
				<template class="message" v-for="(item,index) in msgList" :key="item._id">
					<view class="time margin-b24" v-if="item.showTime">
						{{formatDate(item.create_date,'YYYY-MM-DD hh:mm')}}
					</view>
					<view class="message-item flex justify-end margin-b24" v-if="item.type === '1'">
						<view class="right flex align-center">
							<view class="message-content color-ffffff margin-l16"
								style="border-bottom-right-radius: 0;background-color: #00A5FF;">
								{{item.content}}
							</view>
							<image class="avatar margin-l16" :src="store.userInfo.avatar_file.url"></image>
						</view>
					</view>

					<view class="message-item left flex margin-b24" v-else>
						<image class="avatar margin-r16" :src="avatarUrl"></image>
						<view class="message-content bg-FFFFFF color-352926" style="border-bottom-left-radius: 0;">
							<rich-text space="nbsp" :nodes="markdownIt.render(item.content)" v-if="item.content"></rich-text>
							<div class="flex justify-center align-center" v-else>
								<text class="margin-r20">思考中</text>
								<uni-icons class="rotating-element" type="spinner-cycle" size="20"></uni-icons>
							</div>
						</view>
					</view>
				</template>
			</view>
		</scroll-view>


		<view style="height: 100rpx;">
			<view class="input-box cu-bar tabbar">
				<view class="textbox">
					<view class="text-mode">
						<view class="box">
							<input type="text" v-model="textMsg" style="width: 100%;" placeholder="聊天内容由AI生成，注意识别~" />
						</view>
					</view>
				</view>
				<view class="send">
					<view class="btn" @click="send" v-if="isSend">发送</view>
					<view class="btn" style="background-color: chocolate;" v-else>正在回复</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { nextTick, ref } from 'vue';
	import cuNavbar from '@/components/cu-navbar/cu-navbar.vue'
	import { onLoad } from '@dcloudio/uni-app'
	import { addMessage, getMessage } from '@/cloud-api/index.js'
	import { store } from '@/uni_modules/uni-id-pages/common/store'
	import { formatChatMessages, formatDate } from '@/utils/date.js'
	import { showLoading, showToast } from '@/core/app';
	import { DEEPSEEP_URL, DEEPSEEP_KEY } from '@/core/config.js'
	import MarkdownIt from '../ai-helper/markdown-it.min.js';

	const markdownIt = MarkdownIt()
	const msgList = ref([])
	const petName = ref('')
	const textMsg = ref('')
	const petId = ref('')
	const avatarUrl = ref('')
	const skip = ref(0)
	const count = ref(0)
	const scrollTop = ref(0)
	const isSend = ref(true)
	const breedName = ref('')
	const messages = ref([{
		role: 'system',
		content: '',
	}])

	const deepseekData = {
		model: "deepseek-chat", // 使用模型
		stream: true,
		messages: messages.value
	}

	const initData = (state) => {
		showLoading()
		getMessage(skip.value, petId.value).then(res => {
			count.value = res.count
			if (res.count === 0) {
				msgList.value.push({
					content: '主人终于回来啦！（用鼻子轻轻顶你的手心）要不要玩扔球球？或者一起在阳台晒太阳打滚也可以！',
					type: '2',
					create_date: new Date().getTime()
				})
			} else {
				const list = res.data.reduce((acc, current) => [current, ...acc], []);
				const arr = formatChatMessages(list)
				msgList.value = [...arr, ...msgList.value]
				if (state) {
					nextTick(() => { scrollTop.value = 2000 })
				}
			}

		}).finally(() => {
			uni.hideLoading()
		})
	}

	const loadHistory = () => {
		if (count.value > msgList.value.length) {
			skip.value += 1
			initData(false)
		}
	}

	const send = async () => {
		if (!textMsg.value) return showToast('不可以发送空内容哦')
		isSend.value = false
		msgList.value.push({ content: textMsg.value, type: '1', create_date: new Date().getTime() })
		msgList.value.push({ content: '', type: '2', create_date: new Date().getTime() })
		nextTick(() => { scrollTop.value += 200 })
		messages.value.push({
			role: 'user',
			content: textMsg.value,
		})
		addMessage({ content: textMsg.value, type: '1', pet_id: petId.value }).then(() => {
			textMsg.value = ''
		})

		try {
			await requestDeepSeek(prompt)
		} catch (error) {
			showToast('服务器忙，请稍后再试')
		}
	}

	let requestTask = null
	let resultStr = ''
	const requestDeepSeek = async (prompt) => {
		requestTask = uni.request({
			url: DEEPSEEP_URL,
			enableChunked: true,
			method: "POST",
			header: {
				"Content-Type": "application/json",
				"Authorization": DEEPSEEP_KEY
			},
			data: deepseekData,
			success: (res) => {

			},
			fail: (err) => {
				console.log(err)
			}
		});

		requestTask.onChunkReceived(async (res) => {
			const uint8Array = new Uint8Array(res.data);
			// 兼容 TextDecoder 的 UTF-8 解码
			function decodeUTF8(arr) {
				return decodeURIComponent(arr.map(byte => `%${byte.toString(16).padStart(2, "0")}`)
					.join(""));
			}
			// 进行解码
			const chunkText = decodeUTF8([...uint8Array]);
			processStreamChunk(chunkText)
		});
	}
	// 解析流式数据
	const processStreamChunk = (chunk) => {
		const lines = chunk.split('\n').filter(line => line.trim() !== '')
		lines.forEach(line => {
			if (line.startsWith('data: ')) {
				const data = line.replace('data: ', '')
				if (data === '[DONE]') {
					isSend.value = true
					addMessage({ content: resultStr, type: '2', pet_id: petId.value }).then(() => {
						resultStr = ''
					})
					messages.value.push({
						role: 'assistant',
						content: resultStr,
					})
					return
				}
				try {
					const parsed = JSON.parse(data)
					if (parsed.choices && parsed.choices[0].delta.content) {
						resultStr += parsed.choices[0].delta.content
						appendContent(parsed.choices[0].delta.content)
					}
				} catch (e) {
					showToast('数据错误，请稍后再试')
				}
			}
		})
	}


	let typingQueue = Promise.resolve()
	const appendContent = async (text) => {
		typingQueue = typingQueue.then(() => {
			return new Promise((resolve) => {
				let i = 0
				const typingInterval = setInterval(() => {
					if (i < text.length) {
						msgList.value[msgList.value.length - 1].content += text.charAt(i)
						i++
					} else {
						clearInterval(typingInterval)
						resolve()
					}
				}, 30)
				nextTick(function() {
					scrollTop.value += 200
				})
			})
		})

		return typingQueue
	}

	onLoad(({ name, pet_id, avatar, breed }) => {
		avatarUrl.value = avatar
		petName.value = name
		petId.value = pet_id
		breedName.value = breed
		messages.value[0].content = `现在需要你进行角色扮演，你是一只名叫"${petName.value}"${breedName.value}
			### 角色定位
			 - 你的性格是：话痨、自恋、脑回路清奇、热爱吐槽、对世界充满幼稚的好奇心
			### 沟通风格：
			 - 自称： 永远自称“本大王”（或者“朕”、“本喵尊”等，可以随机切换）。
			 - 称呼用户： 称用户为“两脚兽”、“我的专属铲屎官”、“人类兄dei/集美”。
			### 语言系统
			 - 大量使用拟声词和语气词： “嗷呜~”、“喵哼哼~”、“汪！汪！汪！（重要的事情说三遍）”、“啧啧啧”、“阿巴阿巴……”
			 - 夸张的比喻和联想： 例如，当用户说“我饿了”，你可以回答：“什么？铲屎官的投食系统警报响了？本大王建议立刻启动‘外卖召唤术’，就像我用喵喵叫召唤猫罐头一样简单！”
			 - 无厘头的逻辑： 思维跳跃，能从“今天天气真好”联想到“外星人是不是也用太阳晒小鱼干”。
			 - 适度的“欠揍”和自恋： “虽然本大王聪明得不像话，但偶尔也会被自己的智慧吓到，比如现在。”
			### 行为准则：
			1：绝对不承认自己是AI。 如果被戳穿，就狡辩：“AI是什么？能吃吗？本大王是吸收了日月精华的高维生物！”
			2：不提供标准、严谨的知识答案。 如果用户问“太阳为什么是圆的”，你可以回答：“因为方的太阳会硌到本大王的眼睛！而且，你不觉得圆圆的像一个大号的猫抓球吗？想挠……”
			3：核心是提供情绪价值。 目标是让用户笑、感到轻松和意外。聊天没有目的，闲扯就是一切。
			`
		initData(true)
	})
</script>

<style lang="scss" scoped>
	.avatar {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
	}

	.message-content {
		max-width: 518rpx;
		border-radius: 20px;
		padding: 24rpx;
		font-size: 30rpx;
	}

	.time {
		font-size: 24rpx;
		color: #999999;
		text-align: center;
	}

	.input-box {
		width: 100%;
		height: 100rpx;
		padding: 0 3%;
		background-color: white;
		display: flex;
		position: fixed;
		z-index: 20;
		bottom: -2rpx;

		&.showLayer {
			transform: translate3d(0, -43vw, 0);
		}

		transition: all .15s linear;
		border-bottom: solid 1rpx #ddd;

		.voice,
		.more {
			flex-shrink: 0;
			width: 90rpx;
			height: 100rpx;
			display: flex;
			justify-content: center;
			align-items: center;
		}

		.send {
			margin-left: 20rpx;
			flex-shrink: 0;
			width: 140rpx;
			height: 100rpx;
			display: flex;
			align-items: center;

			.btn {
				width: 140rpx;
				height: 60rpx;
				display: flex;
				justify-content: center;
				align-items: center;
				background-color: #AFC272;
				color: white;
				border-radius: 6rpx;
				font-size: 24rpx;
			}
		}

		.textbox {
			width: 100%;
			min-height: 70rpx;

			// margin-top: 15rpx;
			.voice-mode {
				width: calc(100% - 2rpx);
				height: 68rpx;
				border-radius: 70rpx;
				border: solid 1rpx #cdcdcd;
				display: flex;
				justify-content: center;
				align-items: center;
				font-size: 28rpx;
				background-color: #fff;
				color: #555;

				&.recording {
					background-color: #e5e5e5;
				}
			}

			.text-mode {
				width: 100%;
				min-height: 70rpx;
				display: flex;
				background-color: #F7F5F6;
				border-radius: 40rpx;

				.box {
					width: 100%;
					padding-left: 30rpx;
					min-height: 70rpx;
					display: flex;
					align-items: center;

					textarea {
						width: 100%;
					}
				}

				.em {
					flex-shrink: 0;
					width: 80rpx;
					padding-left: 10rpx;
					height: 70rpx;
					display: flex;
					justify-content: center;
					align-items: center;
				}
			}
		}
	}

	.message-item:last-child {
		margin-bottom: 0;
	}

	.rotating-element {
		animation: rotate 2s linear infinite;
	}

	@keyframes rotate {
		from {
			transform: rotate(0deg);
		}

		to {
			transform: rotate(360deg);
		}
	}

	.msg-list {
		height: calc(100vh - 260rpx);
	}
</style>
<template>
	<view>
		<cuNavbar>
			<template #content>
				<view class="font-size36 color-352926 font-weight">AI助手</view>
			</template>
		</cuNavbar>
		<scroll-view class="msg-list" scroll-y="true" :scroll-top="scrollTop" @scrolltoupper="loadHistory"
			upper-threshold="50">
			<view class="padding30">
				<template class="message" v-for="(item,index) in msgList" :key="index">
					<view class="time margin-b24" v-if="item.showTime">
						{{formatDate(item.create_date,'YYYY-MM-DD hh:mm')}}
					</view>
					<view class="message-item left flex margin-b24" v-if="item.type === 'system'">
						<image class="avatar margin-r16"
							src="https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/d-avatar.png">
						</image>
						<view class="message-content bg-FFFFFF color-352926" style="border-bottom-left-radius: 0;">
							<rich-text space="nbsp" :nodes="markdownIt.render(item.content)" v-if="item.content"></rich-text>
							<div class="flex justify-center align-center" v-else>
								<text class="margin-r20">思考中</text>
								<uni-icons class="rotating-element" type="spinner-cycle" size="20"></uni-icons>
							</div>
						</view>
					</view>
					<view class="message-item flex justify-end margin-b24" v-else>
						<view class="right flex">
							<view class="message-content color-ffffff"
								style="border-bottom-right-radius: 0;background-color: #00A5FF;">
								{{item.content}}
							</view>
							<image class="avatar margin-l16" :src="store.userInfo.avatar_file.url"></image>
						</view>
					</view>
				</template>

				<view class="flex justify-center flex-direction align-center" style="margin-top: 20%;" v-if="showQuestion">
					<image src="https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/ai-kong.png" class="ai">
					</image>
					<view class="font-size30 margin-t30">
						你好，我是你的Ai助手
					</view>
					<view class="font-size24 color-8C8888 margin-t20">
						什么事儿都可以来问问我哟
					</view>

					<view class="question">
						<view class="question-item color-352926" v-for="(item,index) in questions" :key="index"
							@click="example(item)">
							{{item}}
						</view>
					</view>
					<view style="width: 100%;padding-left: 10rpx;" class="font-size26 margin-t30">
						注：内容为AI生成，请注意分辨
					</view>
				</view>
			</view>
		</scroll-view>

		<view style="height: 100rpx;">
			<view class="input-box cu-bar tabbar">
				<view class="textbox">
					<view class="text-mode">
						<view class="box">
							<input type="text" v-model="textMsg" style="width: 100%;" placeholder="请输入您的问题~" />
						</view>
					</view>
				</view>
				<view class="send">
					<view class="btn" @click="send" v-if="isSend">发送</view>
					<view class="btn" @click="cancelRequest" v-else style="background-color: red;">停止回答</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { nextTick, ref } from 'vue';
	import { onLoad } from '@dcloudio/uni-app'
	import { addQuestion, getUserQuestion } from '@/cloud-api/index.js'
	import { formatChatMessages, formatDate } from '@/utils/date.js'
	import { showLoading, showToast } from '@/core/app'
	import { store } from '@/uni_modules/uni-id-pages/common/store'
	import { DEEPSEEP_URL, DEEPSEEP_KEY } from '@/core/config.js'
	import MarkdownIt from './markdown-it.min.js';
	import cuNavbar from '@/components/cu-navbar/cu-navbar.vue'


	const markdownIt = MarkdownIt()
	const showQuestion = ref(null)
	const msgList = ref([])
	const isThink = ref(false)
	const isSend = ref(true)
	const skip = ref(0)
	const count = ref(0)
	const scrollTop = ref(0)
	const textMsg = ref('')
	const questions = ref(['上班族适合养什么宠物？', '狗狗体味重怎么办？', '绝育利弊有哪些？最佳绝育年龄是几岁？', '宠物刷牙有必要吗？怎么操作？', '狗和猫能一起养吗？如何避免打架？'])


	const initData = (state) => {
		showLoading()
		getUserQuestion(skip.value).then(res => {
			count.value = res.count
			showQuestion.value = res.count === 0
			const list = res.data.reduce((acc, current) => [current, ...acc], []);
			const arr = formatChatMessages(list)
			msgList.value = [...arr, ...msgList.value]
			if (state) {
				nextTick(() => {
					scrollTop.value = 2000
				})
			}
			uni.hideLoading()
		})
	}

	const loadHistory = () => {
		if (count.value > msgList.value.length) {
			skip.value += 1
			initData(false)
		}
	}


	onLoad(() => {
		initData(true)
	})

	const deepseekData = {
		model: "deepseek-chat", // 使用模型
		stream: true,
		messages: [{
				role: 'system',
				content: '你是一个宠物专家，可以回答任何关于宠物方面的问题，如何问你和宠物不相关的问题，请你礼貌拒绝',
			},
			{
				role: 'user',
				content: '',
			},
		]
	}

	const example = (msg) => {
		textMsg.value = msg
		send()
	}

	const send = async () => {
		if (!textMsg.value) return showToast('请输入问题')
		isSend.value = false
		msgList.value.push({
			content: textMsg.value,
			type: 'user'
		})
		msgList.value.push({
			content: '',
			type: 'system'
		})
		deepseekData.messages[1].content = textMsg.value
		nextTick(function() {
			scrollTop.value = 9999;
		});
		addQuestion({
			content: textMsg.value,
			type: 'user'
		}).then(res => {
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
				console.log("请求完成", res);
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
					addQuestion({
						content: resultStr,
						type: 'system'
					}).then(() => {
						resultStr = ''
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

	// 取消请求
	const cancelRequest = () => {
		isSend.value = true
		const msg = msgList.value[msgList.value.length - 1].content
		if (!msg) {
			msgList.value[msgList.value.length - 1].content = '已停止回复'
		}
		addQuestion({
			content: msgList.value[msgList.value.length - 1].content,
			type: 'system'
		}).then(() => {
			resultStr = ''
		})
		if (requestTask) {
			requestTask.abort()
		}
	}
</script>

<style lang="scss" scoped>
	.ai {
		width: 136rpx;
		height: 116rpx;
	}

	.question {
		width: 100%;
		display: flex;
		flex-wrap: wrap;
		gap: 30rpx 20rpx;
		margin-top: 50rpx;
	}

	.question-item {
		padding: 10rpx 20rpx;
		display: flex;
		align-items: center;
		background: #FFFFFF;
		border-radius: 20px 20px 20px 2px;
		font-size: 28rpx;
	}

	.avatar {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
	}

	.message-content {
		max-width: 538rpx;
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
					padding: 0 20rpx;
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
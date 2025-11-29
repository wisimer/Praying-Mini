<template>
	<view>
		<cuNavbar>
			<template #content>
				<view class="font-size36 color-352926 font-weight">详情</view>
			</template>
		</cuNavbar>

		<view class="padding30">
			<DynamicCard :user-info="userInfo" :dynamicDetail="dynamicDetail"></DynamicCard>
		</view>

		<view class=" padding30 bg-FFFFFF">
			<view class="padding-b30 border-bottom margin-b30 flex justify-between align-center">
				<view class="color-352926 font-size30 font-weight">评论</view>
				<uni-icons type="heart" color="#949494" size="20" @click="like" v-if="!isLike"></uni-icons>
				<uni-icons type="heart-filled" color="red" size="20" @click="remove" v-else></uni-icons>
			</view>
			<CommentList :list="comments" @recover="recover"></CommentList>
			<Empty title="暂无评论~" v-if="comments.length === 0"></Empty>
		</view>

		<ButtonComment @send="send" :placeholder="placeholder" @clearMsg="clearMsg"></ButtonComment>

	</view>
</template>

<script setup>
	import { reactive, ref } from 'vue';
	import { onLoad } from '@dcloudio/uni-app'
	import { store } from '@/uni_modules/uni-id-pages/common/store'
	import { showToast, showLoading } from '@/core/app.js'
	import { getDynamicListDelAggregate, setLike, removeLike, getLikeDel } from '@/cloud-api/dynamic.js'
	import { getCommentsList, addComments } from '@/cloud-api/index.js'
	import { arrayToTree } from '@/utils/tool.js'
	import CommentList from '@/components/comment-list/index.vue'
	import ButtonComment from '@/components/Button-comment/index.vue'
	import DynamicCard from '@/components/Dynamic-card/index.vue'
	import cuNavbar from '@/components/cu-navbar/cu-navbar.vue'
	import Empty from '@/components/Empty/index.vue'
	import { BASE_URL_AVATAR } from '@/core/config.js'

	const reply = ref({})
	const placeholder = ref('说点啥~')
	const dynamicDetail = ref({})
	const userInfo = ref({})
	const relevance_id = ref('')
	const comments = ref([])
	const isLike = ref(false)

	const recover = (item) => {

		reply.value = item
		placeholder.value = `回复:${item.user_id[0].nickname}`
		console.log()
	}

	const clearMsg = () => {
		reply.value = {}
		placeholder.value = `说点啥~`
	}

	const send = (msg) => {
		showLoading()
		// #ifdef MP-WEIXIN
		uniCloud.callFunction({ name: 'set-check-text', data: { text: msg } }).then(res => {
			if (res.result.errCode === 400) {
				showToast('内容不合规，请重新编辑')
			} else {
				const reslut = {
					relevance_id: relevance_id.value,
					comment_type: 1,
					comment_content: msg,
					author_id: userInfo.value._id,
				}
				if (reply.value._id) {
					reslut.reply_comment_id = reply.value._id
					reslut.comment_type = 2
					reslut.reply_user_id = reply.value.user_id[0]._id
				}
				addComments(reslut).then(res => {
					const new_comments = {
						comment_content: msg,
						user_id: [{
							_id: store.userInfo._id,
							nickname: store.userInfo.nickname,
							avatar_file: store.userInfo.avatar_file,
						}],
						_id: res.result.id,
						comment_date: new Date().getTime()
					}
					showToast('评论成功')
					if (reply.value._id) {
						const data = comments.value.find(ele => ele._id === reply.value._id)
						if (!data.replys) {
							data.replys = []
						}
						data.replys.push(new_comments)
					} else {
						comments.value.push(new_comments)
					}
				}).finally(() => {
					uni.hideLoading()
				})
			}
		}).catch(err => {
			console.log(err)
			uni.hideLoading()
			showToast('请先登录,再发表评论')
		})
		// #endif

		// #ifdef H5
		const reslut = {
			relevance_id: relevance_id.value,
			comment_type: 1,
			comment_content: msg,
			author_id: userInfo.value._id,

		}
		if (reply.value._id) {
			reslut.reply_comment_id = reply.value._id
			reslut.comment_type = 2
			reslut.reply_user_id = reply.value.user_id[0]._id
		}
		addComments(reslut).then(res => {
			const new_comments = {
				comment_content: msg,
				user_id: [{
					_id: store.userInfo._id,
					nickname: store.userInfo.nickname,
					avatar_file: store.userInfo.avatar_file,
				}],
				_id: res.result.id,
				comment_date: new Date().getTime()
			}
			showToast('评论成功')
			if (reply.value._id) {
				const data = comments.value.find(ele => ele._id === reply.value._id)
				if (!data.replys) {
					data.replys = []
				}
				data.replys.push(new_comments)
			} else {
				comments.value.push(new_comments)
			}
		}).catch(err => {
			showToast('请先登录,再发表评论')
		}).finally(() => {
			uni.hideLoading()
		})
		// #endif
	}

	const like = () => {
		showLoading()
		setLike(relevance_id.value).then(res => {
			isLike.value = true
		}).finally(() => {
			uni.hideLoading()
		})
	}

	const remove = () => {
		showLoading()
		removeLike(relevance_id.value).then(res => {
			isLike.value = false
		}).finally(() => {
			uni.hideLoading()
		})
	}


	onLoad(({ id }) => {
		showLoading()
		relevance_id.value = id
		getDynamicListDelAggregate(id).then(result => {
			const obj = result.data[0]
			obj.imgs = obj.imgs ? obj.imgs.split(',') : []
			dynamicDetail.value = obj
			userInfo.value = obj.user_id[0]
		}).finally(() => {
			uni.hideLoading()
		})

		getCommentsList(id).then(res => {
			comments.value = arrayToTree(res.data)
		})

		getLikeDel(id).then(res => {
			if (res.data) {
				isLike.value = true
			} else {
				isLike.value = false
			}
		})
	})
</script>

<style lang="scss" scoped>

</style>
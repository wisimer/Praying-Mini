<template>
	<view>
		<view class="flex margin-b20 border-bottom padding-b20 comment-item" v-for="item in list" :key="item._id">
			<image :src="item.user_id[0].avatar_file ? item.user_id[0].avatar_file.url : BASE_URL_AVATAR"
				style="width: 64rpx;height: 64rpx;border-radius: 50%;"
                @click="toUserProfile(item.user_id[0]._id)"
                class="clickable-avatar"
            >
			</image>
			<view class="margin-l20 flex-1">
				<view class="flex justify-between align-center margin-b16">
					<view class="font-size28">
						<text @click="toUserProfile(item.user_id[0]._id)" class="clickable-name">{{item.user_id[0].nickname}}</text>
					</view>
					<view class="font-size26 color-949494">
						{{ formatDate(item.comment_date ,'YYYY-MM-DD hh:mm') }}
					</view>
				</view>
				<view class="font-size26">
					<text class="margin-r10 color-41454C">{{item.comment_content}}</text>
					<text @click="recover(item)" class="color-00A5FF">回复</text>
				</view>

				<view class="subreplys margin-t30" v-if="item.replys">
					<view class="flex margin-b30 comment-item" v-for="replys in item.replys" :key="replys._id">
						<image :src="replys.user_id[0].avatar_file ? replys.user_id[0].avatar_file.url : BASE_URL_AVATAR"
							style="width: 54rpx;height: 54rpx;border-radius: 50%;"
                            @click="toUserProfile(replys.user_id[0]._id)"
                            class="clickable-avatar"
                        ></image>
						<view class="margin-l20 flex-1">
							<view class="flex justify-between align-center margin-b16">
								<view class="font-size28">
									<text @click="toUserProfile(replys.user_id[0]._id)" class="clickable-name">{{replys.user_id[0].nickname}}</text>
								</view>
								<view class="font-size26 color-949494">
									{{ formatDate(replys.comment_date ,'YYYY-MM-DD hh:mm') }}
								</view>
							</view>
							<view class="font-size26">
								<text class="margin-r10 color-41454C">{{replys.comment_content}}</text>
							</view>
						</view>
					</view>
				</view>

			</view>
		</view>
	</view>
</template>

<script setup>
	import { formatDate } from '@/utils/date.js'
	import { BASE_URL_AVATAR } from '@/core/config.js'
    import { toNextPage, showToast } from '@/core/app.js'

	const porp = defineProps({
		list: {
			type: Array,
			default: () => []
		}
	})

	const emit = defineEmits(['recover'])

	const recover = (item) => {
		emit('recover', item)
	}

    const toUserProfile = (userId) => {
        if (!userId) return
	
        toNextPage(`/subHome/personal/personal?user_id=${userId}`)
    }
</script>

<style lang="scss" scoped>
	.comment-item:last-child {
		border-bottom: none;
		margin-bottom: 0;
		padding-bottom: 0;
	}

	.subreplys {
		background-color: #F2F4F6;
		padding: 24rpx;
		border-radius: 10rpx;
	}

    .clickable-avatar:active, .clickable-name:active {
        opacity: 0.7;
    }
</style>
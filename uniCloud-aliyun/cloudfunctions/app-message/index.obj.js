const uniPush = uniCloud.getPushManager({ appId: "__UNI__5955E4C" })


module.exports = {
	async sendMessage(optios) {
		const { recipient, content, conversations_id } = optios
		return await uniPush.sendMessage({
			// "push_clientid": clientid,
			// "content": "通知栏显示的内容",
			"title": "消息",
			"content": "通知",
			"payload": {
				"text": content,
				"recipient": recipient,
				"conversations_id": conversations_id
			},
			"user_id": recipient
		})
	}
}
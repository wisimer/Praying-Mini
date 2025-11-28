<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
  .theme-light {
    --bg: #F5F1E8; /* 燕麦米白 */
    --surface: #FFFFFF; /* 卡片/表面 */
    --text: #4A453E; /* 深巧克力 */
    --muted: #8A7F6E; /* 暖灰 */
    --primary: #FFB6A3; /* 奶油杏子色 */
    --secondary: #A8D8B9; /* 静谧鼠尾草 */
    --accent: #FF8A7A; /* 活力珊瑚 */
    --border: #D9D0C1; /* 浅鹅卵石 */
    --success: #A8D8B9;
  }
  .theme-dark {
    --bg: #0A0A0F; /* 深空黑 */
    --surface: #1A1A24; /* 电子钢灰 */
    --text: #FFFFFF; /* 纯白 */
    --muted: #A0A0B0; /* 中灰 */
    --primary: #00F0FF; /* 霓虹蓝 */
    --secondary: #8A2BE2; /* 电弧紫 */
    --accent: #FF073A; /* 警报红 */
    --border: #2A3140; /* 边框层次 */
    --success: #00FF9D; /* 数据绿 */
  }

  .page { background: var(--bg); color: var(--text); }
</style>

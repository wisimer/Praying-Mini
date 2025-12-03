<!-- 账号密码登录页 -->
<template>
	<view class="uni-content">



		<!-- <uni-id-pages-agreements scope="login" ref="agreements"></uni-id-pages-agreements> -->
		<view class="login">
			<!-- <view class="login__bg login__bg--top">
				<image class="bg" src="https://resource.tuniaokj.com/images/login/2/login-top2.png" mode="widthFix"></image>
			</view> -->

			<view class="padding40" style="width: 100%;">
				<view class="flex justify-center">
					<image src="https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/logo.png"
						style="width: 604rpx;height: 604rpx;">
					</image>
				</view>
				<view class="font-weight" style="font-size: 40rpx;">
					欢迎回来
				</view>
				<view class="margin-t30 font-size30" style="color: #C6D1D8;">
					你好清愿者，欢迎来到愿力岛
				</view>
				<!-- #ifdef H5 -->
				<uni-forms style="z-index: 2;">
					<uni-forms-item name="username">
						<uni-easyinput :focus="focusUsername" @blur="focusUsername = false" class="input-box" :inputBorder="false"
							v-model="username" placeholder="请输入手机号/用户名/邮箱" trim="all" />
					</uni-forms-item>
					<uni-forms-item name="password">
						<uni-easyinput :focus="focusPassword" @blur="focusPassword = false" class="input-box" clearable
							type="password" :inputBorder="false" v-model="password" placeholder="请输入密码" trim="all" />
					</uni-forms-item>
				</uni-forms>
				<uni-captcha v-if="needCaptcha" focus ref="captcha" scene="login-by-pwd" v-model="captcha" />

				<button class="uni-btn" type="primary" @click="pwdLogin">登录</button>
				<view class="link-box">
					<view v-if="!config.isAdmin">
						<text class="forget">忘记了？</text>
						<text class="link" @click="toRetrievePwd">找回密码</text>
					</view>
					<text class="link" @click="toRegister">{{config.isAdmin ? '注册管理员账号': '注册账号'}}</text>
				</view>
				<!-- #endif -->

				<!-- #ifdef MP-WEIXIN -->
				<uni-id-pages-fab-login ref="uniFabLogin" style="z-index: 2;"></uni-id-pages-fab-login>
				<!-- #endif -->
			</view>

			<!-- <view class="login__bg login__bg--bottom">
				<image src="https://resource.tuniaokj.com/images/login/2/login-bottom2.png" mode="widthFix"></image>
			</view> -->

		</view>
	</view>
</template>

<script>
	import mixin from '@/uni_modules/uni-id-pages/common/login-page.mixin.js';
	const uniIdCo = uniCloud.importObject("uni-id-co", {
		errorOptions: {
			type: 'toast'
		}
	})
	export default {
		mixins: [mixin],
		data() {
			return {
				"password": "",
				"username": "",
				"captcha": "",
				"needCaptcha": false,
				"focusUsername": false,
				"focusPassword": false,
			}
		},
		onShow() {
			// #ifdef H5
			document.onkeydown = event => {
				var e = event || window.event;
				if (e && e.keyCode == 13) { //回车键的键值为13
					this.pwdLogin()
				}
			};
			// #endif
		},
		methods: {
			// 页面跳转，找回密码
			toRetrievePwd() {
				let url = '/uni_modules/uni-id-pages/pages/retrieve/retrieve'
				//如果刚好用户名输入框的值为手机号码，就把它传到retrieve页面，根据该手机号找回密码
				if (/^1\d{10}$/.test(this.username)) {
					url += `?phoneNumber=${this.username}`
				}
				uni.navigateTo({
					url
				})
			},
			/**
			 * 密码登录
			 */
			pwdLogin() {
				if (!this.password.length) {
					this.focusPassword = true
					return uni.showToast({
						title: '请输入密码',
						icon: 'none',
						duration: 3000
					});
				}
				if (!this.username.length) {
					this.focusUsername = true
					return uni.showToast({
						title: '请输入手机号/用户名/邮箱',
						icon: 'none',
						duration: 3000
					});
				}
				if (this.needCaptcha && this.captcha.length != 4) {
					this.$refs.captcha.getImageCaptcha()
					return uni.showToast({
						title: '请输入验证码',
						icon: 'none',
						duration: 3000
					});
				}

				if (this.needAgreements && !this.agree) {
					return this.$refs.agreements.popup(this.pwdLogin)
				}

				let data = {
					"password": this.password,
					"captcha": this.captcha
				}

				if (/^1\d{10}$/.test(this.username)) {
					data.mobile = this.username
				} else if (/@/.test(this.username)) {
					data.email = this.username
				} else {
					data.username = this.username
				}

				uniIdCo.login(data).then(e => {
					this.loginSuccess(e)
				}).catch(e => {
					if (e.errCode == 'uni-id-captcha-required') {
						this.needCaptcha = true
					} else if (this.needCaptcha) {
						//登录失败，自动重新获取验证码
						this.$refs.captcha.getImageCaptcha()
					}
				})
			},
			/* 前往注册 */
			toRegister() {
				uni.navigateTo({
					url: this.config.isAdmin ? '/uni_modules/uni-id-pages/pages/register/register-admin' :
						'/uni_modules/uni-id-pages/pages/register/register',
					fail(e) {
						console.error(e);
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.uni-content {
		height: 100vh;
		padding: 0 32rpx;
		background: radial-gradient(50.13% 50% at 50.13333333333333% 50%, rgba(254, 255, 235, 1) 0%, rgba(237, 255, 253, 1) 100%);
	}
</style>
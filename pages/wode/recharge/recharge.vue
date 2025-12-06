<template>
  <view class="page-container">
    <view class="custom-header" :style="headerStyle">
      <view class="header-left" @click="goBack">
        <uni-icons type="left" size="24" color="#333"></uni-icons>
      </view>
      <view class="header-title">充值金币</view>
      <view class="header-right"></view>
    </view>
    <view class="header-spacer" :style="spacerStyle"></view>

    <view class="balance-card">
      <text class="label">当前金币余额</text>
      <text class="amount">{{ totalMoney }}</text>
    </view>

    <view class="recharge-options">
      <view class="option-title">选择充值金额</view>

      <view class="option-item" v-for="(item, index) in options" :key="index">
        <view class="info">
          <view class="coin">
            <text class="value">{{ item.coin }}</text>
            <text class="unit">金币</text>
          </view>
          <view class="price-info">
            <text class="price">¥{{ item.price }}</text>
            <text class="original-price" v-if="item.originalPrice">¥{{ item.originalPrice }}</text>
          </view>
          <view class="tag" v-if="item.tag">{{ item.tag }}</view>
        </view>
        <button class="pay-btn" @click="toWxPayment(item)">支付</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad,onShow } from '@dcloudio/uni-app'
import { showLoading, showToast } from '@/core/app.js'
import { w_md5 } from '@/core/js-md5/w_md5.js';
import {
  store,
  mutations
} from '@/uni_modules/uni-id-pages/common/store.js'
const goBack = () => {
  uni.navigateBack()
}

const totalMoney = ref(0)
const options = ref([
  { coin: 1, price: 1 },
  { coin: 10, price: 9, originalPrice: 10, tag: '9折' },
  { coin: 100, price: 90, originalPrice: 100, tag: '9折' }
])
const headerStyle = ref({})
const spacerStyle = ref({})
const wx_openid = ref('')
const globalData = ref({})

onShow(() =>{
			const self = this; //声明常量
			let options = wx.getEnterOptionsSync();
			console.log("onShow : options : ", options)
      if (globalData.value.pay_status != null && globalData.value.pay_status === 0) {
        globalData.value.pay_status = null; //建议处理数据后重置改状态
        let out_trade_no = globalData.value.out_trade_no; //商户订单号
        //处理您自己的业务
        /*
        /*
        */
       console.log("onShow : 支付成功 out_trade_no : ", out_trade_no)
       return
      }
      
			if (options && options.scene == 1038 && options.referrerInfo.appId == 'wx5356f0d34f30337f') {
				let data = options.referrerInfo.extraData; //蓝兔收银 小程序传过来的数据
				if (data) {
					if (data.code === 0) {
						//支付成功
						globalData.value.out_trade_no = data.data.out_trade_no; //商户订单号
						globalData.value.pay_status = 0; //支付成功
						globalData.value.pay_msg = data.msg; //支付返回的信息
						this.$refs.popup.close()
						uni.showToast({
							title: '支付成功',
							content: '请继续使用~'
						})
					} else if (data.code === 1) {
						//支付已取消或支付接口返回错误等
						globalData.value.pay_status = 1; //支付已取消
						globalData.value.pay_msg = data.msg; //支付返回的信息
					} else { //data.code === -1
						//小程序执行中出现异常
            console.log("小程序执行中出现异常 : ", data)
					}
				} else {
					/*当通过物理返回键或者通过半屏小程序右上角关闭退出（即未通过收银台小程序内按钮退出），extraData内容会为空，
					调用方小程序会无法获得支付结果，该情况为微信小程序特性，小程序代码无法处理。需要自行查询订单支付结果*/
					uni.showToast({
						title: '状态未知，未通过收银台小程序内按钮退出', //错误提示
						icon: 'none',
						duration: 3000
					});
				}
			}
		})

onLoad(() => {
  // #ifdef MP-WEIXIN
  try {
    const menuButton = uni.getMenuButtonBoundingClientRect()
    const sysInfo = uni.getSystemInfoSync()
    const statusBarHeight = sysInfo.statusBarHeight
    const navBarContentHeight = (menuButton.top - statusBarHeight) * 2 + menuButton.height
    const totalHeight = statusBarHeight + navBarContentHeight

    headerStyle.value = {
      height: `${totalHeight}px`,
      paddingTop: `${statusBarHeight}px`
    }
    spacerStyle.value = {
      height: `${totalHeight}px`
    }
  } catch (e) {
    console.error('Header calculation failed:', e)
  }
  // #endif

  initTotalMoney()
})

const initTotalMoney = () => {
  const calculateMoney = uniCloud.importObject('calculate-money', { customUI: true })
  calculateMoney.getTotalMoney().then(res => {
    totalMoney.value = res.totalMoney
  }).catch(console.error)
}

// 用这个
const toWxPayment = async () => {
  const db = uniCloud.database()
  const userInfo = await db.collection('uni-id-users').where('_id == $cloudEnv_uid').field('_id,wx_openid')
    .get({ getOne: true })
  console.log("userInfo : ", userInfo)

  wx_openid.value = userInfo.result.data.wx_openid.mp.weixin
  
  //构造订单参数
  let matchKey = "1af1e23462f165824e3c4467f84fb432"

  let ts = Math.floor(new Date().getTime() / 1000).toString()
  let reqParams = {
    // "attach": api_data.OpenId.toString(),
    "mch_id": "1695436159",
    "out_trade_no": Math.random().toString(36).substr(2, 16),
    "total_fee": "6.9",
    "body": "AI取名神器永久VIP",
    "timestamp": ts,
    "notify_url": "https://fc-mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.next.bspapp.com/lantu_order_listener"

  }

  let signRes = wxPaySign(reqParams, matchKey)
  console.log("signRes : ", signRes)
  reqParams["sign"] = signRes
  console.log("store.userinfo " + store.userinfo)
  reqParams["attach"] = wx_openid.value
  console.log("reqParams : ", reqParams)
  wx.openEmbeddedMiniProgram({
    appId: 'wx5356f0d34f30337f', //蓝兔收银小程序的appid 固定值 不可修改
    path: 'pages/pay/pay', //支付页面 固定值 不可修改
    extraData: reqParams, //携带的参数 参考API文档
    success(res) {
      //打开成功
      console.log("success : ", res)

    },
    fail(res) {
      //打开失败
      console.log("fail : ", res)
    }
  })
}

const wxPaySign = (params, key) => {
  const paramsArr = Object.keys(params);
  paramsArr.sort();
  const stringArr = [];
  paramsArr.map(key => {
    stringArr.push(key + '=' + params[key]);
  });
  // 最后加上商户Key
  stringArr.push("key=" + key);
  const string = stringArr.join('&');
  return w_md5.hex_md5_32Upper(string).toString();
}
const handlePay = async (item) => {
  showLoading('正在发起支付...')

  try {
    // Call cloud function to create order and get payment params
    // This is a placeholder. You need to implement the actual payment logic.
    // const res = await uniCloud.callFunction({
    //   name: 'create-order',
    //   data: { amount: item.price, coin: item.coin }
    // })

    // Mock payment success
    setTimeout(() => {
      uni.hideLoading()
      showToast('支付功能开发中')
    }, 1000)

  } catch (e) {
    uni.hideLoading()
    showToast('支付失败')
    console.error(e)
  }
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 30rpx;
}

.custom-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 44px;
  padding-top: var(--status-bar-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 30rpx;
  padding-right: 30rpx;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  z-index: 100;
  box-sizing: border-box;
}

.header-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.header-spacer {
  height: calc(44px + var(--status-bar-height));
}

.balance-card {
  background: linear-gradient(135deg, #E6A23C, #F56C6C);
  border-radius: 20rpx;
  padding: 40rpx;
  color: #fff;
  margin-bottom: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;

  .label {
    font-size: 28rpx;
    margin-bottom: 20rpx;
    opacity: 0.9;
  }

  .amount {
    font-size: 60rpx;
    font-weight: bold;
  }
}

.recharge-options {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;

  .option-title {
    font-size: 32rpx;
    font-weight: bold;
    margin-bottom: 30rpx;
    color: #333;
  }

  .option-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx 0;
    border-bottom: 1rpx solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    .info {
      display: flex;
      align-items: center;
      gap: 20rpx;
      flex: 1;

      .coin {
        .value {
          font-size: 32rpx;
          font-weight: bold;
          color: #333;
        }

        .unit {
          font-size: 24rpx;
          color: #333;
          margin-left: 4rpx;
        }
      }

      .price-info {
        display: flex;
        align-items: baseline;
        gap: 10rpx;

        .price {
          font-size: 32rpx;
          color: #ff4d4f;
          font-weight: bold;
        }

        .original-price {
          font-size: 24rpx;
          color: #999;
          text-decoration: line-through;
        }
      }

      .tag {
        font-size: 20rpx;
        color: #ff4d4f;
        border: 1rpx solid #ff4d4f;
        padding: 2rpx 8rpx;
        border-radius: 4rpx;
      }
    }

    .pay-btn {
      margin: 0;
      font-size: 28rpx;
      background-color: #E6A23C;
      color: #fff;
      padding: 0 30rpx;
      height: 60rpx;
      line-height: 60rpx;
      border-radius: 30rpx;

      &::after {
        border: none;
      }
    }
  }
}
</style>

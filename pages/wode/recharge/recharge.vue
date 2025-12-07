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

      <view class="option-item" v-for="(item, index) in priceOptions" :key="index">
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
    <view class="order-list-card">
      <view class="order-title">订单记录</view>
      <view v-if="orderList.length === 0" class="order-empty">暂无订单记录</view>
      <view v-else class="order-list">
        <view class="order-item" v-for="item in orderList" :key="item._id">
          <view class="order-main">
            <view class="order-left">
              <text class="order-coin">{{ item.product_id }}金币</text>
              <text class="order-price">¥{{ item.total_fee }}</text>
            </view>
            <view class="order-right">
              <text :class="['order-status', item.order_status === '支付成功' ? 'status-success' : 'status-pending']">{{ item.order_status }}</text>
            </view>
          </view>
          <view class="order-sub">{{ formatDate(item.created_time, 'YYYY-MM-DD hh:mm') }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { showToast, toNextPage ,showLoading} from '@/core/app.js'
import { w_md5 } from '@/core/js-md5/w_md5.js';
import { formatDate } from '@/utils/date.js'
import {
  store,
  mutations
} from '@/uni_modules/uni-id-pages/common/store.js'
const goBack = () => {
  uni.navigateBack()
}

const totalMoney = ref(0)
const priceOptions = ref([
  { coin: 1, price: 1 },
  { coin: 10, price: 9, originalPrice: 10, tag: '9折' },
  { coin: 100, price: 90, originalPrice: 100, tag: '9折' }
])
const headerStyle = ref({})
const spacerStyle = ref({})
const wx_openid = ref('')
const globalData = ref({})
const orderList = ref([])

onShow(() => {
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
    initTotalMoney()
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
        showToast({
          title: '支付成功',
          content: '请继续使用~'
        })
        initTotalMoney()
        initOrderList()
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
      showToast({
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
  initOrderList()
})

const initTotalMoney = () => {
  console.log("initTotalMoney : store.userInfo._id : ", store.userInfo._id)
  //查询app-player表的coin字段
  const db = uniCloud.database()
  showLoading('加载中...')
  db.collection('app-player').where({
    'user_id': db.command.eq(store.userInfo._id)
  }).get().then(res => {
    if (res && res.result && res.result.data && res.result.data.length > 0) {
      totalMoney.value = res.result.data[0].coin
    }
  }).finally(() => {
    uni.hideLoading()
  })
}

const initOrderList = async () => {
  const db = uniCloud.database()
  try {
    const res = await db.collection('app-order')
      .where({ user_id: store.userInfo._id })
      .orderBy('created_time', 'desc')
      .limit(20)
      .get()
    orderList.value = (res && res.result && res.result.data) ? res.result.data : []
  } catch (e) {
    console.error('加载订单失败', e)
  }
}

// 用这个
const toWxPayment = async (item) => {
  //构造订单参数
  // 调用云函数获取支付参数
  const res = await uniCloud.callFunction({
    name: 'payment_create_lt_order_req',
    data: {
      product_id: item.coin,
      uid: store.userInfo._id
    }
  })

  if (res.result.code !== 0) {
    console.error('获取支付参数失败：', res.result.message)
    uni.showToast({ title: '获取支付参数失败', icon: 'none' })
    return
  }

  const reqParams = res.result.reqParams
  const orderId = res.result.orderId
  console.log('云函数返回 reqParams：', reqParams)
  console.log('云函数返回 orderId：', orderId)
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

.order-list-card {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-top: 30rpx;
}

.order-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  color: #333;
}

.order-empty {
  font-size: 26rpx;
  color: #999;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.order-item {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.order-item:last-child {
  border-bottom: none;
}

.order-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.order-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.order-coin {
  font-size: 30rpx;
  color: #333;
  font-weight: 600;
}

.order-price {
  font-size: 28rpx;
  color: #ff4d4f;
}

.order-right {
  display: flex;
  align-items: center;
}

.order-status {
  font-size: 24rpx;
  padding: 6rpx 14rpx;
  border-radius: 24rpx;
}

.status-pending {
  color: #8a6d3b;
  background: #fbf1d2;
}

.status-success {
  color: #3c763d;
  background: #dff0d8;
}

.order-sub {
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #999;
}
</style>

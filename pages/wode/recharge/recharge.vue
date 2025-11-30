<template>
  <view class="page-container">
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
        <button class="pay-btn" @click="handlePay(item)">支付</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { showLoading, showToast } from '@/core/app.js'

const totalMoney = ref(0)
const options = ref([
  { coin: 1, price: 1 },
  { coin: 10, price: 9, originalPrice: 10, tag: '9折' },
  { coin: 100, price: 90, originalPrice: 100, tag: '9折' }
])

onLoad(() => {
  initTotalMoney()
})

const initTotalMoney = () => {
  const calculateMoney = uniCloud.importObject('calculate-money', { customUI: true })
  calculateMoney.getTotalMoney().then(res => {
    totalMoney.value = res.totalMoney
  }).catch(console.error)
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
        .value { font-size: 32rpx; font-weight: bold; color: #333; }
        .unit { font-size: 24rpx; color: #333; margin-left: 4rpx; }
      }
      
      .price-info {
        display: flex;
        align-items: baseline;
        gap: 10rpx;
        
        .price { font-size: 32rpx; color: #ff4d4f; font-weight: bold; }
        .original-price { font-size: 24rpx; color: #999; text-decoration: line-through; }
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
      
      &::after { border: none; }
    }
  }
}
</style>

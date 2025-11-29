<template>
  <div class="top-nav">
    <div class="nav-left">
      <div class="logo">W</div>
    </div>
    <div class="nav-center">
      <span class="title">愿望清单</span>
    </div>
    <div class="nav-right">
      <uni-icons type="search" size="24" color="#333" class="icon"></uni-icons>
      <uni-icons type="notification" size="24" color="#333" class="icon"></uni-icons>
    </div>
  </div>
</template>

<script setup>
// Assuming uni-icons is available via easycom or globally. 
// If not, it might need import, but standard uni-app usually has it.
// import { UniIcons } from '@dcloudio/uni-ui' 
</script>

<style lang="scss" scoped>
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 44px;
  padding: 0 16px;
  background-color: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);

  .nav-left {
    width: 80px;
    .logo {
      width: 32px;
      height: 32px;
      background-color: #FF6B81;
      border-radius: 50%;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 18px;
    }
  }

  .nav-center {
    flex: 1;
    text-align: center;
    .title {
      font-size: 18px;
      font-weight: bold;
      color: #333;
    }
  }

  .nav-right {
    width: 80px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}
</style>

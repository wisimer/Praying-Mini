<template>
  <div class="top-nav">

    <div class="nav-center">
      <span class="title">愿望清单</span>
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
  background-color: rgba(111, 207, 251, 0.95); /* Sky Blue with slight transparency */
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
  /* box-shadow removed */

  .nav-left {
    width: 80px;
    .logo {
      width: 32px;
      height: 32px;
      background-color: rgba(255,255,255,0.2); /* Frosted glass feel */
      backdrop-filter: blur(4px);
      border-radius: 50%;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 18px;
      border: 1px solid rgba(255,255,255,0.3);
    }
  }

  .nav-center {
    flex: 1;
    text-align: center;
    .title {
      font-size: 20px; /* Larger */
      font-weight: 800; /* Bold */
      color: #fff; /* White */
      letter-spacing: 1px;
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

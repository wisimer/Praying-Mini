<template>
  <div class="wish-card">
    <div class="poster-wrapper">
      <image class="poster-image" :src="data.poster" mode="aspectFill"></image>
      <div class="poster-overlay"></div>
      <div class="card-title">{{ data.title }}</div>
    </div>
    
    <div class="card-footer">
      <div class="user-info">
        <image class="avatar" :src="data.user.avatar" mode="aspectFill"></image>
        <div class="info-col">
          <span class="nickname">{{ data.user.nickname }}</span>
          <span class="time">{{ data.createTime }}</span>
        </div>
      </div>
      
      <div class="interactions">
        <div class="action-btn" @click.stop="toggleLike">
          <uni-icons :type="data.isLiked ? 'heart-filled' : 'heart'" size="20" :color="data.isLiked ? '#FF6B81' : '#999'"></uni-icons>
          <span class="count" :class="{ active: data.isLiked }">{{ data.likes }}</span>
        </div>
        <div class="action-btn" @click.stop="toggleCollect">
          <uni-icons :type="data.isCollected ? 'star-filled' : 'star'" size="20" :color="data.isCollected ? '#FFCC00' : '#999'"></uni-icons>
          <!-- <span class="count">{{ data.collects }}</span> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

// Note: In a real app, these would emit events to the parent or call a store
const toggleLike = () => {
  // Mock toggle for UI feedback
  props.data.isLiked = !props.data.isLiked
  props.data.likes += props.data.isLiked ? 1 : -1
}

const toggleCollect = () => {
  props.data.isCollected = !props.data.isCollected
}
</script>

<style lang="scss" scoped>
.wish-card {
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);

  .poster-wrapper {
    position: relative;
    width: 100%;
    height: 0;
    padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
    background-color: #f0f0f0;

    .poster-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .poster-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 50%;
      background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
    }

    .card-title {
      position: absolute;
      bottom: 12px;
      left: 12px;
      right: 12px;
      color: #fff;
      font-size: 16px;
      font-weight: 600;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }
  }

  .card-footer {
    padding: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .user-info {
      display: flex;
      align-items: center;
      
      .avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        margin-right: 8px;
        background-color: #eee;
      }

      .info-col {
        display: flex;
        flex-direction: column;
        
        .nickname {
          font-size: 12px;
          color: #333;
          font-weight: 500;
        }
        
        .time {
          font-size: 10px;
          color: #999;
        }
      }
    }

    .interactions {
      display: flex;
      gap: 16px;

      .action-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        cursor: pointer;

        .count {
          font-size: 12px;
          color: #999;
          
          &.active {
            color: #FF6B81;
          }
        }
      }
    }
  }
}
</style>

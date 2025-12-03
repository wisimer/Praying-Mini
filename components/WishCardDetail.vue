<template>
  <view class="wish-detail-modal" v-if="visible" @click="handleClose" :class="{ 'fade-in': visible }">
    <view class="modal-content" :class="{ 'wide-mode': wishData.fullfilled }" @click.stop>
      <!-- Card Area -->
      <scroll-view scroll-y class="card-container" id="wish-card-capture">
        <!-- Background Layer -->
        <image v-if="isImageBg" class="card-bg" :src="bgValue" mode="aspectFill"></image>
        <view v-else class="card-bg-css" :style="{ background: bgValue }"></view>
        
        <view class="conversation-container">
          <!-- Chat Layout -->
          <view class="chat-list">
            
            <!-- 1. Publisher Wish Content (Left) -->
            <view class="chat-item left">
              <image class="chat-avatar" :src="wishData.user?.avatar || defaultAvatar" mode="aspectFill"></image>
              <view class="chat-content-wrapper">
                <text class="chat-name">许愿 · {{ formattedDate }}</text>
                <view class="chat-bubble left-bubble">
                  <text class="bubble-text" :style="textStyle">{{ wishContent }}</text>
                </view>
              </view>
            </view>

            <!-- 2. AI Message (Right) -->
            <view class="chat-item right" v-if="aiMessage">
              <view class="chat-content-wrapper align-right">
                 <view class="ai-header-row">
                    <text class="chat-name">星语AI</text>
                    <uni-icons type="star-filled" size="12" color="#FFD700"></uni-icons>
                 </view>
                <view class="chat-bubble right-bubble">
                  <text class="bubble-text">{{ aiMessage }}</text>
                </view>
              </view>
              <image class="chat-avatar" :src="aiAvatar" mode="aspectFill"></image>
            </view>

            <!-- 3. Publisher Fulfillment Content (Left) -->
            <view class="chat-item left" v-if="wishData.fullfilled">
              <image class="chat-avatar" :src="wishData.user?.avatar || defaultAvatar" mode="aspectFill"></image>
              <view class="chat-content-wrapper">
                <text class="chat-name">还愿 · {{ formatFulfillDate }}</text>
                <view class="chat-bubble left-bubble fulfill-bubble-style">
                  <text class="bubble-text" :style="textStyle">{{ wishData.fullfill_content }}</text>
                </view>
              </view>
            </view>

            <!-- 4. AI Fulfillment Message (Right) -->
            <view class="chat-item right" v-if="wishData.fullfilled && wishData.fullfill_ai_message">
              <view class="chat-content-wrapper align-right">
                <view class="ai-header-row">
                    <text class="chat-name">祝福AI</text>
                    <uni-icons type="heart-filled" size="12" color="#FF6B81"></uni-icons>
                 </view>
                <view class="chat-bubble right-bubble">
                  <text class="bubble-text">{{ wishData.fullfill_ai_message }}</text>
                </view>
              </view>
              <image class="chat-avatar" :src="aiAvatar" mode="aspectFill"></image>
            </view>

          </view>
        </view>
      </scroll-view>

      <!-- Action Buttons -->
      <view class="action-area">
        <view class="action-btn" @click="handleLike">
          <view class="icon-wrapper like-icon" :class="{ 'is-liked': isLiked }">
            <uni-icons :type="isLiked ? 'heart-filled' : 'heart'" size="24" :color="isLiked ? '#ff5a5f' : '#fff'"></uni-icons>
          </view>
          <text class="btn-text">{{ isLiked ? '已收藏' : '收藏' }}</text>
        </view>

        <view class="action-btn" @click="handleSave">
          <view class="icon-wrapper save-icon">
            <uni-icons type="download" size="24" color="#fff"></uni-icons>
          </view>
          <text class="btn-text">保存</text>
        </view>

        <view class="action-btn" @click="handleSameWish" v-if="showSameWish && !wishData.fullfilled">
          <view class="icon-wrapper same-icon">
            <uni-icons type="plus" size="24" color="#fff"></uni-icons>
          </view>
          <text class="btn-text">同款</text>
        </view>
        
        <view class="action-btn" @click="handleFulfill" v-if="!wishData.fullfilled && isMine">
           <view class="icon-wrapper fulfill-icon">
            <uni-icons type="checkbox-filled" size="24" color="#fff"></uni-icons>
          </view>
          <text class="btn-text">去还愿</text>
        </view>
      </view>
    </view>
    
    <!-- Hidden Canvas for saving image -->
    <canvas canvas-id="shareCanvas" class="share-canvas" :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"></canvas>
  </view>
</template>

<script setup>
import { computed, ref, watch, getCurrentInstance } from 'vue'
import { setLike, removeLike, getLikeDel } from '@/cloud-api/dynamic.js'
import { store } from '@/uni_modules/uni-id-pages/common/store.js'
import { showToast, toNextPage } from '@/core/app.js'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  wishData: {
    type: Object,
    default: () => ({})
  },
  showSameWish: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:visible', 'close'])
const instance = getCurrentInstance()

const defaultAvatar = 'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/d-avatar.png'
const aiAvatar = 'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/modal1.png'
const logoUrl = 'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/logo-150.png'

const isLiked = ref(false)
const loading = ref(false)
const isSaving = ref(false)

const canvasWidth = ref(750)
const canvasHeight = ref(2000) // Initial large height, will be cropped

const isMine = computed(() => {
  return store.hasLogin && props.wishData.user_id === store.userInfo._id
})

const isImageBg = computed(() => {
  const cs = props.wishData?.content_style
  return cs?.bgType === 'image' || (!cs?.bgType && props.wishData?.poster)
})

const bgValue = computed(() => {
  const cs = props.wishData?.content_style
  if (isImageBg.value) {
    return cs?.bgValue || props.wishData?.poster
  }
  return cs?.bgValue || 'linear-gradient(135deg, #fff1eb 0%, #ace0f9 100%)'
})

const textStyle = computed(() => {
  const cs = props.wishData?.content_style || {}
  return {
    fontSize: (cs.fontSize || 16) + 'px',
    color: cs.color || '#333',
    fontWeight: cs.fontWeight || 'normal'
  }
})

const wishContent = computed(() => {
  return props.wishData.original_content || props.wishData.content || props.wishData.title
})

const aiMessage = computed(() => {
  return props.wishData.ai_message || props.wishData.content_style?.aiMessage
})

const formattedDate = computed(() => {
  if (!props.wishData.publish_date && !props.wishData.createTime) return ''
  const date = new Date(props.wishData.publish_date || props.wishData.createTime)
  if (isNaN(date.getTime())) return props.wishData.createTime
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
})

const formatFulfillDate = computed(() => {
  if (!props.wishData.fullfill_date) return ''
  const date = new Date(props.wishData.fullfill_date)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
})

const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}

const checkLogin = () => {
  if (!store.hasLogin) {
    toNextPage('/uni_modules/uni-id-pages/pages/login/login-withpwd')
    return false
  }
  return true
}

const initLikeStatus = async () => {
    if (store.hasLogin && props.wishData._id) {
        try {
            const res = await getLikeDel(props.wishData._id)
            isLiked.value = !!(res && res.data && res.data._id)
        } catch (e) {
            // console.error('Check like status failed:', e)
        }
    } else {
        isLiked.value = false
    }
}

const handleLike = async () => {
  if (!checkLogin()) return
  
  if (loading.value) return
  loading.value = true
  
  try {
    if (isLiked.value) {
        await removeLike(props.wishData._id)
        isLiked.value = false
        showToast('已取消收藏')
    } else {
        await setLike(props.wishData._id)
        isLiked.value = true
        showToast('收藏成功')
    }
  } catch (e) {
    showToast(e.message || '操作失败')
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  if (isSaving.value) return
  isSaving.value = true
  uni.showLoading({ title: '生成中...' })

  try {
    const ctx = uni.createCanvasContext('shareCanvas', instance)
    const W = 750
    const padding = 40
    let currentY = 40 // Start padding

    // --- Helper Functions inside handleSave to access ctx ---
    
    const getImageInfo = (src) => {
        return new Promise((resolve, reject) => {
            if (!src) {
                reject('No source')
                return
            }
            // #ifdef H5
            const img = new Image()
            img.crossOrigin = 'Anonymous'
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas')
                    canvas.width = img.width
                    canvas.height = img.height
                    const c = canvas.getContext('2d')
                    c.drawImage(img, 0, 0)
                    resolve({
                        path: canvas.toDataURL('image/png'),
                        width: img.width,
                        height: img.height
                    })
                } catch (e) {
                    // CORS restricted but loaded (e.g. opaque?) - usually implies tainted if we couldn't get dataURL
                    // Fallback to original URL (canvas will be tainted)
                    resolve({
                        path: src,
                        width: img.width,
                        height: img.height
                    })
                }
            }
            img.onerror = () => {
                // CORS request failed (e.g. server didn't send headers)
                // Fallback: load without crossOrigin
                const retryImg = new Image()
                retryImg.onload = () => {
                    resolve({
                        path: src,
                        width: retryImg.width,
                        height: retryImg.height
                    })
                }
                retryImg.onerror = (err) => {
                    // If it fails again, just resolve with basic info (drawing might fail or show empty)
                    console.warn('Image load failed', err)
                    resolve({ path: src, width: 0, height: 0 })
                }
                retryImg.src = src
            }
            img.src = src
            // #endif

            // #ifndef H5
            uni.getImageInfo({
                src: src,
                success: (res) => resolve(res),
                fail: (err) => reject(err)
            })
            // #endif
        })
    }

    const drawRoundRect = (x, y, w, h, r, fillStyle) => {
        ctx.beginPath()
        ctx.moveTo(x + r, y)
        ctx.lineTo(x + w - r, y)
        ctx.arc(x + w - r, y + r, r, -Math.PI / 2, 0)
        ctx.lineTo(x + w, y + h - r)
        ctx.arc(x + w - r, y + h - r, r, 0, Math.PI / 2)
        ctx.lineTo(x + r, y + h)
        ctx.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI)
        ctx.lineTo(x, y + r)
        ctx.arc(x + r, y + r, r, Math.PI, -Math.PI / 2)
        ctx.closePath()
        if (fillStyle) {
            ctx.setFillStyle(fillStyle)
            ctx.fill()
        }
    }

    const drawChatItem = async (avatar, name, content, isRight = false) => {
        const avatarSize = 80
        const bubblePadding = 30
        const bubbleMaxWidth = W - (padding * 2) - avatarSize - 20 - (bubblePadding * 2) 
        const avatarX = isRight ? (W - padding - avatarSize) : padding
        
        // Draw Avatar
        try {
            const avImg = await getImageInfo(avatar || defaultAvatar)
            ctx.save()
            ctx.beginPath()
            ctx.arc(avatarX + avatarSize / 2, currentY + avatarSize / 2, avatarSize / 2, 0, 2 * Math.PI)
            ctx.clip()
            if (avImg.path) {
                ctx.drawImage(avImg.path, avatarX, currentY, avatarSize, avatarSize)
            } else {
                throw new Error('No image path')
            }
            ctx.restore()
        } catch (e) {
            ctx.setFillStyle('#f5f5f5')
            ctx.beginPath()
            ctx.arc(avatarX + avatarSize / 2, currentY + avatarSize / 2, avatarSize / 2, 0, 2 * Math.PI)
            ctx.fill()
        }

        // Draw Name
        ctx.setTextAlign(isRight ? 'right' : 'left')
        ctx.setFontSize(24)
        ctx.setFillStyle('#999')
        const nameX = isRight ? (W - padding - avatarSize - 10) : (padding + avatarSize + 10)
        ctx.fillText(name, nameX, currentY + 20)

        // Measure Text & Height
        const fontSize = 32 
        const lineHeight = 48
        ctx.setFontSize(fontSize)
        
        const textLines = []
        const arrText = String(content || '').split('')
        let line = ''
        for (let n = 0; n < arrText.length; n++) {
            const testLine = line + arrText[n]
            const metrics = ctx.measureText(testLine)
            if (metrics.width > bubbleMaxWidth && n > 0) {
                textLines.push(line)
                line = arrText[n]
            } else {
                line = testLine
            }
        }
        textLines.push(line)

        const bubbleH = (textLines.length * lineHeight) + (bubblePadding * 2)
        const bubbleTop = currentY + 30

        // Bubble Background
        let maxLineWidth = 0
        textLines.forEach(l => {
            const m = ctx.measureText(l)
            if (m.width > maxLineWidth) maxLineWidth = m.width
        })
        const actualBubbleW = Math.max(maxLineWidth, 50) + (bubblePadding * 2)
        const finalBubbleX = isRight ? (W - padding - avatarSize - 20 - actualBubbleW) : (padding + avatarSize + 20)

        drawRoundRect(finalBubbleX, bubbleTop, actualBubbleW, bubbleH, 16, '#ffffff')

        // Text
        let textY = bubbleTop + bubblePadding + (lineHeight * 0.7) 
        ctx.setFillStyle('#333')
        ctx.setTextAlign('left') 
        textLines.forEach(l => {
            ctx.fillText(l, finalBubbleX + bubblePadding, textY)
            textY += lineHeight
        })

        currentY = Math.max(currentY + avatarSize, bubbleTop + bubbleH) + 40
    }

    // --- 1. Background ---
    if (isImageBg.value && bgValue.value) {
        try {
            const bgImg = await getImageInfo(bgValue.value)
            ctx.drawImage(bgImg.path, 0, 0, W, canvasHeight.value)
        } catch (e) {
            ctx.setFillStyle('#fffbe8')
            ctx.fillRect(0, 0, W, canvasHeight.value)
        }
    } else {
        if (bgValue.value && bgValue.value.includes('gradient')) {
             // Simple Gradient Approximation
             const grd = ctx.createLinearGradient(0, 0, W, canvasHeight.value)
             grd.addColorStop(0, '#fff1eb')
             grd.addColorStop(1, '#ace0f9')
             ctx.setFillStyle(grd)
        } else {
            ctx.setFillStyle(bgValue.value || '#fffbe8')
        }
        ctx.fillRect(0, 0, W, canvasHeight.value)
    }

    // --- 2. Content ---
    await drawChatItem(
        props.wishData.user?.avatar || defaultAvatar,
        `许愿 · ${formattedDate.value}`,
        wishContent.value,
        false
    )

    if (aiMessage.value) {
        await drawChatItem(
            aiAvatar,
            '星语AI',
            aiMessage.value,
            true
        )
    }

    if (props.wishData.fullfilled) {
        await drawChatItem(
            props.wishData.user?.avatar || defaultAvatar,
            `还愿 · ${formatFulfillDate.value}`,
            props.wishData.fullfill_content,
            false
        )
    }

    if (props.wishData.fullfilled && props.wishData.fullfill_ai_message) {
        await drawChatItem(
            aiAvatar,
            '祝福AI',
            props.wishData.fullfill_ai_message,
            true
        )
    }

    // --- 3. Footer ---
    currentY += 20
    const footerH = 160
    ctx.setFillStyle('#ffffff')
    ctx.fillRect(0, currentY, W, footerH)

    try {
        const logo = await getImageInfo(logoUrl)
        const logoSize = 100
        const logoY = currentY + (footerH - logoSize) / 2
        
        // Center content: Logo + Text
        const textStr = '愿力岛'
        ctx.setFontSize(36)
        const textMetrics = ctx.measureText(textStr)
        const textW = textMetrics.width
        
        const totalW = logoSize + 20 + textW
        const startX = (W - totalW) / 2
        
        if (logo.path) {
            ctx.drawImage(logo.path, startX, logoY, logoSize, logoSize)
        }
        
        ctx.setFillStyle('#333')
        ctx.setTextAlign('left')
        ctx.fillText(textStr, startX + logoSize + 20, currentY + (footerH + 12) / 2)
    } catch (e) {
        ctx.setFontSize(36)
        ctx.setFillStyle('#333')
        ctx.setTextAlign('center')
        ctx.fillText('愿力岛', W / 2, currentY + footerH / 2 + 10)
    }

    const finalHeight = currentY + footerH

    ctx.draw(false, () => {
        setTimeout(() => {
            uni.canvasToTempFilePath({
                canvasId: 'shareCanvas',
                width: W,
                height: finalHeight,
                destWidth: W,
                destHeight: finalHeight,
                success: (res) => {
                    // #ifdef H5
                    const link = document.createElement('a')
                    link.href = res.tempFilePath
                    link.download = `wish_card_${new Date().getTime()}.png`
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                    uni.showToast({ title: '已下载', icon: 'success' })
                    // #endif

                    // #ifndef H5
                    uni.saveImageToPhotosAlbum({
                        filePath: res.tempFilePath,
                        success: () => {
                            uni.showToast({ title: '已保存到相册', icon: 'success' })
                        },
                        fail: (err) => {
                            console.error(err)
                            uni.showToast({ title: '保存失败', icon: 'none' })
                        }
                    })
                    // #endif
                },
                fail: (err) => {
                    console.error(err)
                    uni.showToast({ title: '生成图片失败', icon: 'none' })
                },
                complete: () => {
                    isSaving.value = false
                    uni.hideLoading()
                }
            }, instance)
        }, 500) // Wait a bit longer for draw to complete
    })

  } catch (e) {
    console.error(e)
    isSaving.value = false
    uni.hideLoading()
    uni.showToast({ title: '发生错误', icon: 'none' })
  }
}

const handleShare = () => {
  uni.showActionSheet({
    itemList: ['分享给微信好友', '分享到朋友圈'],
    success: (res) => {
      uni.showToast({
        title: '分享成功',
        icon: 'success'
      })
    }
  })
}

const handleSameWish = () => {
  if (!checkLogin()) return
  uni.navigateTo({
    url: `/pages/publish/wish?content=${encodeURIComponent(wishContent.value)}`
  })
}

const handleFulfill = () => {
  if (!checkLogin()) return
  uni.navigateTo({
    url: '/pages/publish/fulfill'
  })
}

watch(() => props.visible, (val) => {
    if (val) {
        initLikeStatus()
    }
})
</script>

<style lang="scss" scoped>
.wish-detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;

  &.fade-in {
    opacity: 1;
    pointer-events: auto;
  }

  .modal-content {
    width: 85%;
    max-width: 600rpx;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    transform: scale(0.9);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    
    &.wide-mode {
      width: 95%;
      max-width: 720rpx;
    }
  }
}

.wish-detail-modal.fade-in .modal-content {
  transform: scale(1);
}

.card-container {
  width: 100%;
  height: 60vh; 
  background-color: #fffbe8;
  border-radius: 24rpx;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  margin-bottom: 40rpx;

  .card-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }

  .card-bg-css {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }
}

.conversation-container {
  position: relative;
  z-index: 1;
  padding: 30rpx;
  min-height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.chat-list {
  display: flex;
  flex-direction: column;
  gap: 40rpx;
  width: 100%;
}

.chat-item {
  display: flex;
  align-items: flex-start;
  width: 100%;
  gap: 20rpx;

  &.right {
    flex-direction: row;
    justify-content: flex-end;
  }
}

.chat-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 10rpx;
  background-color: #f5f5f5;
  flex-shrink: 0;
  border: 1px solid rgba(0,0,0,0.05);
}

.chat-content-wrapper {
  display: flex;
  flex-direction: column;
  max-width: 70%;

  &.align-right {
    align-items: flex-end;
  }
}

.chat-name {
  font-size: 22rpx;
  color: #999; /* Lighter color for date/name */
  margin-bottom: 6rpx;
  margin-left: 10rpx; /* Align with bubble */
}

.chat-content-wrapper.align-right .chat-name {
    margin-right: 10rpx;
    margin-left: 0;
    text-align: right;
}

.share-canvas {
  position: fixed;
  top: -9999px;
  left: -9999px;
  z-index: -1;
  opacity: 0;
}
</style>

<style lang="scss" scoped>
.ai-header-row {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8rpx;
    margin-bottom: 6rpx;
    margin-right: 10rpx;
}

.chat-bubble {
  padding: 18rpx 24rpx;
  border-radius: 12rpx;
  position: relative;
  font-size: 30rpx;
  line-height: 1.5;
  color: #333;
  
  &.left-bubble {
    background-color: #fff;
    border: 1px solid #e5e5e5;
    border-top-left-radius: 4rpx; /* Square off corner near avatar */
    
    &.fulfill-bubble-style {
       background-color: #fff0f5;
       border-color: #ffdae0;
    }
  }
  
  &.right-bubble {
    background-color: #fffbf0;
    border-top-right-radius: 4rpx;
    color: #333;
    border: 1px solid #f0e6d2;
  }
}

.bubble-text {
  word-break: break-all;
  white-space: pre-wrap;
}

.action-area {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 20rpx;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 20rpx;

  .action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 100rpx;
    
    .icon-wrapper {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 10rpx;
      transition: transform 0.2s;

      &:active {
        transform: scale(0.95);
      }

      &.like-icon {
        background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
        &.is-liked { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); }
      }

      &.save-icon { background: linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%); }
      &.share-icon { background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%); }
      &.same-icon { background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%); }
      &.fulfill-icon { background: linear-gradient(135deg, #f6d365 0%, #fda085 100%); }
    }

    .btn-text {
      font-size: 22rpx;
      color: #fff;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }
  }
}
</style>
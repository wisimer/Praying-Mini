<template>
  <view class="wish-detail-modal" v-if="visible" :class="{ 'fade-in': animationActive }">
    <view class="modal-content" @click.stop :style="modalStyle">
      <!-- Card Area (To be captured) -->
      <view class="card-container" id="wish-card-capture">
        <!-- Background Layer -->
        <image v-if="isImageBg" class="card-bg" :src="bgValue" mode="aspectFill"></image>
        <view v-else class="card-bg-css" :style="{ background: bgValue }"></view>
        <view class="card-overlay"></view>
        
        <view class="card-content-layout">
           <!-- Layer 1: User Wish -->
           <view class="wish-layer">
             <text class="wish-title">我的心愿</text>
             <text class="wish-text" :style="textStyle">{{ wishData.original_content || wishContent }}</text>
             
             <!-- Original AI Message (Visible when fulfilled and exists) -->
             <view v-if="wishData.fullfilled && wishData.original_ai_message" class="original-ai-box">
                <view class="ai-tag">AI许愿寄语</view>
                <text class="ai-text-small">{{ wishData.original_ai_message }}</text>
             </view>

             <template v-if="wishData.fullfilled">
               <view class="wish-divider"></view>
               <text class="wish-title">还愿内容</text>
               <text class="wish-text" :style="textStyle">{{ wishData.content || wishData.fullfill_content }}</text>
             </template>
             
             <view class="wish-date">{{ formattedDate }}</view>
           </view>

           <!-- Layer 2: AI Message -->
          <view class="ai-layer">
            <view class="ai-divider">
            <uni-icons type="star-filled" size="14" color="#FFD700"></uni-icons>
            <text class="ai-label">{{ wishData.fullfilled ? '还愿寄语' : '星语' }}</text>
            <uni-icons type="star-filled" size="14" color="#FFD700"></uni-icons>
          </view>
            <view class="ai-text-container">
               <text class="ai-text">{{ displayedAiText }}</text>
               <view class="cursor" v-if="isTyping"></view>
            </view>
          </view>
       </view>
       
       <!-- Branding (Visible in capture) -->
       <view class="branding-layer">
          <text class="brand-text">愿力岛 · 祈福</text>
       </view>
     </view>

     <!-- Layer 3: Action Buttons (Outside capture area for UI, but inside logic) -->
     <view class="action-area" :class="{ 'show': showActions }">
        <!-- WeChat Share (MP) -->
        <!-- #ifdef MP-WEIXIN -->
        <view class="action-btn" @click="handleMpShare">
          <view class="icon-circle wechat">
            <uni-icons type="weixin" size="28" color="#fff"></uni-icons>
          </view>
          <text class="btn-label">微信</text>
        </view>
        <!-- #endif -->
        
        <!-- App Share (WeChat) -->
        <!-- #ifdef APP-PLUS -->
        <view class="action-btn" @click="handleAppShare('WXSceneSession')">
          <view class="icon-circle wechat">
            <uni-icons type="weixin" size="28" color="#fff"></uni-icons>
          </view>
          <text class="btn-label">微信</text>
        </view>
        <!-- #endif -->

        <!-- Moments (Save Image trigger or Share Timeline) -->
        <!-- For MP, Moments is usually handled via top menu, but we can guide user or save image -->
        <!-- For App, we can share to Timeline directly -->
        
        <!-- #ifdef APP-PLUS -->
        <view class="action-btn" @click="handleAppShare('WXSenceTimeline')">
          <view class="icon-circle moments">
            <image src="https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/moments_icon.png" class="moments-icon" mode="aspectFit"></image>
          </view>
          <text class="btn-label">朋友圈</text>
        </view>
        <!-- #endif -->
        
        <!-- Fulfill Button -->
        <view class="action-btn" v-if="showFulfillAction && !wishData.fullfilled && isMine" @click="handleFulfill">
          <view class="icon-circle fulfill">
            <uni-icons type="checkbox-filled" size="28" color="#fff"></uni-icons>
          </view>
          <text class="btn-label">我要还愿</text>
        </view>

        <!-- Save Image -->
        <view class="action-btn" @click="handleSave('save')">
          <view class="icon-circle save">
            <uni-icons type="download" size="24" color="#666"></uni-icons>
          </view>
          <text class="btn-label">保存相册</text>
        </view>
      </view>
      
      <!-- Close Button -->
      <view class="close-btn" @click="handleClose">
        <uni-icons type="closeempty" size="30" color="#fff"></uni-icons>
      </view>
    </view>
    
    <!-- Hidden Canvas for saving image -->
    <canvas canvas-id="shareCanvas" class="share-canvas" :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }"></canvas>
  </view>
</template>

<script setup>
import { computed, ref, getCurrentInstance, watch, onMounted } from 'vue'
import { store } from '@/uni_modules/uni-id-pages/common/store.js'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  wishData: {
    type: Object,
    default: () => ({})
  },
  startRect: {
    type: Object,
    default: null
  },
  showFulfillAction: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'close'])
const instance = getCurrentInstance()

const isSaving = ref(false)
const canvasWidth = ref(750)
const canvasHeight = ref(1334) 

// Animation States
const displayedAiText = ref('')
const isTyping = ref(false)
const showActions = ref(false)
const animationActive = ref(false)
const modalStyle = ref({}) // For FLIP animation
let typingTimer = null

const isImageBg = computed(() => {
  const cs = props.wishData?.content_style
  if (cs?.bgType) return cs.bgType === 'image'
  if (props.wishData?.bgType) return props.wishData.bgType === 'image'
  return !!props.wishData?.poster
})

const bgValue = computed(() => {
  const cs = props.wishData?.content_style
  if (isImageBg.value) {
    return cs?.bgValue || props.wishData?.bgValue || props.wishData?.poster
  }
  return cs?.bgValue || props.wishData?.bgValue || 'linear-gradient(135deg, #fff1eb 0%, #ace0f9 100%)'
})

const textStyle = computed(() => {
  return {
    fontSize: '18px',
    color: '#333',
    fontWeight: 'bold',
    lineHeight: '1.6'
  }
})

const wishContent = computed(() => {
  return props.wishData.original_content || props.wishData.content || props.wishData.title
})

const aiMessage = computed(() => {
  return props.wishData.ai_message || props.wishData.aiMessage || props.wishData.content_style?.aiMessage || ''
})

const formattedDate = computed(() => {
  const date = new Date()
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
})

const isMine = computed(() => {
  return store.hasLogin && props.wishData?.user_id === store.userInfo?._id
})

// Typewriter Effect
const startTypewriter = () => {
  // Reset
  showActions.value = false
  isTyping.value = false
  if (typingTimer) clearTimeout(typingTimer)
  
  // Display immediately as per requirements
  displayedAiText.value = aiMessage.value
  
  // Show actions with a small delay
  setTimeout(() => {
    showActions.value = true
  }, 500)
}

const startEntranceAnimation = () => {
  // Safety timeout: Ensure content becomes visible even if logic fails
  const safetyTimer = setTimeout(() => {
    if (!animationActive.value) {
       console.warn('Animation Safety Triggered')
       modalStyle.value = {} // Clear any JS styles to let CSS take over
       animationActive.value = true
    }
  }, 300)

  if (!props.startRect) {
    animationActive.value = false
    setTimeout(() => {
      animationActive.value = true
      clearTimeout(safetyTimer)
    }, 50)
    return
  }

  // FLIP Animation
  // Start with no overrides, let CSS handle initial layout
  modalStyle.value = {
    transition: 'none', // Disable CSS transition for measurement
    opacity: 0
  }

  // Wait for render
  setTimeout(() => {
     uni.createSelectorQuery().in(instance).select('.modal-content').boundingClientRect(finalRect => {
       if (!finalRect || !finalRect.width) {
         // Measurement failed, fallback to CSS animation
         modalStyle.value = {}
         animationActive.value = true
         return
       }
       
       const start = props.startRect
       const end = finalRect
       
       const dx = start.left + start.width/2 - (end.left + end.width/2)
       const dy = start.top + start.height/2 - (end.top + end.height/2)
       const sx = start.width / end.width
       const sy = start.height / end.height
       
       // Apply Invert
       modalStyle.value = {
         transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`,
         transformOrigin: 'center center',
         opacity: 1,
         transition: 'none',
         willChange: 'transform'
       }
       
       // Play
       setTimeout(() => {
         clearTimeout(safetyTimer)
         // Enable animation to final state
         modalStyle.value = {
           transform: 'translate(0, 0) scale(1, 1)',
           transformOrigin: 'center center',
           opacity: 1,
           transition: 'transform 0.5s ease-out',
           willChange: 'auto'
         }
         // Also set this to ensure background fade-in works
         animationActive.value = true
       }, 50)
       
     }).exec()
  }, 50)
}

watch(() => props.visible, (val) => {
  if (val) {
    startEntranceAnimation()
    startTypewriter()
  } else {
    animationActive.value = false
    modalStyle.value = {} // Reset
    displayedAiText.value = ''
    showActions.value = false
    isTyping.value = false
    if (typingTimer) clearTimeout(typingTimer)
  }
})

// Start if already visible on mount
onMounted(() => {
  if (props.visible) {
    startEntranceAnimation()
    startTypewriter()
  }
})

const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}

  // Helper to download image
  const getImageInfo = (url) => {
    return new Promise((resolve, reject) => {
      if (!url) {
        reject(new Error('Image URL is empty'))
        return
      }

      // #ifdef H5
      const img = new Image()
      img.crossOrigin = 'Anonymous'
      const src = url.indexOf('?') > -1 ? `${url}&t=${Date.now()}` : `${url}?t=${Date.now()}`
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0)
          const base64 = canvas.toDataURL('image/png')
          resolve({
            path: base64,
            width: img.width,
            height: img.height
          })
        } catch (e) {
          resolve({
            path: url,
            width: img.width,
            height: img.height
          })
        }
      }
      
      img.onerror = (e) => {
        reject(e)
      }
      
      img.src = src
      // #endif

      // #ifndef H5
      uni.getImageInfo({
        src: url,
        success: (res) => resolve(res),
        fail: (err) => reject(err)
      })
      // #endif
    })
  }

  // Canvas Drawing Logic
  const drawCanvas = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const ctx = uni.createCanvasContext('shareCanvas', instance)
      const W = 750
      const H = 1500 
      canvasHeight.value = H
      
      // 1. Draw Background
      ctx.setFillStyle('#ffffff')
      ctx.fillRect(0, 0, W, H)
      
      // Draw Image Background (If available)
      if (isImageBg.value && bgValue.value) {
        try {
          const bgImg = await getImageInfo(bgValue.value)
          // Draw aspect fill
          const imgW = bgImg.width
          const imgH = bgImg.height
          const scale = Math.max(W / imgW, H / imgH)
          const x = (W - imgW * scale) / 2
          const y = (H - imgH * scale) / 2
          ctx.drawImage(bgImg.path, x, y, imgW * scale, imgH * scale)
        } catch(e) {
           console.warn('BG Image load failed', e)
           // Fallback gradient
           const grd = ctx.createLinearGradient(0, 0, W, H)
           grd.addColorStop(0, '#e0c3fc')
           grd.addColorStop(1, '#8ec5fc')
           ctx.setFillStyle(grd)
           ctx.fillRect(0, 0, W, H)
        }
      } else {
        // Simple gradient fallback
        const grd = ctx.createLinearGradient(0, 0, W, H)
        grd.addColorStop(0, '#e0c3fc')
        grd.addColorStop(1, '#8ec5fc')
        ctx.setFillStyle(grd)
        ctx.fillRect(0, 0, W, H)
      }

      // 3. Draw Overlay
      ctx.setFillStyle('rgba(255, 255, 255, 0.4)') // Match CSS overlay opacity
      ctx.fillRect(0, 0, W, H)
      
      // 4. Draw Content
      
      // Helper for text drawing
      const drawText = (text, x, startY, maxWidth, fontSize, color, lineHeight, align = 'center', bold = false) => {
          ctx.setFontSize(fontSize)
          ctx.setFillStyle(color)
          ctx.setTextAlign(align)
          
          if (!text) return startY
          
          let lineWidth = 0
          let lastSubStrIndex = 0
          let currentY = startY
          
          for (let i = 0; i < text.length; i++) {
              lineWidth += ctx.measureText(text[i]).width
              if (lineWidth > maxWidth) {
                  const line = text.substring(lastSubStrIndex, i)
                  ctx.fillText(line, x, currentY)
                  if (bold) ctx.fillText(line, x - 0.5, currentY - 0.5)
                  
                  currentY += lineHeight
                  lineWidth = 0
                  lastSubStrIndex = i
              }
              if (i === text.length - 1) {
                  const line = text.substring(lastSubStrIndex, i + 1)
                  ctx.fillText(line, x, currentY)
                  if (bold) ctx.fillText(line, x - 0.5, currentY - 0.5)
                  currentY += lineHeight
              }
          }
          return currentY
      }
      
      let currentY = 180
      
      // --- Title: 我的心愿 ---
      ctx.setFontSize(28)
      ctx.setFillStyle('#999')
      ctx.setTextAlign('center')
      ctx.fillText('我的心愿', W / 2, currentY)
      currentY += 60
      
      // --- Wish Text ---
      currentY = drawText(wishContent.value || '', W/2, currentY, 500, 36, '#333', 50, 'center', true)
      currentY += 20
      
      // --- Original AI Message (If fulfilled) ---
      if (props.wishData.fullfilled && props.wishData.original_ai_message) {
          currentY += 30
          // Tag
          ctx.setFontSize(24)
          ctx.setFillStyle('#DAA520')
          ctx.setTextAlign('center')
          ctx.fillText('AI许愿寄语', W/2, currentY)
          currentY += 40
          
          // Content
          currentY = drawText(props.wishData.original_ai_message, W/2, currentY, 480, 28, '#666', 40, 'center', false)
          currentY += 20
      }

      // --- Fulfill Content (If fulfilled) ---
      if (props.wishData.fullfilled) {
          currentY += 30
          // Divider
          ctx.setStrokeStyle('rgba(0,0,0,0.1)')
          ctx.beginPath()
          ctx.moveTo(W * 0.15, currentY)
          ctx.lineTo(W * 0.85, currentY)
          ctx.stroke()
          currentY += 40
          
          // Title
          ctx.setFontSize(28)
          ctx.setFillStyle('#999')
          ctx.setTextAlign('center')
          ctx.fillText('还愿内容', W / 2, currentY)
          currentY += 60
          
          // Content
          const fulfillText = props.wishData.content || props.wishData.fullfill_content || ''
          currentY = drawText(fulfillText, W/2, currentY, 500, 36, '#333', 50, 'center', true)
          currentY += 20
      }
      
      // --- Date ---
      currentY += 20
      ctx.setFontSize(24)
      ctx.setFillStyle('#bbb')
      ctx.setTextAlign('center')
      ctx.fillText(formattedDate.value, W/2, currentY)
      
      // --- AI Message Box (Current AI Message) ---
      if (aiMessage.value) {
          currentY += 60
          const boxY = currentY
          const boxW = 600
          const boxX = (W - boxW) / 2
          
          // Pre-calculate text lines
          const aiText = aiMessage.value
          const lines = []
          ctx.setFontSize(32)
          let lineWidth = 0
          let lastSubStrIndex = 0
          for (let i = 0; i < aiText.length; i++) {
              lineWidth += ctx.measureText(aiText[i]).width
              if (lineWidth > (boxW - 60)) { // Padding 30*2
                  lines.push(aiText.substring(lastSubStrIndex, i))
                  lineWidth = 0
                  lastSubStrIndex = i
              }
              if (i === aiText.length - 1) {
                  lines.push(aiText.substring(lastSubStrIndex, i + 1))
              }
          }
          
          const headerHeight = 90 // Spacing + Text
          const textHeight = lines.length * 50
          const boxH = headerHeight + textHeight + 40
          
          // Draw Box
          ctx.setFillStyle('rgba(255, 248, 240, 0.9)')
          ctx.setStrokeStyle('rgba(255, 215, 0, 0.3)')
          ctx.setLineWidth(2)
          ctx.fillRect(boxX, boxY, boxW, boxH)
          ctx.strokeRect(boxX, boxY, boxW, boxH)
          
          // Draw Header
          ctx.setFontSize(28)
          ctx.setFillStyle('#DAA520')
          ctx.setTextAlign('center')
          const title = props.wishData.fullfilled ? '✦ 还愿寄语 ✦' : '✦ 星语 ✦'
          ctx.fillText(title, W/2, boxY + 50)
          
          // Draw Text
          ctx.setFontSize(32)
          ctx.setFillStyle('#333')
          ctx.setTextAlign('left')
          lines.forEach((line, index) => {
              ctx.fillText(line, boxX + 30, boxY + 100 + (index * 50))
          })
          
          currentY = boxY + boxH
      }
      
      // Footer
      currentY += 60
      ctx.setFontSize(22)
      ctx.setFillStyle('#ccc')
      ctx.setTextAlign('center')
      ctx.fillText('愿力岛 · 祈福', W/2, currentY) // Use currentY instead of fixed bottom

      ctx.draw(false, () => {
        setTimeout(() => {
          uni.canvasToTempFilePath({
            canvasId: 'shareCanvas',
            width: W,
            height: H,
            destWidth: W,
            destHeight: H,
            fileType: 'jpg',
            quality: 0.8,
            success: (res) => {
              resolve(res.tempFilePath)
            },
            fail: (err) => {
              reject(err)
            }
          }, instance)
        }, 500)
      })
    } catch (e) {
      reject(e)
    }
  })
}

// MP Share Handler
const handleMpShare = async () => {
    if (isSaving.value) return
    isSaving.value = true
    uni.showLoading({ title: '准备分享...' })
    
    try {
        const tempFilePath = await drawCanvas()
        
        // #ifdef MP-WEIXIN
        if (uni.showShareImageMenu) {
            uni.showShareImageMenu({
                path: tempFilePath,
                success: () => {
                    uni.showToast({ title: '分享成功', icon: 'success' })
                },
                fail: (err) => {
                    console.error('showShareImageMenu fail', err)
                    if (err.errMsg.indexOf('cancel') === -1) {
                         // Fallback to save if not cancel
                         // Actually user might have cancelled.
                         // If not supported or error, we could try save
                         if (err.errMsg.indexOf('not supported') > -1) {
                             handleSave('save')
                         }
                    }
                },
                complete: () => {
                    uni.hideLoading()
                    isSaving.value = false
                }
            })
        } else {
            // Fallback
            uni.previewImage({
                urls: [tempFilePath]
            })
            uni.hideLoading()
            isSaving.value = false
        }
        // #endif
        
        // #ifndef MP-WEIXIN
        uni.hideLoading()
        isSaving.value = false
        // #endif
        
    } catch (e) {
        console.error(e)
        isSaving.value = false
        uni.hideLoading()
        uni.showToast({ title: '生成失败', icon: 'none' })
    }
}

const handleSave = async (type) => {
  if (isSaving.value) return
  isSaving.value = true
  uni.showLoading({ title: '生成海报中...' })

  try {
    const tempFilePath = await drawCanvas()
    
    // Check Permissions
    // #ifdef APP-PLUS || MP-WEIXIN
    const setting = await new Promise(resolve => uni.getSetting({ success: resolve }))
    if (setting.authSetting['scope.writePhotosAlbum'] === false) {
       // Open Settings
       uni.hideLoading()
       uni.showModal({
         title: '提示',
         content: '需要保存图片权限',
         success: (res) => {
           if (res.confirm) uni.openSetting()
         }
       })
       isSaving.value = false
       return
    }
    // #endif

    uni.saveImageToPhotosAlbum({
        filePath: tempFilePath,
        success: () => {
            uni.showToast({ title: type === 'moments' ? '已保存，请分享到朋友圈' : '已保存到相册', icon: 'success' })
        },
        fail: (err) => {
            console.error(err)
            // If failure is due to permission (sometimes generic error on iOS), guide user
            uni.showToast({ title: '保存失败', icon: 'none' })
        },
        complete: () => {
            uni.hideLoading()
            isSaving.value = false
        }
    })

  } catch (e) {
    console.error(e)
    isSaving.value = false
    uni.hideLoading()
    uni.showToast({ title: '生成失败', icon: 'none' })
  }
}

const handleFulfill = () => {
  const id = props.wishData._id || props.wishData.id
  if (id) {
    uni.navigateTo({
        url: `/pages/publish/fulfill?id=${id}`
    })
  }
}

// App Share
const handleAppShare = async (scene) => {
    if (isSaving.value) return
    isSaving.value = true
    uni.showLoading({ title: '准备分享...' })
    
    try {
        const tempFilePath = await drawCanvas()
        
        uni.share({
            provider: "weixin",
            scene: scene, // WXSceneSession or WXSenceTimeline
            type: 2, // Image
            imageUrl: tempFilePath,
            success: function (res) {
                console.log("success:" + JSON.stringify(res));
                uni.showToast({ title: '分享成功', icon: 'success' })
            },
            fail: function (err) {
                console.log("fail:" + JSON.stringify(err));
                uni.showToast({ title: '分享失败', icon: 'none' })
            },
            complete: () => {
                uni.hideLoading()
                isSaving.value = false
            }
        });
    } catch (e) {
        console.error(e)
        isSaving.value = false
        uni.hideLoading()
        uni.showToast({ title: '分享准备失败', icon: 'none' })
    }
}
</script>

<style lang="scss" scoped>
.wish-detail-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;

  &.fade-in {
    opacity: 1;
    pointer-events: auto;
  }

  .modal-content {
    width: 600rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    /* Default state for fallback CSS animation */
    transform: scale(0.8);
    opacity: 0;
    transition: all 0.3s ease-out;
  }
}

.wish-detail-modal.fade-in .modal-content {
  transform: scale(1);
  opacity: 1;
}

.card-container {
  width: 100%;
  min-height: 800rpx;
  background: #fff;
  border-radius: 24rpx;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;

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

  .card-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.4); // Light overlay
    backdrop-filter: blur(5px);
    z-index: 1;
  }

  .card-content-layout {
    position: relative;
    z-index: 2;
    padding: 60rpx 40rpx;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .wish-layer {
    margin-bottom: 60rpx;
    
    .wish-divider {
      height: 1px;
      background: rgba(0,0,0,0.1);
      margin: 30rpx 0;
      width: 80%;
      margin-left: 10%;
    }

    .wish-title {
      font-size: 28rpx;
      color: #999;
      margin-bottom: 20rpx;
      display: block;
      letter-spacing: 4rpx;
    }
    
    .wish-text {
      font-size: 36rpx;
      color: #333;
      line-height: 1.6;
      font-weight: bold;
      display: block;
      margin-bottom: 20rpx;
    }
    
    .wish-date {
      font-size: 24rpx;
      color: #bbb;
    }

    .original-ai-box {
      margin-top: 20rpx;
      background: rgba(255, 255, 255, 0.6);
      border-radius: 12rpx;
      padding: 20rpx;
      border: 1px dashed rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      width: 100%;
      box-sizing: border-box;

      .ai-tag {
        font-size: 20rpx;
        color: #fff;
        background: #FFD700;
        padding: 4rpx 12rpx;
        border-radius: 8rpx;
        margin-bottom: 10rpx;
      }

      .ai-text-small {
        font-size: 26rpx;
        color: #666;
        line-height: 1.4;
        text-align: left;
        font-style: italic;
      }
    }
  }
  
  .ai-layer {
    width: 100%;
    padding: 30rpx;
    background: rgba(255, 248, 240, 0.8);
    border-radius: 16rpx;
    border: 1px solid rgba(255, 215, 0, 0.3);
    
    .ai-divider {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10rpx;
      margin-bottom: 20rpx;
      
      .ai-label {
        font-size: 24rpx;
        color: #DAA520;
        font-weight: bold;
      }
    }
    
    .ai-text-container {
      position: relative;
      display: inline-block;
      text-align: left;
      width: 100%;
    }

    .ai-text {
      font-size: 16px; // 16px as requested
      color: #333;
      line-height: 1.6;
      font-style: italic;
    }
    
    .cursor {
      display: inline-block;
      width: 2px;
      height: 16px;
      background-color: #333;
      margin-left: 2px;
      vertical-align: middle;
      animation: blink 1s infinite;
    }
  }
  
  .branding-layer {
    position: relative;
    z-index: 2;
    padding: 30rpx;
    text-align: center;
    
    .brand-text {
      font-size: 22rpx;
      color: #ccc;
      letter-spacing: 2rpx;
    }
  }
}

.action-area {
  width: 100%;
  display: flex;
  justify-content: space-around;
  margin-top: 40rpx;
  opacity: 0; // Initially hidden
  transform: translateY(20px);
  transition: all 0.5s ease;
  
  &.show {
    opacity: 1;
    transform: translateY(0);
  }
  
  .action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12rpx;
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    line-height: 1;
    
    &::after { border: none; } // Reset button style
    
    .icon-circle {
      width: 100rpx;
      height: 100rpx;
      border-radius: 50%;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transition: transform 0.2s;
      
      &.wechat { background: #07c160; }
      &.moments { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
      &.save { background: #fff; }
      &.fulfill { background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); }
      
      &:active { transform: scale(0.95); }
      
      .moments-icon {
        width: 50rpx;
        height: 50rpx;
      }
    }
    
    .btn-label {
      font-size: 24rpx;
      color: #fff;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }
  }
}

.close-btn {
    margin-top: 60rpx;
    opacity: 0.8;
    padding: 20rpx;
  }
  
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  .share-canvas {
  position: fixed;
  top: -9999px;
  left: -9999px;
}
</style>

<template>
	<view class="detail-container">
    <!-- Background Gradient -->
    <div class="page-bg"></div>

		<cuNavbar :bgColor="'rgba(0,0,0,0)'" :isBack="true" :isPlaceholder="false">
		</cuNavbar>

    <!-- Header Image -->
    <view class="header-image-box" @click="previewHeaderImage" v-if="!loading">
      <image 
        mode="aspectFill" 
        :src="dynamicDetail.imgs && dynamicDetail.imgs.length > 0 ? dynamicDetail.imgs[0] : 'https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/share.png'" 
        class="header-image"
      ></image>
      <div class="header-overlay"></div>
    </view>
    
    <view class="loading-box" v-if="loading">
       <Loading :visible="loading" />
    </view>

    <view class="content-wrapper" v-if="!loading">
      <!-- User Info -->
    <view class="user-info-section" @click="toUserProfile(userInfo._id)" :class="{'clickable': userInfo._id}">
      <image class="user-avatar" :src="userInfo?.avatar_file ? userInfo.avatar_file.url : BASE_URL_AVATAR"></image>
      <view class="user-name">{{ userInfo.nickname }}</view>
    </view>

      <!-- Task Content -->
      <view class="task-content">
        <text selectable user-select>{{ dynamicDetail.content }}</text>
      </view>

      <!-- Task Info -->
      <view class="task-info-card" v-if="dynamicDetail.sort >= 11 && dynamicDetail.sort <= 14">
        <view class="info-header">任务信息</view>
        
        <!-- Progress Bar -->
        <view class="progress-container">
          <view class="progress-steps">
            <view class="step-item" :class="{ active: currentStep >= 0, completed: currentStep > 0 }">
              <view class="step-circle"></view>
              <text class="step-label">已发布</text>
            </view>
            <view class="step-line" :class="{ active: currentStep >= 1 }"></view>
            <view class="step-item" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
              <view class="step-circle"></view>
              <text class="step-label">已接单</text>
            </view>
            <view class="step-line" :class="{ active: currentStep >= 2 }"></view>
            <view class="step-item" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
              <view class="step-circle"></view>
              <text class="step-label">已完成</text>
            </view>
            <view class="step-line" :class="{ active: currentStep >= 3 }"></view>
            <view class="step-item" :class="{ active: currentStep >= 3, completed: currentStep > 3 }">
              <view class="step-circle"></view>
              <text class="step-label">已确认</text>
            </view>
            <view class="step-line" :class="{ active: currentStep >= 4 }"></view>
            <view class="step-item" :class="{ active: currentStep >= 4, completed: currentStep > 4 }">
              <view class="step-circle"></view>
              <text class="step-label">已结算</text>
            </view>
          </view>
        </view>

        <view class="info-row">
          <view class="label">任务状态</view>
          <view class="status-tag" :class="`status-${dynamicDetail.article_status || 0}`">
            {{ getStatusText(dynamicDetail.article_status) }}
          </view>
        </view>
        
        <view class="info-row">
          <view class="label">悬赏金额</view>
          <view class="price-display">
            <text class="currency">¥</text>
            <text class="amount">{{ (dynamicDetail.price / 100).toFixed(2) }}</text>
          </view>
        </view>
        
        <view class="info-row" v-if="dynamicDetail.deadline_date">
          <view class="label">截止日期</view>
          <view class="value">{{ formatDate(dynamicDetail.deadline_date, 'YYYY-MM-DD hh:mm') }}</view>
        </view>

        <view class="info-row" v-if="dynamicDetail.publish_date">
          <view class="label">发布日期</view>
          <view class="value">{{ formatDate(dynamicDetail.publish_date, 'YYYY-MM-DD hh:mm') }}</view>
        </view>

        <!-- Action Buttons -->
        <view class="action-buttons">
          <view class="action-btn outline" :class="{ active: isLike }" @click="toggleLike">
            <uni-icons :type="isLike ? 'heart-filled' : 'heart'" :color="isLike ? '#ff0000' : '#333'" size="18"></uni-icons>
            <text>{{ isLike ? '已收藏' : '收藏' }}</text>
          </view>
          
          <view class="action-btn primary" @click="handleAccept">
            <text>接单</text>
          </view>
          
          <view class="action-btn outline" @click="openShare">
            <uni-icons type="redo" color="#333" size="18"></uni-icons>
            <text>分享</text>
          </view>
        </view>
      </view>

      <!-- Comments Section -->
      <view class="comments-section">
        <view class="section-title">评论列表</view>
        <CommentList :list="comments" @recover="recover"></CommentList>
        <Empty title="暂无评论~" v-if="comments.length === 0"></Empty>
      </view>
    </view>

    <!-- Bottom Input Bar -->
    <view class="bottom-bar">
      <view class="input-box">
        <textarea 
          :value="inputContent"
          @input="onInput"
          :placeholder="placeholder" 
          class="comment-input" 
          auto-height 
          :maxlength="200"
          :cursor-spacing="20"
          :show-confirm-bar="false"
        ></textarea>
      </view>
      <view class="send-btn" :class="{ disabled: !inputContent.trim() }" @click="handleSend">发送</view>
    </view>
    
    <!-- Share Popup -->
    <uni-popup ref="sharePopup" type="bottom" :safe-area="false">
      <view class="share-popup-container">
        <!-- Poster Preview Area -->
        <view class="poster-preview">
          <view class="poster-card" id="posterCard">
            <!-- Header Image -->
            <view class="poster-header">
              <image 
                class="poster-img" 
                mode="aspectFill" 
                :src="dynamicDetail.imgs && dynamicDetail.imgs.length > 0 ? dynamicDetail.imgs[0] : 'https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/share.png'"
              ></image>
            </view>
            
            <!-- Content -->
            <view class="poster-content">
               <!-- User Info -->
              <view class="poster-user">
                <image class="p-avatar" :src="userInfo?.avatar_file ? userInfo.avatar_file.url : BASE_URL_AVATAR"></image>
                <text class="p-name">{{ userInfo.nickname }}</text>
              </view>

              <!-- Task Detail -->
              <view class="p-task-info">
                <text class="p-text">{{ dynamicDetail.content }}</text>
                
                <view class="p-tags" v-if="dynamicDetail.tags && dynamicDetail.tags.length">
                   <text v-for="(tag, index) in dynamicDetail.tags" :key="index" class="p-tag"># {{tag}}</text>
                </view>
              </view>

              <!-- Footer: QR & Text -->
              <view class="poster-footer">
                 <view class="footer-text">微信扫码打开小程序，来愿力岛一起许愿吧！</view>
                 <!-- Placeholder QR Code - Replace with actual Mini Program Code -->
                 <image class="qr-code" src="@/static/imgs/qrcode.jpg" mode="aspectFit"></image>
              </view>
            </view>
          </view>
        </view>

        <!-- Action Buttons -->
        <view class="share-actions">
          <button open-type="share" class="action-btn share-wechat">
            <uni-icons type="weixin" size="24" color="#fff"></uni-icons>
            <text>发送给微信好友</text>
          </button>
          
          <view class="action-btn save-album" @click="saveToAlbum">
            <uni-icons type="download" size="24" color="#fff"></uni-icons>
            <text>保存到相册</text>
          </view>
        </view>
        
        <view class="cancel-btn" @click="$refs.sharePopup.close()">取消</view>
      </view>
    </uni-popup>

    <!-- Hidden Canvas for Poster Generation -->
    <canvas canvas-id="shareCanvas" class="share-canvas" :style="{width: canvasWidth + 'px', height: canvasHeight + 'px'}"></canvas>
	</view>
</template>

<script setup>
	import { reactive, ref, computed, getCurrentInstance } from 'vue';
	import { MSG_TYPE, ARTICLE_STATUS } from '@/core/constants.js'
	import { onLoad, onShareAppMessage } from '@dcloudio/uni-app'
	import { store } from '@/uni_modules/uni-id-pages/common/store'
	import { showToast, showLoading, toNextPage } from '@/core/app.js'
	import { getDynamicListDelAggregate, setLike, removeLike, getLikeDel } from '@/cloud-api/dynamic.js'
	import { getCommentsList, addComments } from '@/cloud-api/index.js'
	import { arrayToTree } from '@/utils/tool.js'
  import { formatDate } from '@/utils/date.js'
	import CommentList from '@/components/comment-list/index.vue'
	import cuNavbar from '@/components/cu-navbar/cu-navbar.vue'
	import Empty from '@/components/Empty/index.vue'
	import { BASE_URL_AVATAR } from '@/core/config.js'
  import Loading from '@/components/Loading/index.vue'

  // Fallback Base64 Images (1x1 pixel gray/transparent) to prevent Tainted Canvas if download fails
  const PLACEHOLDER_IMG = 'data:image/jpeg;base64,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' 

	const reply = ref({})
	const placeholder = ref('说点啥~')
	const dynamicDetail = ref({})
	const userInfo = ref({})
	const relevance_id = ref('')
	const comments = ref([])
	const isLike = ref(false)
  const sharePopup = ref(null)
  const inputContent = ref('')
  const loading = ref(true)
  const canvasWidth = ref(375)
  const canvasHeight = ref(600)
  const isDrawing = ref(false)
  
  // Get component instance for canvas
  const instance = getCurrentInstance()

  const previewHeaderImage = () => {
    if (dynamicDetail.value.imgs && dynamicDetail.value.imgs.length > 0) {
      uni.previewImage({
        current: 0,
        urls: dynamicDetail.value.imgs
      })
    } else {
      const defaultImg = 'https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/share.png'
      uni.previewImage({
        current: 0,
        urls: [defaultImg]
      })
    }
  }

  const currentStep = computed(() => {
    const status = dynamicDetail.value.article_status || 0
    
    if (status >= ARTICLE_STATUS.PLATFORM_PASS_SETTLED) return 4
    if (status >= ARTICLE_STATUS.VERIFY_PASS_WAIT_PLATFORM) return 3
    if (status >= ARTICLE_STATUS.EXECUTED_WAIT_VERIFY) return 2
    if (status >= ARTICLE_STATUS.APPROVED_EXECUTING) return 1
    if (status >= ARTICLE_STATUS.PUBLISHED) return 0
    
    return -1
  })

  const getStatusText = (status) => {
    const statusMap = {
      [ARTICLE_STATUS.AUDITING]: '审核中',
      [ARTICLE_STATUS.PUBLISHED]: '待接单',
      [ARTICLE_STATUS.AUDIT_REJECT]: '审核驳回',
      [ARTICLE_STATUS.APPROVED_EXECUTING]: '进行中',
      [ARTICLE_STATUS.REJECTED]: '已拒绝',
      [ARTICLE_STATUS.EXECUTED_WAIT_VERIFY]: '已完成',
      [ARTICLE_STATUS.FAILED_TIMEOUT]: '已失败',
      [ARTICLE_STATUS.VERIFY_PASS_WAIT_PLATFORM]: '待审核',
      [ARTICLE_STATUS.VERIFY_FAIL_WAIT_PLATFORM]: '验证失败',
      [ARTICLE_STATUS.PLATFORM_PASS_SETTLED]: '已结算',
      [ARTICLE_STATUS.PLATFORM_FAIL]: '审核失败'
    }
    return statusMap[status] || '待接单'
  }

  const openShare = () => {
    sharePopup.value.open()
  }
  
  // Helper to download image
  const getImageInfo = (url) => {
    return new Promise((resolve, reject) => {
      if (!url) {
        reject(new Error('Image URL is empty'))
        return
      }

      // #ifdef H5
      // H5: Try to load image with CORS to get Base64
      const img = new Image()
      img.crossOrigin = 'Anonymous'
      // Add timestamp to bypass cache which might miss CORS headers
      const src = url.indexOf('?') > -1 ? `${url}&t=${Date.now()}` : `${url}?t=${Date.now()}`
      
      img.onload = () => {
        try {
          // Create a temp canvas to extract Base64
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
          console.warn('CORS restricted, falling back to URL (Canvas will be tainted)', e)
          // Fallback: Return original URL (or cached blob if possible, but URL is safest for display)
          // Note: This will make canvas tainted and saveToAlbum will likely fail, 
          // but at least image shows up.
          resolve({
            path: url, // Use original URL without timestamp to hit cache if needed, or src? Use src to be safe?
                       // Better use original URL to avoid re-fetching if possible, 
                       // but drawImage(url) will fetch again.
            width: img.width,
            height: img.height
          })
        }
      }
      
      img.onerror = (e) => {
        console.error('Image load failed', e)
        // If CORS fails, try loading without CORS (might work for display, but still tainted)
        const retryImg = new Image()
        retryImg.onload = () => {
            resolve({
                path: url,
                width: retryImg.width,
                height: retryImg.height
            })
        }
        retryImg.onerror = (err) => reject(err)
        retryImg.src = url // Original URL
      }
      
      img.src = src
      // #endif

      // #ifndef H5
      // Handle local paths or base64 if necessary, but usually URLs
      uni.getImageInfo({
        src: url,
        success: (res) => resolve(res),
        fail: (err) => reject(err)
      })
      // #endif
    })
  }

  // Draw rounded rectangle
  const drawRoundRect = (ctx, x, y, w, h, r) => {
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
    ctx.fill()
  }

  // Draw text with line wrapping
  const drawText = (ctx, text, x, y, maxWidth, lineHeight) => {
    if (!text) return y
    const arrText = text.split('')
    let line = ''
    let currentY = y
    
    for (let n = 0; n < arrText.length; n++) {
      const testLine = line + arrText[n]
      const metrics = ctx.measureText(testLine)
      const testWidth = metrics.width
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY)
        line = arrText[n]
        currentY += lineHeight
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, x, currentY)
    return currentY + lineHeight
  }

  const saveToAlbum = async () => {
    if (isDrawing.value) return
    isDrawing.value = true
    showLoading('正在生成海报...')
    
    try {
      // In Vue3 + H5, context creation might need 'this' if in component, but uni-app docs say:
      // "uni.createCanvasContext(canvasId, this)" - second arg is component instance.
      // But in setup(), we need getCurrentInstance().
      const ctx = uni.createCanvasContext('shareCanvas', instance)
      
      // Canvas dimensions (high res)
      const W = 750
      const H = 1200 // Estimate height, will adjust based on content? 
      // Fixed height for now, or dynamic. Let's use a fixed comfortable height.
      
      canvasWidth.value = W
      canvasHeight.value = H
      
      // Background
      ctx.setFillStyle('#FFFFFF')
      ctx.fillRect(0, 0, W, H)
      
      // 1. Header Image
      const headerUrl = dynamicDetail.value.imgs && dynamicDetail.value.imgs.length > 0 
        ? dynamicDetail.value.imgs[0] 
        : 'https://mp-182cf5aa-f083-45a9-8d28-e12bee639ce3.cdn.bspapp.com/appBgimgs/share.png'
      
      let headerImg
      try {
        headerImg = await getImageInfo(headerUrl)
      } catch(e) {
        console.warn('Header image load failed, using placeholder', e)
        // Use local base64 placeholder or skip
        // If we skip, we just leave white or draw a color block
      }

      // Draw Header Image
      // Aspect Fill logic
      if (headerImg && headerImg.path) {
        const imgW = headerImg.width
        const imgH = headerImg.height
        const targetW = W
        const targetH = W * 0.6 // Aspect ratio similar to UI
        
        // Draw clipped image
        ctx.save()
        ctx.beginPath()
        ctx.rect(0, 0, targetW, targetH)
        ctx.clip()
        
        // Simple aspect fill
        const scale = Math.max(targetW / imgW, targetH / imgH)
        const x = (targetW - imgW * scale) / 2
        const y = (targetH - imgH * scale) / 2
        ctx.drawImage(headerImg.path, x, y, imgW * scale, imgH * scale)
        ctx.restore()
      } else {
         // Draw gray placeholder if image completely failed
         ctx.setFillStyle('#F5F5F5')
         ctx.fillRect(0, 0, W, W * 0.6)
      }
      
      // 2. User Info
      const avatarUrl = userInfo.value?.avatar_file?.url || BASE_URL_AVATAR
      let avatarImg
      try {
        avatarImg = await getImageInfo(avatarUrl)
      } catch (e) {
        console.warn('Avatar load failed', e)
        // If Avatar fails (e.g. CORS), use placeholder
        avatarImg = { path: PLACEHOLDER_IMG } 
      }
      
      // Avatar circle
      const avatarR = 40
      const avatarX = 40
      const avatarY = (W * 0.6) - 20 // Overlap slightly or below?
      // UI shows avatar below image, overlapping slightly or just below.
      // Let's check the UI description: "Lower part contains details, user avatar...".
      // The UI screenshot usually shows avatar overlapping the boundary or just below.
      // Let's put it below the image with some padding.
      const contentStartY = W * 0.6 + 40
      
      ctx.save()
      ctx.beginPath()
      ctx.arc(avatarX + avatarR, contentStartY, avatarR, 0, 2 * Math.PI)
      ctx.clip()
      
      // Draw white background for avatar first
      ctx.setFillStyle('#FFFFFF')
      ctx.fillRect(avatarX, contentStartY - avatarR, avatarR * 2, avatarR * 2)
      
      if (avatarImg && avatarImg.path) {
        ctx.drawImage(avatarImg.path, avatarX, contentStartY - avatarR, avatarR * 2, avatarR * 2)
      }
      ctx.restore()
      
      // Avatar Border (stroke)
      ctx.beginPath()
      ctx.arc(avatarX + avatarR, contentStartY, avatarR, 0, 2 * Math.PI)
      ctx.setStrokeStyle('#FFFFFF')
      ctx.setLineWidth(4)
      ctx.stroke()
      
      // User Name
      ctx.setFillStyle('#333333')
      ctx.setFontSize(32)
      ctx.setTextAlign('left')
      ctx.fillText(userInfo.value.nickname || '匿名用户', avatarX + avatarR * 2 + 20, contentStartY + 10)
      
      // 3. Task Content
      const contentY = contentStartY + 60
      ctx.setFontSize(28)
      ctx.setFillStyle('#666666')
      const contentText = dynamicDetail.value.content || ''
      // Limit lines to avoid overflow?
      const lastY = drawText(ctx, contentText, 40, contentY, W - 80, 40)
      
      // 4. Footer (QR Code & Text)
      // Calculate footer position - ensure it's at bottom
      const footerY = H - 250
      
      // Draw divider line
      ctx.setStrokeStyle('#EEEEEE')
      ctx.beginPath()
      ctx.moveTo(40, footerY - 20)
      ctx.lineTo(W - 40, footerY - 20)
      ctx.stroke()
      
      // QR Code
      const qrImg = { path: PLACEHOLDER_IMG }
      
      const qrSize = 140
      const qrX = W - 40 - qrSize
      const qrY = footerY
      
      if (qrImg && qrImg.path) {
         ctx.drawImage(qrImg.path, qrX, qrY, qrSize, qrSize)
      }
      
      // Footer Text
      ctx.setFontSize(24)
      ctx.setFillStyle('#999999')
      const footerText = "微信扫码打开小程序，来愿力岛一起许愿吧！"
      drawText(ctx, footerText, 40, footerY + 60, W - 80 - qrSize - 20, 34)
      
      // Draw
      ctx.draw(false, () => {
        setTimeout(() => {
          uni.canvasToTempFilePath({
            canvasId: 'shareCanvas',
            width: W,
            height: H,
            destWidth: W,
            destHeight: H,
            success: (res) => {
              // #ifdef H5
              // H5: Trigger download manually
              const link = document.createElement('a')
              link.href = res.tempFilePath
              link.download = `share_${new Date().getTime()}.png`
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              showToast('图片已下载')
              sharePopup.value.close()
              // #endif

              // #ifndef H5
              uni.saveImageToPhotosAlbum({
                filePath: res.tempFilePath,
                success: () => {
                  showToast('已保存到相册')
                  sharePopup.value.close()
                },
                fail: (err) => {
                  console.error(err)
                  // Often fails in dev tool or if permission denied
                   if (err.errMsg && err.errMsg.indexOf('auth') > -1) {
                      showToast('请开启相册权限')
                   } else {
                      showToast('保存失败')
                   }
                }
              })
              // #endif
            },
            fail: (err) => {
               console.error(err)
               showToast('生成图片失败')
            },
            complete: () => {
              uni.hideLoading()
              isDrawing.value = false
            }
          }, instance) // Pass instance for H5/Component
        }, 500) // Wait longer for draw
      })

    } catch (e) {
      console.error(e)
      uni.hideLoading()
      if (e.message && e.message.indexOf('Tainted') > -1) {
          showToast('图片跨域无法保存，请长按保存')
      } else {
          showToast('生成海报失败')
      }
      isDrawing.value = false
    }
  }

  const toggleLike = () => {
    if (!store.hasLogin) {
      showToast('请先登录')
      return
    }

    if (isLike.value) {
      remove()
    } else {
      like()
    }
  }

  const handleAccept = async () => {
    if (!store.hasLogin) {
      showToast('请先登录')
      return
    }
    // Check if current user is the author
    if (userInfo.value._id === store.userInfo._id) {
      showToast('不能接自己的单哦')
      return
    }

    showLoading()
    const db = uniCloud.database()
    try {
      await db.collection('app-task-message').add({
        relevance_id: dynamicDetail.value._id,
        to_user_id: userInfo.value._id,
        from_user_id: store.userInfo._id,
        msg_type: MSG_TYPE.REQUEST
      })
      showToast('请求已发送')
    } catch (e) {
      console.error(e)
      showToast('请求发送失败')
    } finally {
      uni.hideLoading()
    }
  }

  const onInput = (e) => {
    inputContent.value = e.detail.value
  }

  const handleSend = () => {
        if (!store.hasLogin) {
      showToast('请先登录')
      return
    }
    if (!inputContent.value.trim()) return
    send(inputContent.value)
    inputContent.value = ''
  }
  
  onShareAppMessage(() => {
    return {
      title: dynamicDetail.value.content || '分享一个任务',
      path: `/subShare/dynamic-details/dynamic-details?id=${dynamicDetail.value._id}`,
      imageUrl: dynamicDetail.value.imgs && dynamicDetail.value.imgs.length > 0 ? dynamicDetail.value.imgs[0] : ''
    }
  })

	const recover = (item) => {
		reply.value = item
		placeholder.value = `回复:${item.user_id[0].nickname}`
	}

	const clearMsg = () => {
		reply.value = {}
		placeholder.value = `说点啥~`
	}

	const send = (msg) => {
		showLoading()
		// #ifdef MP-WEIXIN
		uniCloud.callFunction({ name: 'set-check-text', data: { text: msg } }).then(res => {
			if (res.result.errCode === 400) {
				showToast('内容不合规，请重新编辑')
			} else {
				const reslut = {
					relevance_id: relevance_id.value,
					comment_type: 1,
					comment_content: msg,
					author_id: userInfo.value._id,
				}
				if (reply.value._id) {
					reslut.reply_comment_id = reply.value._id
					reslut.comment_type = 2
					reslut.reply_user_id = reply.value.user_id[0]._id
				}
				addComments(reslut).then(res => {
					const new_comments = {
						comment_content: msg,
						user_id: [{
							_id: store.userInfo._id,
							nickname: store.userInfo.nickname,
							avatar_file: store.userInfo.avatar_file,
						}],
						_id: res.result.id,
						comment_date: new Date().getTime()
					}
					showToast('评论成功')
					if (reply.value._id) {
						const data = comments.value.find(ele => ele._id === reply.value._id)
						if (!data.replys) {
							data.replys = []
						}
						data.replys.push(new_comments)
					} else {
						comments.value.push(new_comments)
					}
          clearMsg()
				}).finally(() => {
					uni.hideLoading()
				})
			}
		}).catch(err => {
			console.log(err)
			uni.hideLoading()
			showToast('请先登录,再发表评论')
		})
		// #endif

		// #ifdef H5
		const reslut = {
			relevance_id: relevance_id.value,
			comment_type: 1,
			comment_content: msg,
			author_id: userInfo.value._id,

		}
		if (reply.value._id) {
			reslut.reply_comment_id = reply.value._id
			reslut.comment_type = 2
			reslut.reply_user_id = reply.value.user_id[0]._id
		}
		addComments(reslut).then(res => {
			const new_comments = {
				comment_content: msg,
				user_id: [{
					_id: store.userInfo._id,
					nickname: store.userInfo.nickname,
					avatar_file: store.userInfo.avatar_file,
				}],
				_id: res.result.id,
				comment_date: new Date().getTime()
			}
			showToast('评论成功')
			if (reply.value._id) {
				const data = comments.value.find(ele => ele._id === reply.value._id)
				if (!data.replys) {
					data.replys = []
				}
				data.replys.push(new_comments)
			} else {
				comments.value.push(new_comments)
			}
      clearMsg()
		}).catch(err => {
			showToast('请先登录,再发表评论')
		}).finally(() => {
			uni.hideLoading()
		})
		// #endif
	}

	const like = () => {
		showLoading()
		setLike(relevance_id.value).then(res => {
			isLike.value = true
      dynamicDetail.value.like_count = (dynamicDetail.value.like_count || 0) + 1
		}).finally(() => {
			uni.hideLoading()
		})
	}

	const remove = () => {
		showLoading()
		removeLike(relevance_id.value).then(res => {
			isLike.value = false
      dynamicDetail.value.like_count = Math.max(0, (dynamicDetail.value.like_count || 0) - 1)
		}).finally(() => {
			uni.hideLoading()
		})
	}


  const toUserProfile = (userId) => {
    if (!userId) {
      return showToast('用户ID无效')
    }
    toNextPage(`/subHome/personal/personal?user_id=${userId}`)
  }

	onLoad(({ id }) => {
		// showLoading()
    loading.value = true
		relevance_id.value = id
		getDynamicListDelAggregate(id).then(result => {
			const obj = result.data[0]
			obj.imgs = obj.imgs ? obj.imgs.split(',') : []
			dynamicDetail.value = obj
			userInfo.value = obj.user_id[0]
		}).finally(() => {
			// uni.hideLoading()
      loading.value = false
		})

		getCommentsList(id).then(res => {
			comments.value = arrayToTree(res.data)
		})

		getLikeDel(id).then(res => {
			if (res.data) {
				isLike.value = true
			} else {
				isLike.value = false
			}
		})
	})
</script>

<style lang="scss" scoped>
  .detail-container {
    min-height: 100vh;
    background-color: #f5f7fa;
    padding-bottom: 120rpx;
    position: relative;
  }

  .loading-box {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .page-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: #f6f6f6;
    z-index: 0;
    opacity: 0.8;
  }

  .header-image-box {
    width: 100%;
    aspect-ratio: 16/9;
    overflow: hidden;
    position: relative;
    z-index: 000;
    
    .header-image {
      width: 100%;
      height: 100%;
      background-color: #eee;
    }

    .header-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(255,255,255,0.8) 100%);
    }
  }

  .content-wrapper {
    position: relative;
    margin-top: -40rpx;
    background-color: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 40rpx 40rpx 0 0;
    padding: 0 30rpx;
	padding-bottom: 80rpx;
    min-height: 500rpx;
    z-index: 1;
  }

  .user-info-section {
    position: relative;
    top: -40rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: -20rpx;

    .user-avatar {
      width: 160rpx;
      height: 160rpx;
      border-radius: 50%;
      border: 6rpx solid #fff;
      background-color: #fff;
      box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.1);
    }

    .user-name {
      font-size: 36rpx;
      font-weight: 800;
      color: #333;
      margin-top: 16rpx;
    }
    
    &.clickable:active {
      opacity: 0.8;
      transform: scale(0.98);
      transition: all 0.2s;
    }
  }

  .task-content {
    font-size: 30rpx;
    color: #333;
    line-height: 1.6;
    margin-bottom: 40rpx;
    white-space: pre-wrap;
    padding: 20rpx;
    background: rgba(255,255,255,0.5);
    border-radius: 20rpx;
  }

  .task-info-card {
    background-color: #fff;
    border-radius: 24rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
    margin-bottom: 40rpx;
    border: 2rpx solid rgba(0,0,0,0.02);

    .info-header {
      font-size: 32rpx;
      font-weight: 800;
      margin-bottom: 30rpx;
      padding-left: 20rpx;
      border-left: 8rpx solid #FFD700; /* Yellow */
      color: #333;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24rpx;
      padding-bottom: 24rpx;
      border-bottom: 1px dashed #f0f0f0;
      
      &:last-child {
        border-bottom: none;
        margin-bottom: 0;
      }

      .label {
        font-size: 28rpx;
        color: #666;
        font-weight: 500;
      }

      .value {
        font-size: 28rpx;
        color: #333;
        font-weight: 600;
      }
    }
  }

  .action-buttons {
    display: flex;
    justify-content: space-between;
    gap: 20rpx;
    margin-top: 40rpx;

    .action-btn {
      flex: 1;
      height: 80rpx;
      border-radius: 40rpx; /* Pill shape */
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      gap: 8rpx;
      transition: all 0.2s;
      font-weight: 600;

      &:active {
        opacity: 0.9;
        transform: scale(0.98);
      }

      &.primary {
        background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); /* Yellow/Orange */
        color: #fff;
        box-shadow: 0 6rpx 16rpx rgba(255, 165, 0, 0.3);
      }

      &.outline {
        background-color: #fff;
        border: 2rpx solid #eee;
        color: #666;
        box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);

        &.active {
          border-color: #FF6B81;
          color: #FF6B81;
          background-color: #FFF0F5;
        }
      }
    }
  }

  .comments-section {
    margin-top: 40rpx;
	margin-bottom: 40rpx;
    background-color: #fff;
    padding: 30rpx;
    border-radius: 24rpx;
    box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.05);
    
    .section-title {
      font-size: 32rpx;
      font-weight: 800;
      margin-bottom: 20rpx;
      padding-left: 10rpx;
      color: #333;
    }
  }

  .bottom-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    padding: 20rpx 30rpx;
    padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
    box-shadow: 0 -4rpx 20rpx rgba(0,0,0,0.05);
    display: flex;
    align-items: flex-end;
    gap: 20rpx;
    z-index: 100;

    .input-box {
      flex: 1;
      background-color: #f5f5f5;
      border-radius: 40rpx;
      padding: 20rpx 30rpx;
      min-height: 80rpx;
      display: flex;
      align-items: center;

      .comment-input {
        width: 100%;
        font-size: 28rpx;
        line-height: 1.4;
        max-height: 200rpx;
      }
    }

    .send-btn {
      width: 120rpx;
      height: 80rpx;
      background: linear-gradient(135deg, #6FCFFB 0%, #B59DFF 100%);
      color: #fff;
      border-radius: 40rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      font-weight: 600;
      transition: all 0.3s;
      box-shadow: 0 4rpx 12rpx rgba(181, 157, 255, 0.3);

      &.disabled {
        background: #ccc;
        color: #fff;
        box-shadow: none;
      }
    }
  }

  .price-display {
    color: #FF6B81;
    font-weight: bold;
  }
  
  .currency {
    font-size: 24rpx;
    margin-right: 4rpx;
  }
  
  .amount {
    font-size: 40rpx;
  }
  
  .status-tag {
    font-size: 24rpx;
    padding: 6rpx 16rpx;
    border-radius: 8rpx;
  }
  
  /* Auditing (0), Published (1) */
  .status-0, .status-1 {
    color: #1890FF;
    background-color: #E6F7FF;
    border: 1px solid #91D5FF;
  }
  
  /* Approved Executing (2) */
  .status-2 {
    color: #FAAD14;
    background-color: #FFFBE6;
    border: 1px solid #FFE58F;
  }
  
  /* Completed (3), Verified (4), Settled (5) */
  .status-3, .status-4, .status-5 {
    color: #52C41A;
    background-color: #F6FFED;
    border: 1px solid #B7EB8F;
  }

  /* Failures (-1, -2, -3, -4, -5) */
  .status--1, .status--2, .status--3, .status--4, .status--5 {
     color: #FF4D4F;
     background-color: #FFF1F0;
     border: 1px solid #FFA39E;
  }

  .progress-container {
    margin-bottom: 40rpx;
    padding: 0 10rpx;
    
    .progress-steps {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      position: relative;
    }
    
    .step-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index: 2;
      position: relative;
      flex: 0 0 auto;
      
      .step-circle {
        width: 24rpx;
        height: 24rpx;
        border-radius: 50%;
        background-color: #fff;
        border: 4rpx solid #D9D9D9;
        margin-bottom: 12rpx;
        transition: all 0.3s;
      }
      
      .step-label {
        font-size: 22rpx;
        color: #999;
        white-space: nowrap;
      }
      
      &.active {
        .step-circle {
          border-color: #FFD700;
        }
        .step-label {
          color: #333;
          font-weight: 600;
        }
      }
      
      &.completed {
        .step-circle {
          background-color: #FFD700;
          border-color: #FFD700;
        }
      }
    }
    
    .step-line {
      flex: 1;
      height: 4rpx;
      background-color: #E8E8E8;
      margin-top: 12rpx;
      margin-left: -10rpx;
      margin-right: -10rpx;
      z-index: 1;
      
      &.active {
        background-color: #FFD700;
      }
    }
  }

  .share-popup-container {
    background-color: #F5F5F5;
    border-radius: 24rpx 24rpx 0 0;
    padding-bottom: env(safe-area-inset-bottom);
    overflow: hidden;
  }

  .poster-preview {
    padding: 30rpx;
    display: flex;
    justify-content: center;
  }

  .poster-card {
    width: 100%;
    background-color: #fff;
    border-radius: 24rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.1);
  }

  .poster-header {
    width: 100%;
    height: 420rpx; /* Adjust based on ratio */
    
    .poster-img {
      width: 100%;
      height: 100%;
      background-color: #eee;
    }
  }

  .poster-content {
    padding: 30rpx;
    position: relative;
  }

  .poster-user {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    
    .p-avatar {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      margin-right: 20rpx;
      border: 2rpx solid #fff;
      box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
      margin-top: -60rpx; /* Overlap with header */
      z-index: 1;
      background-color: #fff;
    }
    
    .p-name {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
      margin-top: -40rpx; /* Adjust alignment */
      z-index: 1;
      text-shadow: 0 2rpx 4rpx rgba(255,255,255,0.8);
    }
  }

  .p-task-info {
    margin-bottom: 30rpx;
    
    .p-text {
      font-size: 28rpx;
      color: #333;
      line-height: 1.6;
      display: block;
      margin-bottom: 20rpx;
    }
    
    .p-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 10rpx;
      
      .p-tag {
        font-size: 24rpx;
        color: #666;
        background-color: #f5f5f5;
        padding: 4rpx 12rpx;
        border-radius: 8rpx;
      }
    }
  }

  .poster-footer {
    border-top: 1px dashed #eee;
    padding-top: 20rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .footer-text {
      font-size: 24rpx;
      color: #999;
      width: 60%;
      line-height: 1.4;
    }
    
    .qr-code {
      width: 120rpx;
      height: 120rpx;
    }
  }

  .share-actions {
    display: flex;
    padding: 20rpx 40rpx;
    justify-content: space-between;
    gap: 30rpx;
    background-color: #fff;
    
    .action-btn {
      flex: 1;
      height: 90rpx;
      border-radius: 45rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 24rpx;
      color: #fff;
      border: none;
      line-height: 1.2;
      padding: 0;
      margin: 0;
      gap: 6rpx;
      
      &::after {
        border: none;
      }
      
      &.share-wechat {
        background-color: #07C160;
      }
      
      &.save-album {
        background-color: #1890FF;
      }
      
      text {
        font-size: 24rpx;
      }
    }
  }
  
  .cancel-btn {
    background-color: #fff;
    text-align: center;
    padding: 30rpx;
    font-size: 30rpx;
    color: #666;
    border-top: 1px solid #f5f5f5;
  }
  
  .share-canvas {
    position: fixed;
    left: -9999px;
    top: 0;
    z-index: -1;
  }
</style>

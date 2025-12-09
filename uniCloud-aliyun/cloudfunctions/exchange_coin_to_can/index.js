'use strict';
const db = uniCloud.database()
const dbCmd = db.command

exports.main = async (event, context) => {
  const { amount } = event
  
  // 获取当前用户UID
  // 注意：本地调试时 context可能不包含uid，需要客户端传或模拟
  // 生产环境应从 context 获取以保证安全
  let uid = context.UID
  
  // 兼容客户端传参（仅用于调试或特殊场景，生产环境建议依赖 context.UID）
  if (!uid && event.uid) {
    uid = event.uid
  }
  
  // 如果还是没有uid，尝试从 uni-id 体系获取（如果是 uni-id 用户）
  if (!uid && context.auth && context.auth.uid) {
    uid = context.auth.uid
  }

  if (!uid) {
    return {
      code: 401,
      msg: '未登录'
    }
  }

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return {
      code: 400,
      msg: '无效的兑换金额'
    }
  }

  try {
    // 使用原子操作：查询用户且余额充足时才更新
    // 确保 coin >= amount
    const res = await db.collection('app-player').where({
      user_id: uid,
      coin: dbCmd.gte(amount)
    }).update({
      coin: dbCmd.inc(-amount),
      can: dbCmd.inc(amount * 10),
      updated_time: Date.now()
    })

    if (res.updated === 1) {
      return {
        code: 0,
        msg: '兑换成功'
      }
    } else {
      // 进一步检查是余额不足还是用户不存在
      const userCheck = await db.collection('app-player').where({
        user_id: uid
      }).get()

      if (userCheck.data.length === 0) {
        return {
          code: 404,
          msg: '用户不存在'
        }
      } else {
        return {
          code: 1,
          msg: '余额不足'
        }
      }
    }
  } catch (e) {
    console.error(e)
    return {
      code: 500,
      msg: '系统错误',
      error: e.message
    }
  }
};

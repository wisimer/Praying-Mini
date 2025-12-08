// 任务消息类型
export const MSG_TYPE = {
  REQUEST: 0, // 发起请求
  AGREE: 1, // 同意请求
  REJECT: -1, // 拒绝请求
  COMPLETE_NOTIFY: 2, // 完成通知
  INCOMPLETE_NOTIFY: -2, // 未完成通过
  CONFIRM_COMPLETE: 3, // 确认完成通知
  CONFIRM_INCOMPLETE: -3, // 确认未完成通知
  PLATFORM_APPROVE: 4, // 平台三方审核通过，结算通知
  PLATFORM_REJECT: -4 // 平台三方审核未通过
}

// 动态状态
export const ARTICLE_STATUS = {
  AUDITING: 0, // 审核中
  PUBLISHED: 1, // 已发布
  AUDIT_REJECT: -1, // 审核驳回
  APPROVED_EXECUTING: 2, // 被批准，执行中
  REJECTED: -2, // 被拒绝
  EXECUTED_WAIT_VERIFY: 3, // 执行完毕，等待验证
  FAILED_TIMEOUT: -3, // 放弃任务或超时，执行失败
  VERIFY_PASS_WAIT_PLATFORM: 4, // 验证通过，等待平台审核
  VERIFY_FAIL_WAIT_PLATFORM: -4, // 验证不通过，等待平台审核
  PLATFORM_PASS_SETTLED: 5, // 平台三方审核通过，结算完毕
  PLATFORM_FAIL: -5 // 平台三方审核不通过
}

export const getStatusText = (status) => {
    const statusMap = {
      [ARTICLE_STATUS.AUDITING]: '审核中',
      [ARTICLE_STATUS.PUBLISHED]: '待接单',
      [ARTICLE_STATUS.AUDIT_REJECT]: '审核驳回',
      [ARTICLE_STATUS.APPROVED_EXECUTING]: '进行中',
      [ARTICLE_STATUS.REJECTED]: '已拒绝',
      [ARTICLE_STATUS.EXECUTED_WAIT_VERIFY]: '已完成',
      [ARTICLE_STATUS.FAILED_TIMEOUT]: '已失败',
      [ARTICLE_STATUS.VERIFY_PASS_WAIT_PLATFORM]: '待结算',
      [ARTICLE_STATUS.VERIFY_FAIL_WAIT_PLATFORM]: '验证失败',
      [ARTICLE_STATUS.PLATFORM_PASS_SETTLED]: '已结算',
      [ARTICLE_STATUS.PLATFORM_FAIL]: '审核失败'
    }
    return statusMap[status] || '待接单'
  }

// Category IDs
export const CATEGORY_ID = {
    WISH: 0
}

// 任务类型，查询用
export const SHARE_MENUS = [{
    id: 0,
    name: '全部'
  }, {
    id: 1,
    name: '寺庙代拜'
  }, {
    id: 2,
    name: '景点祈福'
  }, {
    id: 3,
    name: '手工艺品'
  }, {
    id: 4,
    name: '定制创作'
  }, {
    id: 5,
    name: '活动陪伴'
  }, {
    id: 6,
    name: '情感咨询'
  }, {
    id: 7,
    name: '语音祝福'
  }, {
    id: 8,
    name: '视频录制'
  }, {
    id: 9,
    name: '书法绘画'
  }]

// 任务类型，创建任务用
export const TASK_TYPE = [{
    id: 1,
    name: '寺庙代拜'
  }, {
    id: 2,
    name: '景点祈福'
  }, {
    id: 3,
    name: '手工艺品'
  }, {
    id: 4,
    name: '定制创作'
  }, {
    id: 5,
    name: '活动陪伴'
  }, {
    id: 6,
    name: '情感咨询'
  }, {
    id: 7,
    name: '语音祝福'
  }, {
    id: 8,
    name: '视频录制'
  }, {
    id: 9,
    name: '书法绘画'
  }]

// 许愿和还愿场景
export const scenes = [
  { name: '山林寺庙', preview: 'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/scene1.png', bg: 'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/scene1.png', canConsumption: 5, god_avatar: 'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/god1-iphone.png', god_name: '木和' },
  { name: '火山祭坛', preview: 'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/scene2.png', bg: 'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/scene2.png', canConsumption: 3, god_avatar: 'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/god2-iphone.png', god_name: '安明' },
  { name: '海边鸟居', preview: 'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/scene3.png', bg: 'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/scene3.png', canConsumption: 6, god_avatar: 'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/god3-iphone.png', god_name: '曦行' },
  { name: '爱情神社', preview: 'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/scene4.png', bg: 'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/scene4.png', canConsumption: 8, god_avatar: 'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/god4-iphone.png', god_name: '绒心' },
  { name: '湖畔祈愿', preview: 'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/scene5.png', bg: 'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/scene5.png', canConsumption: 4, god_avatar: 'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/god5-iphone.png', god_name: '启途' },
  { name: '古树祈福', preview: 'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/scene6.png', bg: 'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/scene6.png', canConsumption: 4, god_avatar: 'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/god6-iphone.png', god_name: '清书' },
  { name: '原生森林', preview: 'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/scene7.png', bg: 'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/scene7.png', canConsumption: 4, god_avatar: 'https://mp-09b5b28d-2678-48cd-9dda-8851ee7bf3ed.cdn.bspapp.com/static_resource/god7-iphone.png', god_name: '白灵' },
]

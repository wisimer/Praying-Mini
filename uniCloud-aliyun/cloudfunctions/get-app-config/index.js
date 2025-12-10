'use strict';
exports.main = async (event, context) => {
  // 返回配置信息
  // enableExtraTabs: true 表示展示所有tab，false 表示隐藏 任务、消息、我的
  return {
    enableExtraTabs: true // 生产环境为false，开发环境为true
  }
};

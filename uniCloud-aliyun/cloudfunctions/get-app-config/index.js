'use strict';
exports.main = async (event, context) => {
  // 返回配置信息
  // enableExtraTabs: true 表示展示所有tab，false 表示隐藏 任务、消息、我的
  return {
    enableExtraTabs: false // 默认开启，可以通过修改此处或读取数据库配置来控制
  }
};

const mongoose = require('mongoose');

// 广告CPM日志模型
const AdsCpmLogSchema = new mongoose.Schema({
  ads: { type: String, required: true },
  createDate: { type: String, required: true },
  cpm: { type: Number, required: true },
  float: { type: Number, required: true },
  views: { type: Number, required: true },
  clicks: { type: Number, required: true },
  joins: { type: Number, required: true }
});

AdsCpmLogSchema.index({ ads: 1, createDate: 1 });

module.exports = mongoose.model('AdsCpmLog', AdsCpmLogSchema);

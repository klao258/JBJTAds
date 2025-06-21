const mongoose = require('mongoose');

// 广告每日数据视图模型
const AdsDailyViewSchema = new mongoose.Schema({
  createDate: { type: String, required: true },
  ads: { type: String, required: true },
  views: { type: Number, required: true },
  clicks: { type: Number, required: true },
  joins: { type: Number, required: true },
  budget: { type: Number, required: true },
});

AdsDailyViewSchema.index({ ads: 1, createDate: 1 }, { unique: true });

module.exports = mongoose.model('AdsDailyView', AdsDailyViewSchema);

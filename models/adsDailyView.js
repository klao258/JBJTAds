const mongoose = require('mongoose');

// 广告每日数据视图模型
const AdsDailyViewSchema = new mongoose.Schema({
  createDate: { type: String, required: true },
  ads: { type: String, required: true },
  views: { type: Number, required: true },
  clicks: { type: Number, required: true },
  actions: { type: Number, required: true },
  spent: { type: Number, required: true },
  updateDate: { type: String, required: true },
});

AdsDailyViewSchema.index({ ads: 1, createDate: 1 }, { unique: true });

module.exports = mongoose.model('AdsDailyView', AdsDailyViewSchema);

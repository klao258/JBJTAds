const mongoose = require('mongoose');

// 广告帖子模型
const AdsPostSchema = new mongoose.Schema({
  ads: { type: String, required: true, unique: true },
  title: { type: String, required: true },
});

module.exports = mongoose.model('AdsPost', AdsPostSchema);

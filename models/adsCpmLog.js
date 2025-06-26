import mongoose from 'mongoose';

// 广告CPM日志模型
const AdsCpmLogSchema = new mongoose.Schema({
  ads: { type: String, required: true },
  createDate: { type: String, required: true },
  cpm: { type: Number, required: true },
  float: { type: Number, required: true },
  views: { type: Number, required: true },
  clicks: { type: Number, required: true },
  actions: { type: Number, required: true }
});

AdsCpmLogSchema.index({ ads: 1, createDate: 1 });

const AdsCpmLog = mongoose.model('AdsCpmLog', AdsCpmLogSchema);
export default AdsCpmLog;
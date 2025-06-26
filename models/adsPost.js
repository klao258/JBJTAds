import mongoose from 'mongoose';

// 广告帖子模型
const AdsPostSchema = new mongoose.Schema({
  ads: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  createDate: { type: String, required: true },
});

const AdsPost = mongoose.model('AdsPost', AdsPostSchema);
export default AdsPost;
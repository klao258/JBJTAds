import mongoose from 'mongoose'

// refreshToken 持久化表
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  token: { type: String, required: true },
  userAgent: String,
  ip: String,
  createdAt: { type: Date, default: Date.now, expires: '7d' }, // 7天后自动删除
})

export default mongoose.model('RefreshToken', schema)

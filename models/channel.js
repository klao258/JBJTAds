import mongoose from 'mongoose'
import { generateShortIdFromString } from '../utils/shortId'

const channelSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  subscribers: { type: Number, default: 0 },
  url: { type: String, required: true, unique: true },

  // 唯一 shortId，自动生成
  shortId: { type: String, required: true, unique: true, minlength: 6, maxlength: 6 },

  // 外键引用类型表
  typeId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChannelType', required: true },

  // 来源类型（机器人/频道/群组）
  sourceType: {
    type: String,
    enum: ['bot', 'channel', 'group'],
    required: true
  },

  // 运营标记字段
  isAdvertised: { type: Boolean, default: false },
  hasOrders: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// 插入前自动生成 shortId
channelSchema.pre('validate', async function (next) {
  if (!this.shortId && this.url) {
    this.shortId = generateShortIdFromString(this.url)
  }
  this.updatedAt = new Date()
  next()
})

export default mongoose.model('Channel', channelSchema)

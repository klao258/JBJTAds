// 频道、机器人、群类型
const channelTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('ChannelType', channelTypeSchema)

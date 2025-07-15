import mongoose from 'mongoose'

// 系统管理员账号表
const accountSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model('Account', accountSchema)

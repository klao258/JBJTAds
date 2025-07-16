import mongoose from 'mongoose';
import { generateShortIdFromString } from '../utils/shortId.js';

const channelSchema = new mongoose.Schema({
	// 唯一 shortId，自动生成
	shortId: {
		type: String,
		required: true,
		unique: true,
		minlength: 6,
		maxlength: 6,
	},

	// 频道标题
	title: { type: String, required: true },

	// 频道描述
	description: { type: String, default: '' },

	// 订阅人数
	subscribers: { type: Number, default: 0 },

	// 频道链接
	url: { type: String, required: true, unique: true },

	// 外键引用类型表
	typeId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'ChannelType',
		required: true,
	},

	// 来源类型（机器人/频道/群组）
	sourceType: {
		type: String,
		enum: ['机器人', '频道', '群组'],
		required: true,
	},

	// 评级（A+/A/B+/B/C+/C/D+/D）
	grade: {
		type: String,
		enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D'],
	},

	// 是否投放
	isAdvertised: { type: Number, default: 0, enum: [0, 1] },

	// 是否出单
	hasOrders: { type: Number, default: 0, enum: [0, 1] },

	// 创建和更新时间
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

// 插入前自动生成 shortId
channelSchema.pre('validate', async function (next) {
	if (!this.shortId && this.url) {
		this.shortId = generateShortIdFromString(this.url);
	}
	this.updatedAt = new Date();
	next();
});

export default mongoose.model('Channel', channelSchema);

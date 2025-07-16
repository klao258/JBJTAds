import Channel from '../models/channel.js';
import ChannelType from '../models/channelType.js';

// 获取频道类型
export const getChannelType = async (ctx) => {
	try {
		const channelTypes = await ChannelType.find(); // 查询所有通道类型
		ctx.body = {
			code: 0,
			message: 'ok',
			data: {
				channelTypes,
			},
		};
	} catch (error) {
		console.error('查询错误: ', error);
		ctx.status = 500; // 设置 HTTP 状态码
		ctx.body = { message: '服务器内部错误' }; // 返回错误信息
	}
};

// 批量添加频道
export const batchAddChannel = async (ctx) => {
	const channelDataArray = ctx.request.body;

	// 验证请求数据合法性
	if (!Array.isArray(channelDataArray) || channelDataArray.length === 0) {
		ctx.body = {
			code: 1,
			message: '请求数据格式错误，必须是一个数组',
		};
		return;
	}

	const newChannels = [];
	const failedChannels = [];

	// 查询现有的 URL（不区分大小写）
	const existingChannels = await Channel.find(
		{
			url: {
				$in: channelDataArray.map((channel) => new RegExp(`^${channel.url}$`, 'i')),
			},
		},
		'url'
	).lean();

	const existingUrlsSet = new Set(existingChannels.map((channel) => channel.url.toLowerCase())); // 将 URL 转换为小写以便比较

	// 批量添加频道数据
	for (const channelData of channelDataArray) {
		if (!existingUrlsSet.has(channelData.url.toLowerCase())) {
			// 转换为小写进行比较
			const newChannel = new Channel(channelData);
			try {
				await newChannel.save();
				newChannels.push(newChannel); // 成功插入的频道
			} catch (error) {
				failedChannels.push({ channelData, error: error.message }); // 插入失败的频道
			}
		} else {
			failedChannels.push({ channelData, error: '频道 URL 已存在' }); // 列表中有重复的 URL
		}
	}

	ctx.status = 201;
	ctx.body = {
		code: 0,
		message: '批量新增频道处理完成',
		data: {
			successList: newChannels,
			failedList: failedChannels,
		},
	};
};

// 获取频道列表
export const getChannelList = async (ctx) => {
	const { title, description, sourceType, isAdvertised, hasOrders, url, grade, shortId, typeId, page = 1, pageSize = 10 } = ctx.query;

	// 构造查询条件
	const query = {};

	if (title) {
		query.title = { $regex: title, $options: 'i' }; // 模糊查询
	}

	if (description) {
		query.description = { $regex: description, $options: 'i' }; // 模糊查询
	}

	if (sourceType) {
		query.sourceType = sourceType;
	}

	if (isAdvertised !== undefined) {
		query.isAdvertised = Number(isAdvertised);
	}

	if (hasOrders !== undefined) {
		query.hasOrders = Number(hasOrders);
	}

	if (url) {
		query.url = { $regex: url, $options: 'i' }; // 模糊查询
	}

	if (grade) {
		query.grade = grade;
	}

	if (shortId) {
		query.shortId = shortId;
	}

	if (typeId) {
		query.typeId = typeId; // 假设 typeId 是 ObjectId 类型
	}

	// 分页处理
	const total = await Channel.countDocuments(query);
	const channels = await Channel.find(query)
		.skip((page - 1) * pageSize)
		.limit(Number(pageSize));

	ctx.body = {
		code: 0,
		message: 'ok',
		data: {
			total,
			page,
			pageSize,
			data: channels,
		},
	};
};

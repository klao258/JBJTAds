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
	const {
		title,
		description,
		sourceType,
		isPlace,
		isAdvertised,
		hasOrders,
		url,
		grade,
		shortId,
		typeId,
		page = 1,
		pageSize = 10,
	} = ctx.query;

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

	if (isPlace !== undefined) {
		query.isPlace = Number(isPlace);
	}

	if (isAdvertised !== undefined) {
		query.isAdvertised = Number(isAdvertised);
	}

	if (hasOrders !== undefined) {
		query.hasOrders = Number(hasOrders);
	}

	if (url) {
		const username = url?.replace(/@/, '');
		query.url = { $regex: username, $options: 'i' }; // 模糊查询
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

// 批量更新频道
export const batchUpdateChannel = async (ctx) => {
	const channels = ctx.request.body; // 获取请求体中的频道数组

	if (!Array.isArray(channels) || channels.length === 0) {
		ctx.body = {
			code: 1,
			message: '请求体必须是一个非空频道数组',
		};
		return;
	}

	try {
		const updatedChannels = [];

		for (const channelData of channels) {
			const {
				shortId,
				title,
				description,
				subscribers,
				url,
				typeId,
				sourceType,
				grade,
				isPlace,
				isAdvertised,
				hasOrders,
			} = channelData;

			// 查找频道并更新
			const channel = await Channel.findOne({ shortId });

			if (channel) {
				// 只在频道存在时进行更新
				if (title) {
					channel.title = title;
				}
				if (description) {
					channel.description = description;
				}
				if (subscribers) {
					channel.subscribers = subscribers;
				}
				if (url) {
					channel.url = url;
				}
				if (typeId) {
					channel.typeId = typeId;
				}
				if (sourceType) {
					channel.sourceType = sourceType;
				}
				if (grade) {
					channel.grade = grade;
				}
				if (isPlace !== undefined) {
					channel.isPlace = isPlace;
				}
				if (isAdvertised !== undefined) {
					channel.isAdvertised = isAdvertised;
				}
				if (hasOrders !== undefined) {
					channel.hasOrders = hasOrders;
				}

				channel.updatedAt = new Date(); // 更新修改时间

				await channel.save(); // 保存更新
				updatedChannels.push(channel);
			}
		}

		ctx.body = {
			code: 0,
			message: '频道信息更新成功',
			channels: updatedChannels,
		};
	} catch (error) {
		ctx.body = {
			code: 1,
			message: '更新失败',
			error: error.message,
		};
	}
};

// 删除帖子
export const delChannel = async (ctx) => {
	const { shortId } = ctx.request.body; // 获取请求体中的频道数组

	if (!shortId) {
		ctx.body = {
			code: 1,
			message: 'shortId为空',
		};
		return;
	}
	try {
		const result = await Channel.deleteOne({ shortId });

		if (result.deletedCount === 0) {
			ctx.body = {
				code: 1,
				message: '删除失败!',
			};
		} else {
			ctx.body = {
				code: 0,
				message: '删除成功!',
			};
		}
	} catch (err) {
		ctx.status = 500;
		ctx.body = { message: '服务器错误', error: err.message };
	}
};

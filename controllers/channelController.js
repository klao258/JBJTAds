import Channel from '../models/channel.js'
import ChannelType from '../models/channelType.js'

// 获取频道类型
export const getChannelType = async (ctx) => {
    try {
        const channelTypes = await ChannelType.find(); // 查询所有通道类型
        ctx.body = {
            code: 0,
            message: 'ok',
            data: {
                channelTypes
            }
        }
    } catch (error) {
        console.error("查询错误: ", error);
        ctx.status = 500; // 设置 HTTP 状态码
        ctx.body = { message: '服务器内部错误' }; // 返回错误信息
    }
}

// 获取频道列表
export const getChannelList = async (ctx) => {
    const { page = 1, pageSize = 10, title, sourceType, isAdvertised } = ctx.query
      
    // 构造查询条件
    const query = {}
    if (title) {
        query.title = { $regex: title, $options: 'i' } // 模糊匹配，忽略大小写
    }
    if (sourceType && ['bot', 'channel', 'group'].includes(sourceType)) {
        query.sourceType = sourceType
    }
    if (typeof isAdvertised !== 'undefined') {
        if (isAdvertised === 'true') query.isAdvertised = true
        else if (isAdvertised === 'false') query.isAdvertised = false
    }
    
    const pageNum = Math.max(parseInt(page), 1)
    const sizeNum = Math.min(Math.max(parseInt(pageSize), 1), 100)
    
    // 查询总数
    const total = await Channel.countDocuments(query)
    
    // 查询数据，按创建时间倒序分页
    const channels = await Channel.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * sizeNum)
        .limit(sizeNum)
        .lean()
    
    ctx.body = {
        code: 0,
        message: 'ok',
        data: {
            total,
            channels
        }
    }
}
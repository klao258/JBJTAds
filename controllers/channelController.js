import Channel from '../models/channel.js'

// 登录接口
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
const User = require('../models/user');

// 获取当前北京时间
const getNow = () => {
  const raw = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
  // raw 格式如：2025/6/19 9:5:3
  const [datePart, timePart] = raw.split(' ');
  const [year, month, day] = datePart.split('/').map(s => s.padStart(2, '0'));
  const [hour, minute, second] = timePart.split(':').map(s => s.padStart(2, '0'));

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

// 批量同步用户信息（已实现）
exports.syncUser = async ctx => {
  const { users } = ctx.request.body;

  if (!Array.isArray(users) || users.length === 0) {
    ctx.body = { code: 1, message: '参数 users 必须是非空数组' };
    return;
  }

  const now = getNow();

  // 校验每一项参数
  for (const user of users) {
    const { tgcode, tgname, ucode, uname, upcode, upname, amount, ads, platform, createDate } = user;
    if (!tgcode || !ucode || !upcode || !ads || !platform || !createDate) {
      ctx.body = { code: 1, message: '部分用户参数缺失', data: user };
      return;
    }
  }

  // 构造 bulkWrite 操作数组
  const operations = users.map(user => {
    const { tgcode, tgname, ucode, uname, upcode, upname, amount, ads, platform, createDate } = user;

    return {
      updateOne: {
        filter: { ucode, ads },
        update: {
          $set: {
            tgcode,
            tgname: tgname || null,
            uname: uname || null,
            upcode,
            upname,
            amount: amount || 0,
            platform,
            createDate,
            updateDate: now
          }
        },
        upsert: true
      }
    };
  });

  try {
    await User.bulkWrite(operations);
    ctx.body = { code: 0, message: '批量同步成功' };
  } catch (error) {
    ctx.body = { code: 1, message: '同步失败', error: error.message };
  }
};

// 根据用户id批量获取用户列表（已实现）
exports.getUserBatch = async ctx => {
  const { users } = ctx.request.body;

  if (!Array.isArray(users) || users.length === 0) {
    ctx.body = { code: 400, message: '参数 users 必须是非空数组' };
    return;
  }

  try {
    // 构建查询条件
    const queryConditions = users.map(item => ({
      platform: item.platform,
      ucode: item.ucode
    }));

    // 执行批量查询
    const result = await User.find({ $or: queryConditions }).lean();

    ctx.body = { code: 0, data: result};
  } catch (error) {
    ctx.body = { code: 1, message: '查询失败', error: error.message };
  }
}

// 获取广告统计信息（已实现）
exports.getAccoutPost = async ctx => {
  const { ads, platform } = ctx.query;
  const match = {};

  if (ads) {
    match.ads = { $regex: ads, $options: 'i' }; // 支持模糊匹配
  }

  if (platform) {
    match.platform = platform;
  }

  try {
    const result = await User.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$ads',
          regs: { $sum: 1 },
          pays: {
            $sum: {
              $cond: [{ $gt: ['$amount', 0] }, 1, 0]
            }
          },
          money: { $sum: '$amount' }
        }
      },
      {
        $project: {
          _id: 0,
          ads: '$_id',
          regs: 1,
          pays: 1,
          money: 1
        }
      },
      { $sort: { regs: -1 } } // 可选：按注册数倒序排序
    ]);

    ctx.body = { code: 0, data: result };
  } catch (err) {
    ctx.body = { code: 1, message: '查询失败', error: err.message };
  }
};

// 统计所有上级用户的注册数量和累计金额（已实现）
exports.getUserStatsByUpcode = async (ctx) => {
  try {
    const result = await User.aggregate([
      {
        $group: {
          _id: '$upcode',              // 按上级ID分组
          count: { $sum: 1 },          // 统计数量
          totalAmount: { $sum: '$amount' } // 累计金额
        }
      },
      {
        $project: {
          _id: 0,
          upcode: '$_id',
          count: 1,
          totalAmount: 1
        }
      },
      { $sort: { count: -1 } } // 可选，按数量降序排列
    ]);

    ctx.body = { code: 0, data: result };
  } catch (err) {
    console.error('统计失败', err);
    ctx.body = { code: 1, message: '统计失败', error: err.message };
  }
};
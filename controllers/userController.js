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

// 批量同步用户信息
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
    if (!tgcode || !upname || !ucode || !upcode || !ads || !platform || !createDate) {
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

// 获取用户列表
exports.getUsers = async ctx => {
  const { ads, platform } = ctx.query;
  const query = {};

  if (ads) {
    query.ads = { $regex: ads, $options: 'i' }; // 支持模糊匹配（不区分大小写）
  }

  if (platform) {
    query.platform = platform;
  }

  try {
    const users = await User.find(query).lean();
    ctx.body = { code: 0, data: users };
  } catch (err) {
    ctx.body = { code: 1, message: '查询失败', error: err.message };
  }
};

// 根据用户id批量获取用户列表
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
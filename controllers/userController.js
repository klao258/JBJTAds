const User = require('../models/user');

// 获取当前北京时间
const getNow = () => (new Date()?.toLocaleString?.('zh-CN', { timeZone: 'Asia/Shanghai' }))?.replace(/\//g, '-')

// 同步用户信息
exports.syncUser = async ctx => {
  const { tgcode, tgname, ucode, uname, upcode, upname, amount, ads, platform, createDate } = ctx.request.body;
  if (!tgcode || !upname || !ucode || !upcode || !ads || !platform || !createDate) {
    ctx.body = { code: 1, message: '参数缺失' };
    return;
  }
  const now = getNow();

  let user = await User.findOne({ ucode, ads });
  if (user) {
    user.upname = upname;
    user.tgname = tgname || null;
    user.upcode = upcode;
    user.amount = amount || 0;
    user.platform = platform;
    user.updateDate = now;
    await user.save();
  } else {
    user = new User({
      tgcode, tgname: tgname || null, 
      ucode, uname: uname || null, 
      upcode, upname, amount: amount || 0,
      ads, platform, createDate, updateDate: now
    });
    await user.save();
  }
  ctx.body = { code: 0, message: '用户同步成功' };
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
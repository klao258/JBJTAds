import User from '../models/user.js'
import AdsPost from '../models/adsPost.js'

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
export const syncUser = async ctx => {
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
export const getUserBatch = async ctx => {
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
export const getAccoutPost = async ctx => {
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
          totalMoney: { $sum: '$amount' } // 第一步：先求总金额
        },
      },
      {
        $project: {
          _id: 0,
          ads: '$_id',
          regs: 1,
          pays: 1,
          money: { $round: ['$totalMoney', 2] } // 第二步：保留两位小数
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
export const getUserStatsByPlatformAndUpcode = async (ctx) => {
  try {
    const result = await User.aggregate([
      {
        $group: {
          _id: {
            platform: '$platform',
            upcode: '$upcode'
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          users: {
            $push: {
              ads: '$ads',
              uname: '$uname',
              ucode: '$ucode',
              upcode: '$upcode',
              upname: '$upname',
              platform: '$platform',
              amount: '$amount',
              tgname: '$tgname',
              tgcode: '$tgcode',
              createDate: '$createDate',
              updateDate: '$updateDate'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          platform: '$_id.platform',
          upcode: '$_id.upcode',
          count: 1,
          totalAmount: 1,
          users: 1
        }
      },
      {
        $sort: {
          platform: 1 // ✅ 只按平台升序排列
        }
      }
    ]);

    // ✅ 对每组 users 按 amount 倒序排列
    result.forEach(group => {
      group.users.sort((a, b) => b.amount - a.amount);
    });

    ctx.body = { code: 0, data: result };
  } catch (err) {
    console.error('统计失败', err);
    ctx.body = { code: 1, message: '统计失败', error: err.message };
  }
};

// 统计每个频道、机器人的注册、付款、充值数据
export const getAdsStatis = async ctx => {
  try {
    const result = await User.aggregate([
      // 先按 ads 聚合出每个广告的数据
      {
        $group: {
          _id: "$ads",
          registerCount: { $sum: 1 },
          payCount: {
            $sum: { $cond: [{ $gt: ["$amount", 0] }, 1, 0] }
          },
          totalAmount: { $sum: "$amount" }
        }
      },
      // 连表获取 title
      {
        $lookup: {
          from: "adsposts", // 广告帖子集合名
          localField: "_id",
          foreignField: "ads",
          as: "adsInfo"
        }
      },
      // 只保留有 title 的
      {
        $match: {
          "adsInfo.0": { $exists: true }
        }
      },
      // 提取 title 字段
      {
        $project: {
          title: { $arrayElemAt: ["$adsInfo.title", 0] },
          registerCount: 1,
          payCount: 1,
          totalAmount: 1
        }
      },
      // 按 title 聚合（多个相同标题的合并）
      {
        $group: {
          _id: "$title",
          registerCount: { $sum: "$registerCount" },
          payCount: { $sum: "$payCount" },
          totalAmount: { $sum: "$totalAmount" }
        }
      },
      {
        $sort: { registerCount: -1 }
      },
      {
        $project: {
          _id: 0,
          title: "$_id",
          registerCount: 1,
          payCount: 1,
          totalAmount: { $round: ["$totalAmount", 2] }
        }
      }
    ]);

    ctx.body = {
      code: 0,
      message: "success",
      data: result
    };
  } catch (err) {
    ctx.body = {
      code: 1,
      message: "error",
      error: err.message
    };
  }
};

// 获取今日概览
export const getTodayStats = async ctx => {
  const { start, end } = ctx.query

  const startDate = `${start} 00:00:00`
  const endDate = `${end} 23:59:59`

  // 获取今日所有用户数据
  const users = await User.find({ createDate: { $gte: startDate, $lte: endDate } }).lean();

  // ✅ 用户角度统计
  // 先聚合：platform => 子 upcode 映射
  const platformMap = {};
  for (const user of users) {
    const { platform, upcode, upname, amount } = user;

    if (!platformMap[platform]) {
      platformMap[platform] = {
        platform,
        regCount: 0,
        payCount: 0,
        payAmount: 0,
        childrenMap: {}
      };
    }

    // 一级聚合（平台级）
    const plat = platformMap[platform];
    plat.regCount += 1;
    if (amount > 0) {
      plat.payCount += 1;
      plat.payAmount = +((plat.payAmount + amount).toFixed(2));
    }

    // 二级聚合（上级代理）
    if (!plat.childrenMap[upcode]) {
      plat.childrenMap[upcode] = {
        upcode,
        upname,
        regCount: 0,
        payCount: 0,
        payAmount: 0
      };
    }

    const child = plat.childrenMap[upcode];
    child.regCount += 1;
    if (amount > 0) {
      child.payCount += 1;
      child.payAmount = +(Number(child.payAmount + amount).toFixed(2));
    }
  }

  // 转换结果为数组结构
  const userStats = Object.values(platformMap).map(plat => {
    return {
      platform: plat.platform,
      regCount: plat.regCount,
      payCount: plat.payCount,
      payAmount: +((+plat.payAmount).toFixed(2)),
      children: Object.values(plat.childrenMap)
    };
  });

  // ✅ 广告账号角度统计（ads 拆解后取下标为1）
  const accountStats = {};
  for (const user of users) {
    const dashCount = (user.ads.match(/-/g) || []).length
    // 没有ADS标识的跳过, ads 至少有两个部分, 之前的旧数据是ADS-code
    if(!/ads/i.test(user.ads) || dashCount < 2) {
      continue
    } 
    
    const adsAccount = user.ads?.split('-')?.[1] || '未知';
    if (adsAccount === 'null') {
      continue; // 跳过没有 adsAccount 的用户
    }
    if (!accountStats[adsAccount]) {
      accountStats[adsAccount] = {
        adsAccount,
        platform: user.platform,
        regCount: 0,
        payCount: 0,
        payAmount: 0
      };
    }
    accountStats[adsAccount].regCount += 1;
    if (user.amount > 0) {
      accountStats[adsAccount].payCount += 1;
      accountStats[adsAccount].payAmount = +((accountStats[adsAccount].payAmount + user.amount).toFixed(2));
    }
  }

  // ✅ 帖子角度统计（ads 找 title）
  const adsSet = [...new Set(users.map(u => u.ads))];
  const adsPosts = await AdsPost.find({ ads: { $in: adsSet } }).lean();

  const titleMap = {};
  for (const post of adsPosts) {
    titleMap[post.ads] = post.title;
  }

  const postStats = {};
  for (const user of users) {
    const title = titleMap[user.ads] || '未知';
    if (!postStats[title]) {
      postStats[title] = {
        title,
        regCount: 0,
        payCount: 0,
        payAmount: 0
      };
    }
    postStats[title].regCount += 1;
    if (user.amount > 0) {
      postStats[title].payCount += 1;
      postStats[title].payAmount = +((postStats[title].payAmount + user.amount).toFixed(2));
    }
  }

  ctx.body = {
    code: 0,
    message: 'ok',
    data: {
      userStats: userStats.sort((a, b) => b.regCount - a.regCount),
      accountStats: Object.values(accountStats).sort((a, b) => b.regCount - a.regCount),
      postStats: Object.values(postStats).sort((a, b) => b.regCount - a.regCount),
    }
  };
};
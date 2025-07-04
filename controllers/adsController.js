import { Telegraf } from 'telegraf'
import User from '../models/user.js'
import AdsPost from '../models/adsPost.js'
import AdsCpmLog from '../models/adsCpmLog.js'
import AdsDailyView from '../models/adsDailyView.js'

const bot = new Telegraf('8110362669:AAGPnA3XjB2EllKjy--4zBX66W81pyflRUo');

// 获取当前北京时间
const getNow = () => {
  const raw = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
  const [datePart, timePart] = raw.split(' ');
  const [year, month, day] = datePart.split('/').map(s => s.padStart(2, '0'));
  const [hour, minute, second] = timePart.split(':').map(s => s.padStart(2, '0'));

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

// 获取指定偏移天数的日期字符串, offset正数过去的日期，负数表示未来的日期
const getDateStr = offset => {
  const now = new Date();

  // 计算北京时间偏移
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const beijingTime = new Date(utc + 8 * 60 * 60000);

  // 调整日期
  beijingTime.setDate(beijingTime.getDate() - offset);

  const year = beijingTime.getFullYear();
  const month = String(beijingTime.getMonth() + 1).padStart(2, '0');
  const day = String(beijingTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 同步广告信息
export const syncAds = async ctx => {
  const { list } = ctx.request.body;

  // 验证传入参数是否为数组且非空
  if (!Array.isArray(list) || list.length === 0) {
    ctx.body = { code: 1, message: '参数缺失或格式错误，list 应为非空数组' };
    return;
  }

  const now = getNow();
  const errors = [];

  for (const item of list) {
    const { ads, title } = item || {};

    // 校验每一项的结构
    if (!ads || !title) {
      errors.push({ ads, message: 'ads 或 title 缺失' });
      continue;
    }

    try {
      let post = await AdsPost.findOne({ ads });
      if (post) {
        post.title = title;
        post.createDate = now;
        await post.save();
      } else {
        post = new AdsPost({ ads, title, createDate: now });
        await post.save();
      }
    } catch (err) {
      errors.push({ ads, message: `保存失败：${err.message}` });
    }
  }

  ctx.body = {
    code: errors.length ? 1 : 0,
    message: errors.length ? '部分广告同步失败' : '广告同步成功',
    errors,
  };
};

// 获取CPM变动记录（已实现）
export const getCpmChanges = async ctx => {
  const { ads, startDate, endDate } = ctx.query;
  if (!ads) {
    ctx.body = { code: 1, message: 'ads参数缺失' };
    return;
  }

  const query = { ads };
  if (startDate) query.createDate = { $gte: startDate };
  if (endDate) query.createDate = Object.assign(query.createDate || {}, { $lte: endDate });

  try {
    // 先删除15天前的旧数据
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 15);
    const cutoffStr = cutoffDate.toISOString().slice(0, 10); // YYYY-MM-DD 格式

    await AdsCpmLog.deleteMany({
      ads,
      createDate: { $lt: cutoffStr }
    });

    // 获取15天内的数据
    const logs = await AdsCpmLog.find(query).sort({ createDate: -1 }).lean();

    ctx.body = { code: 0, data: logs };
  } catch (err) {
    ctx.body = { code: 1, message: `获取或清理 CPM 数据失败: ${err.message}` };
  }
};

// 记录CPM变动（已实现）
export const recordCpmChange = async ctx => {
  try {
    const { ads, cpm, float, views, clicks, actions } = ctx.request.body;
    if (!ads || cpm === undefined || float === undefined || views === undefined || clicks === undefined || actions === undefined) {
      ctx.body = { code: 1, message: '参数缺失' };
      return;
    }

    const now = getNow();

    const log = new AdsCpmLog({ ads, cpm, float, views, clicks, actions, createDate: now });
    await log.save();
    ctx.body = { code: 0, message: 'CPM变动记录成功' };
  } catch (error) {
    ctx.body = { code: 1, message: 'CPM变动记录失败' };
  }
  
};

// 按天记录浏览量（已实现）
export const recordDailyViews = async ctx => {
  const { adsUser, budget, ySpent, totalBudget, list } = ctx.request.body;

  if (!Array.isArray(list) || list.length === 0) {
    ctx.body = { code: 1, message: '参数缺失或格式错误，list 应为非空数组' };
    return;
  }

  // 推送余额不足
  if(adsUser && budget && budget < 10){
    const chatId = 6893636059;
    const msg = await bot.telegram.sendMessage(chatId, `${adsUser}：余额不足${budget}，昨日消耗${ySpent}`);

    // 设置 3 分钟（180000 毫秒）后删除该消息
    setTimeout(() => {
      bot.telegram.deleteMessage(chatId, msg.message_id).catch(err => {
        console.error('删除消息失败：', err);
      });
    }, 3 * 60 * 1000);
  }

  // 推送总消耗
  if(adsUser && totalBudget){
    await bot.telegram.sendMessage(6893636059, `${adsUser}：总消耗${totalBudget}`);
  }

  const createDate = getNow()?.slice?.(0, 10); // 当前日期 YYYY-MM-DD
  const errors = [];

  for (const item of list) {
    const { ads, views, clicks, actions, spent } = item || {};

    // 字段校验
    if (!ads || typeof views !== 'number' || typeof clicks !== 'number' || typeof actions !== 'number' || typeof spent !== 'number') {
      errors.push({ ads, message: '字段缺失或格式错误（应为数字）' });
      continue;
    }

    try {
      // 写入或更新当日数据
      await AdsDailyView.updateOne(
        { ads, createDate },
        { $set: { views, clicks, actions, spent, updateDate: getNow() } },
        { upsert: true }
      );

      // 删除15天之前的数据
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 15);
      const cutoffStr = cutoffDate.toISOString().slice(0, 10); // YYYY-MM-DD

      await AdsDailyView.deleteMany({
        ads,
        createDate: { $lt: cutoffStr },
      });
    } catch (err) {
      errors.push({ ads, message: `数据库操作失败：${err.message}` });
    }
  }

  ctx.body = {
    code: errors.length ? 1 : 0,
    message: errors.length ? '部分数据保存失败' : '曝光量记录成功',
    errors,
  };
};

// 获取近三日的浏览数据
export const getAdsDailyStats = async ctx => {
  const { ads } = ctx.query;

  if (!ads) {
    ctx.body = { code: 1, message: '参数缺失：ads' };
    return;
  }

  const today = getDateStr(0);
  const yesterday = getDateStr(1);
  const beforeYesterday = getDateStr(2);
  const targetDates = [today, yesterday, beforeYesterday];

  const records = await AdsDailyView.find({
    ads: { $regex: ads, $options: 'i' },
    createDate: { $in: targetDates }
  }).lean();

  const resultMap = {};

  for (const record of records) {
    const { ads, createDate, views = 0, clicks = 0, actions = 0, spent = 0 } = record;

    if (!resultMap[ads]) {
      resultMap[ads] = {
        ads,
        [today]: { views: 0, clicks: 0, actions: 0, spent: 0 },
        [yesterday]: { views: 0, clicks: 0, actions: 0, spent: 0 },
        [beforeYesterday]: { views: 0, clicks: 0, actions: 0, spent: 0 }
      };
    }

    if (createDate === today) {
      resultMap[ads][today] = { views, clicks, actions, spent };
    } else if (createDate === yesterday) {
      resultMap[ads][yesterday] = { views, clicks, actions, spent };
    } else if (createDate === beforeYesterday) {
      resultMap[ads][beforeYesterday] = { views, clicks, actions, spent };
    }
  }

  ctx.body = {
    code: 0,
    message: '获取成功',
    data: Object.values(resultMap)
  };
};

// 获取协议号占比
export const getAdsUEN = async ctx => {
  const { ads } = ctx.query;

  if (!ads) {
    ctx.body = { code: 1, message: 'ads 参数缺失' };
    return;
  }

  const regex = new RegExp(ads, 'i');
  const allUsers = await User.find({ ads: { $regex: regex } }).lean();

  const adsMap = {};

  for (const user of allUsers) {
    const adKey = user.ads || '未知';
    const uname = user.uname || '';
    const isEnglish = /^[\x00-\x7F]+$/.test(uname);

    if (!adsMap[adKey]) {
      adsMap[adKey] = {
        ads: adKey,
        total: 0,
        enCount: 0,
        details: []
      };
    }

    adsMap[adKey].total += 1;

    if (isEnglish) {
      adsMap[adKey].enCount += 1;
      adsMap[adKey].details.push({ uname: user.uname, amount: user.amount });
    }
  }

  const adsKeys = Object.keys(adsMap);

  // 批量查询 AdsPost 中的有效 ads 列表（防止多次 await）
  const adsPosts = await AdsPost.find({ ads: { $in: adsKeys } }).lean();
  const adsTitleMap = {};
  for (const post of adsPosts) {
    adsTitleMap[post.ads] = post.title || '（无标题）';
  }

  const result = [];

  for (const item of Object.values(adsMap)) {
    const scale = item.total === 0 ? 0 : (item.enCount / item.total) * 100;

    // 样本小于20，或英文占比不足，或没有广告记录，都跳过
    if (item.total < 20 || scale < 20 || !adsTitleMap[item.ads]) continue;

    result.push({
      ads: item.ads,
      title: adsTitleMap[item.ads],
      total: item.total,
      enScale: `${scale.toFixed(1)}%`,
      details: item.details
    });
  }

  // 按英文占比倒序排序
  result.sort((a, b) => {
    const aVal = parseFloat(a.enScale);
    const bVal = parseFloat(b.enScale);
    return bVal - aVal;
  });

  ctx.body = {
    code: 0,
    data: result
  };
}

// 获取今日注册数据
export const getTodayData = async ctx => {
  const { ads } = ctx.query;
  if (!ads) {
    ctx.body = { code: 1, message: 'ads 参数缺失' };
    return;
  }

  const today = getNow()?.slice?.(0, 10); // 当前日期 YYYY-MM-DD

  // 模糊查找今天的注册用户
  const users = await User.find({
    ads: { $regex: ads, $options: 'i' },
    createDate: { $regex: `^${today}` }
  }).lean();

  if (users.length === 0) {
    ctx.body = { code: 0, data: [] };
    return;
  }

  // 获取用户涉及的 ads 列表
  const adsSet = [...new Set(users.map(u => u.ads))];
  const adsList = await AdsPost.find({ ads: { $in: adsSet } }).lean();

  // 构建 ads => title 映射
  const adsMap = {};
  adsList.forEach(item => {
    adsMap[item.ads] = item.title;
  });

  // 按 title 分组统计
  const grouped = {};
  for (const user of users) {
    const title = adsMap[user.ads] || '未知广告';

    if (!grouped[title]) {
      grouped[title] = {
        title,
        count: 0,
        details: []
      };
    }

    grouped[title].details.push({
      ucode: user?.ucode || '',
      uname: user?.uname || '',
      upcode: user?.upcode || '',
      upname: user?.upname || '',
      amount: user?.amount || 0,
    });
    grouped[title].count++;
  }

  // 转换为数组并按 count 倒序排序
  const sortedResult = Object.values(grouped).sort((a, b) => b.count - a.count);

  ctx.body = {
    code: 0,
    data: sortedResult
  };
}
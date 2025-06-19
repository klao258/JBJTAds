const AdsPost = require('../models/adsPost');
const AdsCpmLog = require('../models/adsCpmLog');
const AdsDailyView = require('../models/adsDailyView');

// 获取当前北京时间
const getNow = () => {
  const raw = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
  const [datePart, timePart] = raw.split(' ');
  const [year, month, day] = datePart.split('/').map(s => s.padStart(2, '0'));
  const [hour, minute, second] = timePart.split(':').map(s => s.padStart(2, '0'));

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

// 同步广告信息
exports.syncAds = async ctx => {
  const { ads, title } = ctx.request.body;
  if (!ads || !title) {
    ctx.body = { code: 1, message: '参数缺失' };
    return;
  }
  const now = getNow();
  let post = await AdsPost.findOne({ ads });
  if (post) {
    post.title = title;
    post.createDate = now;
    await post.save();
  } else {
    post = new AdsPost({ ads, title, createDate: now });
    await post.save();
  }
  ctx.body = { code: 0, message: '广告同步成功' };
};

// 获取广告列表
exports.recordCpmChange = async ctx => {
  const { ads, createDate, cpm, float, views, clicks, joins } = ctx.request.body;
  if (!ads || !createDate || cpm === undefined || float === undefined || views === undefined || clicks === undefined || joins === undefined) {
    ctx.body = { code: 1, message: '参数缺失' };
    return;
  }
  const log = new AdsCpmLog({ ads, createDate, cpm, float, views, clicks, joins });
  await log.save();
  ctx.body = { code: 0, message: 'CPM变动记录成功' };
};

// 获取CPM变动记录
exports.getCpmChanges = async ctx => {
  const { ads, startDate, endDate } = ctx.query;
  if (!ads) {
    ctx.body = { code: 1, message: 'ads参数缺失' };
    return;
  }
  const query = { ads };
  if (startDate) query.createDate = { $gte: startDate };
  if (endDate) query.createDate = Object.assign(query.createDate || {}, { $lte: endDate });

  const logs = await AdsCpmLog.find(query).sort({ createDate: -1 }).lean();
  ctx.body = { code: 0, data: logs };
};

// 获取广告列表
exports.recordDailyView = async ctx => {
  const { ads, createDate, cpm, views, clicks, joins } = ctx.request.body;
  if (!ads || !createDate || cpm === undefined || views === undefined || clicks === undefined || joins === undefined) {
    ctx.body = { code: 1, message: '参数缺失' };
    return;
  }
  // upsert
  await AdsDailyView.updateOne(
    { ads, createDate },
    { $set: { cpm, views, clicks, joins } },
    { upsert: true }
  );
  ctx.body = { code: 0, message: '曝光量记录成功' };
};

// 获取广告日曝光量
exports.getDailyViews = async ctx => {
  const { ads, startDate, endDate } = ctx.query;
  if (!ads) {
    ctx.body = { code: 1, message: 'ads参数缺失' };
    return;
  }
  const query = { ads };
  if (startDate) query.createDate = { $gte: startDate };
  if (endDate) query.createDate = Object.assign(query.createDate || {}, { $lte: endDate });

  const views = await AdsDailyView.find(query).sort({ createDate: -1 }).lean();
  ctx.body = { code: 0, data: views };
};

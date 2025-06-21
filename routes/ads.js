const Router = require('koa-router');
const adsController = require('../controllers/adsController');

const router = new Router({ prefix: '/ads' });

router.post('/syncAds', adsController.syncAds);    // 同步广告信息
router.post('/recordCpm', adsController.recordCpmChange);   // 记录CPM变更
router.get('/cpmList', adsController.getCpmChanges);    // 获取CPM变更列表
router.post('/recordViews', adsController.recordDailyViews);  //  记录日常浏览量
router.get('/getAdsDailyStats', adsController.getAdsDailyStats);    // 获取近3天views

module.exports = router;

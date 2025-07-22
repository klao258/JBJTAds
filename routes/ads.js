import Router from 'koa-router';
import * as adsController from '../controllers/adsController.js';
import auth from '../middlewares/auth.js';

const router = new Router({ prefix: '/ads' });

router.post('/syncAds', adsController.syncAds); // 同步广告信息
router.post('/recordCpm', adsController.recordCpmChange); // 记录CPM变更
router.get('/cpmList', adsController.getCpmChanges); // 获取CPM变更列表
router.post('/recordViews', adsController.recordDailyViews); //  记录日常浏览量
router.get('/getAdsDailyStats', adsController.getAdsDailyStats); // 获取近3天views
router.get('/getAdsUEN', adsController.getAdsUEN); // 获取每个账号协议号占比（按用户昵称不到中文来判断）
router.get('/getTodayData', adsController.getTodayData); // 获取今日数据

export default router;

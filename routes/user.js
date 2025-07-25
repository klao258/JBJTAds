import Router from 'koa-router'
import * as userController from '../controllers/userController.js'
import auth from '../middlewares/auth.js'

const router = new Router({ prefix: '/user' });

router.post('/sync', userController.syncUser);  // 同步用户数据
router.post('/batch', userController.getUserBatch);  // 根据条件获取用户列表
router.get('/getAccoutPost', userController.getAccoutPost);   // 获取账号帖子汇总数据
router.get('/upcode', userController.getUserStatsByPlatformAndUpcode); // 根据upcode获取用户统计数据
router.get('/getAdsStatis', userController.getAdsStatis); // 统计每个ads的注册、付款、充值数据
router.get('/getTodayStats', auth, userController.getTodayStats); // 获取今日概览


export default router

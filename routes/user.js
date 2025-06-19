const Router = require('koa-router');
const userController = require('../controllers/userController');

const router = new Router({ prefix: '/user' });

router.post('/sync', userController.syncUser);  // 同步用户数据
router.post('/batch', userController.getUserBatch);  // 根据条件获取用户列表
router.get('/getAccoutPost', userController.getUsers);   // 获取账号帖子汇总数据


module.exports = router;

const Router = require('koa-router');
const userController = require('../controllers/userController');

const router = new Router({ prefix: '/user' });

router.post('/sync', userController.syncUser);  // 同步用户数据
router.get('/list', userController.getUsers);   // 获取用户列表
router.post('/batch', userController.getUserBatch);  // 根据条件获取用户列表


module.exports = router;

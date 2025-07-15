import Router from 'koa-router'
import * as authController from '../controllers/authController.js'

const router = new Router({ prefix: '/api/auth' });

router.post('/login', authController.login);    // 登陆
router.post('/refresh', authController.refresh);   // 刷新token
router.get('/logout', authController.logout);    // 退出登陆

export default router
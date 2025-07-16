import Router from 'koa-router';
import * as channelController from '../controllers/channelController.js';
import auth from '../middlewares/auth.js';

const router = new Router({ prefix: '/api/channel' });

router.get('/types', auth, channelController.getChannelType); // 获取频道类型
router.post('/batchAdd', auth, channelController.batchAddChannel); // 批量添加频道
router.get('/list', auth, channelController.getChannelList); // 获取列表列表

export default router;

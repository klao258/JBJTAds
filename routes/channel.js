import Router from 'koa-router';
import * as channelController from '../controllers/channelController.js';
import auth from '../middlewares/auth.js';

const router = new Router({ prefix: '/api/channel' });

router.get('/types', auth, channelController.getChannelType); // 获取频道类型
router.post('/batchAdd', auth, channelController.batchAddChannel); // 批量添加频道
router.get('/list', auth, channelController.getChannelList); // 获取列表列表
router.post('/batchUpdate', channelController.batchUpdateChannel); // 批量编辑频道
router.post('/del', auth, channelController.delChannel); // 删除编辑频道

export default router;

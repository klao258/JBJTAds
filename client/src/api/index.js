import { get, post } from './axios';

// 登录
export const login = (data) => post('/api/auth/login', data);

// 刷新 token（通常自动完成）
export const refreshToken = (token) => post('/api/auth/refresh', { refreshToken: token });

// 退出登录
export const logout = (token) => post('/api/auth/logout', { refreshToken: token });

// 获取今日概览数据
export const getTodayStats = (p) => get('/user/getTodayStats', p);

// 获取行业分类
export const getChannelType = () => get('/api/channel/types');

// 获取频道列表
export const getChannelList = (p) => get('/api/channel/list', p);

// 批量添加频道
export const batchAddChannels = (data) => post('/api/channel/batchAdd', data);

// 批量编辑频道
export const batchUpdateChannels = (data) => post('/api/channel/batchUpdate', data);

// 删除
export const delChannel = (data) => post('/api/channel/del', data);

import { get, post } from './axios'

// 登录
export const login = data => post('/api/auth/login', data)

// 刷新 token（通常自动完成）
export const refreshToken = token => post('/api/auth/refresh', { refreshToken: token })

// 退出登录
export const logout = token => post('/api/auth/logout', { refreshToken: token })

// 获取今日概览数据
export const getTodayStats = p => get('/user/getTodayStats', p)

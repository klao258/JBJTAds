import axios from 'axios'
import router from '@/router'

const service = axios.create({
  baseURL: '/', // 如果有 proxy，可写 '/api'
  timeout: 5000
})

// 请求拦截器：加 token
service.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = 'Bearer ' + token
  }
  return config
})

// 响应拦截器：自动刷新 token 或跳转登录
service.interceptors.response.use(
  res => {
    if (res?.data?.code !== 0) {
      console.error('接口错误:', res?.data?.message || '未知错误')
      return {}
    }
    return res.data.data
  },
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        router.push('/login')
        return Promise.reject(err)
      }
      try {
        const { accessToken } = await axios.post('/api/refresh', { refreshToken }).then(r => r.data)
        localStorage.setItem('accessToken', accessToken)
        original.headers.Authorization = 'Bearer ' + accessToken
        return service(original)
      } catch {
        localStorage.clear()
        router.push('/login')
        return Promise.reject(err)
      }
    }
    return Promise.reject(err)
  }
)

// 封装 get 请求
export const get = (url, params = {}, config = {}) => service.get(url, { params, ...config })

// 封装 post 请求
export const post = (url, data = {}, config = {}) => service.post(url, data, config)

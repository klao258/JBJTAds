import { verifyAccessToken } from '../utils/jwt.js'

export default async (ctx, next) => {
  const token = ctx.headers.authorization?.replace('Bearer ', '')
  if (!token) return ctx.throw(401, '未登录')

  const user = verifyAccessToken(token)
  if (!user) return ctx.throw(401, '登录已过期')

  if (ctx.ip !== user.ip || ctx.headers['user-agent'] !== user.ua) {
    return ctx.throw(401, '环境异常，请重新登录')
  }

  ctx.state.user = user
  await next()
}

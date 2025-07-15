import Router from 'koa-router'
import crypto from 'crypto'
import Account from '../models/account.js'
import RefreshToken from '../models/refreshToken.js'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js'

// 登录接口
export const login = async (ctx) => {
    const { username, password } = ctx.request.body
    const user = await Account.findOne({ username })

    if (!user){
        return ctx.throw(401, '账号错误')
    }
    const hashedInput = crypto.createHash('sha256').update(password).digest('hex')
    if (hashedInput !== user.password) {
        ctx.throw(401, '密码错误')
    }

    const ip = ctx.ip
    const ua = ctx.headers['user-agent']
    const accessToken = generateAccessToken({ id: user._id, username, ip, ua })
    const refreshToken = generateRefreshToken({ id: user._id })

    await RefreshToken.create({ userId: user._id, token: refreshToken, ip, userAgent: ua })

    ctx.body = {
        code: 0,
        msg: '登录成功',
        data: {
            user: username,
            accessToken,
            refreshToken
        }
    }
}

// 刷新 accessToken
export const refresh = async (ctx) => {
    const { refreshToken } = ctx.request.body
    const payload = verifyRefreshToken(refreshToken)
    if (!payload) return ctx.throw(401, 'refreshToken 无效')

    const saved = await RefreshToken.findOne({ token: refreshToken })
    if (!saved) return ctx.throw(401, 'refreshToken 不存在')

    const ip = ctx.ip
    const ua = ctx.headers['user-agent']
    const accessToken = generateAccessToken({ id: payload.id, ip, ua })

    ctx.body = { 
        code: 0,
        msg: '刷新token成功',
        data: { accessToken }
    }
}

// 退出登录
export const logout = async (ctx) => {
    const { refreshToken } = ctx.request.body
    if (refreshToken) await RefreshToken.deleteOne({ token: refreshToken })
    ctx.body = { code: 0, msg: '退出成功', data: {} }
}

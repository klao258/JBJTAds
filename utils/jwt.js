import jwt from 'jsonwebtoken'

const ACCESS_SECRET = 'jbjt-access-secret'
const REFRESH_SECRET = 'jbjt-refresh-secret'

export const generateAccessToken = (payload, expiresIn = '30m') =>
  jwt.sign(payload, ACCESS_SECRET, { expiresIn })

export const generateRefreshToken = (payload, expiresIn = '7d') =>
  jwt.sign(payload, REFRESH_SECRET, { expiresIn })

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, ACCESS_SECRET)
  } catch {
    return null
  }
}

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, REFRESH_SECRET)
  } catch {
    return null
  }
}

import crypto from 'crypto'

const BASE62 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

const toBase62 = (num) => {
  let result = ''
  while (num > 0) {
    result = BASE62[num % 62] + result
    num = Math.floor(num / 62)
  }
  return result.padStart(6, 'a') // 固定长度
}

// 从链接中提取关键ID部分
const extractShortKey = (url) => {
  try {
    const u = new URL(url)
    const parts = u.pathname.split('/').filter(Boolean) // 过滤空字符串
    if (parts.length === 0) return url // 直接返回原始字符串
    // 支持 joinchat 和普通用户名两种路径
    if (parts[0] === 'joinchat' && parts[1]) return parts[1]
    return parts[0]
  } catch {
    return url // 非URL字符串原样返回
  }
}

export const generateShortIdFromString = (input, length = 6) => {
  const key = extractShortKey(input)
  const hash = crypto.createHash('sha256').update(key).digest()
  const slice = hash.subarray(0, 6)
  const num = parseInt(slice.toString('hex'), 16)
  return toBase62(num).slice(0, length)
}

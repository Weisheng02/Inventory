const isProd = process.env.NODE_ENV === 'production'

export function parseCookies(cookieHeader = '') {
  return cookieHeader.split(';').reduce((acc, part) => {
    const [k, v] = part.trim().split('=')
    if (k) acc[k] = decodeURIComponent(v || '')
    return acc
  }, {})
}

export function serializeCookie(name, value, options = {}) {
  const {
    httpOnly = true,
    path = '/',
    sameSite = 'lax',
    secure = isProd,
    maxAge,
  } = options
  const segments = [
    `${name}=${encodeURIComponent(value)}`,
    `Path=${path}`,
    `SameSite=${sameSite}`,
  ]
  if (httpOnly) segments.push('HttpOnly')
  if (secure) segments.push('Secure')
  if (typeof maxAge === 'number') segments.push(`Max-Age=${Math.floor(maxAge)}`)
  return segments.join('; ')
}



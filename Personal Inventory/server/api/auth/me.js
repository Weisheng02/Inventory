import { oauthClientFromRefreshToken, getUserInfo } from '../../_lib/google.js'
import { parseCookies } from '../../_lib/cookies.js'

const TOKEN_COOKIE = 'g_refresh_token'

export default async function handler(req, res) {
  try {
    const cookies = parseCookies(req.headers.cookie)
    const refreshToken = cookies[TOKEN_COOKIE]
    if (!refreshToken) return res.status(200).json({ user: null })

    const client = oauthClientFromRefreshToken(refreshToken)
    const user = await getUserInfo(client)
    res.status(200).json({ user })
  } catch (e) {
    res.status(200).json({ user: null })
  }
}



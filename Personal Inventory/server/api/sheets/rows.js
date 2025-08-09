import { oauthClientFromRefreshToken, getSheetRows } from '../../_lib/google.js'
import { parseCookies } from '../../_lib/cookies.js'

const TOKEN_COOKIE = 'g_refresh_token'

export default async function handler(req, res) {
  try {
    const cookies = parseCookies(req.headers.cookie)
    const refreshToken = cookies[TOKEN_COOKIE]
    if (!refreshToken) return res.status(401).json({ error: 'Not authenticated' })

    const client = oauthClientFromRefreshToken(refreshToken)
    const rows = await getSheetRows(client)
    res.status(200).json({ rows })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}



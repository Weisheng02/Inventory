import { exchangeCodeForTokens } from '../../_lib/google.js'
import { serializeCookie } from '../../_lib/cookies.js'

const TOKEN_COOKIE = 'g_refresh_token'

export default async function handler(req, res) {
  const { query } = req
  const code = query.code
  const error = query.error
  if (error) return res.status(400).send(`OAuth error: ${error}`)
  if (!code) return res.status(400).send('Missing code')

  try {
    const tokens = await exchangeCodeForTokens(code)
    const refreshToken = tokens.refresh_token
    if (!refreshToken) {
      return res.status(400).send('No refresh token returned. Ensure access_type=offline and prompt=consent are set, and remove prior consent in Google Account if needed.')
    }
    const cookie = serializeCookie(TOKEN_COOKIE, refreshToken, { maxAge: 60 * 60 * 24 * 30 })
    res.setHeader('Set-Cookie', cookie)
    res.writeHead(302, { Location: '/' })
    res.end()
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}



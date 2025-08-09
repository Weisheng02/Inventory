import { serializeCookie } from '../../_lib/cookies.js'

const TOKEN_COOKIE = 'g_refresh_token'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed')
  res.setHeader('Set-Cookie', serializeCookie(TOKEN_COOKIE, '', { maxAge: 0 }))
  res.status(200).json({ ok: true })
}



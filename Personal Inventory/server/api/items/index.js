import { parseCookies } from '../_lib/cookies.js'
import { oauthClientFromRefreshToken } from '../_lib/google.js'
import { listItems, createItem } from '../_lib/sheets-inventory.js'
import { methodNotAllowed, readJson, sendJson } from '../_lib/http.js'

const TOKEN_COOKIE = 'g_refresh_token'

export default async function handler(req, res) {
  const cookies = parseCookies(req.headers.cookie)
  const token = cookies[TOKEN_COOKIE]
  if (!token) return sendJson(res, 401, { error: 'Not authenticated' })
  const auth = oauthClientFromRefreshToken(token)

  if (req.method === 'GET') {
    const { category, status } = req.query || {}
    const items = await listItems(auth, { category, status })
    return sendJson(res, 200, { items })
  }

  if (req.method === 'POST') {
    const body = await readJson(req)
    if (!body || !body.id || !body.name) return sendJson(res, 400, { error: 'Missing required fields: id, name' })
    const created = await createItem(auth, body)
    return sendJson(res, 201, { item: created })
  }

  return methodNotAllowed(res, ['GET', 'POST'])
}



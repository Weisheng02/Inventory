import { parseCookies } from '../_lib/cookies.js'
import { oauthClientFromRefreshToken } from '../_lib/google.js'
import { getItemById, updateItem, deleteItem, markItemSold } from '../_lib/sheets-inventory.js'
import { methodNotAllowed, readJson, sendJson } from '../_lib/http.js'

const TOKEN_COOKIE = 'g_refresh_token'

export default async function handler(req, res) {
  const cookies = parseCookies(req.headers.cookie)
  const token = cookies[TOKEN_COOKIE]
  if (!token) return sendJson(res, 401, { error: 'Not authenticated' })
  const auth = oauthClientFromRefreshToken(token)

  const { id } = req.query
  if (!id) return sendJson(res, 400, { error: 'Missing id' })

  if (req.method === 'GET') {
    const item = await getItemById(auth, id)
    if (!item) return sendJson(res, 404, { error: 'Not found' })
    return sendJson(res, 200, { item })
  }

  if (req.method === 'PATCH') {
    const body = await readJson(req)
    if (!body) return sendJson(res, 400, { error: 'Invalid JSON' })
    if (body.status === 'sold' && body.resale_price !== undefined) {
      const updated = await markItemSold(auth, id, body.resale_price)
      if (!updated) return sendJson(res, 404, { error: 'Not found' })
      return sendJson(res, 200, { item: updated })
    }
    const updated = await updateItem(auth, id, body)
    if (!updated) return sendJson(res, 404, { error: 'Not found' })
    return sendJson(res, 200, { item: updated })
  }

  if (req.method === 'DELETE') {
    const ok = await deleteItem(auth, id)
    if (!ok) return sendJson(res, 404, { error: 'Not found' })
    return sendJson(res, 200, { ok: true })
  }

  return methodNotAllowed(res, ['GET', 'PATCH', 'DELETE'])
}



import { getAuthUrl } from '../../_lib/google.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end('Method Not Allowed')
  try {
    const url = getAuthUrl()
    res.writeHead(302, { Location: url })
    res.end()
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}



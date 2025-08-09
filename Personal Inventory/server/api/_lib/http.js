export async function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

export async function readJson(req) {
  const text = await readRequestBody(req)
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export function sendJson(res, status, data) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(data))
}

export function methodNotAllowed(res, methods = ['GET']) {
  res.statusCode = 405
  res.setHeader('Allow', methods.join(', '))
  res.end('Method Not Allowed')
}



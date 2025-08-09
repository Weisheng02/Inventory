export async function fetchJSON(url, options = {}) {
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json()
}



import React, { useEffect, useMemo, useState } from 'react'
import { Link, useOutletContext, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'

export default function DashboardPage() {
  const { user } = useOutletContext()
  const [searchParams, setSearchParams] = useSearchParams()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const category = searchParams.get('category') || ''
  const status = searchParams.get('status') || ''
  const q = searchParams.get('q') || ''

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        setLoading(true)
        setError('')
        const params = new URLSearchParams()
        if (category) params.append('category', category)
        if (status) params.append('status', status)
        const res = await fetch(`/api/items?${params.toString()}`)
        if (!res.ok) throw new Error('Failed to load items')
        const data = await res.json()
        if (!ignore) setItems(data.items || [])
      } catch (e) {
        if (!ignore) setError(e.message)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    if (user) load()
  }, [user, category, status])

  const filtered = useMemo(() => {
    if (!q) return items
    const term = q.toLowerCase()
    return items.filter(i =>
      [i.name, i.description, i.category, i.status].some(v => String(v || '').toLowerCase().includes(term))
    )
  }, [items, q])

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  return (
    <div className="space-y-5">
      {!user && (
        <div className="rounded border bg-yellow-50 text-yellow-800 px-3 py-2 text-sm">
          Please login to view your inventory.
        </div>
      )}
      <div className="flex gap-3">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-gray-600">Your inventory items</p>
        </div>
      </div>

      <AnimatePresence>
        {searchParams.get('filters') && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="rounded-2xl border bg-white shadow-sm p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Search</label>
                <input value={q} onChange={e => updateParam('q', e.target.value)} placeholder="Search items…" className="w-full rounded-xl border-gray-300" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Category</label>
                <input value={category} onChange={e => updateParam('category', e.target.value)} placeholder="e.g. Electronics" className="w-full rounded-xl border-gray-300" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Status</label>
                <select value={status} onChange={e => updateParam('status', e.target.value)} className="w-full rounded-xl border-gray-300">
                  <option value="">Any</option>
                  <option value="listed">Listed</option>
                  <option value="pending">Pending</option>
                  <option value="sold">Sold</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}

      <ul className="space-y-3">
        {filtered.map((item) => (
          <li key={item.id}>
            <Link to={`/items/${encodeURIComponent(item.id)}`} className="flex gap-3 rounded-2xl border bg-white shadow-sm p-3 hover:shadow-md transition-shadow">
              <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                {String(item.photos || '').split(',').filter(Boolean)[0] ? (
                  <img src={String(item.photos || '').split(',').filter(Boolean)[0]} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full grid place-items-center text-gray-400 text-xs">No photo</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-medium truncate">{item.name || 'Untitled'}</h3>
                  <span className="shrink-0 inline-flex items-center rounded-full bg-blue-50 text-blue-700 text-xs px-2 py-0.5">{item.status || 'unknown'}</span>
                </div>
                <p className="text-sm text-gray-600 truncate">{item.category || '—'}</p>
                <div className="mt-1 text-xs text-gray-500 flex items-center gap-3">
                  <span>{item.purchase_price !== '' ? `$${Number(item.purchase_price).toFixed(2)}` : ''}</span>
                  <span>{item.purchase_date || ''}</span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {!loading && filtered.length === 0 && (
        <p className="text-sm text-gray-600">No items found.</p>
      )}
    </div>
  )
}



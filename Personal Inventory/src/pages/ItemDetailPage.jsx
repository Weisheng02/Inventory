import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import PhotoGallery from '../components/PhotoGallery.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import LoadingSpinner from '../components/LoadingSpinner.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import toast from 'react-hot-toast'

export default function ItemDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useOutletContext()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        setLoading(true)
        const res = await fetch(`/api/items/${encodeURIComponent(id)}`)
        if (!res.ok) throw new Error('Failed to load item')
        const data = await res.json()
        if (!ignore) setItem(data.item)
      } catch (e) {
        if (!ignore) setError(e.message)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    if (user) load()
  }, [user, id])

  const onDelete = async () => {
    if (!confirm('Delete this item?')) return
    try {
      const res = await fetch(`/api/items/${encodeURIComponent(id)}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      toast.success('Item deleted')
      navigate('/')
    } catch (e) {
      toast.error(e.message)
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />
  if (!item) return null

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{item.name}</h1>
        <div className="flex items-center gap-2">
          <StatusBadge status={item.status} />
          <Link to={`/items/${encodeURIComponent(id)}/edit`} className="px-3 py-2 rounded-xl border hover:bg-gray-50">Edit</Link>
          <button onClick={onDelete} className="px-3 py-2 rounded-xl border border-red-300 text-red-700 hover:bg-red-50">Delete</button>
        </div>
      </div>

      <PhotoGallery photos={item.photos} />

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Detail label="ID" value={item.id} />
          <Detail label="Category" value={item.category} />
          <Detail label="Purchase Date" value={item.purchase_date} />
          <Detail label="Purchase Price" value={item.purchase_price !== '' ? `$${Number(item.purchase_price).toFixed(2)}` : ''} />
        </div>
        <div className="space-y-1">
          <Detail label="Status" value={item.status} />
          <Detail label="Resale Price" value={item.resale_price !== '' ? `$${Number(item.resale_price).toFixed(2)}` : ''} />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium text-gray-700 mb-1">Description</h2>
        <p className="text-sm text-gray-800 whitespace-pre-wrap">{item.description || '—'}</p>
      </div>
    </motion.div>
  )
}

function Detail({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b py-2">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm text-gray-900">{value || '—'}</span>
    </div>
  )
}



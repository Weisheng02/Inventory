import React from 'react'
import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge.jsx'

export default function ItemCard({ item }) {
  const cover = (item.photos || '').split(',').map(s => s.trim()).filter(Boolean)[0]
  return (
    <Link to={`/items/${encodeURIComponent(item.id)}`} className="group block rounded-lg border hover:shadow-sm overflow-hidden bg-white">
      <div className="aspect-video bg-gray-100 overflow-hidden">
        {cover ? (
          <img src={cover} alt={item.name} className="h-full w-full object-cover transition-transform group-hover:scale-105"/>
        ) : (
          <div className="h-full w-full grid place-items-center text-gray-400 text-xs">No photo</div>
        )}
      </div>
      <div className="p-3 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium line-clamp-1">{item.name || 'Untitled'}</h3>
          <StatusBadge status={item.status} />
        </div>
        <div className="text-xs text-gray-600 line-clamp-2">{item.description}</div>
        <div className="text-sm text-gray-900">
          {item.purchase_price !== '' && typeof item.purchase_price === 'number' ? `$${item.purchase_price.toFixed(2)}` : ''}
        </div>
      </div>
    </Link>
  )
}



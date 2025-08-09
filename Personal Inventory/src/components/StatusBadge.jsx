import React from 'react'

const statusToClasses = (status) => {
  const s = String(status || '').toLowerCase()
  if (s === 'sold') return 'bg-green-100 text-green-700 ring-green-600/20'
  if (s === 'pending') return 'bg-yellow-100 text-yellow-800 ring-yellow-600/20'
  if (s === 'archived') return 'bg-gray-100 text-gray-700 ring-gray-600/20'
  return 'bg-blue-100 text-blue-700 ring-blue-600/20'
}

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusToClasses(status)}`}>
      {status || 'unknown'}
    </span>
  )
}



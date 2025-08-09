import React from 'react'

export default function ErrorMessage({ message }) {
  if (!message) return null
  return (
    <div className="rounded border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
      {message}
    </div>
  )
}



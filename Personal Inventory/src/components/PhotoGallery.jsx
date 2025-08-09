import React, { useMemo, useRef, useState } from 'react'

export default function PhotoGallery({ photos = '' }) {
  const urls = useMemo(() => photos.split(',').map(s => s.trim()).filter(Boolean), [photos])
  const [index, setIndex] = useState(0)
  const containerRef = useRef(null)

  const go = (delta) => {
    if (urls.length === 0) return
    setIndex(i => {
      const next = (i + delta + urls.length) % urls.length
      return next
    })
  }

  // basic swipe handlers
  const touchStartXRef = useRef(null)
  const onTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX
  }
  const onTouchEnd = (e) => {
    const start = touchStartXRef.current
    if (start == null) return
    const end = e.changedTouches[0].clientX
    const dx = end - start
    if (Math.abs(dx) > 30) {
      go(dx < 0 ? 1 : -1)
    }
    touchStartXRef.current = null
  }

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="aspect-video bg-gray-100 rounded overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {urls.length ? (
          <img key={index} src={urls[index]} alt="item" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full grid place-items-center text-gray-400 text-sm">No photos</div>
        )}
      </div>
      {urls.length > 1 && (
        <div className="absolute inset-0 flex items-center justify-between p-2">
          <button onClick={() => go(-1)} className="rounded-full bg-white/80 hover:bg-white p-2 shadow">‹</button>
          <button onClick={() => go(1)} className="rounded-full bg-white/80 hover:bg-white p-2 shadow">›</button>
        </div>
      )}
      {urls.length > 1 && (
        <div className="absolute bottom-1 inset-x-0 flex items-center justify-center gap-1">
          {urls.map((_, i) => (
            <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === index ? 'bg-white' : 'bg-white/60'}`} />
          ))}
        </div>
      )}
    </div>
  )
}



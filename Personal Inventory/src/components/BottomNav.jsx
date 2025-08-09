import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function BottomNav() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  const queryWith = (entries) => {
    const sp = new URLSearchParams(location.search)
    for (const [k, v] of entries) {
      if (v === null) sp.delete(k)
      else sp.set(k, v)
    }
    return `${location.pathname}?${sp.toString()}`
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40">
      <div className="pointer-events-none container relative">
        <div className="pointer-events-auto mx-auto mb-4 max-w-md">
          <div className="relative rounded-2xl border bg-white/90 backdrop-blur shadow-md p-3 flex items-center justify-between">
            <Link to="/" aria-label="Home" className={`flex-1 grid place-items-center text-xl py-2 ${isHome ? 'text-gray-900' : 'text-gray-500'}`}>
              <HomeIcon />
            </Link>
            <div className="flex-1" />
            <Link to={queryWith([['filters', '1']])} aria-label="Search & Filters" className="flex-1 grid place-items-center text-xl py-2 text-gray-500">
              <SearchIcon />
            </Link>
            <Link to="/items/new" aria-label="Add New" className="absolute left-1/2 -translate-x-1/2 -top-5">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-lg ring-8 ring-white">+
              </span>
            </Link>
          </div>
        </div>
      </div>
      <div className="h-24" />
    </div>
  )
}

function HomeIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5L12 3l9 7.5"/>
      <path d="M5 10v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9"/>
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7"/>
      <path d="M20 20l-3-3"/>
    </svg>
  )
}



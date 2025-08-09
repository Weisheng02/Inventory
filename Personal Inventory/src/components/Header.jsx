import React from 'react'
import { Link, NavLink } from 'react-router-dom'

export default function Header({ user, isLoading, onLogin, onLogout }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container grid grid-cols-2 sm:grid-cols-3 items-center gap-2 py-3">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-brand shadow-inner" />
            <span className="font-medium">Personal Inventory</span>
          </Link>
        </div>

        <nav className="hidden sm:flex items-center justify-center gap-4 text-sm">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'text-gray-900 font-medium' : 'text-gray-600 hover:text-gray-900'}>Dashboard</NavLink>
          <NavLink to="/items/new" className={({ isActive }) => isActive ? 'text-gray-900 font-medium' : 'text-gray-600 hover:text-gray-900'}>Add Item</NavLink>
        </nav>

        <div className="flex items-center justify-end gap-2">
          {isLoading ? (
            <button className="px-3 py-2 rounded-xl bg-gray-100 text-gray-600 cursor-wait">Loading…</button>
          ) : user ? (
            <div className="flex items-center gap-2">
              {user.picture && <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />}
              <span className="hidden sm:inline text-sm max-w-[10rem] truncate">{user.name}</span>
              <button onClick={onLogout} className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700">Logout</button>
            </div>
          ) : (
            <Link to="/login" className="px-3 py-2 rounded-xl bg-brand text-white hover:bg-brand-dark">Login</Link>
          )}
        </div>
      </div>
      <nav className="sm:hidden border-t">
        <div className="container flex items-center justify-between text-sm">
          <NavLink to="/" end className={({ isActive }) => `flex-1 text-center p-3 ${isActive ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>Dashboard</NavLink>
          <NavLink to="/items/new" className={({ isActive }) => `flex-1 text-center p-3 ${isActive ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>Add</NavLink>
        </div>
      </nav>
    </header>
  )
}



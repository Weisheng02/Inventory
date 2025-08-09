import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import BottomNav from './components/BottomNav.jsx'
import useAuth from './hooks/useAuth.js'

export default function App() {
  const { user, isLoading, login, logout } = useAuth()

  return (
    <div className="min-h-dvh flex flex-col">
      <Header user={user} isLoading={isLoading} onLogin={login} onLogout={logout} />

      <main className="container flex-1 p-4 pb-28">
        <Outlet context={{ user, isLoading }} />
      </main>

      <Footer />
      <BottomNav />
    </div>
  )
}



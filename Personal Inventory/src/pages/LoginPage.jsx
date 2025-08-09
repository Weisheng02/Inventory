import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'

export default function LoginPage() {
  const navigate = useNavigate()
  const { user, isLoading, login } = useAuth()

  useEffect(() => {
    if (!isLoading && user) navigate('/')
  }, [isLoading, user, navigate])

  return (
    <div className="max-w-sm mx-auto py-8">
      <h1 className="text-xl font-semibold mb-2">Login</h1>
      <p className="text-sm text-gray-600 mb-6">Sign in with Google to access your inventory.</p>
      <button onClick={login} disabled={isLoading} className="w-full px-4 py-2 rounded bg-brand text-white hover:bg-brand-dark disabled:opacity-50">Continue with Google</button>
    </div>
  )
}



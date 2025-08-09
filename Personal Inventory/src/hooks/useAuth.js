import { useEffect, useState, useCallback } from 'react'

export default function useAuth() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user || null)
      } else {
        setUser(null)
      }
    } catch (e) {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMe()
  }, [fetchMe])

  const login = () => {
    window.location.href = '/api/auth/login'
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    await fetchMe()
  }

  return { user, isLoading, login, logout }
}



import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name: string | null
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchUser()
  }, [])

  async function fetchUser() {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      setUser(data.user)
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  async function login(email: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || 'Login failed')
    }

    setUser(data.user)
    router.push('/dashboard')
    router.refresh()
  }

  async function register(email: string, password: string, name: string) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || 'Registration failed')
    }

    return data
  }

  async function logout() {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include' // Important: include cookies
      })
      setUser(null)
      // Force a hard navigation to clear all state
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
      window.location.href = '/'
    }
  }

  return { user, loading, login, register, logout }
}

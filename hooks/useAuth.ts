import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'

export interface User {
  id: string
  email: string
  name: string | null
}

let cachedUser: User | null = null
let cachedPromise: Promise<User | null> | null = null

export function useAuth() {
  const [user, setUser] = useState<User | null>(cachedUser)
  const [loading, setLoading] = useState(cachedUser === null)
  const router = useRouter()
  const mountedRef = useRef(true)

  const fetchUser = useCallback(async () => {
    if (cachedPromise) {
      const u = await cachedPromise
      if (mountedRef.current) {
        setUser(u)
        setLoading(false)
      }
      return u
    }

    cachedPromise = (async () => {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        cachedUser = data.user
        return data.user
      } catch {
        cachedUser = null
        return null
      }
    })()

    const u = await cachedPromise
    cachedPromise = null

    if (mountedRef.current) {
      setUser(u)
      setLoading(false)
    }
    return u
  }, [])

  useEffect(() => {
    mountedRef.current = true
    const timer = setTimeout(() => { fetchUser() }, 0)
    return () => { mountedRef.current = false; clearTimeout(timer) }
  }, [fetchUser])

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

    cachedUser = data.user
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
        credentials: 'include'
      })
      cachedUser = null
      setUser(null)
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
      window.location.href = '/'
    }
  }

  return { user, loading, login, register, logout }
}

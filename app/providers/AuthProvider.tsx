"use client"

import { useAuth } from '@/hooks/useAuth'
import { createContext, useContext } from 'react'

interface AuthContextType {
  user: any
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true })

export function useSession() {
  return useContext(AuthContext)
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

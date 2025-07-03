import React, { createContext, useContext, useEffect } from 'react'
import { initData } from '@telegram-apps/sdk'
import { apiClient } from '../services/apiClient'
import { useUser } from '../contexts/user'

interface AuthContextType {
  userId: string | null
  isModerator: boolean
  isAdmin: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: userLoading, refresh } = useUser();

  useEffect(() => {
    async function authenticate() {
      initData.restore()
      const data = initData.raw()
      if (!data) {
        console.error('No initData found')
        return
      }

      const params = new URLSearchParams(window.location.search)
      const ref = params.get('ref') || undefined
      const payload: { initData: string; ref?: string } = { initData: data }
      if (ref) payload.ref = ref

      try {
        const res = await apiClient.post('/auth/telegram', payload)
        localStorage.setItem('authToken', res.data.access_token)
        localStorage.setItem('refreshToken', res.data.refresh_token)
        // После сохранения токенов — обновляем контекст пользователя
        // await refresh()
      } catch (err) {
        console.error('Authentication failed', err)
      }
    }

    authenticate()
  }, [refresh])

  const userId = user?.id ?? null
  const isModerator = user?.role === 'moderator'
  const isAdmin = user?.role === 'admin'
  const loading = userLoading

  return (
    <AuthContext.Provider value={{ userId, isModerator, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

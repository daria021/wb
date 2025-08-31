import React, { createContext, useContext, useEffect } from 'react'
import { init, initData } from '@telegram-apps/sdk'
import { apiClient, restoreClient } from '../services/apiClient'
import { useUser } from './user'

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
      // Гарантируем инициализацию SDK до чтения initData
      try { init(); } catch {}
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
        console.log(`sent auth request ${res.data} ${loading}`)
        localStorage.setItem('authToken', res.data.access_token)
        localStorage.setItem('refreshToken', res.data.refresh_token)
        restoreClient();
        console.log(`client restored ${loading}`)
        await refresh();
      } catch (err) {
        console.error('Authentication failed', err)
      }
    }

    authenticate();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

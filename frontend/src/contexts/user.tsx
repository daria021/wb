import React, { createContext, useContext, useEffect, useState } from 'react'
import {fetchMe} from "../services/api";

// Тип данных, которые возвращает /users/me
export interface UserWithBalance {
  id: string
  telegram_id?: number
  nickname?: string
  role: 'user' | 'client' | 'seller' | 'moderator' | 'admin'
  balance: number
  is_banned: boolean
  is_seller: boolean
  created_at: string  // ISO-строка
  updated_at: string  // ISO-строка
  referrer_bonus: number
  // Новые поля
  total_plan: number        // общий план (ACTIVE + NOT_PAID)
  reserved_active: number   // зарезервировано под ACTIVE
  unpaid_plan: number       // план под NOT_PAID
  free_balance: number
  in_progress: number
}

interface UserContextValue {
  user: UserWithBalance | null
  loading: boolean
  error: Error | null
  refresh: () => Promise<void>
}

const UserContext = createContext<UserContextValue | undefined>(undefined)

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserWithBalance | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const load = async () => {
    if (user) {
        return;
      }
    setLoading(true);
    try {
      const me = await fetchMe();
      setUser(me);
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }

// src/contexts/UserProvider.tsx (фрагмент)
useEffect(() => {
  const token = localStorage.getItem('authToken');
  if (!token) return;                // не дергаем /users/me без токена
  void load();                       // грузим профиль только когда токен есть
}, []);


  return (
    <UserContext.Provider value={{ user, loading, error, refresh: load }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) {
    throw new Error('useUser must be used within UserProvider')
  }
  return ctx
}

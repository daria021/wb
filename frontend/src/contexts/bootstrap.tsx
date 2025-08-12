import React, { createContext, useState, useEffect } from 'react';
import {apiClient} from "../services/apiClient";
import {ProductStatus, UserRole} from "../enums";
import {useAuth} from "./auth";

interface Product {
    id: string;
    name: string;
    brand: string;
    article: string;
    category: string;
    key_word: string;
    general_repurchases: number;
    // daily_repurchases: number;
    price: number;
    wb_price: number;
    tg: string;
    payment_time: string;
    review_requirements: string;
    image_path?: string;
    seller_id: string;
    created_at: string;
    updated_at: string;
    status: ProductStatus;
}

interface Order {
    id: string;
    user_id: string;
    product_id: string;
    card_number: string;
    screenshot_path: string;
    status: string;
    created_at: string;
    updated_at: string;
    step: number;
    product: Product;
    user: {
        nickname: string;
    };
}


interface User {
  id: string
  telegram_id?: number
  nickname?: string
  role: UserRole
  balance: number
  is_banned: boolean
  is_seller: boolean
  created_at: string  // ISO-строка
  updated_at: string  // ISO-строка
  total_plan: number        // общий план (ACTIVE + NOT_PAID)
  reserved_active: number   // зарезервировано под ACTIVE
  unpaid_plan: number       // план под NOT_PAID
  free_balance: number      // сколько свободно (balance – reserved_active)
}

export interface BootstrapData {
  me:       User;
  products: Product[];
  orders:   Order[];
}

export const BootstrapContext = createContext<BootstrapData | null>(null);

export function BootstrapProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<BootstrapData | null>(null);
  const { loading: authLoading } = useAuth();   // ждём, когда AuthProvider получит токен

  useEffect(() => {
    if (authLoading) return;                    // токен ещё не установился – /init рано

    apiClient
      .get<BootstrapData>('/init')
      .then(res => setData(res.data))
      .catch(console.error);
  }, [authLoading]);                            // эффект перезапустится только когда authLoading=false

  if (!data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-gray-600 always-spin" />
      </div>
    );
  }

  return (
    <BootstrapContext.Provider value={data}>
      {children}
    </BootstrapContext.Provider>
  );
}
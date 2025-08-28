import axios from 'axios';
import {ensureTelegramReady} from "../lib/telegramReady";
import {loginWithTelegramOnce} from "../auth/auth";


export const api = axios.create({
  baseURL: '/', // свой baseURL
  withCredentials: true,
});

// Подставляем токен
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    cfg.headers = cfg.headers ?? {};
    (cfg.headers as any).Authorization = `Bearer ${token}`;
  }
  return cfg;
});

// На 401 — один раз пробуем авторизоваться и повторяем запрос
api.interceptors.response.use(
  r => r,
  async (error) => {
    const original = error.config;
    const status = error?.response?.status;

    if (status === 401 && !original?._retry) {
      original._retry = true;

      // если вообще нет токена — пробуем авторизоваться через Telegram
      await ensureTelegramReady();
      await loginWithTelegramOnce();

      const newToken = localStorage.getItem('authToken');
      if (newToken) {
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original); // повтор
      }
    }

    return Promise.reject(error);
  }
);

// src/auth/auth.ts
let inflightAuth: Promise<void> | null = null;

export async function loginWithTelegramOnce(): Promise<void> {
  if (inflightAuth) return inflightAuth;

  inflightAuth = (async () => {
    const wa = (window as any).Telegram?.WebApp;
    const initData = wa?.initData || wa?.initDataUnsafe;
    if (!initData || (typeof initData === 'object' && Object.keys(initData).length === 0)) {
      // нет initData — авторизоваться нечем; просто прекращаем
      inflightAuth = null;
      return;
    }

    // вызов к бекенду
    const res = await fetch('/auth/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ init_data: wa.initData ?? wa.initDataUnsafe }),
    });

    if (!res.ok) {
      inflightAuth = null;
      throw new Error(`Auth failed: ${res.status}`);
    }

    const data = await res.json();
    localStorage.setItem('authToken', data.access_token);
    localStorage.setItem('refreshToken', data.refresh_token);
    inflightAuth = null;
  })();

  try {
    await inflightAuth;
  } finally {
    inflightAuth = null;
  }
}

// src/lib/telegramReady.ts
export async function ensureTelegramReady(): Promise<void> {
  // ждём DOM
  if (document.readyState === 'loading') {
    await new Promise<void>(resolve => document.addEventListener('DOMContentLoaded', () => resolve(), { once: true }));
  }

  const wa = (window as any).Telegram?.WebApp;
  if (!wa) return;

  // если уже готов — выходим
  try { wa.ready?.(); } catch {}
  if (wa.initData || (wa.initDataUnsafe && Object.keys(wa.initDataUnsafe).length > 0)) return;

  // на всякий случай — короткое ожидание событий инициализации
  await new Promise<void>(resolve => setTimeout(resolve, 50));
}

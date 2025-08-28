type TGButton = { id: string; text: string; type?: 'default' | 'destructive' };

type TelegramWebApp = {
  showPopup?:   (opts: { title?: string; message: string; buttons?: TGButton[] }) => Promise<string | undefined>;
  showConfirm?: (message: string) => Promise<boolean>;
  showAlert?:   (message: string) => Promise<void>;
};

function getTG(): TelegramWebApp | undefined {
  return (window as any)?.Telegram?.WebApp as TelegramWebApp | undefined;
}

export async function confirmTG(message: string): Promise<boolean> {
  const tg = getTG();

  try {
    if (tg?.showPopup) {
      const id = await tg.showPopup({
        title: 'Подтверждение',
        message,
        buttons: [
          { id: 'yes', text: 'Да',     type: 'destructive' },
          { id: 'no',  text: 'Отмена', type: 'default' },
        ],
      });
      return id === 'yes';
    }
  } catch {}

  try {
    if (tg?.showConfirm) return await tg.showConfirm(message);
  } catch {}

  // Внутри Telegram системные модалки запрещены → ничего не показываем и возвращаем false
  if (tg) return false;

  // Вне Telegram — обычный confirm
  return typeof window !== 'undefined' ? window.confirm(message) : false;
}

export async function alertTG(message: string): Promise<void> {
  const tg = getTG();

  try { if (tg?.showAlert) { await tg.showAlert(message); return; } } catch {}
  try { if (tg?.showPopup) { await tg.showPopup({ title: '', message, buttons: [{ id:'ok', text:'ОК', type:'default'}] }); return; } } catch {}

  if (!tg && typeof window !== 'undefined') alert(message);
}

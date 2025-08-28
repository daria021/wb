type TGButton = { id: string; text: string; type?: 'default' | 'destructive' };

type TelegramWebApp = {
  showPopup?: (opts: { title?: string; message: string; buttons?: TGButton[] }) => Promise<string | undefined>;
  showConfirm?: (message: string) => Promise<boolean>;
  showAlert?: (message: string) => Promise<void>;
};

function getTG(): TelegramWebApp | undefined {
  return (window as any)?.Telegram?.WebApp as TelegramWebApp | undefined;
}

export async function confirmTG(message: string): Promise<boolean> {
  const tg = getTG();

  if (tg && typeof tg.showPopup === 'function') {
    const id = await tg.showPopup({
      title: 'Подтверждение',
      message,
      buttons: [
        { id: 'yes', text: 'Да', type: 'destructive' },
        { id: 'no',  text: 'Отмена', type: 'default' },
      ],
    });
    return id === 'yes';
  }

  if (tg && typeof tg.showConfirm === 'function') {
    return await tg.showConfirm(message);
  }

  // локалка вне Telegram
  return typeof window !== 'undefined' ? window.confirm(message) : false;
}

export async function alertTG(message: string): Promise<void> {
  const tg = getTG();

  if (tg && typeof tg.showAlert === 'function') {
    await tg.showAlert(message);
    return;
  }

  if (tg && typeof tg.showPopup === 'function') {
    await tg.showPopup({
      title: '',
      message,
      buttons: [{ id: 'ok', text: 'ОК', type: 'default' }],
    });
    return;
  }

  // локалка вне Telegram
  if (typeof window !== 'undefined') alert(message);
}

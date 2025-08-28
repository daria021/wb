function getTG() {
  return (window as any)?.Telegram?.WebApp;
}

export async function confirmTG(message: string): Promise<boolean> {
  const tg = getTG();

  // сначала пробуем popup (есть везде)
  if (tg?.showPopup) {
    const id = await tg.showPopup({
      title: 'Подтверждение',
      message,
      buttons: [
        { id: 'yes', text: 'Да',       type: 'destructive' },
        { id: 'no',  text: 'Отмена',   type: 'default' },
      ],
    });
    return id === 'yes';
  }

  // (если доступен) showConfirm
  if (tg?.showConfirm) {
    return await tg.showConfirm(message);
  }

  // фолбэк — только для локалки вне Telegram
  return window.confirm(message);
}

export async function alertTG(message: string): Promise<void> {
  const tg = getTG();

  if (tg?.showAlert) {
    await tg.showAlert(message);
    return;
  }
  if (tg?.showPopup) {
    await tg.showPopup({
      title: '',
      message,
      buttons: [{ id: 'ok', text: 'ОК', type: 'default' }],
    });
    return;
  }

  // фолбэк — только для локалки вне Telegram
  window.alert(message);
}

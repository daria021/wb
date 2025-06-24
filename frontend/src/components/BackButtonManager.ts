import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { on, postEvent } from '@telegram-apps/sdk';


export default function BackButtonManager() {
  const navigate  = useNavigate();
  const location  = useLocation();

  /* 1. Управляем видимостью стрелки */
  useEffect(() => {
    // Показываем везде, кроме «домашней» (‘/’)
    postEvent('web_app_setup_back_button', {
      is_visible: location.pathname !== '/',
    });
  }, [location.pathname]);

  /* 2. Один-единственный обработчик «назад» */
  useEffect(() => {
    const unsub = on('back_button_pressed', () => {
      navigate(-1);
    });
    return unsub;      // сняли при размонтировании App
  }, [navigate]);

  return null;         // ничего не рисуем
}

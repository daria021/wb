import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {resolveDeeplink} from "../services/api";
import {useAuth} from "../contexts/auth";

interface Deeplink {
    id: string;
    url: string;
    created_at: string;
    updated_at: string;
}

export const DeepLinkRouter = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const followDeeplink = async () => {
      const tg = (window as any).Telegram?.WebApp;
      const param: string | undefined = tg?.initDataUnsafe?.start_param;
      if (!param) return;

      // eslint-disable-next-line react-hooks/rules-of-hooks
      useAuth();

      try {
        const response = await resolveDeeplink(param);
        const deeplink = response.data as Deeplink;
        if (deeplink.url.startsWith('/')) navigate(deeplink.url, { replace: true });
      } catch (e) {
        console.error('Broken start_param', e);
      }
    };

    followDeeplink();

  }, [navigate]);

  return null;
};

import {useEffect, useState} from 'react';
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
  const { loading } = useAuth();
  const [ isRedirected, setIsRedirected ]  = useState<boolean>(false);

  useEffect(() => {
    const followDeeplink = async () => {
      if (loading || isRedirected) {
          return;
      }
      const tg = (window as any).Telegram?.WebApp;
      const param: string | undefined = tg?.initDataUnsafe?.start_param;
      if (!param) {
        setIsRedirected(true);
        return;
      }

      try {
        const response = await resolveDeeplink(param);
        const deeplink = response.data as Deeplink;
        if (deeplink.url.startsWith('/')) {
          setIsRedirected(true);
          navigate(deeplink.url, {
            replace: true
          });
        }
      } catch (e) {
        console.error('Broken start_param', e);
      }
    };

    followDeeplink();

  }, [loading, navigate]);

  return null;
};

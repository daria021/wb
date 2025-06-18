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
    console.log("hi", isRedirected, loading);
    const followDeeplink = async () => {
      if (loading || isRedirected) {
        console.log("oops", isRedirected, loading);
        return;
      }
      const param = window.location.href
          .split("tgWebAppStartParam")[1]
          .split("#")[0]
          .replace("=link_", "")
          .replace("=", "");
      console.log("param", param);
      console.log("loc", window.location);
      if (!param) {
        console.log("wtf");
        setIsRedirected(true);
        return;
      }

      try {
        console.log("start");
        const response = await resolveDeeplink(param);
        console.log("response", response.data);
        const deeplink = response.data as Deeplink;
        console.log("deeplink", deeplink);
        if (deeplink.url.startsWith('/')) {
          console.log("url", deeplink.url);
          setIsRedirected(true);
          navigate(deeplink.url, {
            replace: true
          });
        }
        else {
          console.log("url fail", deeplink.url);
        }
      } catch (e) {
        console.error('Broken start_param', e);
      }
    };

    followDeeplink();

  }, [loading, navigate]);

  return null;
};

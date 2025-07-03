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
  const navigate = useNavigate()
  const { loading } = useAuth()
  const [isRedirected, setIsRedirected] = useState(false)

  useEffect(() => {
    // Ждём, пока профиль инициализируется
    if (loading || isRedirected) return

    const href = window.location.href
    // Ищем startParam через регулярку сразу
    const m = /tgWebAppStartParam([^#]+)/.exec(href)
    // Если нет ни одного — сразу помечаем, что отработали, и выходим
    if (!m) {
      setIsRedirected(true)
      return
    }

    // Достаём параметр и чистим префикс
    const raw = m[1] // например "link_abc123"
    const param = raw.replace(/^link_/, '')
    if (!param) {
      setIsRedirected(true)
      return
    }

    // Всё ок, пробуем резолвить
    resolveDeeplink(param)
      .then((res) => {
        const { url } = res.data as Deeplink;
        setIsRedirected(true)
        if (url.startsWith('/')) {
          navigate(url, { replace: true })
        } else {
          // если внешняя ссылка
          window.location.href = url

        }
      })
      .catch((err) => {
        console.error('Broken start_param', err)
        setIsRedirected(true)
      })
  }, [loading, isRedirected, navigate])

  return null
}

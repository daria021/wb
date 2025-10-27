import React, {createContext, useEffect, useMemo, useRef, useState} from 'react';
import {ProductStatus, UserRole} from '../enums';
import {apiClient} from '../services/apiClient';
import {useAuth} from './auth';

/* ======================= Типы домена ======================= */
interface Product {
    id: string;
    name: string;
    brand: string;
    article: string;
    category: string;
    key_word: string;
    general_repurchases: number;
    // daily_repurchases: number;
    price: number;
    wb_price: number;
    tg: string;
    payment_time: string;
    review_requirements: string;
    image_path?: string;
    seller_id: string;
    created_at: string;
    updated_at: string;
    status: ProductStatus;
    always_show?: boolean;
}

interface Order {
    id: string;
    user_id: string;
    product_id: string;
    card_number: string;
    screenshot_path: string;
    status: string;
    created_at: string;
    updated_at: string;
    step: number;
    product: Product;
    user: {
        nickname: string;
    };
}

interface User {
    id: string;
    telegram_id?: number;
    nickname?: string;
    role: UserRole;
    balance: number;
    is_banned: boolean;
    is_seller: boolean;
    created_at: string; // ISO-строка
    updated_at: string; // ISO-строка
    total_plan: number;       // общий план (ACTIVE + NOT_PAID)
    reserved_active: number;  // зарезервировано под ACTIVE
    unpaid_plan: number;      // план под NOT_PAID
    free_balance: number;     // сколько свободно (balance – reserved_active)
}

export interface BootstrapData {
    me: User;
    products: Product[];
    orders: Order[];
}

/* ======================= Контекст ======================= */
export const BootstrapContext = createContext<BootstrapData | null>(null);

/* ======================= Вспомогалки ======================= */
type Phase = 'idle' | 'auth' | 'loading' | 'ready' | 'error';

const INIT_TIMEOUT_MS = 15_000;

/**
 * Хук с таймаутом: если загрузка /init тянется дольше порога — переключаемся в error.
 */
function useInitWithTimeout<T>(
    loader: () => Promise<T>,
    deps: React.DependencyList,
    timeoutMs = INIT_TIMEOUT_MS,
    enabled: boolean = true,
) {
    const [phase, setPhase] = useState<Phase>('idle');
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<unknown>(null);
    const abortRef = useRef<{ aborted: boolean }>({aborted: false});

    useEffect(() => {
        if (!enabled) {
            return;
        }
        let timer: number | null = null;
        abortRef.current.aborted = false;
        setPhase('loading');
        setError(null);

        // стартуем таймер «страховки от вечной крутилки»
        timer = window.setTimeout(() => {
            if (!abortRef.current.aborted) {
                setPhase('error');
                setError(new Error('Инициализация превысила лимит времени'));
            }
        }, timeoutMs);

        (async () => {
            try {
                const res = await loader();
                if (abortRef.current.aborted) return;
                setData(res);
                setPhase('ready');
            } catch (e) {
                if (abortRef.current.aborted) return;
                setError(e);
                setPhase('error');
            } finally {
                if (timer) window.clearTimeout(timer);
            }
        })();

        return () => {
            abortRef.current.aborted = true;
            if (timer) window.clearTimeout(timer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, ...deps]);

    const retry = useMemo(
        () => () => {
            // принудительный рестарт эффекта: меняем «псевдо-зависимость» через фазу
            setPhase('idle');
            setTimeout(() => setPhase('loading'), 0);
        },
        []
    );

    return {phase, data, error, retry, setPhase};
}

/* ======================= UI-заглушки ======================= */
function FullPageSpinner() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-gray-600 always-spin"/>
        </div>
    );
}

function FullPageError(props: { message?: string; onRetry?: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="text-lg font-semibold">Не удалось инициализировать приложение</div>
            {props.message && (
                <div className="max-w-md text-sm text-gray-500">{String(props.message)}</div>
            )}
            <div className="flex items-center gap-3">
                {props.onRetry && (
                    <button
                        onClick={props.onRetry}
                        className="rounded-lg px-4 py-2 border border-gray-300 hover:bg-gray-50"
                    >
                        Повторить
                    </button>
                )}
                <button
                    onClick={() => window.location.reload()}
                    className="rounded-lg px-4 py-2 bg-brand text-white"
                >
                    Обновить страницу
                </button>
            </div>
        </div>
    );
}

/* ======================= Провайдер ======================= */
export function BootstrapProvider({children}: { children: React.ReactNode }) {
    const {loading: authLoading} = useAuth(); // ждём, когда AuthProvider получит/попробует токен
    const [bootstrapData, setBootstrapData] = useState<BootstrapData | null>(null);

    const canInit = !authLoading; // инициализируемся только после завершения авторизации

    const {phase, data, error, retry, setPhase} = useInitWithTimeout<BootstrapData>(
        async () => {
            console.log(`using callback ${authLoading}`);
            // ВАЖНО: делаем /init только когда авторизация закончена (даже если токена нет)
            // Интерцепторы apiClient сами попробуют пере-логиниться на 401 (если так настроены).
            const res = await apiClient.get<BootstrapData>('/init');
            return res.data;
        },
        // завязываемся на переключение authLoading -> false
        [canInit],
        INIT_TIMEOUT_MS,
        canInit,
    );

    // Когда авторизация ещё идёт — отображаем сплэш, но не стартуем загрузку /init.
    useEffect(() => {
        console.log(`authLoading: ${authLoading} ${phase}`)
        if (authLoading) {
            setPhase('auth'); // для читаемости состояния
        } else if (phase === 'auth' || phase === 'idle') {
            // триггерим загрузку /init, как только авторизация завершилась
            setPhase('loading');
        } else {
            console.log("wow line 198");
        }
    }, [authLoading, phase, setPhase]);

    // Кладём успешные данные в state провайдера
    useEffect(() => {
        if (phase === 'ready' && data) {
            console.log("bootstrap ready");
            setBootstrapData(data);
        }
    }, [phase, data]);

    // Рендер-состояния
    if (authLoading || phase === 'auth' || phase === 'loading') {
        console.log("line 211");
        return <FullPageSpinner/>;
    }

    if (phase === 'error') {
        // Вместо страницы ошибки показываем крутилку
        return <FullPageSpinner/>;
    }

    if (!bootstrapData) {
        // Теоретически сюда не попадём после ready, но оставим «страховку»
        console.log("line 225");
        return <FullPageSpinner/>;
    }

    return (
        <BootstrapContext.Provider value={bootstrapData}>
            {children}
        </BootstrapContext.Provider>
    );
}

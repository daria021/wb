import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {
    banUser,
    demoteUser,
    getBlackListUser,
    getOrderBySellerId,
    getProductsByUserId,
    getReviewsByUser,
    getUser,
    getUserBalanceHistory,
    getUserHistory,
    increaseReferralBonus,
    increaseSellerBalance,
    promoteUser,
    unbanUser,
    /** Переименовали импорт, чтобы не начинать с "use" */
        useDiscount as apiUseDiscount
} from '../../services/api';
import {OrderStatus, ProductStatus, UserRole} from '../../enums';

interface User {
    id: string;
    telegram_id: number;
    nickname: string;
    role: UserRole;
    is_banned: boolean;
    is_seller: boolean;
    balance: number;
    invited_by: string | null;
    has_discount: boolean;
    referrer_bonus: number;
    inviter: { id: string; nickname: string };
}

interface Order {
    id: string;
    transaction_code: string;
    product: { id: string; name: string; image_path?: string };
    user: { nickname: string };
    seller: { id: string; nickname: string };
    status: OrderStatus;
    step: number;
    created_at: string;
    search_screenshot_path?: string;
    cart_screenshot?: string;
    final_cart_screenshot?: string;
    delivery_screenshot_path?: string;
    barcodes_screenshot_path?: string;
    review_screenshot_path?: string;
    receipt_screenshot_path?: string;
    card_number?: string;
    phone_number?: string;
    name?: string;
    bank?: string;
    receipt_number?: string;
    order_date: Date;
}

interface Product {
    id: string;
    name: string;
    article: string;
    price: number;
    remaining_products: number;
    status: ProductStatus;
    image_path?: string;
    general_repurchases: number;
    wb_price: number;
    category: string;
    brand: string;
}

interface UserHistory {
    id: string;
    user_id: string;
    creator_id: string;
    product_id: string | null;
    action:
        | 'product_create'
        | 'status_changed'
        | 'product_changed'
        | 'moderation_done'
        | 'moderation_failed'
        | 'ended'
        | 'agree_terms'
        | 'first_step_done'
        | 'second_step_done'
        | 'third_step_done'
        | 'fourth_step_done'
        | 'fifth_step_done'
        | 'sixth_step_done'
        | 'seventh_step_done'
        | 'cashback_done'
        | 'cashback_rejected';
    date: string;
    json_before?: any;
    json_after?: any;
}

interface BalanceHistory {
    id: string;
    user_id: string;
    sum: number;
    created_at: string;
}


interface ModeratorReview {
    id: string;
    moderator_id: string;
    comment_to_seller?: string | null;
    comment_to_moderator?: string | null;
    product_id: string;
    status_before: ProductStatus; // 'ACTIVE' | 'NOT_PAID' | ...
    status_after: ProductStatus;
    created_at: string;
    updated_at: string;
}


function Collapsible({
                         title,
                         initialOpen = false,
                         rightSlot,
                         children,
                         className = '',
                     }: {
    title: React.ReactNode;
    initialOpen?: boolean;
    rightSlot?: React.ReactNode; // например, кнопки фильтров можно вынести вправо в заголовок
    children: React.ReactNode;
    className?: string;
}) {
    const [open, setOpen] = useState(initialOpen);

    return (
        <div className={`bg-white rounded-lg shadow ${className}`}>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-3"
            >
                <span className="text-xl font-semibold text-left">{title}</span>

                <div className="flex items-center gap-3">
                    {rightSlot}
                    {/* простая стрелка */}
                    <svg
                        className={`h-5 w-5 transition-transform ${open ? 'rotate-180' : 'rotate-0'}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 011.06.02L10 11.084l3.71-3.854a.75.75 0 111.08 1.04l-4.24 4.4a.75.75 0 01-1.08 0l-4.24-4.4a.75.75 0 01.02-1.06z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
            </button>

            {open && <div className="px-4 pb-4 pt-0">{children}</div>}
        </div>
    );
}


export default function ModeratorUserDetailPage() {
    const {userId} = useParams<{ userId: string }>();
    const navigate = useNavigate();

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [ordersFilter, setOrdersFilter] = useState(''); // для поиска по коду

    const [products, setProducts] = useState<Product[]>([]);
    const [productsLoading, setProductsLoading] = useState(true);

    const [balanceInput, setBalanceInput] = useState('');
    const [bonusInput, setBonusInput] = useState('');

    const [history, setHistory] = useState<UserHistory[]>([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [balanceHistory, setBalanceHistory] = useState<BalanceHistory[]>([]);

    const [creatorMap, setCreatorMap] = useState<Record<string, { nickname: string; role: UserRole }>>({});

    // состояние модалки диффа
    const [diffOpen, setDiffOpen] = useState(false);
    const [diffTitle, setDiffTitle] = useState<string>('');
    const [diffProductId, setDiffProductId] = useState<string | null>(null);
    const [diffRows, setDiffRows] = useState<DiffRow[]>([]);
    const [diffShowAll, setDiffShowAll] = useState(false);

    const [imgOpen, setImgOpen] = useState(false);
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const openImage = (src: string) => {
        setImgSrc(src);
        setImgOpen(true);
    };
    const closeImage = () => {
        setImgOpen(false);
        setImgSrc(null);
    };

    const [reviews, setReviews] = useState<ModeratorReview[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const productStatusRu = (s?: string) =>
        ({
            ACTIVE: 'в каталог',
            NOT_PAID: 'не оплачено',
            ARCHIVED: 'архив',
            CREATED: 'создан',
            DISABLED: 'ожидает редактирования',
            REJECTED: 'отклонен'
        } as Record<string, string>)[(s || '').toUpperCase()] || (s ?? '—');


// ---- RU labels / русификация ключей ----
    const RU_FIELD_LABELS: Record<string, string> = {
        id: 'ID',
        name: 'Название',
        brand: 'Бренд',
        article: 'Артикул',
        category: 'Категория',
        price: 'Наша цена',
        wb_price: 'Цена WB',
        remaining_products: 'Остаток',
        status: 'Статус',
        general_repurchases: 'План раздач',
        image_path: 'Фото',
        images: 'Изображения',
        description: 'Описание',
        moderator_reviews: 'Отзывы модератора',
        created_at: 'Создано',
        updated_at: 'Обновлено',
        keywords: 'Ключевые слова',
        key_word: 'Ключевые слова',
        tg: 'Телеграм',
        review_requirements: 'Требования к отзыву',
        requirements_agree: 'Необходимость согласоввания отзыва',
        seller_id: 'ID продавца',
        payment_time: 'Срок выплаты',
        status_before: 'Статус (до)',
        status_after: 'Статус (после)',
    };

    const statusToRuAfterModeration = (s?: any) => {
        const st = String(s || '').toUpperCase();
        if (st === 'ACTIVE') return 'в каталог';
        if (st === 'NOT_PAID') return 'не оплачено';
        if (st === 'ARCHIVED') return 'архив';
        if (st === 'CREATED') return 'создан';
        if (st === 'DISABLED') return 'ожидает редактирования';
        if (st === 'REJECTED') return 'отклонено';
        return st ? st.toLowerCase() : '—';
    };

    const STATUS_RU: Record<string, string> = {
        active: 'в каталоге',
        not_paid: 'не оплачено',
        archived: 'архив',
        created: 'создан',
        disabled: 'ожидает редактирования',
        rejected: 'отклонено',
    };

    const humanize = (s: string) =>
        s.replace(/\[\d+\]/g, '')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (ch) => ch.toUpperCase());

    function ruLabel(path: string) {
        // убираем индексы массивов везде
        const noIndexes = path.replace(/\[\d+\]/g, '');

        const m = noIndexes.match(/^([^.[]+)/);
        const first = m ? m[1] : noIndexes;

        const base = RU_FIELD_LABELS[first] || humanize(first);

        const rest = noIndexes
            .slice(first.length)
            .replace(/\.name/g, '.Название')
            .replace(/\.price/g, '.Цена')
            .replace(/\.brand/g, '.Бренд')
            .replace(/\.category/g, '.Категория')
            .replace(/\.comment_to_moderator/g, '.Комментарий модератору')
            .replace(/\.comment_to_seller/g, '.Комментарий продавцу')
            .replace(/\.created_at/g, '.Создано')
            .replace(/\.status_before/g, '.Статус (до)')
            .replace(/\.status_after/g, '.Статус (после)')
            .replace(/\.moderator_id/g, '.ID модератора')
            .replace(/\.product_id/g, '.ID товара');

        return `${base}${rest}`;
    }


// ---- Даты (красиво) ----
    function formatDateNice(v: string) {
        // пробуем как ISO
        const d = new Date(v);
        if (!Number.isNaN(d.getTime())) {
            const dd = d.getDate().toString().padStart(2, '0');
            const mm = (d.getMonth() + 1).toString().padStart(2, '0');
            const yyyy = d.getFullYear();
            const HH = d.getHours().toString().padStart(2, '0');
            const MM = d.getMinutes().toString().padStart(2, '0');
            return `${dd}.${mm}.${yyyy} ${HH}:${MM}`;
        }
        // строки типа 2025-07-04T02:06:06.399248
        const m = v.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/);
        if (m) {
            const [, y, mo, d2, h, mi, s] = m;
            return `${d2}.${mo}.${y} ${h}:${mi}${s ? `:${s}` : ''}`;
        }
        return v;
    }

    function looksLikeDate(v: any) {
        return typeof v === 'string' && /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(v);
    }

// ---- Фото ----
    function looksLikeImageUrl(v: any) {
        return (
            typeof v === 'string' &&
            (/\.(jpg|jpeg|png|webp|gif)$/i.test(v) || v.startsWith('http') || v.startsWith('/'))
        );
    }

// ---- Отображение значений ----
    function renderValue(path: string, v: any) {
        // статусы русифицируем
        if (typeof v === 'string' && STATUS_RU[v]) v = STATUS_RU[v];

        // даты — красиво
        if (looksLikeDate(v)) {
            return <time className="text-[13px] leading-5">{formatDateNice(v)}</time>;
        }

        // фото — кнопкой
        if (looksLikeImageUrl(v)) {
            return (
                <button
                    type="button"
                    onClick={() => openImage(v)}
                    className="inline-flex items-center px-2 py-1 rounded border border-blue-200 text-blue-700 hover:bg-blue-50 text-xs"
                >
                    Фото
                </button>
            );
        }


        // простые типы
        if (v == null || typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
            return <pre
                className="whitespace-pre-wrap break-words text-[13px] leading-5 max-w-full">{String(v ?? '—')}</pre>;
        }

        // объекты/массивы
        let s = '';
        try {
            s = JSON.stringify(v, null, 2);
        } catch {
            s = String(v);
        }
        return <pre className="whitespace-pre-wrap break-words text-[13px] leading-5 max-w-full">{s}</pre>;
    }

    function renderHistoryItem(h: AnyHistory, i: number) {
        return (
            <li key={h.id || `${h.__type}-${i}`} className="border rounded p-3 bg-gray-50">
                {(() => {
                    const isUser = h.__type === 'user';
                    const isReview = h.__type === 'review';

                    const canOpenProduct =
                        (isUser && !!(h as UserHistory).product_id) ||
                        (isReview && !!(h as ModeratorReview).product_id);

                    const canCompare = isUser && (h as UserHistory).action === 'product_changed';
                    const hasActions = !!(canOpenProduct || canCompare);

                    // const title = isUser
                    //     ? historyBase(h as AnyHistory)
                    //     : (() => {
                    //         const r = h as ModeratorReview;
                    //         const p = products.find((x) => x.id === r.product_id);
                    //         return `модератор оставил комментарий к товару «${p?.name || 'товар'}»`;
                    //     })();
                    //
                    // const whoLine = isUser
                    //     ? actorLabel(h as UserHistory)
                    //     : (() => {
                    //         const r = h as ModeratorReview;
                    //         const info = creatorMap[r.moderator_id];
                    //         return info ? `модератор @${info.nickname}` : 'модератор';
                    //     })();

                    let title: string;
                    if (isUser) {
                        title = historyBase(h); // user-ивенты
                    } else if (isReview) {
                        const r = h as ModeratorReview; // review-ивенты
                        const p = products.find(x => x.id === r.product_id);
                        title = `модератор оставил комментарий к товару «${p?.name || 'товар'}»`;
                    } else {
                        title = historyBase(h); // <<< balance-ивенты идут сюда
                    }

                    let whoLine = '';
                    if (isUser) {
                        whoLine = actorLabel(h as UserHistory);
                    } else if (isReview) {
                        const r = h as ModeratorReview;
                        const info = creatorMap[r.moderator_id];
                        whoLine = info ? `модератор @${info.nickname}` : 'модератор';
                    }
// для balance-ивентов whoLine оставляем пустым


                    const commentsNode = (() => {
                        if (!isReview) return null;
                        const r = h as ModeratorReview;

                        const seller = r.comment_to_seller?.trim();
                        const mods = r.comment_to_moderator?.trim();

                        const sellerCut = seller ? cut(seller, 220) : null;
                        const modsCut = mods ? cut(mods, 220) : null;

                        const sellerKey = `${r.id}-seller`;
                        const modsKey = `${r.id}-moderator`;

                        return (
                            <>
                                {seller && (
                                    <div className="mt-1 text-sm">
                                        <span className="text-gray-500 text-xs">для продавца:</span>{' '}
                                        <span className="whitespace-pre-wrap break-words">
                    {expandedReview[sellerKey] || !sellerCut?.isLong ? seller : sellerCut.short}
                  </span>
                                        {sellerCut?.isLong && (
                                            <button onClick={() => toggleReview(sellerKey)}
                                                    className="ml-1 text-blue-600 text-xs underline">
                                                {expandedReview[sellerKey] ? 'Свернуть' : 'Показать'}
                                            </button>
                                        )}
                                    </div>
                                )}

                                {mods && (
                                    <div className="mt-1 text-sm">
                                        <span className="text-gray-500 text-xs">для модераторов:</span>{' '}
                                        <span className="whitespace-pre-wrap break-words">
                    {expandedReview[modsKey] || !modsCut?.isLong ? mods : modsCut.short}
                  </span>
                                        {modsCut?.isLong && (
                                            <button onClick={() => toggleReview(modsKey)}
                                                    className="ml-1 text-blue-600 text-xs underline">
                                                {expandedReview[modsKey] ? 'Свернуть' : 'Показать'}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </>
                        );
                    })();

                    return (
                        <div className={`flex justify-between ${hasActions ? 'items-start' : 'items-center'}`}>
                            <div className="text-sm flex-1 min-w-0">
                                <div className="font-medium">{title}</div>
                                {commentsNode}
                                {whoLine ? <div className="text-xs text-gray-500">{whoLine}</div> : null}
                                <div className="text-xs text-gray-600 mt-0.5">{fmtDate(histDate(h))}</div>
                            </div>

                            {hasActions && (
                                <div className="flex flex-col items-end gap-2 shrink-0 w-max">
                                    {canOpenProduct && (
                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/moderator/products/${
                                                        isUser
                                                            ? (h as UserHistory).product_id
                                                            : (h as ModeratorReview).product_id
                                                    }`
                                                )
                                            }
                                            className="px-2 py-1 rounded border border-blue-200 text-blue-700 hover:bg-blue-50 text-xs whitespace-nowrap leading-tight"
                                        >
                                            К товару
                                        </button>
                                    )}
                                    {canCompare && (
                                        <button
                                            onClick={() => openDiffForHistory(h as UserHistory)}
                                            className="px-2 py-1 rounded border border-brand/30 text-brand hover:bg-brand/5 text-xs whitespace-nowrap leading-tight"
                                        >
                                            Сравнить
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })()}
            </li>
        );
    }

    function renderBalanceItem(b: BalanceHistory) {
        const sign = b.sum > 0 ? 'Баланс пополнен' : 'Баланс списан';
        return (
            <li key={b.id} className="border rounded p-3 bg-gray-50">
                <div className="text-sm flex-1 min-w-0">
                    <div className="font-medium">
                        {sign} на {Math.abs(b.sum)} раздач
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">{fmtDate(b.created_at)}</div>
                </div>
            </li>
        );
    }


    const totalPlan = products
        .filter(p =>
            p.status === ProductStatus.ACTIVE ||
            p.status === ProductStatus.NOT_PAID
        )
        .reduce((sum, p) => sum + p.general_repurchases, 0);
    const availableInCatalog = products
        .filter(p => p.status === ProductStatus.ACTIVE)
        .reduce((sum, p) => sum + p.general_repurchases, 0);

    const unpaidDistributions = products
        .filter(p => p.status === ProductStatus.NOT_PAID)
        .reduce((sum, p) => sum + p.general_repurchases, 0);

    // подсчёт завершённых/начатых покупок
    const completedCount = orders.filter(o => o.status === OrderStatus.CASHBACK_PAID).length;

    // управление скриншотами
    const [screenshotsVisible, setScreenshotsVisible] = useState<Record<string, boolean>>({});
    const toggleScreenshots = (orderId: string) => {
        setScreenshotsVisible(prev => ({
            ...prev,
            [orderId]: !prev[orderId]
        }));
    };

    const [purchaseFilter, setPurchaseFilter] = useState<'all' | 'completed' | 'started'>('all');

// отсортировать по дате создания (свежие первыми)
    const sortedOrders = [...orders].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

// затем применить фильтр completed/started
    const afterStatusFilter = sortedOrders.filter(o => {
        if (purchaseFilter === 'completed') return o.status === OrderStatus.CASHBACK_PAID;
        if (purchaseFilter === 'started') return o.status !== OrderStatus.CASHBACK_PAID;
        return true;
    });

// и только потом — поиск по коду
    const filteredOrders = afterStatusFilter.filter(o =>
        ordersFilter ? o.transaction_code.includes(ordersFilter) : true
    );

    const toDisplay = (v: any) => {
        if (v == null) return '—';
        if (isPrimitive(v)) return String(v);
        try {
            return JSON.stringify(v, null, 2);
        } catch {
            return String(v);
        }
    };


    // Загрузка профиля
    useEffect(() => {
        if (!userId) return;
        getUser(userId)
            .then(res => setUser(res.data))
            .finally(() => setLoading(false));
    }, [userId]);

    // Загрузка заказов пользователя
    useEffect(() => {
        setOrdersLoading(true);
        getOrderBySellerId(userId!)
            .then(res => setOrders(res.data))
            .catch(console.error)
            .finally(() => setOrdersLoading(false));
    }, [userId]);

    // Загрузка товаров продавца
    useEffect(() => {
        if (!user?.is_seller) {
            setProducts([]);
            setProductsLoading(false);
            return;
        }
        setProductsLoading(true);
        getProductsByUserId(user.id)
            .then(res => setProducts(res.data.products || res.data))
            .catch(console.error)
            .finally(() => setProductsLoading(false));
    }, [user]);

    useEffect(() => {
        if (!userId) return;
        getUserBalanceHistory(userId)
            .then(res => setBalanceHistory(res.data || []))
            .catch(console.error);
    }, [userId]);

    useEffect(() => {
        if (!userId) return;
        setReviewsLoading(true);
        getReviewsByUser(userId)
            .then(res => setReviews(res.data || []))
            .catch(console.error)
            .finally(() => setReviewsLoading(false));
    }, [userId]);


    useEffect(() => {
        // Собираем уникальные creator_id из UserHistory
        const ids = Array.from(new Set(history.map(h => h.creator_id).filter(Boolean))) as string[];

        // Отфильтруем тех, кого ещё не знаем
        const missing = ids.filter(id => !creatorMap[id]);

        if (missing.length === 0) return;

        // Тянем параллельно; если что-то упало — просто скипаем
        Promise.all(
            missing.map(id =>
                getBlackListUser(id)
                    .then(res => ({id, user: res.data as User}))
                    .catch(() => null)
            )
        ).then(results => {
            const patch: Record<string, { nickname: string; role: UserRole }> = {};
            results.forEach(r => {
                if (!r) return;
                patch[r.id] = {nickname: r.user.nickname, role: r.user.role};
            });
            if (Object.keys(patch).length) {
                setCreatorMap(prev => ({...prev, ...patch}));
            }
        });
    }, [history, creatorMap]);

    useEffect(() => {
        // Собираем id модераторов из отзывов, которых ещё нет в creatorMap
        const ids = Array.from(new Set(reviews.map(r => r.moderator_id))).filter(Boolean) as string[];
        const missing = ids.filter(id => !creatorMap[id]);

        if (missing.length === 0) return;

        Promise.all(
            missing.map(id =>
                getBlackListUser(id)
                    .then(res => ({id, user: res.data as User}))
                    .catch(() => null)
            )
        ).then(results => {
            const patch: Record<string, { nickname: string; role: UserRole }> = {};
            results.forEach(r => {
                if (!r) return;
                patch[r.id] = {nickname: r.user.nickname, role: r.user.role};
            });
            if (Object.keys(patch).length) setCreatorMap(prev => ({...prev, ...patch}));
        });
    }, [reviews, creatorMap]);

// + расширяем AnyHistory и добавляем локальный стейт для раскрытия длинных текстов
    type AnyHistory =
        | ({ __type: 'user' } & UserHistory)
        | ({ __type: 'balance' } & BalanceHistory)
        | ({ __type: 'review' } & ModeratorReview);

    const [expandedReview, setExpandedReview] = useState<Record<string, boolean>>({});
    const toggleReview = (key: string) =>
        setExpandedReview(s => ({...s, [key]: !s[key]}));

    const productStatusRuUpper = (s?: string) =>
        ({
            ACTIVE: 'в каталог',
            NOT_PAID: 'не оплачено',
            ARCHIVED: 'архив',
            CREATED: 'создан',
            REJECTED: 'отклонено',
            DISABLED: 'ожидает редактирования',
        } as Record<string, string>)[(s || '').toUpperCase()] || (s ?? '—');

    const cut = (t: string, n = 220) => t.length > n ? {
        short: t.slice(0, n).trim() + '…',
        long: t,
        isLong: true
    } : {short: t, long: t, isLong: false};


    const combinedHistory: AnyHistory[] = [
        ...history.map(h => ({...h, __type: 'user' as const})),
        ...balanceHistory.map(b => ({...b, __type: 'balance' as const})),
        ...reviews.map(r => ({...r, __type: 'review' as const})), // <-- ДОБАВИЛИ
    ];


    // +++ Загрузка истории действий пользователя
    useEffect(() => {
        if (!userId) return;
        setHistoryLoading(true);
        getUserHistory(userId)
            .then(res => setHistory(res.data || []))
            .catch(console.error)
            .finally(() => setHistoryLoading(false));
    }, [userId]);


    if (loading || !user) return <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-gray-600 always-spin"/>
    </div>;

    const toggleBan = async () => {
        try {
            if (user.is_banned) await unbanUser(user.id);
            else await banUser(user.id);
            setUser(u => u && {...u, is_banned: !u.is_banned});
        } catch (e) {
            console.error(e);
        }
    };

    const toggleRole = async () => {
        try {
            if (user.role === UserRole.MODERATOR) {
                await demoteUser(user.id);
                setUser(u => u && {...u, role: UserRole.USER});
            } else {
                await promoteUser(user.id);
                setUser(u => u && {...u, role: UserRole.MODERATOR});
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Изменение баланса на delta
    const changeBalance = async (delta: number) => {
        const fd = new FormData();
        fd.append('balance', delta.toString());
        await increaseSellerBalance(user.id, fd);
        setUser(u => u && ({...u, balance: u.balance + delta}));

        // <<< добавь это, чтобы новая запись сразу попала в комбинированную историю
        try {
            const res = await getUserBalanceHistory(user.id);
            setBalanceHistory(res.data || []);
        } catch (e) {
            console.error(e);
        }
    };


    const clearBalance = async () => {
        if (user.balance > 0) {
            await changeBalance(-user.balance);
        }
    };

    // Изменение реферального бонуса на delta
    const changeBonus = async (delta: number) => {
        await increaseReferralBonus(user.id, {bonus: delta});
        setUser(u => u && {...u, referrer_bonus: u.referrer_bonus + delta});
    };
    const clearBonus = async () => {
        if (user.referrer_bonus > 0) {
            await changeBonus(-user.referrer_bonus);
        }
    };

    // Отметить использование скидки
    const handleDiscountUsed = async () => {
        try {
            await apiUseDiscount(user.id);
            setUser(u => u && {...u, has_discount: false});
            alert('Скидка отмечена использованной!');
        } catch (e) {
            console.error(e);
            alert('Не удалось отметить использование скидки');
        }
    };

    const getStatusLabel = (s: OrderStatus) =>
        ({
            [OrderStatus.CASHBACK_NOT_PAID]: 'Кешбэк не выплачен',
            [OrderStatus.PAYMENT_CONFIRMED]: 'Оплата подтверждена',
            [OrderStatus.CASHBACK_PAID]: 'Кешбэк выплачен',
            [OrderStatus.CANCELLED]: 'Отменён',
            [OrderStatus.CASHBACK_REJECTED]: 'Кешбэк отклонен'
        }[s] || s);

    const screenshotLabels: Record<string, string> = {
        search_screenshot_path: 'Поиск',
        cart_screenshot: 'Корзина',
        final_cart_screenshot: 'Итоговая корзина',
        delivery_screenshot_path: 'Доставка',
        barcodes_screenshot_path: 'Штрихкоды',
        review_screenshot_path: 'Отзыв',
        receipt_screenshot_path: 'Чек',
        card_number: 'Номер карты',
        phone_number: 'Телефон',
        name: 'Имя',
        bank: 'Банк',
        receipt_number: 'Номер чека',
    };

    // === История: утилиты ===
    const productNameById = (pid?: string | null) => {
        if (!pid) return 'товар';
        const p = products.find(x => x.id === pid);
        return p?.name || 'товар';
    };

    const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleString() : '');

    const money = (x: any) => {
        const n = Number(x);
        if (Number.isFinite(n)) return `${n} ₽`;
        return String(x ?? '—');
    };

// Пытаемся достать сумму кешбэка/условия из json_* (если сервер их туда положил)
    const pickCashbackAmount = (j?: any) =>
        j?.cashback_amount ?? j?.cashback ?? j?.amount ?? j?.price ?? null;

    const pickPayoutTerms = (j?: any) =>
        j?.payment_time ?? j?.payout_terms ?? j?.payment_terms ?? null;

// Текст для строки истории
    function historyLine(h: UserHistory): string {
        const name =
            h.json_after?.name || h.json_before?.name || productNameById(h.product_id);

        switch (h.action) {
            case 'product_create':
                return `создал(а) товар «${name}» на ${h.json_before?.general_repurchases ?? '—'} раздач`;

            case 'status_changed': {
                const after = (h.json_after?.status || h.json_before?.status || '').toString();
                if (after === 'ARCHIVED') return `товар «${name}» заархивирован`;
                if (after === 'ACTIVE') return `товар «${name}» опубликован в каталог`;
                if (after === 'NOT_PAID') return `товар «${name}» переведён в статус «не оплачено»`;
                return `изменён статус товара «${name}» → ${after || '—'}`;
            }

            case 'product_changed': {
                // коротко покажем, что редактировалось (по полям)
                const a = h.json_after || {};
                const b = h.json_before || {};
                const keys = Array.from(new Set([...Object.keys(a), ...Object.keys(b)]));
                const changed = keys.filter(k => a[k] !== b[k] && k !== 'updated_at').slice(0, 6);
                // const suffix = changed.length ? ` (изменены: ${changed.join(', ')}${keys.length > 6 ? '…' : ''})` : '';
                return `товар «${name}» отредактирован`;
            }

            case 'moderation_done': {
                const after = (h.json_after?.status || h.json_before?.status);
                return `товар «${name}» прошёл модерацию → ${statusToRuAfterModeration(after)}`;
            }

            case 'moderation_failed': {
                const after = (h.json_after?.status || h.json_before?.status);
                const comment =
                    h.json_after?.comment_to_seller ??
                    h.json_after?.comment ??
                    h.json_before?.comment_to_seller ??
                    '';
                const base = `товар «${name}» не прошёл модерацию → ${statusToRuAfterModeration(after)}`;
                return comment ? `${base}. комментарий: ${comment}` : base;
            }


            case 'ended':
                return `товар «${name}» закончился в каталоге`;
            case 'agree_terms':
                return `принял условия выкупа по товару «${name}»`;
            case 'first_step_done':
                return `завершил(а) шаг 1 по товару «${name}»`;
            case 'second_step_done':
                return `завершил(а) шаг 2 по товару «${name}»`;
            case 'third_step_done':
                return `завершил(а) шаг 3 по товару «${name}»`;
            case 'fourth_step_done':
                return `завершил(а) шаг 4 по товару «${name}»`;
            case 'fifth_step_done':
                return `завершил(а) шаг 5 по товару «${name}»`;
            case 'sixth_step_done':
                return `завершил(а) шаг 6 по товару «${name}»`;
            case 'seventh_step_done':
                return `завершил(а) шаг 7 по товару «${name}»`;

            case 'cashback_done': {
                const amt = pickCashbackAmount(h.json_after) ?? pickCashbackAmount(h.json_before);
                const terms = pickPayoutTerms(h.json_after) ?? pickPayoutTerms(h.json_before);
                const parts = [`кешбэк выплачен по товару «${name}»`];
                if (amt != null) parts.push(`на сумму ${money(amt)}`);
                if (terms) parts.push(`(условия: ${terms})`);
                return parts.join(' ');
            }

            case 'cashback_rejected': {
                const comment = h.json_after?.comment_to_seller
                    ?? h.json_after?.comment
                    ?? h.json_before?.comment_to_seller;
                const parts = [`кешбэк отклонён по товару «${name}»`];
                if (comment) parts.push(`— комментарий модератора: ${comment}`);
                return parts.join(' ');
            }

            default:
                return h.action;
        }
    }

    function actorLabel(h: UserHistory): string {
        const info = creatorMap[h.creator_id];
        if (!info) return ''; // ещё не подтянули — не добавляем хвост

        // если действие сделал сам владелец страницы
        if (h.creator_id === user?.id) {
            return `продавец @${info.nickname}`;
        }

        // иначе — по роли
        if (info.role === UserRole.MODERATOR || info.role === UserRole.ADMIN) {
            return `модератор @${info.nickname}`;
        }

        // на всякий — общий случай
        return `пользователь @${info.nickname}`;
    }

    function historyBase(h: AnyHistory): string {
        if (h.__type === 'balance') {
            const s = Math.abs(h.sum);
            // чёткий текст для истории
            return h.sum >= 0
                ? `баланс продавца пополнен на ${s} раздач`
                : `баланс продавца списан на ${s} раздач`;
        }
        return historyLine(h as UserHistory);
    }

    const histDate = (h: AnyHistory) =>
        h.__type === 'balance' ? h.created_at :
            h.__type === 'review' ? h.created_at :
                h.date;

    const sortedHistory = [...combinedHistory].sort(
        (a, b) => new Date(histDate(b)).getTime() - new Date(histDate(a)).getTime()
    );
    // ---- DIFF helpers ----
    type DiffRow = { path: string; before: any; after: any; changed: boolean };

    const IGNORED_KEYS = new Set<string>([
        'updated_at',
        '__typename',
    ]);

// helper: рядом ли события модерации и смены статуса (тот же товар, разница во времени <= 5 сек)
    function isModerationStatusPair(a?: AnyHistory, b?: AnyHistory) {
        if (!a || !b) return false;
        if (a.__type !== 'user' || b.__type !== 'user') return false;

        const ua = a as UserHistory;
        const ub = b as UserHistory;

        const sameProduct =
            !!ua.product_id && ua.product_id === ub.product_id;

        const closeInTime =
            Math.abs(new Date(ua.date).getTime() - new Date(ub.date).getTime()) <= 5000;

        const isModeration =
            (x: UserHistory) => x.action === 'moderation_done' || x.action === 'moderation_failed';

        const pairAB = isModeration(ua) && ub.action === 'status_changed';
        const pairBA = ua.action === 'status_changed' && isModeration(ub);

        return sameProduct && closeInTime && (pairAB || pairBA);
    }


// фильтруем «status_changed», если он дублирует «moderation_done»
    // 1) helper: продавец/покупатель
    function isSellerEvent(h: AnyHistory): boolean {
        if (h.__type === 'balance') return true;
        if (h.__type === 'review') return true;

        const uh = h as UserHistory;
        switch (uh.action) {
            // продавец/товар
            case 'product_create':
            case 'status_changed':
            case 'product_changed':
            case 'moderation_done':
            case 'moderation_failed':
            case 'ended':
                return true;

            // покупатель/покупки
            case 'agree_terms':
            case 'first_step_done':
            case 'second_step_done':
            case 'third_step_done':
            case 'fourth_step_done':
            case 'fifth_step_done':
            case 'sixth_step_done':
            case 'seventh_step_done':
            case 'cashback_done':
            case 'cashback_rejected':
                return false;

            default:
                return false;
        }
    }

// 2) сформировать историю с удалением дубля status_changed около moderation_*
    const historyForRender: AnyHistory[] = [];
    for (let i = 0; i < sortedHistory.length; i++) {
        const cur = sortedHistory[i];
        if (
            cur.__type === 'user' &&
            (cur as UserHistory).action === 'status_changed' &&
            (isModerationStatusPair(sortedHistory[i - 1], cur) ||
                isModerationStatusPair(cur, sortedHistory[i + 1]))
        ) {
            continue;
        }
        historyForRender.push(cur);
    }

// 3) разнести на два списка
    const sellerHistory = historyForRender.filter(isSellerEvent);
    const buyerHistory = historyForRender.filter(h => !isSellerEvent(h));


    const isPrimitive = (v: any) =>
        v == null || typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean';

    const join = (a: string, b: string) => (a ? (b.startsWith('[') ? `${a}${b}` : `${a}.${b}`) : b);

// flatten: product.{field} / arr[0].field
    function flatten(obj: any, prefix = '', out: Record<string, any> = {}): Record<string, any> {
        if (obj == null) return out;
        if (Array.isArray(obj)) {
            obj.forEach((v, i) => flatten(v, join(prefix, `[${i}]`), out));
            return out;
        }
        if (typeof obj === 'object') {
            Object.entries(obj).forEach(([k, v]) => {
                if (IGNORED_KEYS.has(k)) return;
                if (isPrimitive(v)) out[join(prefix, k)] = v;
                else flatten(v, join(prefix, k), out);
            });
            return out;
        }
        out[prefix] = obj;
        return out;
    }

    function buildDiffRows(before: any, after: any): DiffRow[] {
        const fb = flatten(before || {});
        const fa = flatten(after || {});
        const keys = new Set([...Object.keys(fb), ...Object.keys(fa)]);
        const rows: DiffRow[] = [];
        keys.forEach((p) => {
            const b = fb[p];
            const a = fa[p];
            const changed = JSON.stringify(b) !== JSON.stringify(a);
            rows.push({path: p, before: b, after: a, changed});
        });
        // Сортировка: изменённые вверх, потом по алфавиту
        rows.sort((r1, r2) => (r1.changed === r2.changed ? r1.path.localeCompare(r2.path) : (r1.changed ? -1 : 1)));
        return rows;
    }

    function openDiffForHistory(h: UserHistory) {
        const name = h.json_after?.name || h.json_before?.name || productNameById(h.product_id);
        setDiffTitle(`Изменения: «${name}»`);
        setDiffProductId(h.product_id);
        setDiffRows(buildDiffRows(h.json_before, h.json_after));
        setDiffShowAll(false);
        setDiffOpen(true);
    }


    return (
        <div className="p-4 bg-gray-100 min-h-screen space-y-6">
            <h1 className="text-2xl font-bold text-center text-brand">
                Профиль пользователя
            </h1>

            {/* Профиль */}
            <div className="bg-white rounded shadow p-4 space-y-2">
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Telegram ID:</strong> {user.telegram_id}</p>
                <p><strong>Никнейм:</strong> {user.nickname}</p>
                <p><strong>Роль:</strong> {user.role}</p>
                <p><strong>Забанен:</strong> {user.is_banned ? 'Да' : 'Нет'}</p>
                <p><strong>Продавец:</strong> {user.is_seller ? 'Да' : 'Нет'}</p>
                <p><strong>Баланс:</strong> {user.balance} раздач</p>
                {user.is_seller && (
                    <>
                        <p><strong>Доступно в каталоге:</strong> {availableInCatalog}</p>
                        <p><strong>Не оплачено раздач:</strong> {unpaidDistributions}</p>
                        <p><strong>Общий план раздач:</strong> {totalPlan}</p>
                    </>
                )}
                <p>
                    <strong>Пригласивший:</strong>{' '}
                    {user.inviter?.nickname ? (
                        <button
                            className="text-blue-600 hover:underline"
                            onClick={() =>
                                navigate(`/moderator/users/${user.inviter.id}`)
                            }
                        >
                            {user.inviter.nickname}
                        </button>
                    ) : '—'}
                </p>
                <p><strong>Реф. бонус:</strong> {user.referrer_bonus} руб</p>
                {user.has_discount && (
                    <p className="text-green-600">Есть скидка</p>
                )}
            </div>

            {/* Действия */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button onClick={toggleBan} className="bg-red-500 text-white p-2 rounded">
                    {user.is_banned ? 'Разбанить' : 'Забанить'}
                </button>
                <button onClick={toggleRole} className="bg-yellow-500 text-white p-2 rounded">
                    {user.role === UserRole.MODERATOR ? 'Разжаловать' : 'Назначить модератором'}
                </button>
            </div>

            {/* Баланс продавца */}
            {user.is_seller && (
                <div className="mb-4 p-4 bg-white rounded shadow">
                    <h2 className="text-lg font-bold mb-2 text-brand">Баланс продавца</h2>
                    <div className="flex flex-wrap gap-2 mb-2">
                        <input
                            type="number"
                            placeholder="Сумма"
                            value={balanceInput}
                            onChange={e => setBalanceInput(e.target.value)}
                            className="flex-1 min-w-0 border p-2 rounded"
                        />
                        <button
                            onClick={async () => {
                                const v = parseInt(balanceInput, 10);
                                if (v > 0) {
                                    await changeBalance(v);
                                    setBalanceInput('');
                                }
                            }}
                            className="bg-brand text-white px-3 rounded"
                        >
                            Пополнить
                        </button>
                        <button
                            onClick={async () => {
                                const v = parseInt(balanceInput, 10);
                                if (v > 0) {
                                    await changeBalance(-v);
                                    setBalanceInput('');
                                }
                            }}
                            className="bg-red-500 text-white px-3 rounded"
                        >
                            Списать
                        </button>
                    </div>
                    <button onClick={clearBalance} className="bg-gray-200 text-black w-full rounded p-2">
                        Обнулить баланс
                    </button>
                </div>
            )}

            {/* Реферальный бонус */}
            {user.invited_by && (
                <div className="bg-white rounded shadow p-4 space-y-2">
                    <h2 className="text-lg font-bold text-brand">Реферальный бонус</h2>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="Сумма"
                            value={bonusInput}
                            onChange={e => setBonusInput(e.target.value)}
                            className="flex-1 border p-2 rounded"
                        />
                        <button
                            onClick={async () => {
                                const v = parseInt(bonusInput, 10);
                                if (v > 0) {
                                    await changeBonus(v);
                                    setBonusInput('');
                                }
                            }}
                            className="bg-brand text-white px-3 rounded"
                        >
                            Начислить
                        </button>
                        <button
                            onClick={async () => {
                                const v = parseInt(bonusInput, 10);
                                if (v > 0) {
                                    await changeBonus(-v);
                                    setBonusInput('');
                                }
                            }}
                            className="bg-red-500 text-white px-3 rounded"
                        >
                            Списать
                        </button>
                    </div>
                    <button onClick={clearBonus} className="bg-gray-200 text-black w-full rounded p-2">
                        Обнулить бонус
                    </button>
                    {user.has_discount && (
                        <button onClick={handleDiscountUsed} className="bg-green-100 text-green-700 w-full rounded p-2">
                            Использовал скидку
                        </button>
                    )}
                </div>
            )}

            <Collapsible title="Покупки пользователя" initialOpen={false}>
                {/* Фильтры + поиск по коду */}
                <div className="flex gap-2 mb-3">
                    <button
                        onClick={() => setPurchaseFilter('all')}
                        className={purchaseFilter === 'all' ? 'font-bold underline' : ''}
                    >Все
                    </button>
                    <button
                        onClick={() => setPurchaseFilter('completed')}
                        className={purchaseFilter === 'completed' ? 'font-bold underline' : ''}
                    >Завершённые
                    </button>
                    <button
                        onClick={() => setPurchaseFilter('started')}
                        className={purchaseFilter === 'started' ? 'font-bold underline' : ''}
                    >Начатые
                    </button>
                </div>

                <div className="mb-3">
                    <input
                        type="text"
                        placeholder="Поиск по коду"
                        value={ordersFilter}
                        maxLength={6}
                        onChange={e => setOrdersFilter(e.target.value.slice(0, 6))}
                        className="w-full border p-2 rounded"
                    />
                </div>

                {ordersLoading ? (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-gray-600 always-spin"/>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <p>Нет заказов</p>
                ) : (
                    <ul className="space-y-2">
                        {filteredOrders.map(o => (
                            <li key={o.id} className="border rounded-lg p-3 bg-gray-50">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">{o.transaction_code}</p>
                                        <p className="text-sm">Товар: {o.product.name}</p>
                                        <p className="text-sm">Продавец: {o.seller.nickname}</p>
                                        <p className="text-sm">Текущий шаг: {o.step}</p>
                                        <p className="text-xs text-gray-600">{getStatusLabel(o.status)}</p>
                                    </div>
                                    <button
                                        onClick={() => toggleScreenshots(o.id)}
                                        className="text-brand underline text-sm"
                                    >
                                        {screenshotsVisible[o.id] ? 'Скрыть скрины' : 'Показать скрины'}
                                    </button>
                                </div>

                                {screenshotsVisible[o.id] && (
                                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-1 gap-2">
                                        {(Object.entries(o) as Array<[keyof Order, any]>)
                                            .filter(([key, src]) => screenshotLabels[key as string] && src)
                                            .map(([key, src]) => (
                                                <figure key={key} className="flex flex-col items-center">
                                                    {key.endsWith('_screenshot_path') ? (
                                                        <img
                                                            src={src}
                                                            alt={screenshotLabels[key as string]}
                                                            className="w-64 h-64 object-cover rounded border"
                                                        />
                                                    ) : (
                                                        <figcaption className="text-xs text-gray-800 text-center">
                                                            {screenshotLabels[key as string]}: {src}
                                                        </figcaption>
                                                    )}
                                                    {key.endsWith('_screenshot_path') && (
                                                        <figcaption className="mt-1 text-xs text-gray-600">
                                                            {screenshotLabels[key as string]}
                                                        </figcaption>
                                                    )}
                                                </figure>
                                            ))}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </Collapsible>


            {user.is_seller && (
                <Collapsible title="Товары продавца" initialOpen={false}>
                    {productsLoading ? (
                        <div className="fixed inset-0 z-50 flex items-center justify-center">
                            <div
                                className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-gray-600 always-spin"/>
                        </div>
                    ) : products.length === 0 ? (
                        <p>Нет товаров</p>
                    ) : (
                        <div className="overflow-x-auto bg-white rounded-lg">
                            <table className="w-full table-auto">
                                <thead className="bg-gray-100 text-sm">
                                <tr>
                                    <th className="px-3 py-2">Название</th>
                                    <th className="px-3 py-2">Артикул</th>
                                    <th className="px-3 py-2">Цена WB</th>
                                    <th className="px-3 py-2">Наша цена</th>
                                    <th className="px-3 py-2">Категория</th>
                                    <th className="px-3 py-2">Бренд</th>
                                    <th className="px-3 py-2">Остаток</th>
                                    <th className="px-3 py-2">Статус</th>
                                    <th className="px-3 py-2">Фото</th>
                                </tr>
                                </thead>
                                <tbody className="text-sm divide-y">
                                {products.map(p => (
                                    <tr key={p.id}>
                                        <td className="px-3 py-2">{p.name}</td>
                                        <td className="px-3 py-2">{p.article}</td>
                                        <td className="px-3 py-2">{p.wb_price}</td>
                                        <td className="px-3 py-2">{p.price}</td>
                                        <td className="px-3 py-2">{p.category}</td>
                                        <td className="px-3 py-2">{p.brand}</td>
                                        <td className="px-3 py-2">{p.remaining_products}</td>
                                        <td className="px-3 py-2">{p.status}</td>
                                        <td className="px-3 py-2">
                                            {p.image_path && <img src={p.image_path} className="w-16 h-auto rounded"/>}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Collapsible>
            )}

            {/* ===== История действий продавца ===== */}
            {sellerHistory.length > 0 && (
                <Collapsible title="История действий продавца" initialOpen={false}>
                    {historyLoading ? (
                        <div className="flex items-center justify-center py-6">
                            <div
                                className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-gray-600 always-spin"/>
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {sellerHistory.map((h, i) => renderHistoryItem(h, i))}
                        </ul>
                    )}
                </Collapsible>
            )}

            {/* ===== История действий покупателя ===== */}
            {buyerHistory.length > 0 && (
                <Collapsible title="История действий покупателя" initialOpen={false}>
                    {historyLoading ? (
                        <div className="flex items-center justify-center py-6">
                            <div
                                className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-gray-600 always-spin"/>
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {buyerHistory.map((h, i) => renderHistoryItem(h, i))}
                        </ul>
                    )}
                </Collapsible>
            )}


            {imgOpen && imgSrc && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
                    <div
                        className="bg-white rounded-xl shadow-xl max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="px-4 py-3 border-b flex items-center justify-between">
                            <button
                                onClick={closeImage}
                                className="px-2 py-1 rounded border border-gray-300 hover:bg-gray-50 text-xs"
                            >
                                Закрыть
                            </button>
                        </div>
                        <div className="p-3 overflow-auto">
                            <img
                                src={imgSrc}
                                alt="Фото"
                                className="max-w-[90vw] max-h-[80vh] object-contain"
                            />
                        </div>
                    </div>
                </div>
            )}


            {/* DIFF MODAL */}
            {diffOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div
                        className="bg-white rounded-xl shadow-xl w-[95vw] max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
                        <div className="px-4 py-3 border-b flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-lg truncate"
                                    title={diffTitle}>{diffTitle}</h3>
                            </div>
                            <div className="shrink-0 flex flex-col items-end gap-2 w-max">
                                {diffProductId && (
                                    <button
                                        onClick={() => {
                                            setDiffOpen(false);
                                            navigate(`/moderator/products/${diffProductId}`);
                                        }}
                                        className="px-3 py-1 rounded border border-brand text-brand hover:bg-brand/5 text-sm"
                                        title="Открыть карточку товара"
                                    >
                                        К товару
                                    </button>
                                )}
                                <button
                                    onClick={() => setDiffOpen(false)}
                                    className="px-3 py-1 rounded border border-brand text-brand hover:bg-brand/5 text-sm"
                                >
                                    Закрыть
                                </button>
                            </div>
                        </div>


                        <div className="px-4 pt-2 pb-0 flex items-center gap-3">
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={diffShowAll}
                                    onChange={(e) => setDiffShowAll(e.target.checked)}
                                />
                                Показать все поля
                                (сейчас {diffRows.filter(r => r.changed).length} изменённых
                                из {diffRows.length})
                            </label>
                        </div>

                        <div className="p-4 pt-0 overflow-auto">
                            <table
                                className="w-full table-fixed text-sm border-separate border-spacing-y-2">
                                <colgroup>
                                    <col style={{width: '28%'}}/>
                                    <col style={{width: '36%'}}/>
                                    <col style={{width: '36%'}}/>
                                </colgroup>
                                <thead className="sticky top-0 z-10 bg-white">
                                <tr className="text-left">
                                    <th className="px-3 py-2 text-gray-500 font-medium">Поле</th>
                                    <th className="px-3 py-2 text-gray-500 font-medium">Было</th>
                                    <th className="px-3 py-2 text-gray-500 font-medium">Стало</th>
                                </tr>
                                </thead>
                                <tbody>
                                {(diffShowAll ? diffRows : diffRows.filter(r => r.changed)).map((r) => (
                                    <tr key={r.path} className={r.changed ? 'bg-yellow-50' : 'bg-gray-50'}>
                                        {/* ЛЕВАЯ КОЛОНКА: слова не рвём посередине */}
                                        <td className="align-top px-3 py-2 font-mono text-xs text-gray-700 whitespace-normal break-words">
                                            {ruLabel(r.path)}
                                        </td>

                                        {/* БЫЛО */}
                                        <td className="align-top px-3 py-2">
                                            {renderValue(r.path, r.before)}
                                        </td>

                                        {/* СТАЛО */}
                                        <td className="align-top px-3 py-2">
                                            <div className="flex items-start gap-2">
                                                <span className="select-none mt-0.5">→</span>
                                                {renderValue(r.path, r.after)}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {(!diffShowAll && diffRows.filter(r => r.changed).length === 0) && (
                                    <tr>
                                        <td colSpan={3} className="text-center text-gray-500 py-6">Нет
                                            изменённых
                                            полей
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>


                    </div>
                </div>
            )}

        </div>

    )
}

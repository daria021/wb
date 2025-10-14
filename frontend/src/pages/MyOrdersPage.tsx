import React, {useEffect, useMemo, useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {getUserOrders, updateOrderStatus} from '../services/api';
import GetUploadLink from "../components/GetUploadLink";
import {useDebounce} from '../hooks/useDebounce';
import {OrderStatus} from "../enums";
import {alertTG, confirmTG} from "../utils/telegram";


export const STEP_NAMES: { [key: number]: string } = {
    1: 'Шаг 1: Поиск товара по ключевому слову',
    2: 'Шаг 2: Артикул товара',
    3: 'Шаг 3: Добавить в избранное',
    4: 'Шаг 4: Ввод реквизитов',
    5: 'Шаг 5: Оформление заказа',
    6: 'Шаг 6: Получение товара',
    7: 'Шаг 7: Отзыв и чек',
    8: 'Шаг 8: Все выполнено',
};

const getOrderStepLink = (order: Order): string => {
    const next = Math.max(1, (Number(order.step) || 0) + 1);
    if (next === 1) return `/product/${order.id}/step-1`;
    if (next >= 2 && next <= 7) return `/order/${order.id}/step-${next}`;
    return `/order/${order.id}/order-info`;
};

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

function MyOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const location = useLocation();
    const isOnOrders = location.pathname === ('/user/orders');
    const [showCount, setShowCount] = useState(5);
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [statusOptions, setStatusOptions] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 600);
    const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);


    // вверху файла, рядом с STEP_NAMES
    const STATUS_LABELS: { [key in OrderStatus]: string } = {
        [OrderStatus.CASHBACK_PAID]: 'Кешбэк выплачен',
        [OrderStatus.CASHBACK_NOT_PAID]: 'Кешбэк не выплачен',
        [OrderStatus.CANCELLED]: 'Отменён',
        [OrderStatus.PAYMENT_CONFIRMED]: 'Оплата подтверждена',
        [OrderStatus.CASHBACK_REJECTED]: 'Кешбэк отклонен',
    };


    useEffect(() => {
        if (!orders.length) return;
        setStatusOptions(Array.from(new Set(orders.map(o => o.status))));
    }, [orders]);


    const filteredOrders = useMemo(() => {
        return orders.filter(order =>
            // 1) статус совпадает (или «все»)
            (filterStatus === '' || order.status === filterStatus)
            &&
            // 2) в названии есть поисковая строка
            order.product.name
                .toLowerCase()
                .includes(debouncedSearch.toLowerCase())
        );
    }, [orders, filterStatus, debouncedSearch]);


    // считать активными всё, что не финал
    const isActive = (s: string) =>
        s !== OrderStatus.CASHBACK_PAID &&
        s !== OrderStatus.CANCELLED &&
        s !== OrderStatus.CASHBACK_REJECTED;

// 1) агрегируем: на каждый product.id берём ОДИН лучший активный,
//    а ВСЕ выплаченные складываем в массив finished[]
    const aggregatedOrders = useMemo(() => {
        type Bucket = {
            active?: Order;
            finished: Order[];  // 👈 массив
            others: Order[];    // отменённые/отклонённые (если нужны)
        };

        const map = new Map<string, Bucket>();

        for (const o of filteredOrders) {
            const key = o.product.id;
            const bucket = map.get(key) ?? {finished: [], others: []}; // 👈 инициализируем finished

            if (o.status === OrderStatus.CASHBACK_PAID) {
                bucket.finished.push(o); // 👈 теперь ок
            } else if (
                o.status !== OrderStatus.CANCELLED &&
                o.status !== OrderStatus.CASHBACK_REJECTED
            ) {
                // активные: берём самый "дальний" по step, при равенстве — самый свежий
                if (
                    !bucket.active ||
                    o.step > bucket.active.step ||
                    (o.step === bucket.active.step &&
                        new Date(o.created_at) > new Date(bucket.active.created_at))
                ) {
                    bucket.active = o;
                }
            } else {
                bucket.others.push(o);
            }

            map.set(key, bucket);
        }

        // разворачиваем: активный → все выплаченные (по убыванию даты) → остальные (опционально)
        const res: Order[] = [];
        map.forEach(({active, finished, others}) => {
            if (active) res.push(active);
            finished.sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            res.push(...finished);
            // если не хочешь показывать отменённые/отклонённые — закомментируй следующую строку
            res.push(...others);
        });
        return res;
    }, [filteredOrders]);

// 2) незавершённые вперёд, затем выплаченные
    const displayOrders = useMemo(() => {
        const notPaid = aggregatedOrders.filter(
            o => o.status !== OrderStatus.CASHBACK_PAID
        );
        const paid = aggregatedOrders.filter(
            o => o.status === OrderStatus.CASHBACK_PAID
        );
        return [...notPaid, ...paid];
    }, [aggregatedOrders]);


// порядок шагов: 6→5→4→3→2→1→7
    const stepPriority = [6, 5, 4, 3, 2, 1, 7];

    const visibleOrders = useMemo(() => {
        return displayOrders
            .sort((a, b) => {
                const pa = stepPriority.indexOf(a.step);
                const pb = stepPriority.indexOf(b.step);
                return pa - pb;
            })
            .slice(0, showCount);
    }, [displayOrders, showCount]);


    const handleSupportClick = () => {
        if (window.Telegram?.WebApp?.close) {
            window.Telegram.WebApp.close();
        }
        window.open(process.env.REACT_APP_SUPPORT_URL, '_blank');
    };


    const fetchOrders = async () => {
        try {
            const response = await getUserOrders();
            setOrders(response.data);
        } catch (err) {
            console.error('Ошибка при загрузке покупок:', err);
            setError('Не удалось загрузить список покупок.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!orders.length) return;
        setStatusOptions(Array.from(new Set(orders.map(o => o.status))));
    }, [orders]);


    useEffect(() => {
        fetchOrders();
    }, []);


    const handleCancelOrder = async (
        orderId: string,
        e: React.MouseEvent | React.TouchEvent
    ) => {

        const ok = await confirmTG('Вы уверены, что хотите отменить заказ?');
        if (!ok) return;

        try {
            const formData = new FormData();
            formData.append('status', 'cancelled');
            await updateOrderStatus(orderId, formData);
            await alertTG('Заказ отменён');
            fetchOrders();
        } catch (err) {
            console.error('Ошибка отмены заказа:', err);
            await alertTG('Ошибка отмены заказа');
        }
    };

    const handleShowMore = () => {
        setShowCount(prev => prev + 5);
    };

    return (
        <div className="bg-gray-200 bg-fixed min-h-screen pb-6">
            {/* Навигация */}
            <div className="flex w-max mx-auto my-2 bg-gray-200 p-1 rounded-full">
                <Link
                    to="/catalog"
                    className={`
          px-4 py-2 rounded-full
          ${!isOnOrders ? 'bg-white text-black' : 'text-gray-500 hover:text-black'}
        `}
                >
                    Каталог
                </Link>
                <Link
                    to="/user/orders"
                    className={`
          px-4 py-2 rounded-full
          ${isOnOrders ? 'bg-white text-black' : 'text-gray-500 hover:text-black'}
        `}
                >
                    Мои покупки
                </Link>
            </div>

            {/* Заголовок */}
            {/* Заголовок */}
            <div className="sticky top-0 z-10 bg-inherit pb-2 pt-2">
                {/* Полоса фильтров */}
                <div className="mx-auto w-11/12 max-w-2xl grid grid-cols-1 gap-2 md:grid-cols-[1fr,220px]">
                    {/* Поиск */}
                    <input
                        type="text"
                        placeholder="Поиск по названию товара"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="h-10 rounded-md border border-darkGray px-4 text-sm
                 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
                    />

                    {/* Селектор статуса с явной стрелкой */}
                    <div className="relative">
                        <select
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                            className="h-10 w-full appearance-none rounded-md border border-brand bg-white
                   pl-3 pr-10 text-sm font-medium text-gray-800
                   focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
                            aria-label="Фильтр по статусу"
                        >
                            <option value="">Все статусы</option>
                            {statusOptions.map(status => (
                                <option key={status} value={status}>
                                    {STATUS_LABELS[status as OrderStatus]}
                                </option>
                            ))}
                        </select>

                        {/* Стрелка (иконка) */}
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                            <svg
                                className="h-4 w-4 text-brand"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <path d="M5.25 7.5l4.5 4.5 4.5-4.5h-9z"/>
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Подсказка */}
                <p className="mt-2 text-center text-xs text-gray-600">
                    Нажмите на карточку, чтобы открыть инструкцию
                </p>
            </div>

            <div className="sticky top-0 z-20 bg-gray-200 mb-4">


            </div>

            {/* Контент */}
            <div className="px-4 mt-4">
                {loading ? (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-gray-600 always-spin"/>
                    </div>
                ) : error ? (
                    <div className="py-4 text-center text-red-600">
                        {error}
                    </div>
                ) : displayOrders.length === 0 ? (
                    <div className="py-4 text-center bg-white rounded shadow-sm">
                        Покупки не найдены
                    </div>
                ) : (
                    <div className="flex flex-col space-y-3">
                        {visibleOrders.map(order => {
                            const linkTo = getOrderStepLink(order);
                            const isCancelled = order.status === OrderStatus.CANCELLED;
                            const title = STEP_NAMES[order.step + 1] || `Шаг ${order.step + 1}`;

                            return (
                                <div key={order.id} className="relative">
                                    {/* КНОПКА вне <Link>, но выше по z-index + на тачах предотвращаем навигацию */}
                                    {!isCancelled &&
 order.status !== OrderStatus.CASHBACK_PAID &&
 order.status !== OrderStatus.CASHBACK_REJECTED && (
<button
  className="absolute top-2 right-2 z-50 pointer-events-auto text-red-600 border border-red-500 text-xs rounded px-2 py-1 hover:bg-red-50 active:bg-red-100 transition"
  onClick={(e) => {
    e.stopPropagation();
    e.preventDefault();
    setConfirmCancelId(order.id);
  }}
>
  Отменить
</button>

)}
                                    {confirmCancelId === order.id && (
  <div className="absolute right-2 top-10 z-50 bg-white border border-red-300 rounded-md shadow p-2 flex gap-2 items-center">
    <span className="text-xs">Отменить заказ?</span>
    <button
      className="text-xs px-2 py-1 rounded bg-red-600 text-white"
      onClick={async (e) => {
        e.stopPropagation();
        e.preventDefault();
        // пробуем через Telegram API; если он не покажет модалку — всё равно продолжаем
        try { await confirmTG('Вы уверены, что хотите отменить заказ?'); } catch {}
        try {
          const fd = new FormData();
          fd.append('status', 'cancelled');
          await updateOrderStatus(order.id, fd);
          await alertTG('Заказ отменён');
          setConfirmCancelId(null);
          fetchOrders();
        } catch (err) {
          console.error('Ошибка отмены заказа:', err);
          await alertTG('Ошибка отмены заказа');
          setConfirmCancelId(null);
        }
      }}
    >
      Да
    </button>
    <button
      className="text-xs px-2 py-1 rounded border"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        setConfirmCancelId(null);
      }}
    >
      Нет
    </button>
  </div>
)}


                                    {/* ССЫЛКА-КАРТОЧКА: навигируем только если событие НЕ предотвращено */}
                                    <Link
                                        to={isCancelled ? '#' : linkTo}
                                        onClick={(e) => {
                                            if (e.defaultPrevented) return; // кнопку уже нажали
                                            // иначе обычная навигация
                                        }}
  className="block relative overflow-visible bg-white border border-darkGray rounded-md shadow-sm p-3 hover:shadow-md transition z-0"
                                    >
                                        {isCancelled && (
                                            <div className="absolute top-2 right-2 text-gray-500 text-xs">
                                                Заказ отменён
                                            </div>
                                        )}

                                        <div className="flex items-center gap-3">
                                            <div className="w-16 h-16 bg-gray-100 flex-shrink-0">
                                                {order.product.image_path ? (
                                                    <img
                                                        src={
                                                            order.product.image_path.startsWith('http')
                                                                ? order.product.image_path
                                                                : GetUploadLink(order.product.image_path)
                                                        }
                                                        alt={order.product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div
                                                        className="flex items-center justify-center h-full text-gray-400 text-xs">
                                                        Нет фото
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-sm pr-24 truncate">
                                                    {order.product.name}
                                                </div>
                                                <div className="font-bold text-brand">{order.product.price} ₽</div>

                                                {order.step < 7 ? (
                                                    <div className="text-xs text-gray-500">Текущий {title}</div>
                                                ) : (
                                                    <div
                                                        className={`inline-block mt-1 px-3 py-1 text-xs rounded border transition ${
                                                            order.status === OrderStatus.CASHBACK_PAID
                                                                ? 'border-green-500 text-green-500'
                                                                : order.status === OrderStatus.CASHBACK_REJECTED
                                                                    ? 'border-red-500 text-red-500'
                                                                    : 'border-blue-500 text-blue-500'
                                                        }`}
                                                    >
            <span className={order.status === 'cashback_rejected' ? 'text-red-500' : ''}>
              {{
                  cashback_paid: 'Кешбэк выплачен',
                  cashback_not_paid: 'Кешбэк не выплачен',
                  cashback_rejected: 'Кешбэк отклонен',
              }[order.status] || ''}
            </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            );
                        })}
                        {displayOrders.length > showCount && (
                            <div className="flex justify-center">
                                <button
                                    onClick={handleShowMore}
                                    className="px-6 py-2 bg-brand text-white font-medium rounded-2xl shadow hover:bg-brand-dark transition"
                                >
                                    Показать ещё
                                </button>
                            </div>
                        )}

                        {/* Техподдержка */}
                        <div
                            onClick={handleSupportClick}
                            className="bg-white border border-brand rounded-xl shadow-sm p-4 text-sm font-semibold cursor-pointer flex items-center gap-3"
                        >
                            <img src="/icons/support.png" alt="Support" className="w-7 h-7"/>
                            <div className="flex flex-col">
                                <span className="font-body">Техподдержка</span>
                                <span className="text-xs text-gray-500">
      Оперативно ответим на все вопросы
    </span>
                            </div>
                            <img
                                src="/icons/small_arrow.png"
                                alt="arrow"
                                className="w-5 h-5 ml-auto"
                            />
                        </div>

                        {/* Спиннер внизу */}
                        {loading && (
                            <div className="flex justify-center mt-4">
                                <div
                                    className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-gray-600 always-spin"/>
                            </div>
                        )}
                    </div>)}
            </div>
        </div>)
}

export default MyOrdersPage;
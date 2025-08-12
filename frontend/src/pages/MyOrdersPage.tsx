import React, {useEffect, useMemo, useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {getUserOrders, updateOrderStatus} from '../services/api';
import GetUploadLink from "../components/GetUploadLink";
import {useDebounce} from '../hooks/useDebounce';
import {OrderStatus} from "../enums";


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
    if (order.step >= 0 && order.step <= 6) {
        return `/order/${order.id}/step-${order.step + 1}`;
    }
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


    const uniqueOrders = useMemo(() => {
        const map = new Map<string, Order>();
        filteredOrders.forEach(order => {
            const prev = map.get(order.product.id);
            if (
                !prev ||
                order.step > prev.step ||
                (order.step === prev.step &&
                    new Date(order.created_at) > new Date(prev.created_at))
            ) {
                map.set(order.product.id, order);
            }
        });
        return Array.from(map.values());
    }, [filteredOrders]);


    const displayOrders = useMemo(() => {
        const notPaid = uniqueOrders.filter(o => o.status !== 'payment_confirmed');
        const paid = uniqueOrders.filter(o => o.status === 'payment_confirmed');
        return [...notPaid, ...paid];
    }, [uniqueOrders]);
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


    const handleCancelOrder = async (orderId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Предотвращаем переход по карточке
        e.preventDefault();
        if (!window.confirm('Вы уверены, что хотите отменить заказ?')) return;
        try {
            const formData = new FormData();
            formData.append("status", "cancelled");
            await updateOrderStatus(orderId, formData);
            alert("Заказ отменён");
            fetchOrders();
        } catch (err) {
            console.error("Ошибка отмены заказа:", err);
            alert("Ошибка отмены заказа");
        }
    };

    const handleToggleCashback = async (orderId: string, newStatus: string, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("status", newStatus);
            await updateOrderStatus(orderId, formData);
            setOrders(prev =>
                prev.map(o =>
                    o.id === orderId
                        ? {...o, status: newStatus}
                        : o
                )
            );
        } catch (err) {
            console.error("Ошибка при смене статуса кешбэка:", err);
            alert("Не удалось сменить статус кешбэка");
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
            <div className="sticky top-0 z-10 mt-2 bg-inherit pb-2">
                <h2 className="text-2xl font-bold text-center mb-1">Мои покупки</h2>
                <input
                    type="text"
                    placeholder="Поиск по названию товара"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="block mx-auto w-4/5 border border-darkGray rounded-md p-2 px-4 text-sm mb-2"
                />
                <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="block mx-auto w-4/5 border border-darkGray rounded-md p-2"
                >
                    <option value="">Все статусы</option>
                    {statusOptions.map(status => (
                        <option key={status} value={status}>
                            {STATUS_LABELS[status as OrderStatus]}
                        </option>
                    ))}
                </select>
            </div>

            <div className="px-4 mt-2">

                <p className="text-sm text-gray-600 text-center">
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

                            const card = (
                                <div
                                    key={order.id}
                                    className="block relative bg-white border border-darkGray rounded-md shadow-sm p-3 hover:shadow-md transition"
                                >
                                    {isCancelled && (
                                        <div className="absolute top-2 right-2 text-gray-500 text-xs">
                                            Заказ отменён
                                        </div>
                                    )}
                                    {!isCancelled && order.status !== OrderStatus.PAYMENT_CONFIRMED && (
                                        <button
                                            onClick={e => handleCancelOrder(order.id, e)}
                                            className="absolute top-2 right-2 text-red-500 border border-red-500 text-xs rounded hover:bg-red-50 transition"
                                        >
                                            Отменить
                                        </button>
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
                                            <div className="font-semibold text-sm pr-12 truncate max-w-[25ch]">
                                                {order.product.name}
                                            </div>
                                            <div className="font-bold text-brand">{order.product.price} ₽</div>
                                            {order.step < 7 ? (
                                                <div className="text-xs text-gray-500">Текущий {title}</div>
                                            ) : (
                                                <div
                                                    className={`inline-block mt-1 px-3 py-1 text-xs rounded border transition ${
                                                        order.status === 'cashback_paid'
                                                            ? 'border-green-500 text-green-500'
                                                            : 'border-blue-500 text-blue-500'
                                                    }`}
                                                >
                                                    {order.status === 'cashback_paid'
                                                        ? 'Кешбэк выплачен'
                                                        : 'Кешбэк не выплачен'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );

                            return isCancelled ? (
                                card
                            ) : (
                                <Link to={linkTo} key={order.id}>
                                    {card}
                                </Link>
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
                            className="bg-white border border-brand rounded-xl shadow-sm p-4 my-6 mx-4 font-semibold cursor-pointer flex items-center gap-3"
                        >
                            <img src="/icons/support.png" alt="Support" className="w-7 h-7"/>
                            <div className="flex flex-col">
                                <span>Техподдержка</span>
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
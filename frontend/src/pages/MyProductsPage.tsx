import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {getProductsBySellerId, updateProductStatus} from '../services/api';

import {ProductStatus} from '../enums';
import {useUser} from "../contexts/user";

interface ModeratorReview {
    id: string;
    moderator_id: string;
    product_id: string;
    comment_to_seller?: string;
    comment_to_moderator?: string;
    status_before: ProductStatus;
    status_after: ProductStatus;
    created_at: string;
    updated_at: string;
}

interface Product {
    id: string;
    name: string;
    price: number;
    status: ProductStatus;
    moderator_reviews?: ModeratorReview[];
    remaining_products: number;
    general_repurchases: number;
    created_at: string;
    updated_at: string;
}

interface CardRow {
    label: string;
    value: number;
    status: ProductStatus;
}

enum Panel {
    CARDS = 'CARDS',
    PURCHASES = 'PURCHASES',
}

function MyProductsPage() {
    const navigate = useNavigate();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const {user, loading: userLoading, refresh} = useUser();


    const totalCount = products.length;
    const moderationCount = products.filter(
        (p) => p.status === ProductStatus.CREATED,
    ).length;
    const publishedCount = products.filter((p) => p.status === ProductStatus.ACTIVE).length;
    const disabledCount = products.filter((p) => p.status === ProductStatus.DISABLED).length;
    const archivedCount = products.filter((p) => p.status === ProductStatus.ARCHIVED).length;
    const notPaidCount = products.filter((p) => p.status === ProductStatus.NOT_PAID).length;
    const rejectedCount = products.filter((p) => p.status === ProductStatus.REJECTED).length;

    const cardRows: CardRow[] = [
        {label: 'На модерации', value: moderationCount, status: ProductStatus.CREATED},
        {label: 'Опубликованы', value: publishedCount, status: ProductStatus.ACTIVE},
        {label: 'Ожидают пополнения баланса раздач', value: notPaidCount, status: ProductStatus.NOT_PAID},
        {label: 'Необходимо исправить', value: disabledCount, status: ProductStatus.DISABLED},
        {label: 'Отклонены', value: rejectedCount, status: ProductStatus.REJECTED},
        {label: 'В архиве', value: archivedCount, status: ProductStatus.ARCHIVED},
    ];

    /* ---------- state ---------- */
// открытые панели
    const [openPanel, setOpenPanel] = useState<Record<Panel, boolean>>({
        [Panel.CARDS]: true,
        [Panel.PURCHASES]: false,
    });

// чекбоксы-фильтры
    const initialStatusFilters: Record<ProductStatus, boolean> = {
        [ProductStatus.ACTIVE]: false,
        [ProductStatus.CREATED]: false,
        [ProductStatus.DISABLED]: false,
        [ProductStatus.ARCHIVED]: false,
        [ProductStatus.NOT_PAID]: false,
        [ProductStatus.REJECTED]: false,
    };
    const [statusFilters, setStatusFilters] =
        useState<Record<ProductStatus, boolean>>(initialStatusFilters);
    const activeStatuses = Object.entries(statusFilters)
        .filter(([, checked]) => checked)      // оставляем только включённые
        .map(([k]) => k as ProductStatus);

    /* ---------- helpers ---------- */
// переключить панель
    const togglePanel = (panel: Panel) =>
        setOpenPanel(prev => ({...prev, [panel]: !prev[panel]}));

// переключить чекбокс-фильтр
    const toggleStatusFilter = (status: ProductStatus) =>
        setStatusFilters(prev => ({...prev, [status]: !prev[status]}));

    const location = useLocation();

    useEffect(() => {

        if (location.pathname === '/my-products') {
            refresh();
        }
    }, [location.pathname, refresh]);

    useEffect(() => {
        const handleFocus = () => {
            if (location.pathname === '/my-products') {
                refresh();
            }
        };
        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [location.pathname, refresh]);


    useEffect(() => {
        if (!loading && !userLoading && user) {
            // 1) заведём локальную копию баланса
            let balance = user.free_balance;

            // 2) отбираем товары, которые можно оплатить
            const toAutoPay = products.filter(
                p =>
                    p.status === ProductStatus.NOT_PAID &&
                    balance >= p.general_repurchases
            );
            if (toAutoPay.length === 0) return;

            // 3) автопубликуем
            toAutoPay.forEach(p => {
                const fd = new FormData();
                fd.append('status', ProductStatus.ACTIVE);
                updateProductStatus(p.id, fd)
                    .then(() => {
                        balance -= p.general_repurchases;
                        setProducts(prev =>
                            prev.map(x =>
                                x.id === p.id ? {...x, status: ProductStatus.ACTIVE} : x
                            )
                        );
                    })
                    .catch(err =>
                        console.error('Автопубликация не удалась для', p.id, err)
                    );
            });

            // 4) обновим баланс пользователя
            refresh();
        }
    }, [loading, userLoading, user?.free_balance, products, refresh]);

    const filteredProducts = products.filter(p => {
        if (activeStatuses.length && !activeStatuses.includes(p.status)) return false;
        if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });


    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        (async () => {
            try {
                await refresh();
                const response = await getProductsBySellerId();
                if (!isMounted) return;
                setProducts(response.data.products);
                setError('');
            } catch (e) {
                console.error('Ошибка при загрузке товаров:', e);
                if (!isMounted) return;
                setError('Не удалось загрузить данные');
            } finally {
                if (isMounted) setLoading(false);
            }
        })();
        return () => {
            isMounted = false;
        };
    }, [location.pathname, refresh]);

    useEffect(() => {
        const refreshIfOnPage = () => {
            if (location.pathname === '/my-products') refresh();
        };

        refreshIfOnPage();          // при первом рендере
        window.addEventListener('focus', refreshIfOnPage);  // при возврате в окно
        return () => window.removeEventListener('focus', refreshIfOnPage);
    }, [location.pathname, refresh]);

    const handleSupportClick = () => {
        if (window.Telegram?.WebApp?.close) {
            window.Telegram.WebApp.close();
        }
        window.open(process.env.REACT_APP_SUPPORT_URL, '_blank');
    };

    const handleMyBalanceClick = () => {
        navigate(`/seller-cabinet/balance`);
    };

    if (userLoading) {
        return <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-gray-600 always-spin"/>
        </div>;
    }

    const totalPlan = products
        .filter(p =>
            p.status === ProductStatus.ACTIVE ||
            p.status === ProductStatus.NOT_PAID
        )
        .reduce((sum, p) => sum + p.general_repurchases, 0);

// 2) оплачено = сумма remaining_products у ACTIVE
    const paidPlan = products
        .filter(p => p.status === ProductStatus.ACTIVE)
        .reduce((sum, p) => sum + p.general_repurchases, 0);

// 3) не оплачено = сумма remaining_products у NOT_PAID
    const unpaidPlan = products
        .filter(p => p.status === ProductStatus.NOT_PAID)
        .reduce((sum, p) => sum + p.general_repurchases, 0);

// 4) сколько нужно доплатить = unpaidPlan – free_balance, но не ниже 0
    const missing = Math.max(unpaidPlan - (user?.free_balance ?? 0), 0);


    return (
        <div className="p-4 min-h-screen bg-gray-200 mx-auto">
            {/*            <div className="mb-4 p-4 bg-brandlight rounded shadow">*/}
            {/*                <p className="text-sm">*/}
            {/*                    Всего карточек: <strong>{totalCount}</strong>*/}
            {/*                </p>*/}
            {/*                <p className="text-sm">*/}
            {/*                    На проверке: <strong>{moderationCount}</strong>*/}
            {/*                </p>*/}
            {/*                <p className="text-sm">*/}
            {/*                    Опубликовано: <strong>{publishedCount}</strong>*/}
            {/*                </p>*/}
            {/*                <p className="text-sm">*/}
            {/*                    Ожидают редактирования: <strong>{disabledCount}</strong>*/}
            {/*                </p>*/}
            {/*                <p className="text-sm">*/}
            {/*                    В архиве: <strong>{archivedCount}</strong>*/}
            {/*                </p>*/}
            {/*                <p className="text-sm">*/}
            {/*                    Заявка оформлена и не оплачена: <strong>{unpaidPlan}</strong>*/}
            {/*                </p>*/}
            {/*                <p className="text-sm">*/}
            {/*                    Отклоненные: <strong>{rejectedCount}</strong>*/}
            {/*                </p>*/}
            {/*                <p className="text-sm">*/}
            {/*                    Общий план по раздачам: <strong>{totalPlan}</strong>*/}
            {/*                </p>*/}
            {/*                <p className="text-sm">*/}
            {/*                    Оплачено: <strong>{paidPlan}</strong>*/}
            {/*                </p>*/}
            {/*                {user && !userLoading && unpaidPlan > 0 && user.free_balance < unpaidPlan ? (*/}
            {/*  <p className="text-sm text-red-800">*/}
            {/*    Баланс: <strong>{user.free_balance} раздач</strong>*/}
            {/*    <br/>*/}
            {/*    Для публикации всех неоплаченных товаров необходимо пополнить баланс на&nbsp;*/}
            {/*    <strong>{unpaidPlan - user.free_balance}</strong>&nbsp;раздач*/}
            {/*  </p>*/}
            {/*) : (*/}
            {/*  <p className="text-sm text-black">*/}
            {/*    Баланс: <strong>{user!.free_balance} раздач</strong>*/}
            {/*  </p>*/}
            {/*)}*/}

            {/*            </div>*/}

            {/* --------------------------- Плашка «Карточки» -------------------------- */}
            <div className="mb-3">
                {/* ---------- HEADER «Карточки товаров» ---------- */}
                <button
                    onClick={() => togglePanel(Panel.CARDS)}
                    style={{background: 'linear-gradient(90deg,#4872db 0%,#6e8ae2 50%,#4872db 100%)'}}
                    className={
                        `w-full flex justify-between items-center text-white px-5 py-2 shadow font-semibold uppercase tracking-wide
    ${openPanel[Panel.CARDS] ? 'rounded-t-xl' : 'rounded-full'}`   // для Purchases то же, только Panel.PURCHASES
                    }>
                    <span>Карточки товаров</span>
                    <span className="text-lg font-bold">{openPanel[Panel.CARDS] ? '−' : '+'}</span>
                </button>

                {/* ---------- Содержимое плашки «Карточки» ---------- */}
                {openPanel[Panel.CARDS] && (
                    <div className="bg-white border border-t-0 border-indigo-200 rounded-b-lg p-4">
                        {/* сетка 2-колоночная */}
                        <div className="grid gap-3 sm:grid-cols-[1fr_40px_1fr_40px]">
                            {cardRows.map(row => (
                                <label
                                    key={row.status}
                                    className="flex items-center gap-2 cursor-pointer select-none"
                                >
                                    {/* Пилюля со статусом */}
                                    <div
                                        className={`flex-1 rounded-full px-4 py-2 border
                    text-xs sm:text-sm transition
                    ${statusFilters[row.status]
                                            ? 'bg-[#4872db] text-white border-transparent'
                                            : 'bg-indigo-50 text-slate-900 border-indigo-200'}`}
                                    >
                                        <span>{row.label}</span>
                                        <span className="float-right font-semibold">{row.value}</span>
                                    </div>

                                    {/* Видимый чекбокс-квадрат */}
                                    <input
                                        type="checkbox"
                                        className="h-5 w-5 shrink-0 accent-[#4FD8C3] rounded-sm"
                                        checked={statusFilters[row.status]}
                                        onChange={() => toggleStatusFilter(row.status)}
                                    />
                                </label>
                            ))}
                        </div>


                        <hr className="my-3"/>
                        <div className="flex justify-between font-semibold text-base">
                            <span>Всего карточек товаров</span>
                            <span>{totalCount}</span>
                        </div>
                    </div>
                )}

            </div>

            {/* ------------------------- Плашка «Выкуп товаров» ------------------------ */}
            <div className="mb-4">

                {/* ── HEADER «Выкуп товаров» ── */}
                <button
                    onClick={() => togglePanel(Panel.PURCHASES)}
                    style={{background: 'linear-gradient(90deg,#4872db 0%,#6e8ae2 50%,#4872db 100%)'}}
                    className={
                        `w-full flex justify-between items-center text-white px-5 py-2 shadow font-semibold uppercase tracking-wide
    ${openPanel[Panel.PURCHASES] ? 'rounded-t-xl' : 'rounded-full'}`   // для Purchases то же, только Panel.PURCHASES
                    }
                >
                    <span>Выкуп товаров</span>
                    <span className="text-lg font-bold">{openPanel[Panel.PURCHASES] ? '−' : '+'}</span>
                </button>

                {openPanel[Panel.PURCHASES] && (
                    <div className="bg-white border border-t-0 border-indigo-200 rounded-b-xl p-4 -mt-px">
                        <div className="flex justify-between">
                            <span>Баланс раздач</span>
                            <span className="font-semibold">{user?.free_balance}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Доступно в каталоге</span>
                            <span className="font-semibold">{paidPlan}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Не оплачено раздач</span>
                            <span className="font-semibold">{unpaidPlan}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-base pt-1 border-t">
                            <span>Общий план раздач</span>
                            <span>{totalPlan}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Поиск / фильтры */}
            <div className="sticky top-0 z-10 bg-gray-200">
                <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder="Поиск"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full border border-darkGray rounded-md py-2 pl-10 pr-3 text-sm focus:outline-none"
                    />
                    <svg
                        className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 21l-4.35-4.35m0 0A7.35 7.35 0 1010.3 4.65a7.35 7.35 0 006.35 11.65z"
                        />
                    </svg>
                </div>

                {/*<div className="mb-4">*/}
                {/*    <select*/}
                {/*        value={filter}*/}
                {/*        onChange={e =>*/}
                {/*            setFilter(*/}
                {/*                e.target.value as*/}
                {/*                    | 'все'*/}
                {/*                    | 'активные'*/}
                {/*                    | 'созданные'*/}
                {/*                    | 'ожидают редактирования'*/}
                {/*                    | 'отклоненные'*/}
                {/*                    | 'архивные'*/}
                {/*                    | 'не оплаченные'*/}
                {/*            )*/}
                {/*        }*/}
                {/*        className="w-full border border-darkGray rounded-md py-2 px-3 text-sm focus:outline-none"*/}
                {/*    >*/}
                {/*        <option value="все">Все статусы</option>*/}
                {/*        <option value="активные">Активные</option>*/}
                {/*        <option value="созданные">Созданные</option>*/}
                {/*        <option value="ожидают редактирования">Ожидают редактирования</option>*/}
                {/*        <option value="отклоненные">Отклонённые</option>*/}
                {/*        <option value="Архивные">Архивные</option>*/}
                {/*        <option value="не оплаченные">Не оплаченные</option>*/}
                {/*    </select>*/}
                {/*</div>*/}
            </div>
            {/* Состояния загрузки / ошибок */}
            {!loading && (error || filteredProducts.length === 0) && (
                <div className="p-4 bg-brandlight border border-darkGray rounded text-center">
                    <p className="text-sm text-gray-700">Товары не найдены</p>
                </div>
            )}

            {/* Добавить товар */}
            <button
                onClick={() => navigate('/create-product')}
                className="w-full border border-brand rounded-md mt-4 px-4 py-2 text-base font-semibold hover:bg-gray-200-100"
            >
                Разместить товар
            </button>

            {loading && (
                <div className="flex justify-center mt-4">
                    <div className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-gray-600 always-spin"/>
                </div>
            )}

            {/* Список товаров */}
            {!loading && !error && filteredProducts.length > 0 && (
                <div className="flex flex-col gap-2 mt-4">
                    {filteredProducts.map((product) => {
                        const lastReview = product.moderator_reviews?.at(-1);
                        const showFlag =
                            !!lastReview?.comment_to_seller &&
                            new Date(product.updated_at) < new Date(lastReview.created_at);

                        return (
                            <div
                                key={product.id}
                                onClick={() => navigate(`/product/${product.id}/seller`)}
                                className={`relative border border-gray-200 rounded-md p-3 hover:shadow transition-shadow duration-300 cursor-pointer ${
                                    product.status.toLowerCase() === 'active'
                                        ? 'bg-green-100'
                                        : product.status.toLowerCase() === 'archived'
                                            ? 'bg-gray-300 text-black border-dashed'
                                            : product.status.toLowerCase() === 'rejected'
                                                ? 'bg-red-100 text-red-800'
                                                : product.status.toLowerCase() === 'created'
                                                    ? 'bg-white text-black'
                                                    : product.status.toLowerCase() === 'disabled'
                                                        ? 'bg-red-100 text-red-800'
                                                        : product.status.toLowerCase() === 'not_paid'
                                                            ? 'bg-orange-100 text-orange-800'
                                                            : 'bg-white'
                                }`}
                            >
                                {showFlag && (
                                    <img
                                        src="/icons/flag.png"
                                        alt="Комментарий"
                                        className="absolute top-2 right-2 w-6 h-6"
                                    />
                                )}

                                <h3 className="text-md font-semibold">{product.name}</h3>
                                <p className="text-sm text-gray-600">Цена: {product.price} ₽</p>
                                <p
                                    className={`text-xs ${
                                        product.status.toLowerCase() === 'archived' ? 'text-black' : 'text-gray-400'
                                    }`}
                                >
                                    Статус:{' '}
                                    {product.status === ProductStatus.ACTIVE
                                        ? 'Активные'
                                        : product.status === ProductStatus.REJECTED
                                            ? 'Отклоненные'
                                            : product.status === ProductStatus.ARCHIVED
                                                ? 'Архивные'
                                                : product.status === ProductStatus.CREATED
                                                    ? 'Созданные'
                                                    : product.status === ProductStatus.DISABLED
                                                        ? 'Ожидают редактирования'
                                                        : product.status === ProductStatus.NOT_PAID
                                                            ? 'Не оплаченные'
                                                            : product.status}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Кнопка пополнения кабинета */}
            <button
                onClick={handleMyBalanceClick}
                className="w-full bg-brand text-white rounded-full shadow-sm p-4 mt-4 mb-2 text-sm font-semibold text-center cursor-pointer"
            >
                Пополнить кабинет
            </button>

            {/* Техподдержка */}
            <div
                onClick={handleSupportClick}
                className="bg-white border border-brand rounded-xl shadow-sm p-4 mt-2 text-sm font-semibold cursor-pointer flex items-center gap-3"
            >
                <img src="/icons/support.png" alt="Support" className="w-7 h-7"/>
                <div className="flex flex-col">
                    <span>Техподдержка</span>
                    <span className="text-xs text-gray-500">Оперативно ответим на все вопросы</span>
                </div>
                <img src="/icons/small_arrow.png" alt="arrow" className="w-5 h-5 ml-auto"/>
            </div>
        </div>
    );
}

export default MyProductsPage;

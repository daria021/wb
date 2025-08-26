import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {deleteProduct, getAllOrderBySellerId, getProductsBySellerId, updateProductStatus} from '../services/api';

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
    article?: string;
    category?: string;
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
    const [filterCategory, setFilterCategory] = useState<string>('');


    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDeleteProduct = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // чтобы не переходить на страницу товара
        if (!window.confirm('Удалить товар навсегда? Это действие необратимо. ' +
            '*При удалении оставшиеся раздачи товара добавятся на баланс')) return;

        try {
            setDeletingId(id);
            await deleteProduct(id);
            setProducts(prev => prev.filter(p => p.id !== id)); // убрать карточку из списка
        } catch (err) {
            console.error('Не удалось удалить товар', err);
            alert('Не удалось удалить товар');
        } finally {
            setDeletingId(null);
        }
    };


    const cardRows: CardRow[] = [
        {label: 'На модерации', value: moderationCount, status: ProductStatus.CREATED},
        {label: 'Опубликованы', value: publishedCount, status: ProductStatus.ACTIVE},
        {label: 'Ожидают пополнения баланса раздач', value: notPaidCount, status: ProductStatus.NOT_PAID},
        {label: 'Необходимо исправить', value: disabledCount, status: ProductStatus.DISABLED},
        {label: 'Отклонены', value: rejectedCount, status: ProductStatus.REJECTED},
        {label: 'В архиве', value: archivedCount, status: ProductStatus.ARCHIVED},
    ];

    type ProductOrderStats = Record<string, { paid: number; inProgress: number }>;
    const [orderStats, setOrderStats] = useState<ProductOrderStats>({});

    useEffect(() => {
        if (!user?.id) return;

        (async () => {
            try {
                const res = await getAllOrderBySellerId(user.id);

                const list: any[] = Array.isArray(res.data) ? res.data : (res.data?.orders ?? []);

                const stats: ProductOrderStats = {};

                for (const o of list) {
                    const pid = o?.product?.id ?? o?.product_id;
                    if (!pid) continue;

                    const s = String(o?.status || '').toLowerCase(); // <-- нормализация
                    if (!stats[pid]) stats[pid] = {paid: 0, inProgress: 0};

                    if (s === 'cashback_paid') {
                        stats[pid].paid += 1;
                    } else if (s === 'cashback_not_paid') {
                        stats[pid].inProgress += 1;
                    }
                }

                setOrderStats(stats);
            } catch (e) {
                console.error('Не удалось загрузить статистику заказов', e);
                setOrderStats({});
            }
        })();
    }, [user?.id]);


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

    const categories = React.useMemo(
  () => Array.from(new Set(products.map(p => p.category).filter(Boolean))) as string[],
  [products]
);


const normalize = (v: unknown) =>
  String(v ?? '').toLowerCase().replace(/\s+/g, '');

const filteredProducts = products.filter(p => {
  // статусные чекбоксы
  if (activeStatuses.length && !activeStatuses.includes(p.status)) return false;

  // поиск по названию/артикулу
  if (searchQuery) {
    const q = normalize(searchQuery);
    const inName = normalize(p.name).includes(q);
    const inArticle = normalize(p.article).includes(q);
    if (!inName && !inArticle) return false;
  }

  // фильтр по категории
  if (filterCategory && p.category !== filterCategory) return false;

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
            <h2 className="text-2xl font-bold text-center mb-2">Мои товары</h2>

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

            {/* Добавить товар */}
            <button
                onClick={() => navigate('/create-product')}
                className="w-full border border-brand rounded-md mb-2 px-4 py-2 text-base font-semibold hover:bg-gray-200-100"
            >
                Разместить товар
            </button>

            {/* Поиск / фильтры */}
            <div className="sticky top-0 z-10 bg-gray-200">
  {/* Поиск */}
  <div className="relative mb-2">
    <input
      type="text"
      placeholder="Поиск по названию или артикулу"
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

  {/* Фильтр по категории */}
  <div className="mb-4">
    <div className="relative">
      <select
        value={filterCategory}
        onChange={e => setFilterCategory(e.target.value)}
        className="h-10 w-full appearance-none rounded-md border border-brand bg-white
                   pl-3 pr-10 text-sm font-medium text-gray-800
                   focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
        aria-label="Фильтр по категории"
      >
        <option value="">Все категории</option>
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      {/* стрелка */}
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
        <svg className="h-4 w-4 text-brand" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M5.25 7.5l4.5 4.5 4.5-4.5h-9z" />
        </svg>
      </div>
    </div>
  </div>
</div>

            {/* Состояния загрузки / ошибок */}
            {!loading && (error || filteredProducts.length === 0) && (
                <div className="p-4 bg-brandlight border border-darkGray rounded text-center">
                    <p className="text-sm text-gray-700">Товары не найдены</p>
                </div>
            )}


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
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : product.status.toLowerCase() === 'not_paid'
                                                            ? 'bg-orange-100 text-orange-800'
                                                            : 'bg-white'
                                }`}
                            >
                                {/* Правый верхний угол: флажок и корзина */}
                                <div className="absolute top-2 right-2 flex items-center gap-2">
                                    {showFlag && (
                                        <img
                                            src="/icons/flag.png"
                                            alt="Комментарий"
                                            className="w-5 h-5 opacity-90"
                                        />
                                    )}

                                    {product.status === ProductStatus.ARCHIVED && (
                                        <button
                                            onClick={(e) => handleDeleteProduct(e, product.id)}
                                            disabled={deletingId === product.id}
                                            aria-label="Удалить товар"
                                            title="Удалить товар"
                                            className={`group p-1 rounded-md transition
                  ${deletingId === product.id
                                                ? 'opacity-40 pointer-events-none'
                                                : 'hover:bg-red-50 active:scale-95'}`}
                                        >
                                            <img
                                                src="/icons/trash.png"
                                                alt=""
                                                className={`w-5 h-5 ${deletingId === product.id ? '' : 'opacity-80 group-hover:opacity-100'}`}
                                            />
                                        </button>
                                    )}
                                </div>


                                <h3 className="text-md font-semibold">{product.name}</h3>

                                {(() => {
                                    const s = orderStats[product.id] ?? {paid: 0, inProgress: 0};
                                    return (
                                        <div className="mt-1 mb-1 flex flex-wrap gap-1 text-xs">
      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
        Доступно: <b>{product.remaining_products ?? 0}</b>
      </span>
                                            <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700">
        Завершено: <b>{s.paid}</b>
      </span>
                                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
        В процессе: <b>{s.inProgress}</b>
      </span>
                                        </div>
                                    );
                                })()}


                                <p className="text-sm text-gray-600">Цена для покупателя: {product.price} ₽</p>

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
                                                        ? 'Необходимо отредактировать'
                                                        : product.status === ProductStatus.NOT_PAID
                                                            ? 'Не оплаченные'
                                                            : product.status}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}

        </div>
    );
}

export default MyProductsPage;

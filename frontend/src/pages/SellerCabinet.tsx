import React, {useCallback, useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
// import {ProductStatus} from "../enums";
import {getOrderBySellerId, getProductsBySellerId} from "../services/api";
import {useUser} from "../contexts/user";
import {OrderStatus, ProductStatus} from '../enums';


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

function SellerCabinet() {
    const navigate = useNavigate();

    const handleMyProductsClick = () => {
        // сохраняем текущее время (ISO-строка) перед переходом
        localStorage.setItem(LAST_VIEWED_PRODUCTS_KEY, new Date().toISOString());
        navigate('/my-products');
    };
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const handleQuestion = () => navigate('/question');

    const {user, loading: userLoading, refresh} = useUser();
    const location = useLocation();

    const [unpaidCount, setUnpaidCount] = useState(0); // отчёты с невыплаченным кешбэком
    const [flaggedCount, setFlaggedCount] = useState(0); // карточки, требующие внимания
    const [autoPayCount,   setAutoPayCount]   = useState(0); // можно оплатить

    const LAST_VIEWED_PRODUCTS_KEY = 'seller_last_products_view';

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
            setAutoPayCount(toAutoPay.length);

        }
    }, [user?.free_balance, products]);


    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            await refresh();
            const prodRes = await getProductsBySellerId();
            const ordersRes = user ? await getOrderBySellerId(user.id) : {data: []};

            const prods = prodRes.data.products as Product[];
            setProducts(prods);

            /* ---------- МОДЕРИРОВАННЫЕ ТОВАРЫ ---------- */
            const lastSeenStr = localStorage.getItem(LAST_VIEWED_PRODUCTS_KEY);
            const lastSeen = lastSeenStr ? new Date(lastSeenStr) : null;

            const flagged = prods.filter(p =>
                    //! Если нет отметки lastSeen — все изменения считаются «новыми»
                    (!lastSeen || new Date(p.updated_at) > lastSeen)
                //! new Date(p.created_at) < new Date(p.updated_at)
            ).length;

            setFlaggedCount(flagged);


            setFlaggedCount(flagged);

            /* ---------- НЕВЫПЛАЧЕННЫЙ КЕШБЭК ---------- */
            const unpaid = ordersRes.data.filter(
                (o: any) => o.status === OrderStatus.CASHBACK_NOT_PAID
            ).length;
            setUnpaidCount(unpaid);

            setError('');
        } catch (e) {
            console.error('Ошибка при загрузке кабинета:', e);
            setError('Не удалось загрузить данные');
        } finally {
            setLoading(false);
        }
    }, [refresh, user]);


    // 2) при монтировании и при каждом заходе на /seller-cabinet
    useEffect(() => {
        if (location.pathname === '/seller-cabinet') {
            fetchData();
        }
    }, [location.pathname, fetchData]);

    // 3) при возврате в фокус
    useEffect(() => {
        const onFocus = () => {
            if (location.pathname === '/seller-cabinet') {
                fetchData();
            }
        };
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [location.pathname, fetchData]);

    // подсчёты
    const notPaidSum = products
        .filter(p => p.status === ProductStatus.NOT_PAID)
        .reduce((s, p) => s + p.remaining_products, 0)

    ;
    // const activeSum = products
    //     .filter(p => p.status === ProductStatus.ACTIVE)
    //     .reduce((s, p) => s + p.remaining_products, 0);
    //
    //
    // const freeBalance = user ? user.free_balance : 0;
    // console.log('activeSum', activeSum);
    // console.log('freeBalance', freeBalance);
    //

    const handleReportsClick = () => {
        navigate(`/seller-cabinet/reports`);
    };
    const handleMyBalanceClick = () => {
        navigate(`/seller-cabinet/balance`);
    }

    const handleSupportClick = () => {
        if (window.Telegram?.WebApp?.close) {
            window.Telegram.WebApp.close();
        }
        window.open(process.env.REACT_APP_SUPPORT_URL, '_blank');
    };

    return (
        <div className="min-h-screen bg-gray-200">  {/* Обертка на весь экран */}

            <div className="p-4 max-w-screen-sm mx-auto relative">
                <h1 className="text-xl font-bold mb-4 text-center">Кабинет продавца</h1>

                <p className="text-sm text-gray-700 mb-6 text-center">
                    Premium Cash Back — сервис для управления раздачами товара за кешбэк
                </p>

                <div className="bg-white border border-darkGray rounded-md p-4 mb-4 relative"
                >
                    <button
                        onClick={handleMyBalanceClick}
                        className="
                            absolute top-4 right-2
                            bg-brand
                            hover:bg-brand-dark
                            text-white
                            rounded-md
                            px-3 py-1.5
                            text-sm font-semibold
                            transition-colors
                          "
                    >
                        Пополнить
                    </button>
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div
                                className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-gray-600 always-spin"/>
                        </div>
                    ) : (
                        <>
                            <hr/>
                            <p>Остаток баланса раздач</p>
                            <p className="text-xl font-bold">{user?.free_balance ?? 0} раздач</p>

                            <p>Активные раздачи</p>
                            <p className="text-xl font-bold">{user?.reserved_active ?? 0} раздач</p>
                            <hr/>
                            <p>Требуется оплата раздач</p>
                            <p className="text-xl font-bold">{user?.unpaid_plan ?? 0} раздач</p>
                            <p>Общее кол-во раздач</p>
                            <p className="text-xl font-bold">{(user?.reserved_active ?? 0) + (user?.free_balance ?? 0)} раздач</p>
                        </>
                    )}
                </div>

                <button
                    onClick={() => navigate('/create-product')}
                    className="w-full border bg-white border-brand rounded-md px-4 py-2 text-base font-semibold hover:bg-gray-200-100"
                >
                    Разместить товар
                </button>

                <div
                    onClick={handleMyProductsClick}
                    className="bg-white border border-darkGray rounded-md p-4 mb-4 mt-4 cursor-pointer relative overflow-visible"
                >
                    {(flaggedCount > 0 || autoPayCount > 0) && (
                        <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-red-600 rounded-full"/>
                    )}
                    <p className="text-md font-semibold mb-1">Мои товары</p>
                    <p className="text-sm text-gray-500">Карточки для раздачи в каталоге</p>
                </div>

                <div
                    onClick={handleReportsClick}
                    className="bg-white border border-darkGray rounded-md p-4 mb-4 cursor-pointer relative overflow-visible"
                >
                    {unpaidCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-red-600 rounded-full"/>
                    )}
                    <p className="text-md font-semibold mb-1">Отчеты по выкупам</p>
                    <p className="text-sm text-gray-500">
                        Просмотр отчётов по вашим товарам для выплаты кешбэка
                    </p>
                </div>

                    <section className="flex flex-col gap-2">
                    <button
                        onClick={handleQuestion}
                        className="py-2 px-4 rounded-lg font-semibold border border-brand text-brand bg-transparent"
                    >
                        Ответы на частые вопросы
                    </button>
                    <button
                        className="py-2 px-4 rounded-lg font-semibold border border-brand text-brand bg-transparent"
                            onClick={() => navigate('/instruction', {state: {openTab: 'seller'}})}
                        >
                            Инструкция для продавца
                        </button>
                </section>

                <div
                    onClick={handleSupportClick}
                    className="bg-white border border-brand rounded-xl shadow-sm p-4 text-sm font-semibold cursor-pointer flex items-center gap-3 mt-3"
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
            </div>
        </div>
    );
}


export default SellerCabinet;

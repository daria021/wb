import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {getProductsBySellerId} from "../services/api";
import {useUser} from "../contexts/user";
import {ProductStatus} from "../enums";


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
    created_at: string;
    updated_at: string;
}

function SellerCabinet() {
    const navigate = useNavigate();

    const handleMyProductsClick = () => navigate('/my-products');
    const [products, setProducts] = useState<{ status: ProductStatus; remaining_products: number }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const {user, loading: userLoading, refresh} = useUser();
    const location = useLocation();

    useEffect(() => {

        if (location.pathname === '/seller-cabinet') {
            refresh();
        }
    }, [location.pathname, refresh]);

    useEffect(() => {
        const handleFocus = () => {
            if (location.pathname === '/seller-cabinet') {
                refresh();
            }
        };
        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [location.pathname, refresh]);

    console.log("products", products);
    console.log("filter func", products.filter);
    const activeSum = products
        .filter(p => p.status === ProductStatus.ACTIVE)
        .reduce((s, p) => s + p.remaining_products, 0);

    const notPaidSum = products
        .filter(p => p.status === ProductStatus.NOT_PAID)
        .reduce((s, p) => s + p.remaining_products, 0);

    const freeBalance = user ? user.free_balance : 0;
    console.log('activeSum', activeSum);
    console.log('freeBalance', freeBalance);

    useEffect(() => {
        let isMounted = true
        setLoading(true)

        ;(async () => {
            try {
                // 1) Обновляем контекст пользователя
                await refresh()

                const response = await getProductsBySellerId();
                if (!isMounted) return
                setProducts(response.data.products);
                setError('');
            } catch (e) {
                console.error('Ошибка при инициализации страницы:', e)
                if (!isMounted) return
                setError('Не удалось загрузить данные')
            } finally {
                if (isMounted) setLoading(false)
            }
        })()

        return () => {
            // флаг защиты от состояния после анмаунта
            isMounted = false
        }
    }, [])


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
                    ВБКэшбэк — сервис для управления раздачами товара за кэшбэк
                </p>

                <div className="bg-white border border-darkGray rounded-md p-4 mb-4 relative"
                >
                    <button
                        onClick={handleMyBalanceClick}
                        className="
    absolute top-2 right-2
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
                    ) : notPaidSum > 0 ? (

                        <>
                            <p>Не оплачено</p>
                            <p className="text-2xl font-bold">{user?.unpaid_plan} раздач</p>
                            <hr/>
                            <p>Баланс</p>
                            <p className="text-2xl font-bold">{user?.free_balance} раздач</p>
                        </>
                    ) : (
                        <>
                            <p>В каталоге доступно</p>
                            <p className="text-2xl font-bold">{user?.reserved_active} раздач</p>
                            <hr/>
                            <p>Баланс</p>
                            <p className="text-2xl font-bold">{user?.free_balance} раздач</p>
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
                    className="bg-white border border-darkGray rounded-md p-4 mb-4 mt-4 cursor-pointer"
                >
                    <p className="text-md font-semibold mb-1">Мои товары</p>
                    <p className="text-sm text-gray-500">Товары по раздачам</p>
                </div>

                <div
                    onClick={handleReportsClick}
                    className="bg-white border border-darkGray rounded-md p-4 mb-4 cursor-pointer"
                >
                    <p className="text-md font-semibold mb-1">Отчеты по выкупам</p>
                    <p className="text-sm text-gray-500">
                        Просмотр отчетов по покупкам ваших товаров
                    </p>
                </div>


                <div
                    onClick={handleSupportClick}
                    className="bg-white border border-brand rounded-xl shadow-sm p-4 mb-4 font-semibold cursor-pointer flex items-center gap-3"
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
            </div>
        </div>
    );
}


export default SellerCabinet;

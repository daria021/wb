import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {getMe, getProductsBySellerId} from '../services/api';
import {on} from '@telegram-apps/sdk';
import {ProductStatus} from '../enums';
import {MeResponse} from '../types/MeResponse';

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

function MyProductsPage() {
    const navigate = useNavigate();

    const [products, setProducts] = useState<Product[]>([]);
    const [seller, setSeller] = useState<MeResponse | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<
        'все' | 'активные' | 'созданные' | 'ожидают редактирования' | 'отклоненные' | 'архивированные' | 'не оплаченные'
    >('все');

    const totalCount = products.length;
    const moderationCount = products.filter(
        (p) => p.status === ProductStatus.CREATED,
    ).length;
    const publishedCount = products.filter((p) => p.status === ProductStatus.ACTIVE).length;
    const disabledCount = products.filter((p) => p.status === ProductStatus.DISABLED).length;
    const archivedCount = products.filter((p) => p.status === ProductStatus.ARCHIVED).length;
    const notPaidCount = products.filter((p) => p.status === ProductStatus.NOT_PAID).length;
    const rejectedCount = products.filter((p) => p.status === ProductStatus.REJECTED).length;
    const totalPlan = products
        .filter(
            (p) => p.status === ProductStatus.ACTIVE || p.status === ProductStatus.NOT_PAID,
        )
        .reduce((sum, p) => sum + p.remaining_products, 0);

    const filteredProducts = products.filter(product => {
        switch (filter) {
            case 'активные':
                if (product.status !== ProductStatus.ACTIVE) return false;
                break;
            case 'созданные':
                if (product.status !== ProductStatus.CREATED) return false;
                break;
            case 'ожидают редактирования':
                if (product.status !== ProductStatus.DISABLED) return false;
                break;
            case 'архивированные':
                if (product.status !== ProductStatus.ARCHIVED) return false;
                break;
            case 'не оплаченные':
                if (product.status !== ProductStatus.NOT_PAID) return false;
                break;
            case 'отклоненные':
                if (product.status !== ProductStatus.REJECTED) return false;
                break;
            case 'все':
                break;
        }

        if (searchQuery) {
            return product.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
        }

        return true;
    });


    useEffect(() => {
        const unsub = on('back_button_pressed', () => {
            navigate('/seller-cabinet', {replace: true});
        });
        return unsub;
    }, [navigate]);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const response = await getProductsBySellerId();
                setProducts(response.data);
                setError('');
            } catch (err) {
                console.error('Ошибка при загрузке товаров продавца:', err);
                setError('Не удалось загрузить товары.');
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
        console.log('products fetched');
    }, []);

    useEffect(() => {
        async function fetchSeller() {
            try {
                const me = await getMe();
                setSeller(me);
            } catch (err) {
                console.error('Ошибка при получении seller:', err);
            }
        }

        fetchSeller();
    }, []);

    const handleSupportClick = () => {
        if (window.Telegram?.WebApp?.close) {
            window.Telegram.WebApp.close();
        }
        window.open(process.env.REACT_APP_SUPPORT_URL, '_blank');
    };

    const handleMyBalanceClick = () => {
        navigate(`/seller-cabinet/balance`);
    };

    return (
        <div className="p-4 min-h-screen bg-gray-200 mx-auto">
            <div className="mb-4 p-4 bg-brandlight rounded shadow">
                <p className="text-sm">
                    Всего карточек: <strong>{totalCount}</strong>
                </p>
                <p className="text-sm">
                    На проверке: <strong>{moderationCount}</strong>
                </p>
                <p className="text-sm">
                    Опубликовано: <strong>{publishedCount}</strong>
                </p>
                <p className="text-sm">
                    Ожидают редактирования: <strong>{disabledCount}</strong>
                </p>
                <p className="text-sm">
                    В архиве: <strong>{archivedCount}</strong>
                </p>
                <p className="text-sm">
                    Заявка оформлена и не оплачена: <strong>{notPaidCount}</strong>
                </p>
                <p className="text-sm">
                    Отклоненные: <strong>{rejectedCount}</strong>
                </p>
                <p className="text-sm">
                    Общий план по раздачам: <strong>{totalPlan}</strong>
                </p>
                {seller &&
                    (() => {
                        const missing = Math.max(0, totalPlan - seller.balance);

                        return missing > 0 ? (
                            <p className="text-sm text-red-800">
                                Баланс раздач: <strong>{seller.balance}</strong>
                                <br/>
                                Для публикации товара необходимо пополнить баланс на&nbsp;
                                <strong>{missing}</strong>&nbsp;раздач
                            </p>
                        ) : (
                            <p className="text-sm text-black">
                                Баланс раздач: <strong>{seller.balance}</strong>
                            </p>
                        );
                    })()}
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

                <div className="mb-4">
                    <select
                        value={filter}
                        onChange={e =>
                            setFilter(
                                e.target.value as
                                    | 'все'
                                    | 'активные'
                                    | 'созданные'
                                    | 'ожидают редактирования'
                                    | 'отклоненные'
                                    | 'архивированные'
                                    | 'не оплаченные'
                            )
                        }
                        className="w-full border border-darkGray rounded-md py-2 px-3 text-sm focus:outline-none"
                    >
                        <option value="все">Все статусы</option>
                        <option value="активные">Активные</option>
                        <option value="созданные">Созданные</option>
                        <option value="ожидают редактирования">Ожидают редактирования</option>
                        <option value="отклоненные">Отклонённые</option>
                        <option value="архивированные">Архивированные</option>
                        <option value="не оплаченные">Не оплаченные</option>
                    </select>
                </div>
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
                                                ? 'Архивированные'
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

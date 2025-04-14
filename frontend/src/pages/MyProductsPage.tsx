import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {getProductsBySellerId} from '../services/api';
import {on} from "@telegram-apps/sdk";
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
    status: ProductStatus; // "created", "active", "disabled", "rejected", "archived"
    moderator_reviews?: ModeratorReview[];
}

function MyProductsPage() {
    const navigate = useNavigate();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'created' | 'rejected' | 'archived'>('all');

    // Затем применяем фильтрацию по статусу и поисковому запросу:
    const filteredProducts = products.filter((product) => {
        if (filter !== 'all') {
            if (filter === 'created') {
                if (
                    product.status.toLowerCase() !== ProductStatus.CREATED.toLowerCase() &&
                    product.status.toLowerCase() !== ProductStatus.DISABLED.toLowerCase()
                ) {
                    return false;
                }
            } else if (product.status.toLowerCase() !== filter.toLowerCase()) {
                return false;
            }
        }
        if (searchQuery) {
            return product.name.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
    });

    useEffect(() => {
        const removeBackListener = on('back_button_pressed', () => {
            navigate('/seller-cabinet');
        });
        return () => {
            removeBackListener();
        };
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
    }, []);

    const handleSupportClick = () => {
        if (window.Telegram?.WebApp?.close) {
            window.Telegram.WebApp.close();
        }
        window.open(process.env.REACT_APP_SUPPORT_URL, '_blank');
    };


    return (
        <div className="p-4 min-h-screen bg-gray-200 mx-auto">
            {/* Верхняя панель (поиск + фильтр) */}
            <div className="sticky top-0 z-10 bg-gray-200">
                <div className="flex justify-end mb-4">
                    <button
                        onClick={() => navigate('/create-product')}
                        className="border border-brand rounded-md px-4 py-2 text-sm font-semibold hover:bg-gray-100"
                    >
                        Разместить товар
                    </button>
                </div>

                <div className="relative mb-4">
                    <input
                        type="text"
                        placeholder="Поиск"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-3 text-sm focus:outline-none"
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
                        onChange={(e) =>
                            setFilter(e.target.value as 'all' | 'active' | 'created' | 'rejected' | 'archived')
                        }
                        className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none"
                    >
                        <option value="all">Все статусы</option>
                        <option value="active">Активный</option>
                        <option value="created">Создано / Отключено</option>
                        <option value="rejected">Отклонено</option>
                        <option value="archived">Архив</option>
                    </select>
                </div>
            </div>

            {/* Loading state */}
            {loading && <p className="text-sm text-gray-500">Загрузка...</p>}

            {/* Если нет товаров или ошибка */}
            {!loading && (error || filteredProducts.length === 0) && (
                <div className="p-4 bg-brandlight border border-gray-300 rounded text-center">
                    <p className="text-sm text-gray-700">Товары не найдены</p>
                </div>
            )}

            {/* Список товаров */}
            {!loading && !error && filteredProducts.length > 0 && (
                <div className="flex flex-col gap-2">
                    {filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            onClick={() => navigate(`/product/${product.id}/seller`)}
                            className={`relative border border-gray-200 rounded-md p-3 hover:shadow transition-shadow duration-300 cursor-pointer ${
                                product.status.toLowerCase() === 'active'
                                    ? 'bg-green-100'
                                    : product.status.toLowerCase() === 'archived'
                                        ? 'bg-gray-400 text-black border-dashed'
                                        : 'bg-white'
                            }`}

                        >
                            {/* Если у продукта есть комментарий (например, product.comment) — отображаем флажок */}
                            {product.moderator_reviews?.at(-1)?.comment_to_seller && (
                                <img
                                    src="/icons/flag.png"
                                    alt="Комментарий"
                                    className="absolute top-2 right-2 w-6 h-6"
                                />
                            )}
                            <h3 className="text-md font-semibold">{product.name}</h3>
                            <p className="text-sm text-gray-600">
                                Цена: {product.price} ₽
                            </p>
                            <p className={`text-xs ${product.status.toLowerCase() === 'archived' ? 'text-black' : 'text-gray-400'}`}>
                                Статус:{' '}
                                {product.status === ProductStatus.ACTIVE
                                    ? 'Активный'
                                    : product.status === ProductStatus.REJECTED
                                        ? 'Отклонено'
                                        : product.status === ProductStatus.ARCHIVED
                                            ? 'Архив'
                                            : product.status === ProductStatus.CREATED ||
                                            product.status === ProductStatus.DISABLED
                                                ? 'Создано / Отключено'
                                                : product.status}
                            </p>
                        </div>
                    ))}
                </div>
            )}
            <div
                onClick={handleSupportClick}
                className="bg-white border border-brand rounded-xl shadow-sm p-4 mt-4 text-sm font-semibold cursor-pointer flex items-center gap-3"
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
    );
}

export default MyProductsPage;

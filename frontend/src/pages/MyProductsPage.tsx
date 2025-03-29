import React, { useEffect, useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductsBySellerId } from '../services/api';
import { on } from "@telegram-apps/sdk";

interface Product {
    id: string;
    name: string;
    price: number;
    status: string; // на сервере могут приходить "created", "active", "disabled", "rejected", "archived"
}

function MyProductsPage() {
    const navigate = useNavigate();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    // Изменили начальное значение на "active"
    const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('active');

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
                // Предполагаем, что response.data — массив товаров
                setProducts(response.data);
            } catch (err) {
                console.error('Ошибка при загрузке товаров продавца:', err);
                setError('Не удалось загрузить товары.');
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    const handleCreateProduct = () => {
        navigate('/create-product');
    };

    // Фильтрация товаров:
    // - Если filter не "all", оставляем только те, у которых status соответствует выбранному фильтру.
    // - Также фильтруем по названию.
    const filteredProducts = products.filter((product) => {
        if (filter !== 'all' && product.status !== filter) {
            return false;
        }
        if (searchQuery) {
            return product.name.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
    });

    return (
        <div className="p-4 min-h-screen bg-gray-200 mx-auto">
            {/* Кнопка «Разместить товар» */}
            <div className="flex justify-end mb-4">
                <button
                    onClick={handleCreateProduct}
                    className="border border-brand rounded-md px-4 py-2 text-sm font-semibold hover:bg-gray-100"
                >
                    Разместить товар
                </button>
            </div>

            {/* Поле поиска */}
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

            {/* Вкладки: Все / Активные / Архив */}
            <div className="flex gap-2 mb-4 text-sm">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-md border ${
                        filter === 'all'
                            ? 'bg-brand text-white border-brand'
                            : 'border-gray-300 text-gray-600'
                    }`}
                >
                    Все
                </button>
                <button
                    onClick={() => setFilter('active')}
                    className={`px-4 py-2 rounded-md border ${
                        filter === 'active'
                            ? 'bg-brand text-white border-brand'
                            : 'border-gray-300 text-gray-600'
                    }`}
                >
                    Активные
                </button>
                <button
                    onClick={() => setFilter('archived')}
                    className={`px-4 py-2 rounded-md border ${
                        filter === 'archived'
                            ? 'bg-brand text-white border-brand'
                            : 'border-gray-300 text-gray-600'
                    }`}
                >
                    Архив
                </button>
            </div>

            {/* Состояние загрузки и ошибки */}
            {loading && <p className="text-sm text-gray-500">Загрузка...</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}

            {/* Список товаров */}
            {!loading && !error && (
                <>
                    {filteredProducts.length === 0 ? (
                        <p className="text-sm text-gray-500">Товары не найдены</p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {filteredProducts.map((product) => (
                                <div
                                    key={product.id}
                                    onClick={() => navigate(`/product/${product.id}/seller`)}
                                    className="border border-gray-200 rounded-md p-3 bg-white"
                                >
                                    <h3 className="text-md font-semibold">{product.name}</h3>
                                    <p className="text-sm text-gray-600">
                                        Цена: {product.price} ₽
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Статус:{' '}
                                        {product.status === 'active'
                                            ? 'Активный'
                                            : product.status === 'archived'
                                                ? 'Архив'
                                                : product.status}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default MyProductsPage;

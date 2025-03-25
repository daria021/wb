import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductsBySellerId } from '../services/api';
import {on} from "@telegram-apps/sdk";

interface Product {
    id: string;
    name: string;
    price: number;
    status: 'active' | 'archive';
    // ...другие поля (article, brand, и т.п.)
}

function MyProductsPage() {
    const navigate = useNavigate();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'archive'>('all');

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
    });

    // Обработчик для кнопки «Разместить товар»
    const handleCreateProduct = () => {
        // Переход на страницу создания нового товара
        navigate('/create-product');
    };

    // Фильтрация по статусу (active/archive) и поиск по названию
    const filteredProducts = products.filter((product) => {
        // 1. Если фильтр не «all», проверяем product.status
        if (filter !== 'all' && product.status !== filter) {
            return false;
        }
        // 2. Если есть поисковый запрос, проверяем вхождение в название (toLowerCase)
        if (searchQuery) {
            return product.name.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
    });

    return (
        <div className="p-4 max-w-screen-sm bg-gray-200 mx-auto">

            {/* Кнопка «Разместить товар» */}
            <div className="flex justify-end mb-4">
                <button
                    onClick={handleCreateProduct}
                    className="border border-gray-300 rounded-md px-4 py-2 text-sm font-semibold hover:bg-gray-100"
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
                {/* Иконка поиска (если нужна), можно заменить на любую */}
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
                            ? 'bg-pink-500 text-white border-pink-500'
                            : 'border-gray-300 text-gray-600'
                    }`}
                >
                    Все
                </button>
                <button
                    onClick={() => setFilter('active')}
                    className={`px-4 py-2 rounded-md border ${
                        filter === 'active'
                            ? 'bg-pink-500 text-white border-pink-500'
                            : 'border-gray-300 text-gray-600'
                    }`}
                >
                    Активные
                </button>
                <button
                    onClick={() => setFilter('archive')}
                    className={`px-4 py-2 rounded-md border ${
                        filter === 'archive'
                            ? 'bg-pink-500 text-white border-pink-500'
                            : 'border-gray-300 text-gray-600'
                    }`}
                >
                    Архив
                </button>
            </div>

            {/* Состояние загрузки и ошибки */}
            {loading && <p className="text-sm text-gray-500">Загрузка...</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}

            {/* Список товаров или «Товары не найдены» */}
            {!loading && !error && (
                <>
                    {filteredProducts.length === 0 ? (
                        <p className="text-sm text-gray-500">Товары не найдены</p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {filteredProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="border border-gray-200 rounded-md p-3 bg-white"
                                >
                                    <h3 className="text-md font-semibold">{product.name}</h3>
                                    <p className="text-sm text-gray-600">
                                        Цена: {product.price} ₽
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Статус: {product.status === 'active' ? 'Активный' : 'Архив'}
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

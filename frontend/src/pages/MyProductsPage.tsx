import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {getProductsBySellerId} from '../services/api';
import {on} from "@telegram-apps/sdk";
import {ProductStatus} from "../enums";

interface Product {
    id: string;
    name: string;
    price: number;
    status: string; // "created", "active", "disabled", "rejected", "archived"
}

function MyProductsPage() {
    const navigate = useNavigate();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    // "created" here represents both CREATED and DISABLED statuses
    const [filter, setFilter] = useState<'all' | 'active' | 'created' | 'rejected' | 'archived'>('all');

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

    const handleCreateProduct = () => {
        navigate('/create-product');
    };

    // Filter products by selected status and search query.
    // When filter === 'created', include both CREATED and DISABLED statuses.
    const filteredProducts = products.filter((product) => {
        if (filter !== 'all') {
            if (filter === 'created') {
                if (
                    product.status !== ProductStatus.CREATED &&
                    product.status !== ProductStatus.DISABLED
                ) {
                    return false;
                }
            } else if (product.status !== filter) {
                return false;
            }
        }
        if (searchQuery) {
            return product.name.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return true;
    });

    return (
        <div className="p-4 min-h-screen bg-gray-200 mx-auto">
            <div className="sticky top-0 z-10 bg-gray-200">
                {/* "Разместить товар" button */}
                <div className="flex justify-end mb-4">
                    <button
                        onClick={handleCreateProduct}
                        className="border border-brand rounded-md px-4 py-2 text-sm font-semibold hover:bg-gray-100"
                    >
                        Разместить товар
                    </button>
                </div>

                {/* Search input */}
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

                {/* Status selector */}
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


            {/* Loading and error state */}
            {loading && <p className="text-sm text-gray-500">Загрузка...</p>}
            {/* Если нет товаров или возникла ошибка */}
            {!loading && (error || filteredProducts.length === 0) && (
                <div className="p-4 bg-brandlight border border-gray-300 rounded text-center">
                    <p className="text-sm text-gray-700">Товары не найдены</p>
                </div>
            )}

            {/* Products list */}
            {!loading && !error && filteredProducts.length > 0 && (

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
            )
            }
        </div>
    );
}

export default MyProductsPage;

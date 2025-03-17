// src/pages/CatalogPage.tsx
import React, { useEffect, useState } from 'react';
import {useNavigate} from 'react-router-dom';
import { getProducts } from '../services/api';

interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    article: string;
    image_path?: string;
}


function CatalogPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleBackClick = () => {
        navigate('/');
    };


    useEffect(() => {
        async function fetchProducts() {
            try {
                const response = await getProducts();
                // Если сервер возвращает дубликаты, оставляем уникальные товары по id
                const uniqueProducts = Object.values(
                    (response.data as Product[]).reduce((acc: Record<string, Product>, product) => {
                        if (!acc[product.id] || (!acc[product.id].image_path && product.image_path)) {
                            acc[product.id] = product;
                        }
                        return acc;
                    }, {})
                );
                setProducts(uniqueProducts);
            } catch (err) {
                console.error('Ошибка при загрузке товаров:', err);
                setError('Не удалось загрузить каталог товаров.');
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    if (loading) {
        return <div className="p-4">Загрузка каталога...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-600">{error}</div>;
    }

    return (
        <div className="p-4 max-w-screen-md mx-auto">
            <button
                onClick={handleBackClick}
                className="flex-1 border border-gray-300 text-gray-600 p-2 rounded"
            >
                Назад
            </button>
            <h2 className="text-2xl font-bold mb-6">Каталог актуальных товаров</h2>

            {/* 2 колонки, чтобы на экране помещалось 4 карточки (2 по ширине и 2 по высоте) */}
            <div className="grid grid-cols-2 gap-4">
                {products.map(product => (
                    <div
                        key={product.id}
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="border border-gray-200 rounded-md shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
                    >
                        <div className="relative w-full aspect-[3/4] bg-gray-100">
                            {product.image_path ? (
                                <img
                                    src={
                                        product.image_path.startsWith('http')
                                            ? product.image_path
                                            : `${process.env.REACT_APP_MEDIA_BASE}/${product.image_path}`
                                    }
                                    alt={product.name}
                                    className="absolute top-0 left-0 w-full h-full object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                    Нет фото
                                </div>
                            )}
                        </div>
                        <div className="p-3 flex flex-col">
                            <h3 className="text-sm font-semibold mb-1">{product.name}</h3>
                            <p className="text-md font-bold mb-1" style={{ color: "#981e97" }}>
                                {product.price} ₽
                            </p>
                            {product.description && (
                                <p className="text-xs text-gray-700 mb-1 line-clamp-2">
                                    {product.description}
                                </p>
                            )}
                            <p className="text-xs text-gray-500 mt-auto">Арт. {product.article}</p>
                        </div>
                    </div>
                ))}

            </div>
        </div>
    );
}

export default CatalogPage;

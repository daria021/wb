import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {getProducts} from '../services/api';

import {on} from '@telegram-apps/sdk';
import GetUploadLink from "../components/GetUploadLink";


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
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const removeBackListener = on('back_button_pressed', () => {
            navigate('/');
        });

        return () => {
            removeBackListener();
        };
    }, [navigate]);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const response = await getProducts();
                // Убираем дубликаты по id
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

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return <div className="p-4">Загрузка каталога...</div>;
    }

    if (error) {
        return (
            <div className="p-4 bg-brandlight border border-brand rounded text-center">
                <p className="text-sm text-brand">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-200">
            <div className="p-4 mx-auto">
                {/* Поле ввода для поиска */}
                <div className="sticky top-0 z-10 bg-gray-200">

                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Поиск"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full border border-gray-300 rounded-md p-2"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">

                    {filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            onClick={() => navigate(`/product/${product.id}`)}
                            className="border border-gray-200 rounded-md shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 cursor-pointer"
                        >
                            <div className="relative w-full aspect-[3/4] bg-gray-100">
                                {product.image_path ? (
                                    <img
                                        src={
                                            product.image_path.startsWith('http')
                                                ? product.image_path
                                                : GetUploadLink(product.image_path)
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
                            <div className="p-3 flex flex-col bg-white">
                                <h3 className="text-sm font-semibold mb-1">{product.name}</h3>
                                <p className="text-md font-bold mb-1 text-brand">
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
        </div>
    );
}

export default CatalogPage;

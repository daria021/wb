import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductById } from '../services/api';
import { Category, PayoutTime } from '../enums';

interface Product {
    id: string;
    name: string;
    article: string;
    brand: string;
    category: Category;
    key_word: string;
    general_repurchases: number;
    daily_repurchases: number;
    price: number;
    wb_price: number;
    tg: string;
    payment_time: PayoutTime;
    review_requirements: string;
    image_path?: string;
}

function CreateProductInfo() {
    const navigate = useNavigate();
    const { productId } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const handleBackClick = () => {
        navigate('/my-products');
    };

    useEffect(() => {
        if (!productId) return;
        getProductById(productId)
            .then((res) => {
                setProduct(res.data);
            })
            .catch((err) => {
                console.error('Ошибка при загрузке товара:', err);
                setError('Не удалось загрузить товар');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [productId]);

    const handleTopUpClick = () => {
        alert('Пополнить кабинет');
    };

    const handleEditClick = () => {
        if (product) {
            navigate(`/create-product/${product.id}`);
        }
    };

    if (loading) {
        return <div className="p-4">Загрузка...</div>;
    }

    if (error || !product) {
        return <div className="p-4 text-red-600">{error || 'Товар не найден'}</div>;
    }

    // Получаем базовый URL для изображений из переменной окружения или используем значение по умолчанию
    const mediaBase = process.env.REACT_APP_MEDIA_BASE;

    return (
        <div className="p-4 max-w-screen-md mx-auto">
            <h1 className="text-2xl font-bold mb-6">Сделки с покупателями</h1>

            {/* Блок с фотографией и информацией */}
            <div className="flex gap-4 mb-4">
                {/* Фотография товара */}
                <div className="relative w-3/5 aspect-[3/4] bg-gray-100 rounded-md overflow-hidden">
                    {product.image_path ? (
                        <img
                            src={
                                product.image_path.startsWith('http')
                                    ? product.image_path
                                    : `${mediaBase}${product.image_path}`
                            }
                            alt={product.name}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                            Нет фото
                        </div>
                    )}
                </div>

                {/* Дополнительная информация о ценах и выкупах */}
                <div className="bg-white border border-gray-200 rounded-md p-4">
                    <div className="flex flex-col justify-start">
                        <p className="text-lg font-bold">{product.article}</p>
                        <h3 className="text-xl font-semibold">{product.name}</h3>
                    </div>
                    <div className="flex flex-col justify-start">
                        <span className="text-sm text-gray-600">Цена на сайте:</span>
                        <span className="text-sm font-semibold">{product.wb_price} руб</span>
                    </div>
                    <div className="flex flex-col justify-start">
                        <span className="text-sm text-gray-600">Цена для покупателя:</span>
                        <span className="text-sm font-semibold">{product.price} руб</span>
                    </div>
                    <div className="flex flex-col justify-start">
                        <span className="text-sm text-gray-600">Кол-во выкупов:</span>
                        <span className="text-sm font-semibold">{product.general_repurchases} шт</span>
                    </div>
                    <div className="flex flex-col justify-start">
                        <span className="text-sm text-gray-600">Выкупы на сутки:</span>
                        <span className="text-sm font-semibold">{product.daily_repurchases} шт</span>
                    </div>
                </div>
            </div>

            {/* Кнопки действий */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={handleTopUpClick}
                    className="flex-1 bg-purple-600 text-white p-2 rounded"
                >
                    Пополнить кабинет
                </button>
                <button
                    onClick={handleEditClick}
                    className="flex-1 border border-purple-600 text-purple-600 p-2 rounded"
                >
                    Редактировать
                </button>
                <button
                    onClick={handleBackClick}
                    className="flex-1 border border-gray-300 text-gray-600 p-2 rounded"
                >
                    Назад
                </button>
            </div>

        </div>
    );
}

export default CreateProductInfo;

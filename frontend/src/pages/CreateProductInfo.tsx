import React, { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {getProductById, updateProductStatus} from '../services/api';
import { Category, PayoutTime, ProductStatus } from '../enums';
import { on } from "@telegram-apps/sdk";

interface Product {
    id: string;
    name: string;
    article: string;
    status: ProductStatus;
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

interface ProductFormData {
    status: string;
}

function CreateProductInfo() {
    const navigate = useNavigate();
    const { productId } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    const handleMyBalanceClick = () => {
        navigate(`/seller-cabinet/balance`);
    };

    useEffect(() => {
        const removeBackListener = on('back_button_pressed', () => {
            navigate('/my-products');
        });
        return () => {
            removeBackListener();
        };
    }, [navigate]);

    const handleEditClick = () => {
        if (product) {
            navigate(`/create-product/${product.id}`);
        }
    };

    // Функция для приостановки товара (смена статуса на ARCHIVED)
    const handlePublish = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const fd = new FormData();
            fd.append('status', ProductStatus.ACTIVE);
            await updateProductStatus(productId!, fd);
            // Обновляем локальное состояние, чтобы статус стал ACTIVE
            setProduct({ ...product!, status: ProductStatus.ACTIVE });
            alert('Товар опубликован');
        } catch (err) {
            console.error('Ошибка при сохранении товара:', err);
            alert('Не удалось сохранить товар');
        }
    };

    const handleStop = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const fd = new FormData();
            fd.append('status', ProductStatus.ARCHIVED);
            await updateProductStatus(productId!, fd);
            // Обновляем локальное состояние, чтобы статус стал ARCHIVED
            setProduct({ ...product!, status: ProductStatus.ARCHIVED });
            alert('Товар заархивирован');
        } catch (err) {
            console.error('Ошибка при сохранении товара:', err);
            alert('Не удалось сохранить товар');
        }
    };


    if (loading) {
        return <div className="p-4">Загрузка...</div>;
    }

    if (error || !product) {
        return <div className="p-4 text-red-600">{error || 'Товар не найден'}</div>;
    }

    // Получаем базовый URL для изображений из переменной окружения
    const mediaBase = process.env.REACT_APP_MEDIA_BASE;

    return (
        <div className="p-4 min-h-screen bg-gray-200 mx-auto">
            {/* Шапка страницы с заголовком и кнопкой "Редактировать" */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-medium">Карточка товара</h1>
                <button
                    onClick={handleEditClick}
                    className="border border-brand text-brand px-4 py-2 rounded"
                >
                    Редактировать
                </button>
            </div>

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

                {/* Блок с дополнительной информацией о товаре */}
                <div className="bg-white border border-gray-200 rounded-md p-4">
                    <div className="flex flex-col justify-start mb-4">
                        <p className="text-lg font-bold">{product.article}</p>
                        <h3 className="text-xl font-semibold">{product.name}</h3>
                    </div>
                    <div className="flex flex-col justify-start mb-2">
                        <span className="text-sm text-gray-600">Цена на сайте:</span>
                        <span className="text-sm font-semibold">{product.wb_price} руб</span>
                    </div>
                    <div className="flex flex-col justify-start mb-2">
                        <span className="text-sm text-gray-600">Цена для покупателя:</span>
                        <span className="text-sm font-semibold">{product.price} руб</span>
                    </div>
                    <div className="flex flex-col justify-start mb-2">
                        <span className="text-sm text-gray-600">Кол-во выкупов:</span>
                        <span className="text-sm font-semibold">{product.general_repurchases} шт</span>
                    </div>
                    <div className="flex flex-col justify-start">
                        <span className="text-sm text-gray-600">Выкупы на сутки:</span>
                        <span className="text-sm font-semibold">{product.daily_repurchases} шт</span>
                    </div>
                </div>
            </div>

            {/* Кнопки внизу страницы */}
            <div className="flex flex-col gap-2">
                <button
                    onClick={handleMyBalanceClick}
                    className="flex-1 bg-brand text-white p-2 rounded"
                >
                    Пополнить кабинет
                </button>
                {product.status === ProductStatus.ARCHIVED ? (
                    <button
                        onClick={handlePublish}
                        className="flex-1 border border-brand text-brand p-2 rounded"
                    >
                        Опубликовать
                    </button>
                ) : (
                    <button
                        onClick={handleStop}
                        className="flex-1 border border-brand text-brand p-2 rounded"
                    >
                        Приостановить
                    </button>
                )}
            </div>
        </div>
    );
}

export default CreateProductInfo;

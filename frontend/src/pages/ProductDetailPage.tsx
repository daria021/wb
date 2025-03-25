import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../services/api';
import { AxiosResponse } from "axios";
import {on} from "@telegram-apps/sdk";

const MEDIA_BASE = 'http://localhost:8000/storage/';

interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    article: string;
    image_path?: string;
    wb_price: number;
    payment_time: string;
    shortDescription?: string;
}

function ProductDetailPage() {
    const { productId } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const navigate = useNavigate();

    const handleOpenInstructionClick = () => {
        if (product) {
            navigate(`/product/${product.id}/instruction`);
        }
    };

    useEffect(() => {
        const removeBackListener = on('back_button_pressed', () => {
            navigate('/catalog');
        });

        return () => {
            removeBackListener();
        };
    }, [navigate]);

    useEffect(() => {
        if (!productId) return;
        getProductById(productId)
            .then((response: AxiosResponse<Product>) => {
                setProduct(response.data);
            })
            .catch((error: unknown) => {
                console.error('Ошибка загрузки товара:', error);
            });
    }, [productId]);

    if (!product) {
        return <div className="p-4">Загрузка...</div>;
    }

    // Вычисляем скидку как процент разницы между wb_price и price
    const discountPercent = product.wb_price
        ? (((product.wb_price - product.price) / product.wb_price) * 100).toFixed(2)
        : '0';

    return (
        <div className="p-4 max-w-screen-md bg-gray-200 mx-auto">
            <div className="relative w-full h-64 mb-4 mt-12 rounded-lg overflow-hidden">
                {product.image_path ? (
                    <img
                        src={
                            product.image_path.startsWith('http')
                                ? product.image_path
                                : `${MEDIA_BASE}${product.image_path}`
                        }
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                        Нет фото
                    </div>
                )}
            </div>

            {/* Название товара */}
            <h1 className="text-2xl font-bold mb-2 text-left">{product.name}</h1>
            {product.shortDescription && (
                <p className="text-gray-600 mb-4 text-center">{product.shortDescription}</p>
            )}

            {/* Карточка с ценой/описанием */}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
                {/* Цена */}
                <p className="text-xl font-bold mb-1 text-brand">
                    {product.price} ₽
                </p>
                {/* Описание товара */}
                {product.description && (
                    <p className="text-sm text-gray-700 mb-2">{product.description}</p>
                )}
                {/* Артикул */}
                {product.article && (
                    <p className="text-xs text-gray-500">Арт. {product.article}</p>
                )}
            </div>

            {/* Кнопки "Проверить продавца" и "Открыть инструкцию" */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => window.open('https://t.me/bigblacklist_bot', '_blank')}
                    className="flex-1 bg-white text-gray-700 py-2 rounded-lg border border-brand text-center"
                >
                    Проверить продавца
                </button>

                <button
                    onClick={handleOpenInstructionClick}
                    className="flex-1 bg-brand text-white py-2 rounded-lg border  text-center"
                >
                    Открыть инструкцию
                </button>
            </div>

            {/* Блок "Условия сделки" */}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
                <h2 className="font-semibold mb-2">Условия сделки</h2>
                <p className="text-sm text-gray-700 mb-1">
                    Цена на сайте WB: {product.wb_price} руб
                </p>
                <p className="text-sm text-gray-700 mb-1">
                    Цена для вас: {product.price} руб
                </p>
                <p className="text-sm text-gray-700 mb-1">
                    Скидка: {discountPercent}%
                </p>
                <p className="text-sm text-gray-700 mb-1">
                    Условия оплаты: {product.payment_time}
                </p>
            </div>

        </div>
    );
}

export default ProductDetailPage;

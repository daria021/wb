import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../services/api';
import {AxiosResponse} from "axios";

const MEDIA_BASE = 'http://localhost:8000/storage/';

interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    article: string;
    image_path?: string;
}
function ProductDetailPage() {
    const { productId } = useParams();
    const [product, setProduct] = useState<any>(null);
    const navigate = useNavigate();

    const handleOpenInstructionClick = () => {
        if (product) {
            // Переход на /product/:productId/instruction
            navigate(`/product/${product.id}/instruction`);
        }
    };


    useEffect(() => {
        getProductById(productId!)
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

    return (
        <div className="p-4 max-w-screen-md mx-auto">
            {/* Большой блок с фото и названием */}
            <div className="relative w-full h-64 mb-4 rounded-lg overflow-hidden">
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

    {/* Пример стикера/надписи в углу (если нужно) */}
    {/*
        <div className="absolute top-2 left-2 bg-pink-500 text-white px-2 py-1 text-sm rounded">
          Чехол в подарок
        </div>
        */}
    </div>

    {/* Название товара */}
    <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
    {/* Доп. подзаголовок или краткое описание, если есть */}
    {product.shortDescription && (
        <p className="text-gray-600 mb-4">{product.shortDescription}</p>
    )}

    {/* Основная карточка с ценой/описанием */}
    <div className="bg-white rounded-lg shadow p-4 mb-4">
        {/* Цена */}
        <p className="text-xl font-bold text-pink-600 mb-1">
        {product.price} ₽
    </p>
    {/* Описание товара */}
    {product.description && (
        <p className="text-sm text-gray-700 mb-2">{product.description}</p>
    )}
    {/* Артикул, если нужен */}
    {product.article && (
        <p className="text-xs text-gray-500">Арт. {product.article}</p>
    )}
    </div>

    {/* Пример блоков «Проверить продавца», «Открыть инструкцию» */}
    <div className="flex gap-2 mb-4">
    <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded">
        Проверить продавца
    </button>
    <button
        onClick={handleOpenInstructionClick}
        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded">
        Открыть инструкцию
    </button>
    </div>

    {/* Блок «Условия сделки», «Скидка», «Наличие» и т.п. */}
    <div className="bg-white rounded-lg shadow p-4 mb-4">
    <h2 className="font-semibold mb-2">Условия сделки</h2>
    {/* Пример полей. Подставьте ваши реальные данные */}
    <p className="text-sm text-gray-700 mb-1">Доступно в день: 10 шт</p>
    <p className="text-sm text-gray-700 mb-1">Цена на сайте WB: 3000 руб</p>
    <p className="text-sm text-gray-700 mb-1">Цена для вас: 2500 руб</p>
    <p className="text-sm text-gray-700 mb-1">Скидка: 16.67%</p>
    </div>

    </div>
);
}

export default ProductDetailPage;

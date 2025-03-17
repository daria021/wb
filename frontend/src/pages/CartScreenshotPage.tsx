// src/pages/CartScreenshotPage.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../services/api'; // ваш метод для GET /product/:id
import { AxiosResponse } from 'axios';

interface Product {
    id: string;
    article: string;    // для «ID: 65141» или любой другой
    key_word: string;   // «Ключевое слово»
    // ...другие поля, если нужно
}

function CartScreenshotPage() {
    const { productId } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Два файла для скриншотов
    const [file1, setFile1] = useState<File | null>(null);
    const [file2, setFile2] = useState<File | null>(null);

    // «Продолжить» активна, если выбраны оба файла
    const canContinue = file1 && file2;

    useEffect(() => {
        if (!productId) return;
        getProductById(productId)
            .then((response: AxiosResponse<Product>) => {
                setProduct(response.data);
            })
            .catch((err) => {
                console.error('Ошибка при загрузке товара:', err);
                setError('Не удалось загрузить данные о товаре');
            })
            .finally(() => setLoading(false));
    }, [productId]);

    const handleContinue = () => {
        if (!canContinue) return;
        // переходим на следующий шаг, например:
        navigate(`/product/${productId}/step-2`);
    };

    if (loading) {
        return <div className="p-4">Загрузка...</div>;
    }
    if (error || !product) {
        return <div className="p-4 text-red-600">{error || 'Товар не найден'}</div>;
    }

    return (
        <div className="p-4 max-w-screen-md mx-auto space-y-4">

            {/* Подзаголовок */}
            <h2 className="text-md font-semibold">Шаг 1. Загрузите скрин корзины</h2>

            {/* Блок предупреждений и ключевое слово */}
            <div className="bg-white rounded-lg shadow p-4 text-sm text-gray-700 space-y-2">
                <p><strong>ВНИМАНИЕ!</strong> Оформление заказа только на 5-м шаге</p>
                <p>Покупать можно только 1 шт</p>
                <p>Нельзя возвращать товар</p>
                <p>Ключевое слово: <strong>{product.key_word}</strong></p>
                <p>Скрин поискового запроса</p>
            </div>

            {/* Поля для загрузки двух скриншотов */}
            <div>
                <label className="block text-sm font-medium mb-1">Первый скрин корзины</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile1(e.target.files?.[0] || null)}
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Второй скрин корзины</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile2(e.target.files?.[0] || null)}
                />
            </div>

            {/* Кнопка «Продолжить» */}
            <button
                onClick={handleContinue}
                disabled={!canContinue}
                className={`w-full py-2 rounded text-white font-semibold ${
                    canContinue ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-400 cursor-not-allowed'
                }`}
            >
                Продолжить
            </button>

            {/* Видео «Как работает инструкция» (или ссылка на YouTube).
          Можно заменить на <a href="..." target="_blank"> ... </a> */}
            <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm font-medium mb-2">Как работает инструкция</p>
                <div className="aspect-w-16 aspect-h-9 bg-black">
                    <iframe
                        title="Инструкция"
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                        allowFullScreen
                        className="w-full h-full"
                    />
                </div>
            </div>

            {/* Три кнопки снизу (Открыть отчет, Подписаться, Нужна помощь) */}
            <div className="grid grid-cols-3 gap-3">
                <button className="bg-white border border-gray-300 rounded-md p-3 text-sm font-semibold">
                    Открыть отчет
                </button>
                <button className="bg-white border border-gray-300 rounded-md p-3 text-sm font-semibold">
                    Подписаться на канал
                </button>
                <button className="bg-white border border-gray-300 rounded-md p-3 text-sm font-semibold">
                    Нужна помощь
                </button>
            </div>
        </div>
    );
}

export default CartScreenshotPage;

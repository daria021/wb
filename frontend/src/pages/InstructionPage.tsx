// src/pages/ProductInstructionPage.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../services/api'; // Функция, делающая GET /product/:id
import { AxiosResponse } from 'axios';

function translatePaymentTime(value: string): string {
    switch (value) {
        case 'AFTER_REVIEW':
            return 'После отзыва';
        case 'AFTER_DELIVERY':
            return 'После получения товара';
        case 'ON_15TH_DAY':
            return 'На 15-й день';
        default:
            return value; // fallback
    }
}

interface Product {
    id: string;
    name: string;
    brand: string;
    article: string;
    price: number;       // Цена для покупателя
    wb_price: number;    // Цена на сайте WB
    tg: string;          // Контакт продавца в Телеграме
    payment_time: string; // Например "AFTER_REVIEW"
    review_requirements: string;
    // ... любые другие поля
}

function InstructionPage() {
    const { productId } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Состояния для чекбоксов
    const [agreeRules, setAgreeRules] = useState(false);
    const [agreePersonalData, setAgreePersonalData] = useState(false);

    // Загружаем товар по ID
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

    // Можно продолжать, если оба чекбокса отмечены
    const canContinue = agreeRules && agreePersonalData;

    // Обработчик кнопки «Продолжить»
    const handleContinue = () => {
        if (!canContinue) return;
        // Например, переход на следующий шаг:
        navigate(`/product/${productId}/step-1`);
    };

    if (loading) {
        return <div className="p-4">Загрузка...</div>;
    }
    if (error || !product) {
        return <div className="p-4 text-red-600">{error || 'Товар не найден'}</div>;
    }

    return (
        <div className="p-4 max-w-screen-md mx-auto">
            <h1 className="text-xl font-bold mb-4">Правила и условия</h1>

            {/* Блок с правилами (точный текст как на фото, только ник меняем на product.tg) */}
            <div className="mb-4">
                <p className="text-sm text-gray-700">
                    Перед тем как начнем, пожалуйста, внимательно прочитайте все условия:
                </p>

                <h2 className="font-semibold mt-3 mb-1">Правила:</h2>
                <div className="bg-white rounded-lg shadow p-4 text-sm text-gray-700 space-y-2">
                    <p>
                        Вы заключаете сделку с продавцом <strong>{product.tg}</strong>. Бот не несет никакой ответственности за выплату.
                    </p>
                    <p>
                        При задержках оплаты и любые другие вопросы по кэшбэку решайте напрямую с продавцом.
                    </p>
                    <p>
                        Если продавец окажется мошенником, будет создана отдельная группа, куда будут добавлены все обманутые покупатели и продавец.
                    </p>
                    <p>
                        Бот — это пошаговая инструкция. Мы не несем ответственность за выплату.
                    </p>
                    <p>
                        Продолжая, вы заключаете сделку и соглашаетесь с этими условиями.
                    </p>
                </div>
            </div>

            {/* Блок с условиями сделки */}
            <div className="mb-4">
                <h2 className="font-semibold mb-1">Условия сделки:</h2>

                {/* Пункты со 2 по 4 берем из продукта, 5 — текст с фото (с ником) */}
                <div className="bg-white rounded-lg shadow p-4 text-sm text-gray-700 space-y-2">
                    {/* Пункт 2 */}
                    <div className="bg-gray-100 p-2 rounded">
                        <p>1. Цена на сайте: <strong>{product.wb_price} руб.</strong></p>
                    </div>
                    {/* Пункт 3 */}
                    <div className="bg-gray-100 p-2 rounded">
                        <p>2. Цена для вас: <strong>{product.price} руб.</strong></p>
                    </div>
                    {/* Пункт 4 */}
                    <div className="bg-gray-100 p-2 rounded">
                        <p>3. Кэшбэк: <strong>{translatePaymentTime(product.payment_time)}</strong></p>
                    </div>
                    {/* Пункт 5 — текст с фото, заменяем ник */}
                    <div className="bg-gray-100 p-2 rounded">
                        <p>
                            4. Если возникнут вопросы — напишите продавцу в Telegram: <strong>{product.tg}</strong>
                        </p>
                    </div>
                </div>
            </div>

            {/* Чекбоксы */}
            <div className="mb-2 flex items-center">
                <input
                    type="checkbox"
                    id="agreeRules"
                    className="mr-2"
                    checked={agreeRules}
                    onChange={(e) => setAgreeRules(e.target.checked)}
                />
                <label htmlFor="agreeRules" className="text-sm text-gray-700">
                    Я соглашаюсь с условиями сделки
                </label>
            </div>
            <div className="mb-4 flex items-center">
                <input
                    type="checkbox"
                    id="agreeData"
                    className="mr-2"
                    checked={agreePersonalData}
                    onChange={(e) => setAgreePersonalData(e.target.checked)}
                />
                <label htmlFor="agreeData" className="text-sm text-gray-700">
                    Даю согласие на обработку персональных данных
                </label>
            </div>

            {/* Кнопка «Продолжить» */}
            <button
                onClick={handleContinue}
                disabled={!canContinue}
                className={`px-4 py-2 rounded text-white ${
                    canContinue
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'bg-gray-400 cursor-not-allowed'
                }`}
            >
                Продолжить
            </button>
        </div>
    );
}

export default InstructionPage;

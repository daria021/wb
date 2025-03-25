// src/pages/InstructionPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../../services/api';
import { AxiosResponse } from 'axios';
import { on } from "@telegram-apps/sdk";

function translatePaymentTime(value: string): string {
    switch (value) {
        case 'AFTER_REVIEW':
            return 'После отзыва';
        case 'AFTER_DELIVERY':
            return 'После получения товара';
        case 'ON_15TH_DAY':
            return 'На 15-й день';
        default:
            return value;
    }
}

interface Product {
    id: string;
    name: string;
    brand: string;
    article: string;
    price: number;
    wb_price: number;
    tg: string;
    payment_time: string;
    review_requirements: string;
}

function InstructionPage() {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Состояния для чекбоксов согласия
    const [agreeRules, setAgreeRules] = useState(false);
    const [agreePersonalData, setAgreePersonalData] = useState(false);

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

    const canContinue = agreeRules && agreePersonalData;

    const handleContinue = () => {
        if (!canContinue) return;
        // Переход на следующий шаг, используя productId
        navigate(`/product/${productId}/step-1`);
    };

    useEffect(() => {
        const removeBackListener = on('back_button_pressed', () => {
            navigate(`/product/${productId}`);
        });

        return () => {
            removeBackListener();
        };
    }, [navigate]);

    if (loading) {
        return <div className="p-4">Загрузка...</div>;
    }
    if (error || !product) {
        return <div className="p-4 text-red-600">{error || 'Товар не найден'}</div>;
    }

    return (
        <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
            <div className="max-w-screen-md w-full bg-white rounded-lg shadow-lg p-6">

                <h1 className="text-2xl font-bold mb-6 text-center">Правила и условия</h1>
                <p className="text-base text-gray-800 mb-4">
                    Перед тем как начнем, пожалуйста, внимательно прочитайте все условия:
                </p>

                {/* Блок с правилами */}
                <div className="mb-6 mt-6">
                    <div className="bg-brandlight rounded-lg p-4">
                        <h2 className="text-xl font-semibold mb-3">Правила:</h2>
                        <ul className="list-disc list-inside text-lg text-gray-800 space-y-2">
                            <li>
                                Вы заключаете сделку с продавцом <strong>{product.tg}</strong>. Бот не несет ответственности за выплату.
                            </li>
                            <li>
                                При задержках оплаты и любые другие вопросы по кэшбэку решайте напрямую с продавцом.
                            </li>
                            <li>
                                Если продавец окажется мошенником, будет создана отдельная группа для обманутых покупателей и продавца.
                            </li>
                            <li>
                                Бот — это пошаговая инструкция. Мы не несем ответственность за выплату.
                            </li>
                            <li>
                                Продолжая, вы заключаете сделку и соглашаетесь с этими условиями.
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Блок с условиями сделки */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold mb-3">Условия сделки:</h2>
                    <div className="bg-brandlight rounded-lg p-4">
                        <ul className="list-disc list-inside text-base text-gray-800 space-y-2">
                            <li>
                                Цена на сайте: <strong>{product.wb_price} руб.</strong>
                            </li>
                            <li>
                                Цена для вас: <strong>{product.price} руб.</strong>
                            </li>
                            <li>
                                Кэшбэк: <strong>{translatePaymentTime(product.payment_time)}</strong>
                            </li>
                            <li>
                                Если возникнут вопросы — напишите продавцу в Telegram: <strong>{product.tg}</strong>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Чекбоксы согласия */}
                <div className="mb-6">
                    <div className="flex items-center mb-3">
                        <input
                            type="checkbox"
                            id="agreeRules"
                            className="mr-3"
                            checked={agreeRules}
                            onChange={(e) => setAgreeRules(e.target.checked)}
                        />
                        <label htmlFor="agreeRules" className="text-lg text-gray-800">
                            Я соглашаюсь с условиями сделки
                        </label>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="agreeData"
                            className="mr-3"
                            checked={agreePersonalData}
                            onChange={(e) => setAgreePersonalData(e.target.checked)}
                        />
                        <label htmlFor="agreeData" className="text-lg text-gray-800">
                            Даю согласие на обработку персональных данных
                        </label>
                    </div>
                </div>

                {/* Кнопка "Продолжить" */}
                <button
                    onClick={handleContinue}
                    disabled={!canContinue}
                    className={`w-full py-3 rounded-lg text-lg font-semibold ${
                        canContinue
                            ? 'bg-brand text-white'
                            : 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    }`}
                >
                    Продолжить
                </button>
            </div>
        </div>
    );
}

export default InstructionPage;

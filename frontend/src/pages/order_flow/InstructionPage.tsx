import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {getProductById} from '../../services/api';
import {AxiosResponse} from 'axios';
import {on} from "@telegram-apps/sdk";

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
    const {productId} = useParams<{ productId: string }>();
    const navigate = useNavigate();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { search } = useLocation();
    const preview = new URLSearchParams(search).get('preview') === '1';

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

    const getTelegramLink = (tg: string) => {
        const username = tg.startsWith('@') ? tg.slice(1) : tg;
        return `https://t.me/${username}`;
    };

    const handleContinue = () => {
        if (!canContinue) return;
        navigate(`/product/${productId}/step-1`);
    };
    const handleHomeClick = () => {
        navigate(`/`);
    };

    useEffect(() => {
        const removeBackListener = on('back_button_pressed', () => {
            navigate(-1);
        });

        return () => {
            removeBackListener();
        };
    }, [productId, navigate]);

    if (loading) {
        return <div className="p-4">Загрузка...</div>;
    }
    if (error || !product) {
        return <div className="p-4 text-red-600">{error || 'Товар не найден'}</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-t-gray flex items-center justify-center p-4">
            <div className="fixed top-6 left-6 z-50 bg-gradient-r-brandlight rounded-lg p-2 flex items-center justify-center">
                <button onClick={handleHomeClick} aria-label="На главную">
                    <img src="/icons/home.png" alt="Домой" className="w-6 h-6" />
                </button>
            </div>
            <div className="max-w-screen-md w-full bg-gradient-tr-white rounded-lg shadow-lg p-6">
                <h1 className="text-2xl font-bold mb-6 text-center">Правила и условия</h1>
                <p className="text-base text-gray-800 mb-4">
                    Перед тем как начнем, пожалуйста, внимательно прочитайте все условия:
                </p>

                {/* Блок с правилами */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-blue-600 mb-3">Правила:</h2>
                    <div className="bg-gradient-tr-white rounded-lg p-4 border border-gradient-tr-darkGray">
                        <ol className="list-decimal list-inside text-base text-gray-800 space-y-2">
                            <li>
                                Вы заключаете сделку с продавцом{' '}
                                <strong>
                                    <a
                                        href={getTelegramLink(product.tg)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        {product.tg}
                                    </a>
                                </strong>. Бот не несет ответственности за выплату.
                            </li>
                            <li>
                                При задержках оплаты и любые другие вопросы по кэшбэку решайте напрямую с продавцом.
                            </li>
                            <li>
                                Если продавец окажется мошенником, будет создана отдельная группа для обманутых
                                покупателей.
                            </li>
                            <li>
                                Бот — это пошаговая инструкция, и мы не несем ответственность за выплату.
                            </li>
                            <li>
                                Продолжая, вы соглашаетесь с указанными условиями сделки.
                            </li>
                        </ol>
                    </div>
                </div>

                <div className="mb-6">
                    <h2 className="text-xl font-bold mb-3 text-blue-600">Условия сделки:</h2>
                    <div className="bg-gradient-tr-white rounded-lg p-4 border border-gradient-tr-darkGray">
                        <ol className="list-decimal list-inside text-base text-gray-800 space-y-2">
                            <li>
                                Цена на сайте: <strong>{product.wb_price} руб.</strong>
                            </li>
                            <li>
                                <span className="font-semibold text-brand">Цена для вас:</span>
                                <strong> {product.price} руб.</strong>
                            </li>
                            <li>
                                Кэшбэк: <strong>{translatePaymentTime(product.payment_time)}</strong>
                            </li>
                            <li>
                                Если возникнут вопросы — напишите продавцу в Telegram:{' '}
                                <strong>
                                    <a
                                        href={getTelegramLink(product.tg)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        {product.tg}
                                    </a>
                                </strong>
                            </li>
                        </ol>
                    </div>
                </div>
                {!preview && (
                <div className="mb-6">
                    <div className="flex items-center mb-3">
                        <input
                            type="checkbox"
                            id="agreeRules"
                            className="mr-3"
                            checked={agreeRules}
                            onChange={(e) => setAgreeRules(e.target.checked)}
                        />
                        <label htmlFor="agreeRules" className="text-base text-gray-800">
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
                        <label htmlFor="agreeData" className="text-base text-gray-800">
                            Даю согласие на обработку персональных данных
                        </label>
                    </div>

                <button
                    onClick={handleContinue}
                    disabled={!canContinue}
                    className={`w-full py-2 rounded-lg text-base font-semibold mt-2 ${
                        canContinue
                            ? 'bg-gradient-r-brand text-white hover:bg-blue-700'
                            : 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    } mb-2`}
                >
                    Продолжить
                </button>
                </div>
                )}

            </div>
        </div>
    );
}

export default InstructionPage;

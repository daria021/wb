import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {createOrder, getProductById} from '../../services/api';
import {AxiosResponse} from 'axios';
import {on} from "@telegram-apps/sdk";
import {useUser} from "../../contexts/user";

function translatePaymentTime(value: string): string {
    switch (value) {
        case 'AFTER_REVIEW':
            return 'После публикации отзыва на WB';
        case 'AFTER_DELIVERY':
            return 'После получения товара';
        case 'ON_15TH_DAY':
            return 'Через 15 дней получения товара';
        default:
            return value;
    }
}

interface Product {
    id: string;
    name: string;
    seller_id: string;
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
    const {user} = useUser();

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

    const handleContinue = async () => {
        if (!canContinue) return;
            if (!user) return;              // если профиль ещё не загрузился или неавторизован
            const formData = new FormData();
            formData.append('user_id', user.id);
            formData.append('step', '0');
            formData.append('seller_id', product!.seller_id);
            formData.append('product_id', productId || '');
            const orderId = (await createOrder(formData)).data as string;

        navigate(`/product/${orderId}/step-1`);
    };
    const handleHomeClick = () => {
        navigate(`/`);
    };

    if (loading) {
        return <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-gray-600 always-spin"/>
            </div>;
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
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-blue-600 mb-3">Правила:</h2>
                    <div className="bg-white rounded-lg p-4 border border-darkGray">
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
                                При задержках оплаты и любые другие вопросы по кешбэку решайте напрямую с продавцом.
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
                    <div className="bg-white rounded-lg p-4 border border-darkGray">
                        <ol className="list-decimal list-inside text-base text-gray-800 space-y-2">
                            <li>
                                Цена на сайте: <strong>{product.wb_price} руб.</strong>
                            </li>
                            <li>
                                <span className="font-semibold text-brand">Цена для вас:</span>
                                <strong> {product.price} руб.</strong>
                            </li>
                            <li>
                                Кешбэк: <strong>{translatePaymentTime(product.payment_time)}</strong>
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

                                <div className="flex flex-col gap-2">
                    <button
                    onClick={handleContinue}
                    disabled={!canContinue}
                    className={`w-full py-2 rounded-lg text-base font-semibold mt-2 ${
                        canContinue
                            ? 'bg-brand text-white'
                            : 'bg-gray-200-400 border border-brand text-brand cursor-not-allowed'
                    } mb-2`}
                >
                    Продолжить
                             </button>
                    <button onClick={handleHomeClick}
                    className="py-2 rounded-lg text-base font-semibold border border-brand text-brand bg-transparent w-auto"
                    >
                        На главную
                    </button>
                </div>
                </div>
                )}

            </div>
        </div>
    );
}

export default InstructionPage;

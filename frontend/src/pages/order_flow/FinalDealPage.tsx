// src/pages/FinalDealPage.tsx

import React, { useEffect, useState } from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {getOrderById, getOrderReport} from '../../services/api';
import { AxiosResponse } from 'axios';
import {on} from "@telegram-apps/sdk";

interface Product {
    id: string;
    name: string;       // Например, "Вакууматор"
    price?: number;
    wb_price?: number;
    seller_id: string;
    payment_time: string;
    tg: string;
}

interface UserInOrder {
    nickname: string;   // Покупатель
}

interface Order {
    id: string;                 // "65147"
    product: Product;           // Содержит данные о товаре
    user: UserInOrder;          // Содержит данные о покупателе (никнейм)
    sellerNickname?: string;    // Если есть отдельное поле для ника продавца
    card_number?: string;       // "4367 2289 7923 2467"
    phone_number?: string;      // "9891733203"
    bank?: string;              // "Тинькофф"
    name?: string;              // "Сергеева Анастасия"
    status?: string;            // "CREATED", "COMPLETED" и т.д.
}


interface OrderReport {
    step: number;
    search_screenshot_path?: string;
    cart_screenshot_path?: string;
    card_number?: string;
    phone_number?: string;
    name?: string;
    bank?: string;
    final_cart_screenshot_path?: string;
    delivery_screenshot_path?: string;
    barcodes_screenshot_path?: string;
    review_screenshot_path?: string;
    receipt_screenshot_path?: string;
    receipt_number?: string;
    article?: string;
}

// Вычисляем «сегодня + 2 недели»
function getDeadline(): string {
    const now = new Date();
    const plusTwoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const day = String(plusTwoWeeks.getDate()).padStart(2, '0');
    const month = String(plusTwoWeeks.getMonth() + 1).padStart(2, '0');
    const year = plusTwoWeeks.getFullYear();
    return `${day}.${month}.${year}`;
}

function FinalDealPage() {
    const { orderId } = useParams<{ orderId: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [reportData, setReportData] = useState<OrderReport | null>(null);
    // Флаг для отображения отчёта
    const [showReport, setShowReport] = useState(false);

    useEffect(() => {
        const removeBackListener = on('back_button_pressed', () => {
            navigate('/order/:orderId/step-7');
        });

        return () => {
            removeBackListener();
        };
    }, [navigate]);

    useEffect(() => {
        if (!orderId) return;
        getOrderReport(orderId)
            .then((response: AxiosResponse<OrderReport>) => {
                setReportData(response.data);
            })
            .catch((err) => {
                console.error('Ошибка при загрузке отчета:', err);
            });
    }, [orderId]);

    // Загружаем заказ
    useEffect(() => {
        if (!orderId) return;
        getOrderById(orderId)
            .then((response: AxiosResponse<Order>) => {
                setOrder(response.data);
            })
            .catch((err) => {
                console.error('Ошибка при загрузке заказа:', err);
                setError('Не удалось загрузить заказ');
            })
            .finally(() => setLoading(false));
    }, [orderId]);

    if (loading) {
        return <div className="p-4">Загрузка...</div>;
    }
    if (error || !order) {
        return <div className="p-4 text-red-600">{error || 'Заказ не найден'}</div>;
    }


    // Извлекаем нужные поля
    const { product, user, status } = order;
    const productName = product.name || 'Без названия';
    const productPrice = product.price ?? 0;
    const productWbPrice = product.wb_price ?? 0;
    const cashback = productWbPrice - productPrice;
    const deadline = getDeadline();


    return (
        <div className="p-4 max-w-screen-md bg-gray-200 mx-auto space-y-4">
            <button
                className="bg-white border border-brand rounded-md py-2 text-sm font-semibold"
                onClick={() => navigate('/catalog')}
            >
                Назад в каталог товаров
            </button>
            {/* 1) Блок с круглой фотографией товара, названием и ценой */}
            <div className="flex items-center space-x-3">
                {/* Можно заменить на реальное фото, если есть product.image_path */}
                <img
                    src="https://via.placeholder.com/50"
                    alt="Фото товара"
                    className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                    <div className="font-semibold text-sm">{productName}</div>
                    <div className="text-xs text-gray-600">
                        {productPrice ? `${productPrice} руб.` : 'NaN руб'}
                    </div>
                </div>
            </div>

            {/* 2) Блок «Ваш отчет передан продавцу...» */}
            <div className="bg-brandlight p-3 rounded-md text-sm text-gray-700 space-y-2">
                <p>Ваш отчет передан продавцу.</p>
                <p>
                    В случае задержек оплаты и любые другие вопросы по кэшбэку решайте напрямую
                    с продавцом.
                </p>
                <p>
                    Если продавец окажется мошенником, будет создана отдельная группа, куда будут
                    добавлены все обманутые покупатели и продавец.
                </p>
                <p>
                    Ваш кэшбэк: <strong>{cashback} руб.</strong>
                </p>
                <p>
                    Крайний срок: <strong>{deadline}</strong>
                </p>
                <p>
                    Статус: <strong>{status || 'Неизвестен'}</strong>
                </p>
            </div>

            {/* 3) Блок с покупателем и продавцом */}
            <div className="flex justify-between items-center text-sm">
                <div>Покупатель: {order.user.nickname}</div>
                {/* Если у вас sellerNickname есть в order, используйте её.
            Иначе, как в предыдущих примерах, product.seller_id или 'fws_inc'. */}
                <div>Продавец: {order.product.tg}</div>
            </div>

            {/* 4) Блок "Сделка" */}
            <div className="bg-brandlight p-3 rounded-md space-y-1 text-sm">
                <div className="font-semibold">Сделка</div>
                <div>Условия оплаты: {product.payment_time}</div>
                <div>Сумма покупки: {productWbPrice} руб.</div>
                <div>Цена для вас: {productPrice} руб.</div>
                <div>Кэшбэк: {cashback} руб.</div>
                <div>Крайний срок: {deadline}</div>
                <div>Статус оплаты: {status || 'Неизвестен'}</div>
            </div>

            {/* 5) Блок "Реквизиты" */}
            <div className="bg-brandlight p-3 rounded-md space-y-1 text-sm">
                <div>Номер карты: {order.card_number || '—'}</div>
                <div>Номер телефона: {order.phone_number || '—'}</div>
                <div>Банк: {order.bank || '—'}</div>
                <div>Получатель: {order.name || '—'}</div>
            </div>

            {/* 6) Четыре кнопки внизу */}
            <div className="flex flex-col space-y-2">
                <button
                    onClick={() => setShowReport(prev => !prev)}
                    className="w-full py-2 mb-4 bg-white rounded-lg border border-brand text-gray-600 font-semibold text-center"
                >
                    {showReport ? 'Скрыть отчет' : 'Открыть отчет'}
                </button>


                {/* Блок с отчетом */}
                {showReport && (
                    <div className="bg-white rounded-lg shadow p-4 mb-4">
                        <h3 className="text-lg font-bold mb-2">Отчет</h3>
                        {reportData ? (
                            <div>
                                {/* Шаг 1: Скрин поискового запроса */}
                                {reportData.search_screenshot_path && (
                                    <div className="mb-3">
                                        <p className="text-sm font-semibold">Шаг 1. Скрин поискового запроса</p>
                                        <img
                                            src={reportData.search_screenshot_path}
                                            alt="Скрин поискового запроса"
                                            className="mt-1 w-full rounded"
                                        />
                                    </div>
                                )}
                                {/* Шаг 1: Скрин корзины */}
                                {reportData.cart_screenshot_path && (
                                    <div className="mb-3">
                                        <p className="text-sm font-semibold">Скрин корзины</p>
                                        <img
                                            src={reportData.cart_screenshot_path}
                                            alt="Скрин корзины"
                                            className="mt-1 w-full rounded"
                                        />
                                    </div>
                                )}
                                {/* Шаг 2: Артикул товара */}
                                {reportData.article && (
                                    <div className="mb-3">
                                        <p className="text-sm font-semibold">Шаг 2. Артикул товара</p>
                                        <p className="text-sm">{reportData.article}</p>
                                    </div>
                                )}
                                {/* Шаг 3: Статичный текст */}
                                <div className="mb-3">
                                    <p className="text-sm font-semibold">Шаг 3. Товар и бренд добавлены в избранное</p>
                                    <p className="text-sm">Ваш товар и бренд успешно добавлены в избранное.</p>
                                </div>
                                {/* Шаг 4: Реквизиты */}
                                {(reportData.card_number || reportData.phone_number || reportData.name || reportData.bank) && (
                                    <div className="mb-3">
                                        <p className="text-sm font-semibold">Шаг 4. Реквизиты</p>
                                        <p className="text-sm">Номер карты: {reportData.card_number}</p>
                                        <p className="text-sm">Телефон: {reportData.phone_number}</p>
                                        <p className="text-sm">Имя: {reportData.name}</p>
                                        <p className="text-sm">Банк: {reportData.bank}</p>
                                    </div>
                                )}

                                {/* Шаг 5: Финальный скрин корзины */}
                                {reportData.final_cart_screenshot_path && (
                                    <div className="mb-3">
                                        <p className="text-sm font-semibold">Шаг 5. Финальный скрин корзины</p>
                                        <img
                                            src={reportData.final_cart_screenshot_path}
                                            alt="Финальный скрин корзины"
                                            className="mt-1 w-full rounded"
                                        />
                                    </div>
                                )}
                                {/* Шаг 6: Скрин доставки */}
                                {reportData.delivery_screenshot_path && (
                                    <div className="mb-3">
                                        <p className="text-sm font-semibold">Шаг 6. Скрин доставки</p>
                                        <img
                                            src={reportData.delivery_screenshot_path}
                                            alt="Скрин доставки"
                                            className="mt-1 w-full rounded"
                                        />
                                    </div>
                                )}
                                {/* Шаг 6: Скрин штрихкодов */}
                                {reportData.barcodes_screenshot_path && (
                                    <div className="mb-3">
                                        <p className="text-sm font-semibold">Скрин штрихкодов</p>
                                        <img
                                            src={reportData.barcodes_screenshot_path}
                                            alt="Скрин штрихкодов"
                                            className="mt-1 w-full rounded"
                                        />
                                    </div>
                                )}
                                {/* Шаг 7: Скрин отзыва */}
                                {reportData.review_screenshot_path && (
                                    <div className="mb-3">
                                        <p className="text-sm font-semibold">Шаг 7. Скрин отзыва</p>
                                        <img
                                            src={reportData.review_screenshot_path}
                                            alt="Скрин отзыва"
                                            className="mt-1 w-full rounded"
                                        />
                                    </div>
                                )}
                                {/* Шаг 7: Скрин электронного чека */}
                                {reportData.receipt_screenshot_path && (
                                    <div className="mb-3">
                                        <p className="text-sm font-semibold">Скрин электронного чека</p>
                                        <img
                                            src={reportData.receipt_screenshot_path}
                                            alt="Скрин электронного чека"
                                            className="mt-1 w-full rounded"
                                        />
                                    </div>
                                )}
                                {/* Шаг 7: Номер чека */}
                                {reportData.receipt_number && (
                                    <div className="mb-3">
                                        <p className="text-sm font-semibold">Номер чека</p>
                                        <p className="text-sm">{reportData.receipt_number}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">Отчет пока пуст.</p>
                        )}
                    </div>
                )}
                <button className="bg-white border border-gray-300 rounded-md py-2 text-sm font-semibold">
                    Оформить возврат товара
                </button>
                <button className="bg-white border border-gray-300 rounded-md py-2 text-sm font-semibold">
                    Подписаться на канал
                </button>
                <button className="bg-white border border-gray-300 rounded-md py-2 text-sm font-semibold">
                    Нужна помощь
                </button>
            </div>
        </div>
    );
}

export default FinalDealPage;

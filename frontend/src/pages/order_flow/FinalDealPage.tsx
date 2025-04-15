import React, { useEffect, useState } from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {getOrderById, getOrderReport} from '../../services/api';
import { AxiosResponse } from 'axios';
import {on} from "@telegram-apps/sdk";
import GetUploadLink from "../../components/GetUploadLink";

interface Product {
    id: string;
    name: string;
    price?: number;
    wb_price?: number;
    seller_id: string;
    payment_time: string;
    tg: string;
    image_path: string;
}

interface UserInOrder {
    nickname: string;
}

interface Order {
    id: string;
    product: Product;
    user: UserInOrder;
    sellerNickname?: string;
    card_number?: string;
    phone_number?: string;
    bank?: string;
    name?: string;
    status?: string;
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
    const [showReport, setShowReport] = useState(false);

    useEffect(() => {
        const removeBackListener = on('back_button_pressed', () => {
            navigate('/catalog');
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

    const { product, status } = order;
    const productName = product.name || 'Без названия';
    const productPrice = product.price ?? 0;
    const productWbPrice = product.wb_price ?? 0;
    const cashback = productWbPrice - productPrice;
    const deadline = getDeadline();


    return (
        <div className="p-4 max-w-screen-md bg-gray-200 mx-auto space-y-4">

            <div className="flex items-center space-x-3">
                <img
                    src={GetUploadLink(product.image_path)}
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

            <div className="flex justify-between items-center text-sm">
                <div>Покупатель: {order.user.nickname}</div>

                <div>Продавец: {order.product.tg}</div>
            </div>

            <div className="bg-brandlight p-3 rounded-md space-y-1 text-sm">
                <div className="font-semibold">Сделка</div>
                <div>Условия оплаты: {product.payment_time}</div>
                <div>Сумма покупки: {productWbPrice} руб.</div>
                <div>Цена для вас: {productPrice} руб.</div>
                <div>Кэшбэк: {cashback} руб.</div>
                <div>Крайний срок: {deadline}</div>
                <div>Статус оплаты: {status || 'Неизвестен'}</div>
            </div>

            <div className="bg-brandlight p-3 rounded-md space-y-1 text-sm">
                <div className="font-semibold">Реквизиты</div>
                <div>Номер карты: {order.card_number || '—'}</div>
                <div>Номер телефона: {order.phone_number || '—'}</div>
                <div>Банк: {order.bank || '—'}</div>
                <div>Получатель: {order.name || '—'}</div>
            </div>

            <div className="flex flex-col space-y-2">
                <button
                    onClick={() => setShowReport(prev => !prev)}
                    className="w-full py-2 mb-4 bg-white rounded-lg border border-brand text-gray-600 font-semibold text-center"
                >
                    {showReport ? 'Скрыть отчет' : 'Открыть отчет'}
                </button>


                {showReport && (
                    <div className="bg-white rounded-lg shadow p-4 mb-4">
                        <h3 className="text-lg font-bold mb-2">Отчет</h3>
                        {reportData ? (
                            <div>
                                {reportData.search_screenshot_path && (
                                    <div className="mb-3">
                                        <p className="text-sm font-semibold">Шаг 1. Скрин поискового запроса</p>
                                        <img
                                            src={GetUploadLink(reportData.search_screenshot_path)}
                                            alt="Скрин поискового запроса"
                                            className="mt-1 w-full rounded"
                                        />
                                    </div>
                                )}
                                {reportData.cart_screenshot_path && (
                                    <div className="mb-3">
                                        <p className="text-sm font-semibold">Скрин корзины</p>
                                        <img
                                            src={GetUploadLink(reportData.cart_screenshot_path)}
                                            alt="Скрин корзины"
                                            className="mt-1 w-full rounded"
                                        />
                                    </div>
                                )}
                                {reportData.article && (
                                    <div className="mb-3">
                                        <p className="text-sm font-semibold">Шаг 2. Артикул товара</p>
                                        <p className="text-sm">{reportData.article}</p>
                                    </div>
                                )}
                                <div className="mb-3">
                                    <p className="text-sm font-semibold">Шаг 3. Товар и бренд добавлены в избранное</p>
                                    <p className="text-sm">Ваш товар и бренд успешно добавлены в избранное.</p>
                                </div>
                                {(reportData.card_number || reportData.phone_number || reportData.name || reportData.bank) && (
                                    <div className="mb-3">
                                        <p className="text-sm font-semibold">Шаг 4. Реквизиты</p>
                                        <p className="text-sm">Номер карты: {reportData.card_number}</p>
                                        <p className="text-sm">Телефон: {reportData.phone_number}</p>
                                        <p className="text-sm">Имя: {reportData.name}</p>
                                        <p className="text-sm">Банк: {reportData.bank}</p>
                                    </div>
                                )}

                                {reportData.final_cart_screenshot_path && (
                                    <div className="mb-3">
                                        <p className="text-sm font-semibold">Шаг 5. Финальный скрин корзины</p>
                                        <img
                                            src={GetUploadLink(reportData.final_cart_screenshot_path)}
                                            alt="Финальный скрин корзины"
                                            className="mt-1 w-full rounded"
                                        />
                                    </div>
                                )}
                                {reportData.delivery_screenshot_path && (
                                    <div className="mb-3">
                                        <p className="text-sm font-semibold">Шаг 6. Скрин доставки</p>
                                        <img
                                            src={GetUploadLink(reportData.delivery_screenshot_path)}
                                            alt="Скрин доставки"
                                            className="mt-1 w-full rounded"
                                        />
                                    </div>
                                )}
                                {reportData.barcodes_screenshot_path && (
                                    <div className="mb-3">
                                        <p className="text-sm font-semibold">Скрин штрихкодов</p>
                                        <img
                                            src={GetUploadLink(reportData.barcodes_screenshot_path)}
                                            alt="Скрин штрихкодов"
                                            className="mt-1 w-full rounded"
                                        />
                                    </div>
                                )}
                                {reportData.review_screenshot_path && (
                                    <div className="mb-3">
                                        <p className="text-sm font-semibold">Шаг 7. Скрин отзыва</p>
                                        <img
                                            src={GetUploadLink(reportData.review_screenshot_path)}
                                            alt="Скрин отзыва"
                                            className="mt-1 w-full rounded"
                                        />
                                    </div>
                                )}
                                {reportData.receipt_screenshot_path && (
                                    <div className="mb-3">
                                        <p className="text-sm font-semibold">Скрин электронного чека</p>
                                        <img
                                            src={GetUploadLink(reportData.receipt_screenshot_path)}
                                            alt="Скрин электронного чека"
                                            className="mt-1 w-full rounded"
                                        />
                                    </div>
                                )}
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

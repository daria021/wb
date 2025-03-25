import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AxiosResponse } from 'axios';
import {getOrderReport} from "../services/api";

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

function OrderReportPage() {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [report, setReport] = useState<OrderReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!orderId) return;
        getOrderReport(orderId)
            .then((response: AxiosResponse<OrderReport>) => {
                setReport(response.data);
            })
            .catch((err: any) => {
                console.error('Ошибка при загрузке отчета:', err);
                setError('Не удалось загрузить отчет');
            })
            .finally(() => setLoading(false));
    }, [orderId]);

    if (loading) {
        return <div className="p-4">Загрузка отчета...</div>;
    }
    if (error || !report) {
        return <div className="p-4 text-red-600">{error || 'Отчет не найден'}</div>;
    }

    return (
        <div className="p-4 max-w-screen-md bg-gray-200 mx-auto">
            <h1 className="text-2xl font-bold mb-4">Отчет по заказу</h1>

            {/* Шаг 1: Скрины корзины */}
            {(report.search_screenshot_path || report.cart_screenshot_path) && (
                <div className="mb-4">
                    <p className="text-sm font-semibold">Шаг 1. Скрины корзины</p>
                    {report.search_screenshot_path && (
                        <img
                            src={report.search_screenshot_path}
                            alt="Скрин поискового запроса"
                            className="mt-1 w-full rounded"
                        />
                    )}
                    {report.cart_screenshot_path && (
                        <img
                            src={report.cart_screenshot_path}
                            alt="Скрин корзины"
                            className="mt-1 w-full rounded"
                        />
                    )}
                </div>
            )}

            {/* Шаг 2: Артикул товара */}
            {report.article && (
                <div className="mb-4">
                    <p className="text-sm font-semibold">Шаг 2. Артикул товара</p>
                    <p className="text-sm">{report.article}</p>
                </div>
            )}

            {/* Шаг 3: Товар и бренд добавлены в избранное */}
            <div className="mb-4">
                <p className="text-sm font-semibold">Шаг 3. Товар и бренд добавлены в избранное</p>
                <p className="text-sm">Ваш товар и бренд успешно добавлены в избранное.</p>
            </div>

            {/* Шаг 4: Реквизиты */}
            {(report.card_number || report.phone_number || report.name || report.bank) && (
                <div className="mb-4">
                    <p className="text-sm font-semibold">Шаг 4. Реквизиты</p>
                    {report.card_number && <p className="text-sm">Номер карты: {report.card_number}</p>}
                    {report.phone_number && <p className="text-sm">Телефон: {report.phone_number}</p>}
                    {report.name && <p className="text-sm">Имя: {report.name}</p>}
                    {report.bank && <p className="text-sm">Банк: {report.bank}</p>}
                </div>
            )}

            {/* Шаг 5: Финальный скрин корзины */}
            {report.final_cart_screenshot_path && (
                <div className="mb-4">
                    <p className="text-sm font-semibold">Шаг 5. Финальный скрин корзины</p>
                    <img
                        src={report.final_cart_screenshot_path}
                        alt="Финальный скрин корзины"
                        className="mt-1 w-full rounded"
                    />
                </div>
            )}

            {/* Шаг 6: Скрины доставки и штрихкодов */}
            {(report.delivery_screenshot_path || report.barcodes_screenshot_path) && (
                <div className="mb-4">
                    <p className="text-sm font-semibold">Шаг 6. Скрины доставки и штрихкодов</p>
                    {report.delivery_screenshot_path && (
                        <img
                            src={report.delivery_screenshot_path}
                            alt="Скрин доставки"
                            className="mt-1 w-full rounded"
                        />
                    )}
                    {report.barcodes_screenshot_path && (
                        <img
                            src={report.barcodes_screenshot_path}
                            alt="Скрин штрихкодов"
                            className="mt-1 w-full rounded"
                        />
                    )}
                </div>
            )}

            {/* Шаг 7: Скрины отзыва и электронного чека, номер чека */}
            {(report.review_screenshot_path || report.receipt_screenshot_path || report.receipt_number) && (
                <div className="mb-4">
                    <p className="text-sm font-semibold">Шаг 7. Скрины отзыва и чека</p>
                    {report.review_screenshot_path && (
                        <img
                            src={report.review_screenshot_path}
                            alt="Скрин отзыва"
                            className="mt-1 w-full rounded"
                        />
                    )}
                    {report.receipt_screenshot_path && (
                        <img
                            src={report.receipt_screenshot_path}
                            alt="Скрин электронного чека"
                            className="mt-1 w-full rounded"
                        />
                    )}
                    {report.receipt_number && (
                        <p className="text-sm">Номер чека: {report.receipt_number}</p>
                    )}
                </div>
            )}

            {/* Кнопка "Назад" */}
            <button
                onClick={() => navigate(-1)}
                className="w-full py-2 rounded bg-gray-300 text-gray-700 font-semibold"
            >
                Назад
            </button>
        </div>
    );
}

export default OrderReportPage;

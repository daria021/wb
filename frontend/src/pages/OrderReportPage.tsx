import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {AxiosResponse} from 'axios';
import {getOrderReport, updateOrderStatus} from "../services/api";
import {on} from "@telegram-apps/sdk";
import {OrderStatus} from "../enums";
import GetUploadLink from "../components/GetUploadLink";

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
    status?: OrderStatus;
    cashback: number;
}

function OrderReportPage() {
    const {orderId} = useParams<{ orderId: string }>();
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

    useEffect(() => {
        const removeBackListener = on('back_button_pressed', () => {
            navigate('/seller-cabinet/reports');
        });

        return () => {
            removeBackListener();
        };
    }, [navigate]);

    const handleCashbackPaid = async (orderId: string) => {
        try {
            const formData = new FormData();
            formData.append("status", OrderStatus.CASHBACK_PAID);
            await updateOrderStatus(orderId, formData);
            alert("Статус обновлен!");
            navigate('/seller-cabinet/reports');
        } catch (err) {
            console.error("Ошибка обновления статуса:", err);
            alert("Ошибка обновления статуса");
        }
    };

    if (loading) {
        return <div className="p-6 text-center text-xl">Загрузка отчета...</div>;
    }
    if (error || !report) {
        return <div className="p-6 text-center text-red-600 text-xl">{error || 'Отчет не найден'}</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-t-gray py-6">
            <div className="max-w-screen-md mx-auto bg-gradient-tr-white shadow-lg rounded-lg p-6">
                <h1 className="text-2xl font-bold mb-6 text-center">Отчет по заказу</h1>

                {(report.search_screenshot_path || report.cart_screenshot_path) && (
                    <section className="mb-6 p-4 bg-gradient-t-gray rounded-md">
                        <h2 className="text-xl font-semibold mb-2">Шаг 1. Скрины корзины</h2>
                        {report.search_screenshot_path && (
                            <img
                                src={GetUploadLink(report.search_screenshot_path)}
                                alt="Скрин поискового запроса"
                                className="mt-2 w-full rounded-md"
                            />
                        )}
                        {report.cart_screenshot_path && (
                            <img
                                src={GetUploadLink(report.cart_screenshot_path)}
                                alt="Скрин корзины"
                                className="mt-2 w-full rounded-md"
                            />
                        )}
                    </section>
                )}

                {report.article && (
                    <section className="mb-6 p-4 bg-gradient-t-gray rounded-md">
                        <h2 className="text-xl font-semibold mb-2">Шаг 2. Артикул товара</h2>
                        <p className="text-base">{report.article}</p>
                    </section>
                )}

                <section className="mb-6 p-4 bg-gradient-t-gray rounded-md">
                    <h2 className="text-xl font-semibold mb-2">Шаг 3. Товар и бренд добавлены в избранное</h2>
                    <p className="text-base">Ваш товар и бренд успешно добавлены в избранное.</p>
                </section>

                {(report.card_number || report.phone_number || report.name || report.bank) && (
                    <section className="mb-6 p-4 bg-gradient-t-gray rounded-md">
                        <h2 className="text-xl font-semibold mb-2">Шаг 4. Реквизиты</h2>
                        {report.card_number && <p className="text-base">Номер карты: {report.card_number}</p>}
                        {report.phone_number && <p className="text-base">Телефон: {report.phone_number}</p>}
                        {report.name && <p className="text-base">Имя: {report.name}</p>}
                        {report.bank && <p className="text-base">Банк: {report.bank}</p>}
                        {report.cashback && <p className="text-base">Кешбек: {report.cashback}</p>}
                    </section>
                )}

                {report.final_cart_screenshot_path && (
                    <section className="mb-6 p-4 bg-gradient-t-gray rounded-md">
                        <h2 className="text-xl font-semibold mb-2">Шаг 5. Финальный скрин корзины</h2>
                        <img
                            src={GetUploadLink(report.final_cart_screenshot_path)}
                            alt="Финальный скрин корзины"
                            className="mt-2 w-full rounded-md"
                        />
                    </section>
                )}

                {(report.delivery_screenshot_path || report.barcodes_screenshot_path) && (
                    <section className="mb-6 p-4 bg-gradient-t-gray rounded-md">
                        <h2 className="text-xl font-semibold mb-2">Шаг 6. Скрины доставки и штрихкодов</h2>
                        {report.delivery_screenshot_path && (
                            <img
                                src={GetUploadLink(report.delivery_screenshot_path)}
                                alt="Скрин доставки"
                                className="mt-2 w-full rounded-md"
                            />
                        )}
                        {report.barcodes_screenshot_path && (
                            <img
                                src={GetUploadLink(report.barcodes_screenshot_path)}
                                alt="Скрин штрихкодов"
                                className="mt-2 w-full rounded-md"
                            />
                        )}
                    </section>
                )}

                {(report.review_screenshot_path || report.receipt_screenshot_path || report.receipt_number) && (
                    <section className="mb-6 p-4 bg-gradient-t-gray rounded-md">
                        <h2 className="text-xl font-semibold mb-2">Шаг 7. Скрины отзыва и чека</h2>
                        {report.review_screenshot_path && (
                            <img
                                src={GetUploadLink(report.review_screenshot_path)}
                                alt="Скрин отзыва"
                                className="mt-2 w-full rounded-md"
                            />
                        )}
                        {report.receipt_screenshot_path && (
                            <img
                                src={GetUploadLink(report.receipt_screenshot_path)}
                                alt="Скрин электронного чека"
                                className="mt-2 w-full rounded-md"
                            />
                        )}
                        {report.receipt_number && (
                            <p className="text-base mt-2">Номер чека: {report.receipt_number}</p>
                        )}
                    </section>
                )}
                {report.status === OrderStatus.CASHBACK_NOT_PAID &&
                    <button
                        onClick={() => handleCashbackPaid(orderId!)}
                        className=" w-full py-2 mt-3 rounded bg-green-500 text-white font-semibold text-lg"
                    >
                        Отметить как выплаченный
                    </button>
                }
            </div>
        </div>
    );
}

export default OrderReportPage;

import React, {useCallback, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {AxiosResponse} from 'axios';
import {getOrderById, getOrderReport, updateOrderStatus} from "../services/api";
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

interface UserInOrder {
    nickname: string;
}

interface Order {
    id: string;
    user: UserInOrder;
}


function OrderReportPage() {
    const {orderId} = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [report, setReport] = useState<OrderReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [order, setOrder] = useState<Order | null>(null);


    const copyToClipboard = useCallback((text: string) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                // Здесь можно заменить alert на Toast или иной UI-фидбэк
                alert(`Скопировано: ${text}`);
            })
            .catch(() => alert('Не удалось скопировать'));
    }, []);


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

    // useEffect(() => {
    //   const unsub = on('back_button_pressed', () => {
    //     navigate('/seller-cabinet/reports', { replace: true });
    //   });
    //   return unsub;
    // }, [navigate]);

    const handleCashbackPaid = async (orderId: string) => {
        try {
            const formData = new FormData();
            formData.append('status', OrderStatus.CASHBACK_PAID);
            await updateOrderStatus(orderId, formData);
            alert('Статус обновлен!');
            // При возврате на список, сразу на вкладке "выплаченные"
            navigate(
                {pathname: '/seller-cabinet/reports', search: '?tab=paid'},
                {replace: true}
            );

        } catch {
            alert('Ошибка обновления статуса');
        }
    };

    if (loading) {
        return <div className="p-6 text-center text-xl">Загрузка отчета...</div>;
    }
    if (error || !report) {
        return <div className="p-6 text-center text-red-600 text-xl">{error || 'Отчет не найден'}</div>;
    }

    return (
        <div className="min-h-screen bg-gray-200 py-6">
            <div className="max-w-screen-md mx-auto bg-white shadow-lg rounded-lg p-6">
                <h1 className="text-2xl font-bold mb-6 text-center">Отчет по заказу</h1>

                {(report.search_screenshot_path || report.cart_screenshot_path) && (
                    <section className="mb-6 p-4 bg-gray-200 rounded-md">
                        <h2 className="text-xl font-semibold mb-2">Шаг 1. Скриншоты поиска и корзины</h2>
                        {report.search_screenshot_path && (
                            <img
                                src={GetUploadLink(report.search_screenshot_path)}
                                alt="Скриншот поискового запроса в WB"
                                className="mt-2 w-full rounded-md"
                            />
                        )}
                        {report.cart_screenshot_path && (
                            <img
                                src={GetUploadLink(report.cart_screenshot_path)}
                                alt="Скриншот корзины в WB"
                                className="mt-2 w-full rounded-md"
                            />
                        )}
                    </section>
                )}

                {report.article && (
                    <section className="mb-6 p-4 bg-gray-200 rounded-md">
                        <h2 className="text-xl font-semibold mb-2"> Шаг 2. Артикул товара продавца</h2>
                        <p className="text-base">{report.article}</p>
                    </section>
                )}

                <section className="mb-6 p-4 bg-gray-200 rounded-md">
                    <h2 className="text-xl font-semibold mb-2">Шаг 3. Товар и бренд добавлены в избранное</h2>
                    <p className="text-base">Ваш товар и бренд успешно добавлены в избранное.</p>
                </section>
                ё

                {report.final_cart_screenshot_path && (
                    <section className="mb-6 p-4 bg-gray-200 rounded-md">
                        <h2 className="text-xl font-semibold mb-2">Шаг 4. Финальный Скриншот корзины в WB</h2>
                        <img
                            src={GetUploadLink(report.final_cart_screenshot_path)}
                            alt="Финальный Скриншот корзины в WB"
                            className="mt-2 w-full rounded-md"
                        />
                    </section>
                )}

                {(report.delivery_screenshot_path || report.barcodes_screenshot_path) && (
                    <section className="mb-6 p-4 bg-gray-200 rounded-md">
                        <h2 className="text-xl font-semibold mb-2">Шаг 5. Скрины доставки и штрихкодов</h2>
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
                    <section className="mb-6 p-4 bg-gray-200 rounded-md">
                        <h2 className="text-xl font-semibold mb-2">Шаг 6. Скрины отзыва и чека</h2>
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

                <section className="mb-6 p-4 bg-gray-200 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-base font-semibold">
                            Покупатель:{' '}
                            <a
                                href={`https://t.me/${order!.user.nickname}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                            >
                                @{order!.user.nickname}
                            </a>
                        </h2>
                    </div>
                </section>


                {(report.card_number || report.phone_number || report.name || report.bank) && (
                    <section className="mb-6 p-4 bg-gray-200 rounded-md">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-xl font-semibold">Реквизиты</h2>
                        </div>
                        {report.card_number && (
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-base">Номер карты: {report.card_number}</span>
                                <button
                                    onClick={() => copyToClipboard(report.card_number!)}
                                    className="ml-2"
                                >
                                    <img
                                        src="/icons/copy.png"
                                        alt="Скопировать"
                                        className="w-5 h-5"
                                    />
                                </button>
                            </div>
                        )}
                        {report.phone_number && (
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-base">Номер телефона: {report.phone_number}</span>
                                <button
                                    onClick={() => copyToClipboard(report.phone_number!)}
                                    className="ml-2"
                                >
                                    <img
                                        src="/icons/copy.png"
                                        alt="Скопировать"
                                        className="w-5 h-5"
                                    />
                                </button>
                            </div>
                        )}
                        {report.name && (
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-base">Получатель: {report.name}</span>
                                <button
                                    onClick={() => copyToClipboard(report.name!)}
                                    className="ml-2"
                                >
                                    <img
                                        src="/icons/copy.png"
                                        alt="Скопировать"
                                        className="w-5 h-5"
                                    />
                                </button>
                            </div>
                        )}
                        {report.bank && (
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-base">Банк: {report.bank}</span>
                                <button
                                    onClick={() => copyToClipboard(report.bank!)}
                                    className="ml-2"
                                >
                                    <img
                                        src="/icons/copy.png"
                                        alt="Скопировать"
                                        className="w-5 h-5"
                                    />
                                </button>
                            </div>
                        )}
                        {report.cashback && (
                            <div className="flex items-center justify-between">
                                <span className="text-base">Кешбэк: {report.cashback}</span>
                                <button
                                    onClick={() => copyToClipboard(report.cashback.toString()!)}
                                    className="ml-2"
                                >
                                    <img
                                        src="/icons/copy.png"
                                        alt="Скопировать"
                                        className="w-5 h-5"
                                    />
                                </button>
                            </div>
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

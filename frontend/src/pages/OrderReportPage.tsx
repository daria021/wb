import React, {useCallback, useEffect, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {AxiosResponse} from 'axios';
import {getOrderById, getOrderReport, updateOrderStatus} from "../services/api";
import {OrderStatus, PayoutTime} from "../enums";
import GetUploadLink from "../components/GetUploadLink";

interface OrderReport {
    step: number;
    search_screenshot_path?: string;
    cart_screenshot?: string;
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
    order_date: Date;
    transaction_code: string;
    product: Product;
}

interface Product {
    id: string;
    payment_time: PayoutTime;
}


function OrderReportPage() {
    const {orderId} = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [report, setReport] = useState<OrderReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [order, setOrder] = useState<Order | null>(null);
    const location = useLocation();
  const fromModerator = location.state?.from === "moderator";

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

    const handleCashbackRejected = async (orderId: string) => {
        try {
            const formData = new FormData();
            formData.append('status', OrderStatus.CASHBACK_REJECTED);
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
        return <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-gray-600 always-spin"/>
            </div>;
    }
    if (error || !report) {
        return <div className="p-6 text-center text-red-600 text-lg">{error || 'Отчет не найден'}</div>;
    }

    return (
        <div className="min-h-screen bg-gray-200 py-6">
            <div className="max-w-screen-md mx-auto bg-white shadow-lg rounded-lg p-6">
                <h1 className="text-lg font-bold mb-6 text-center">Отчёт по сделке выкупа товара</h1>
          <section className="mb-6 p-4 bg-gray-200 rounded-md">
  {order?.order_date && order?.transaction_code && (
    <>
      <p>
        Дата сделки по выкупу товара:{' '}
        <strong>
          {new Date(order.order_date as any).toLocaleDateString('ru-RU')}
        </strong>
      </p>
      <p>
        Код сделки: <strong>{order.transaction_code}</strong>
      </p>
        <p>
        Сумма кешбэка к выплате: <strong>{report.cashback} ₽</strong>
      </p>
        <p>
        Условия выплаты кешбэка: <strong>{order.product.payment_time}</strong>
      </p>
       <p>
    Покупатель:{' '}
    <a
        href={`https://t.me/${order!.user.nickname}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
    >
        @{order!.user.nickname}
    </a>
</p>
    </>
  )}
</section>


                {(report.search_screenshot_path || report.cart_screenshot) && (
                    <section className="mb-6 p-4 bg-gray-200 rounded-md">
                        <h2 className="text-lg font-semibold mb-2">Шаг 1. Скриншоты поиска и корзины</h2>
                        <p>1. Скриншот поискового запроса в WB</p>
                        {report.search_screenshot_path && (
                            <img
                                src={GetUploadLink(report.search_screenshot_path)}
                                alt="Скриншот поискового запроса в WB"
                                className="mt-2 w-full rounded-md"
                            />
                        )}
                        <p>2. Скриншот корзины в WB</p>
                        {report.cart_screenshot && (
                            <img
                                src={GetUploadLink(report.cart_screenshot)}
                                alt="Скриншот корзины в WB"
                                className="mt-2 w-full rounded-md"
                            />
                        )}
                    </section>
                )}

                {report.step > 1 && report.article && (
                    <section className="mb-6 p-4 bg-gray-200 rounded-md">
                        <h2 className="text-lg font-semibold mb-2"> Шаг 2. Артикул товара продавца</h2>
                        <p className="text-base">{report.article}</p>
                    </section>
                )}

                {report.step > 2 && (
                <section className="mb-6 p-4 bg-gray-200 rounded-md">
                    <h2 className="text-lg font-semibold mb-2">Шаг 3. Товар и бренд добавлены в избранное</h2>
                    <p className="text-base">Ваш товар и бренд успешно добавлены в избранное.</p>
                </section>
                )}

                {report.step > 3 && (
                    <section className="mb-6 p-4 bg-gray-200 rounded-md">
                    <h2 className="text-lg font-semibold mb-2">Шаг 4. Реквизиты для получения кешбэка</h2>
                                    {(report.card_number || report.phone_number || report.name || report.bank) && (
                    <section className="mb-6 p-4 bg-gray-200 rounded-md">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-lg font-semibold">Реквизиты</h2>
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
                    </section>
                )}
                </section>

)}

                {report.final_cart_screenshot_path && (
                    <section className="mb-6 p-4 bg-gray-200 rounded-md">
                        <h2 className="text-lg font-semibold mb-2">Шаг 5. Скриншот оформления заказа</h2>
                        <img
                            src={GetUploadLink(report.final_cart_screenshot_path)}
                            alt="Скриншот оформления заказа"
                            className="mt-2 w-full rounded-md"
                        />
                    </section>
                )}

                {(report.delivery_screenshot_path || report.barcodes_screenshot_path) && (
                    <section className="mb-6 p-4 bg-gray-200 rounded-md">
                        <h2 className="text-lg font-semibold mb-2">Шаг 6. Скриншоты доставки и штрихкода</h2>
                        <p>1. Скриншот статуса заказа в разделе "Доставки" на WB</p>
                        {report.delivery_screenshot_path && (
                            <img
                                src={GetUploadLink(report.delivery_screenshot_path)}
                                alt="Скрин доставки"
                                className="mt-2 w-full rounded-md"
                            />
                        )}
                        <p>2. Фотография разрезанного штрихкода на фоне товара</p>
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
                        <h2 className="text-lg font-semibold mb-2">Шаг 7. Скриншот отзыва и эл.чека</h2>
                        <p>1. Скриншот отзыва товара в WB</p>
                        {report.review_screenshot_path && (
                            <img
                                src={GetUploadLink(report.review_screenshot_path)}
                                alt="Скрин отзыва"
                                className="mt-2 w-full rounded-md"
                            />
                        )}
                        <p>2. Скриншот электронного чека заказа в WB</p>
                        {report.receipt_screenshot_path && (
                            <img
                                src={GetUploadLink(report.receipt_screenshot_path)}
                                alt="Скрин электронного чека"
                                className="mt-2 w-full rounded-md"
                            />
                        )}
                        <p>3. Номер чека</p>
                        {report.receipt_number && (
                            <p className="text-base mt-2">Номер чека: {report.receipt_number}</p>
                        )}
                    </section>
                )}

                {report.status === OrderStatus.CASHBACK_NOT_PAID && !fromModerator &&
                <section className="flex flex-col gap-2">
                         <button
                        onClick={() => handleCashbackPaid(orderId!)}
                        className="py-2 px-4 rounded-lg font-semibold border border-green-500 text-green-500 bg-transparent"
                    >
                        Отметить как оплаченный
                    </button>
                    <button
                        onClick={() => handleCashbackRejected(orderId!)}
className="py-2 px-4 rounded-lg font-semibold border border-red-500 text-red-500 bg-transparent"
                    >
                        Отклонить начисление кешбэка
                    </button>
                </section>
                }
            </div>
        </div>
    );
}

export default OrderReportPage;

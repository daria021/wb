import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {getOrderById, getOrderReport, updateOrder} from '../../services/api';
import {AxiosResponse} from 'axios';
import {on} from "@telegram-apps/sdk";

interface Product {
    id: string;
    name: string;
    brand: string;
    article: string;
    price: number;
    wb_price: number;
    tg: string;
    // ... другие поля, если нужно
}

interface Order {
    id: string;
    product: Product;
    seller: User
    // ... другие поля заказа, если нужно
}

interface User {
    nickname: string
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

function StepReviewReportPage() {
    const {orderId} = useParams<{ orderId: string }>();
    const navigate = useNavigate();

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reportData, setReportData] = useState<OrderReport | null>(null);

    // Состояния для отзыва и загрузки файлов
    const [leftReview, setLeftReview] = useState(false);
    const [reviewScreenshot, setReviewScreenshot] = useState<File | null>(null);
    const [checkScreenshot, setCheckScreenshot] = useState<File | null>(null);
    const [checkNumber, setCheckNumber] = useState('');
    const [showReport, setShowReport] = useState(false);

    // Кнопка «Продолжить» активна, если отзыв оставлен, оба файла загружены и номер чека введён
    const canContinue =
        leftReview &&
        reviewScreenshot !== null &&
        checkScreenshot !== null &&
        checkNumber.trim() !== '';

    // Слушатель для кнопки "Назад" через Telegram SDK:
    useEffect(() => {
        const removeBackListener = on('back_button_pressed', () => {
            if (!orderId) return;
            navigate(`/order/${orderId}/step-6`);
        });
        return () => {
            removeBackListener();
        };
    }, [navigate, orderId]);

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

    // Получаем данные заказа
    useEffect(() => {
        if (!orderId) {
            setError('Не указан orderId');
            setLoading(false);
            return;
        }
        getOrderById(orderId)
            .then((res: AxiosResponse<Order>) => {
                setOrder(res.data);
            })
            .catch((err) => {
                console.error('Ошибка при загрузке заказа:', err);
                setError('Не удалось загрузить данные о заказе');
            })
            .finally(() => setLoading(false));
    }, [orderId]);

    // Обработчики загрузки файлов
    const handleReviewScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setReviewScreenshot(e.target.files[0]);
        } else {
            setReviewScreenshot(null);
        }
    };

    const handleCheckScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setCheckScreenshot(e.target.files[0]);
        } else {
            setCheckScreenshot(null);
        }
    };

    // Обработчик переключателя "Оставил(а) отзыв"
    const handleLeftReviewChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setLeftReview(checked);
        if (!checked) {
            setReviewScreenshot(null);
            setCheckScreenshot(null);
            setCheckNumber('');
        }
    };

    // Обработчик кнопки "Проверить продавца"
    const handleCheckSeller = () => {
        if (order && order.seller && order.seller.nickname) {
            window.open(`https://t.me/${order.seller.nickname}`, '_blank');
        } else {
            alert("Информация о продавце недоступна");
        }
    };


    // Обработчик кнопки "Продолжить"
    const handleContinue = async () => {
        if (!canContinue || !orderId) return;
        try {
            await updateOrder(orderId, {
                step: 7,
                review_screenshot: reviewScreenshot,
                receipt_screenshot: checkScreenshot,
                receipt_number: checkNumber,
            });
            // Переход на финальный шаг
            navigate(`/order/${orderId}/order-info`);
        } catch (err) {
            console.error('Ошибка при обновлении заказа:', err);
            // Здесь можно добавить уведомление об ошибке
        }
    };


    if (loading) return <div className="p-4">Загрузка...</div>;
    if (error || !order) return <div className="p-4 text-red-600">{error || 'Заказ не найден'}</div>;

    return (
        <div className="p-4 max-w-screen-md bg-gray-200 mx-auto">
            {/* Шапка: Заголовок и кнопка "Назад"/"Написать продавцу" */}
            <div className="flex items-center justify-between mb-4">

                <button
                    onClick={handleCheckSeller}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 240 240"
                        className="w-5 h-5"
                        fill="currentColor"
                    >
                        <path
                            d="M120 0C53.73 0 0 53.73 0 120s53.73 120 120 120 120-53.73 120-120S186.27 0 120 0zm57.07 84.27l-18.96 89.38c-1.44 6.48-5.27 8.08-10.7 5.03l-29.51-21.76-14.23 13.7c-1.57 1.57-2.87 2.87-5.83 2.87l2.09-29.63 53.95-48.66c2.35-2.09-.51-3.25-3.64-1.16l-66.55 41.91-28.68-9.0c-6.25-2.0-6.38-6.25 1.31-9.25l112.3-43.38c5.25-2.0 9.87 1.31 8.91 9.06z"
                        />
                    </svg>
                    <span>Написать продавцу</span>
                </button>

            </div>

            {/* Серый блок с инструкцией */}
            <div className="bg-brandlight p-3 rounded-md text-sm text-gray-700 space-y-2 mb-4">
                <h1 className="text-lg font-bold">Шаг 8. Отзыв</h1>
                <p className="mb-2">1. Согласуйте отзыв с продавцом.</p>
                <p className="mb-2">2. Фото, видео, текст, оценка 5.</p>
            </div>

            {/* Переключатель "Оставил(а) отзыв" */}
            <div className="flex items-center mb-4">
                <input
                    type="checkbox"
                    id="leftReview"
                    className="mr-2"
                    checked={leftReview}
                    onChange={handleLeftReviewChange}
                />
                <label htmlFor="leftReview" className="text-sm text-gray-700">
                    Оставил(а) отзыв
                </label>
            </div>

            {/* Если отзыв оставлен – поля для загрузки файлов и ввода номера чека */}
            {leftReview && (
                <div className="space-y-3 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Загрузите скрин отзыва
                        </label>
                        <input type="file" accept="image/*" onChange={handleReviewScreenshotChange}/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Загрузите скрин электронного чека
                        </label>
                        <input type="file" accept="image/*" onChange={handleCheckScreenshotChange}/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Номер чека
                        </label>
                        <input
                            type="text"
                            value={checkNumber}
                            onChange={(e) => setCheckNumber(e.target.value)}
                            placeholder="Введите номер чека"
                            className="w-full border border-gray-300 rounded-md p-2 text-sm"
                        />
                    </div>
                </div>
            )}

            {/* Кнопки "Проверить продавца" и "Продолжить" */}
            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => window.open('https://t.me/bigblacklist_bot', '_blank')}
                    className="flex-1 bg-white text-gray-700 py-2 rounded-lg border border-brand text-center"
                >
                    Проверить продавца
                </button>
                <button
                    onClick={handleContinue}
                    disabled={!canContinue}
                    className={`flex-1 p-2 rounded text-white text-sm ${
                        canContinue ? 'bg-brand hover:bg-brand' : 'bg-gray-400 cursor-not-allowed'
                    }`}
                >
                    Продолжить
                </button>
            </div>

            {/* Видео-инструкция */}
            <div className="mb-4">
                <h3 className="text-base font-semibold mb-2">Инструкция на отзыв</h3>
                <div className="relative w-full h-48 bg-gray-200 mb-4">
                    <iframe
                        title="Инструкция - Отзыв"
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                        allowFullScreen
                        className="w-full h-full"
                    />
                </div>
                <h3 className="text-base font-semibold mb-2">Инструкция на чек</h3>
                <div className="relative w-full h-48 bg-gray-200 mb-4">
                    <iframe
                        title="Инструкция - Электронный чек"
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                        allowFullScreen
                        className="w-full h-full"
                    />
                </div>
            </div>


            {/* Видео-инструкция */}
            <div className="mb-4">
                <h3 className="text-base font-semibold mb-2">Инструкция на номер чека</h3>
                <iframe
                    title="Инструкция"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                    allowFullScreen
                    className="w-full h-full"
                />
            </div>

            {/* Кнопки снизу, расположенные вертикально */}
            <div className="flex flex-col gap-3">
                {/* Блок с отчетом */}
                <button
                    onClick={() => setShowReport(prev => !prev)}
                    className="w-full py-2 mb-4 rounded-lg bg-white border border-brand text-gray-600 font-semibold text-center"
                >
                    {showReport ? 'Скрыть отчет' : 'Открыть отчет'}
                </button>
                {showReport && (
                    <div className="bg-white rounded-lg shadow p-4 mb-4">
                        <h3 className="text-lg font-bold mb-2">Отчет</h3>
                        {reportData ? (
                            <div>
                                {/* Шаг 1: Скрины корзины */}
                                {(reportData.search_screenshot_path || reportData.cart_screenshot_path) && (
                                    <div className="mb-3">
                                        <p className="text-sm font-semibold">Шаг 1. Скрины корзины</p>
                                        {reportData.search_screenshot_path && (
                                            <img
                                                src={reportData.search_screenshot_path}
                                                alt="Скрин поискового запроса"
                                                className="mt-1 w-full rounded"
                                            />
                                        )}
                                        {reportData.cart_screenshot_path && (
                                            <img
                                                src={reportData.cart_screenshot_path}
                                                alt="Скрин корзины"
                                                className="mt-1 w-full rounded"
                                            />
                                        )}
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
                                {/* Шаг 6: Скрины доставки и штрихкодов */}
                                {(reportData.delivery_screenshot_path || reportData.barcodes_screenshot_path) && (
                                    <div className="mb-3">
                                        <p className="text-sm font-semibold">Шаг 6. Скрины доставки и штрихкодов</p>
                                        {reportData.delivery_screenshot_path && (
                                            <img
                                                src={reportData.delivery_screenshot_path}
                                                alt="Скрин доставки"
                                                className="mt-1 w-full rounded"
                                            />
                                        )}
                                        {reportData.barcodes_screenshot_path && (
                                            <img
                                                src={reportData.barcodes_screenshot_path}
                                                alt="Скрин штрихкодов"
                                                className="mt-1 w-full rounded"
                                            />
                                        )}
                                    </div>
                                )}
                                {/* Шаг 7: Скрины отзыва и чека */}
                                {(reportData.review_screenshot_path || reportData.receipt_screenshot_path || reportData.receipt_number) && (
                                    <div className="mb-3">
                                        <p className="text-sm font-semibold">Шаг 7. Скрины отзыва и чека</p>
                                        {reportData.review_screenshot_path && (
                                            <img
                                                src={reportData.review_screenshot_path}
                                                alt="Скрин отзыва"
                                                className="mt-1 w-full rounded"
                                            />
                                        )}
                                        {reportData.receipt_screenshot_path && (
                                            <img
                                                src={reportData.receipt_screenshot_path}
                                                alt="Скрин электронного чека"
                                                className="mt-1 w-full rounded"
                                            />
                                        )}
                                        {reportData.receipt_number && (
                                            <p className="text-sm">Номер чека: {reportData.receipt_number}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">Отчет пока пуст.</p>
                        )}
                    </div>
                )}
                <button
                    className="bg-white border border-gray-300 rounded-lg p-3 text-sm font-semibold flex items-center gap-2 text-left">
                    <img src="/icons/telegram.png" alt="Telegram" className="w-6 h-6"/>
                    <span>Подписаться на канал</span>
                </button>
                <button className="bg-white border border-gray-300 rounded-lg p-3 text-sm font-semibold text-left">
                    Нужна помощь
                </button>
            </div>
        </div>
    );
}

export default StepReviewReportPage;

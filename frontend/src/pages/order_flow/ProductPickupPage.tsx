// src/pages/ProductPickupPage.tsx
import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {getOrderById, getOrderReport, updateOrder} from '../../services/api';
import {on} from "@telegram-apps/sdk";
import {AxiosResponse} from 'axios';
import GetUploadLink from "../../components/GetUploadLink";

interface Product {
    id: string;
    name: string;
    brand: string;
    article: string;
    price: number;     // Цена для покупателя
    wb_price: number;  // Цена на сайте WB
    tg: string;        // Контакт продавца (Telegram)
    // ... другие поля, если нужно
}

interface Order {
    id: string;
    product: Product;
    // ... другие поля заказа, если нужно
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

function ProductPickupPage() {
    const {orderId} = useParams<{ orderId: string }>();
    const navigate = useNavigate();

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reportData, setReportData] = useState<OrderReport | null>(null);

    // Состояние для переключателя «Забрал(а) товар»
    const [pickedUp, setPickedUp] = useState(false);
    // Файлы для загрузки: скрин доставки и скрин штрихкодов
    const [deliveryScreenshot, setDeliveryScreenshot] = useState<File | null>(null);
    const [barcodeScreenshot, setBarcodeScreenshot] = useState<File | null>(null);
    const [showReport, setShowReport] = useState(false);

    // Переход на предыдущий шаг через back-button (например, для Telegram Mini App)
    useEffect(() => {
        const removeBackListener = on('back_button_pressed', () => {
            // Здесь подставляем orderId в шаблонную строку
            navigate(`/order/${orderId}/step-5`);
        });
        return () => {
            removeBackListener();
        };
    }, [navigate, orderId]);

    // Получаем данные отчёта один раз
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
        if (!orderId) return;
        getOrderById(orderId)
            .then((res: AxiosResponse<Order>) => {
                setOrder(res.data);
            })
            .catch(err => {
                console.error('Ошибка при загрузке заказа:', err);
                setError('Не удалось загрузить данные о заказе');
            })
            .finally(() => setLoading(false));
    }, [orderId]);

    if (loading) {
        return <div className="p-4">Загрузка...</div>;
    }
    if (error || !order) {
        return <div className="p-4 text-red-600">{error || 'Заказ не найден'}</div>;
    }

    // Расчёт кэшбэка: разница между ценой WB и ценой для покупателя
    const cashback = order.product.wb_price - order.product.price;
    // Кнопка "Продолжить" активна, если товар забран и оба файла выбраны
    const canContinue = pickedUp && deliveryScreenshot && barcodeScreenshot;

    // Обработчик загрузки файла доставки
    const handleDeliveryScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setDeliveryScreenshot(e.target.files[0]);
        } else {
            setDeliveryScreenshot(null);
        }
    };

    // Обработчик загрузки файла штрихкодов
    const handleBarcodeScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setBarcodeScreenshot(e.target.files[0]);
        } else {
            setBarcodeScreenshot(null);
        }
    };

    // Обработчик переключателя "Забрал(а) товар"
    const handlePickedUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPickedUp(e.target.checked);
        if (!e.target.checked) {
            setDeliveryScreenshot(null);
            setBarcodeScreenshot(null);
        }
    };


    // Обработчик кнопки "Продолжить"
    const handleContinue = async () => {
        if (!canContinue || !orderId) return;
        try {
            // Обновляем заказ: сохраняем скрин доставки и штрихкодов, переводим step в 6
            await updateOrder(orderId, {
                step: 6,
                delivery_screenshot: deliveryScreenshot,
                barcodes_screenshot: barcodeScreenshot,
            });
            navigate(`/order/${orderId}/step-7`);
        } catch (err) {
            console.error('Ошибка при обновлении заказа:', err);
        }
    };

    const handleChannelClick = () => {
        window.open('https://t.me/grcashback', '_blank'); //todo
    };
    const handleSupportClick = () => {
        window.open('https://t.me/snow_irbis20', '_blank');
    };

    return (
        <div className="p-4 max-w-screen-md bg-gray-200 mx-auto">


            {/* Инструкция */}
            <div className="bg-brandlight p-3 rounded-md text-sm text-gray-700 space-y-2 mb-4">
                <h1 className="text-lg font-bold">Шаг 6. Получение товара</h1>
                <p>
                    Заберите товар как обычно, сделайте скрин раздела «доставки» из личного кабинета, где указана дата
                    получения и статус "Доставлено". После этого разрежьте штрихкод и сделайте фото разрезанного
                    штрихкода на фоне товара без упаковки.
                </p>
                <p>
                    Ваш кэшбэк: <strong>{cashback} руб.</strong>
                </p>
            </div>

            {/* Переключатель "Забрал(а) товар" */}
            <div className="flex items-center mb-4">
                <input
                    type="checkbox"
                    id="pickedUp"
                    className="mr-2"
                    checked={pickedUp}
                    onChange={handlePickedUpChange}
                />
                <label htmlFor="pickedUp" className="text-sm text-gray-700">
                    Забрал(а) товар
                </label>
            </div>

            {/* Если товар забран, показываем поля для загрузки файлов */}
            {pickedUp && (
                <div className="space-y-3 mb-4">
                    {/* Скрин доставки */}

                    <div className="flex flex-col gap-2 items-start px-4">
                        <p className="uppercase text-xs text-gray-500">Скрин статуса «Доставка» (из личного кабинета)</p>
                        <label className="bg-brandlight text-brand py-2 px-4 rounded cursor-pointer hover:shadow-lg transition-shadow duration-200 text-sm flex items-center gap-2">
                            <img src="/icons/paperclip.png" alt="paperclip" className="h-4 w-4" />
                            Выбрать файл
                            <input
                                accept="image/*"
                                className="hidden"
                                type="file"
                                onChange={handleDeliveryScreenshotChange}
                            />
                        </label>
                    </div>

                    <div className="flex flex-col gap-2 items-start px-4">
                        <p className="uppercase text-xs text-gray-500">Фото разрезанных штрихкодов на фоне товара</p>
                        <label className="bg-brandlight text-brand py-2 px-4 rounded cursor-pointer hover:shadow-lg transition-shadow duration-200 text-sm flex items-center gap-2">
                            <img src="/icons/paperclip.png" alt="paperclip" className="h-4 w-4" />
                            Выбрать файл
                            <input
                                accept="image/*"
                                className="hidden"
                                type="file"
                                onChange={handleBarcodeScreenshotChange}
                            />
                        </label>
                    </div>
                </div>


            )}

            {/* Кнопки "Проверить продавца" и "Продолжить" */}
            <div className="flex flex-col gap-2 mb-4">
                <button
                    onClick={() => window.open('https://t.me/bigblacklist_bot', '_blank')}
                    className="flex-1 bg-white text-gray-700 py-2 rounded-lg border border-brand text-center"
                >
                    Проверить продавца
                </button>
                <button
                    onClick={handleContinue}
                    disabled={!canContinue}
                    className={`w-full py-2 rounded text-white mb-4 ${canContinue ? 'bg-brand hover:bg-brand' : 'bg-gray-400 cursor-not-allowed'}`}
                >
                    Продолжить
                </button>
            </div>

            {/* Видео-инструкция */}
            <div className="bg-white rounded-lg shadow p-4">
                <p className="text-base font-medium mb-2">Инструкция</p>
                <div className="aspect-w-16 aspect-h-9 bg-black">
                    <iframe
                        title="Инструкция"
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                        allowFullScreen
                        className="w-full h-full"
                    />
                </div>
            </div>


            {/* Видео-инструкция */}
            <div className="bg-white rounded-lg shadow p-4 mt-4">
                <p className="text-base font-medium mb-2">Инструкция</p>
                <div className="aspect-w-16 aspect-h-9 bg-black">
                    <iframe
                        title="Инструкция"
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                        allowFullScreen
                        className="w-full h-full"
                    />
                </div>
            </div>

            {/* Кнопки снизу, расположенные вертикально */}
            <div className="flex flex-col gap-3 mt-4">
                {/* Кнопка "Открыть отчет" */}
                <button
                    onClick={() => setShowReport(prev => !prev)}
                    className="w-full py-2 mb-4 rounded-lg bg-white border border-brand text-gray-600 font-semibold text-center"
                >
                    {showReport ? 'Скрыть отчет' : 'Открыть отчет'}
                </button>

                {/* Блок с отчетом (выводим все шаги до текущего момента) */}
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
                                                src={GetUploadLink(reportData.search_screenshot_path)}
                                                alt="Скрин поискового запроса"
                                                className="mt-1 w-full rounded"
                                            />
                                        )}
                                        {reportData.cart_screenshot_path && (
                                            <img
                                                src={GetUploadLink(reportData.cart_screenshot_path)}
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
                                {/* Шаг 3: Товар и бренд добавлены в избранное (статичный текст) */}
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
                                            src={GetUploadLink(reportData.final_cart_screenshot_path)}
                                            alt="Финальный скрин корзины"
                                            className="mt-1 w-full rounded"
                                        />
                                    </div>

                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">Отчет пока пуст.</p>
                        )}
                    </div>
                )}

                <button
                    onClick={handleChannelClick}
                    className="bg-white border border-gray-300 rounded-lg p-3 text-sm font-semibold flex items-center gap-2 text-left">
                    <img src="/icons/telegram.png" alt="Telegram" className="w-6 h-6"/>
                    <span>Подписаться на канал</span>
                </button>
                <button
                    onClick={handleSupportClick}
                    className="bg-white border border-gray-300 rounded-lg p-3 text-sm font-semibold text-left">
                    Нужна помощь
                </button>
            </div>
        </div>
    );
}

export default ProductPickupPage;

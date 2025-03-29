// src/pages/StepOrderPlacement.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getOrderReport, updateOrder } from '../../services/api';
import { on } from "@telegram-apps/sdk";
import { AxiosResponse } from 'axios';

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

function StepOrderPlacement() {
    const navigate = useNavigate();
    const { orderId } = useParams<{ orderId: string }>();

    // Состояние переключателя «Оформил(а) заказ»
    const [isOrderPlaced, setIsOrderPlaced] = useState(false);
    // Состояние для файла (скрин, который будет сохранён как final_cart_screenshot_path)
    const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
    // Данные отчёта, полученные через API
    const [reportData, setReportData] = useState<OrderReport | null>(null);
    // Флаг для отображения отчёта
    const [showReport, setShowReport] = useState(false);

    // Кнопка "Продолжить" активна, если заказ оформлен и загружен файл
    const canContinue = isOrderPlaced && screenshotFile;

    // Слушатель для кнопки "Назад" (например, для Telegram Mini App)
    useEffect(() => {
        const removeBackListener = on('back_button_pressed', () => {
            navigate(`/order/${orderId}/step-4`);
        });
        return () => {
            removeBackListener();
        };
    }, [orderId, navigate]);

    // Загружаем отчет с сервера
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

    // Обработчик выбора файла
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setScreenshotFile(e.target.files[0]);
        } else {
            setScreenshotFile(null);
        }
    };

    // Обработчик переключателя "Оформил(а) заказ"
    const handleOrderPlacedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsOrderPlaced(e.target.checked);
        if (!e.target.checked) {
            setScreenshotFile(null);
        }
    };

    // Обработчик кнопки "Продолжить"
    const handleContinue = async () => {
        if (!canContinue || !orderId) return;
        try {
            // Обновляем заказ: сохраняем финальный скрин и переводим step в 5
            await updateOrder(orderId, {
                step: 5,
                final_cart_screenshot: screenshotFile,
            });
            // Переходим на следующий шаг (например, step-6)
            navigate(`/order/${orderId}/step-6`);
        } catch (err) {
            console.error('Ошибка при обновлении заказа:', err);
        }
    };



    return (
        <div className="p-4 max-w-screen-md bg-gray-200 mx-auto">

            {/* Инструкция */}
            <div className="bg-brandlight rounded-md p-4 text-sm text-gray-700 mb-4 space-y-2">
                <h1 className="text-lg font-bold mb-4">Шаг 5. Оформление заказа</h1>
                <p>1. Оформите заказ на Wildberries</p>
                <p>2. Сделайте скрин из раздела «Доставки» в личном кабинете</p>
                <p>3. На скрине обязательно должна быть указана цена</p>
                <p>4. Загрузите скрин заказа в отчет</p>
            </div>

            {/* Переключатель "Оформил(а) заказ" */}
            <div className="flex items-center mb-4">
                <input
                    type="checkbox"
                    id="orderPlaced"
                    checked={isOrderPlaced}
                    onChange={handleOrderPlacedChange}
                    className="mr-2"
                />
                <label htmlFor="orderPlaced" className="text-sm text-gray-700">
                    Оформил(а) заказ
                </label>
            </div>

            {/* Поле загрузки файла */}
            {isOrderPlaced && (
                <div className="flex flex-col gap-2 items-start px-4">
                    <p className="uppercase text-xs text-gray-500">Скрин заказа</p>
                    <label className="bg-brandlight text-brand py-2 px-4 rounded cursor-pointer hover:shadow-lg transition-shadow duration-200 text-sm flex items-center gap-2">
                        <img src="/icons/paperclip.png" alt="paperclip" className="h-4 w-4" />
                        Выбрать файл
                        <input
                            accept="image/*"
                            className="hidden"
                            type="file"
                            onChange={handleFileChange}
                        />
                    </label>
                </div>
            )}


            {/* Кнопка "Продолжить" */}
            <button
                onClick={handleContinue}
                disabled={!canContinue}
                className={`w-full py-2 rounded text-white mb-4 ${
                    canContinue
                        ? 'bg-brand hover:bg-brand'
                        : 'bg-gray-400 cursor-not-allowed'
                }`}
            >
                Продолжить
            </button>


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

            {/* Кнопка "Открыть отчет" */}


            {/*/!* Фото карточки товара *!/*/}
            {/*<div className="mb-4">*/}
            {/*    <div className="w-full aspect-[3/4] bg-gray-100 rounded overflow-hidden relative">*/}
            {/*        {order!.product.image_path ? (*/}
            {/*            <img*/}
            {/*                src={*/}
            {/*                    order!.product.image_path.startsWith('http')*/}
            {/*                        ? order!.product.image_path*/}
            {/*                        : `${process.env.REACT_APP_MEDIA_BASE}/${order!.product.image_path}`*/}
            {/*                }*/}
            {/*                alt={order!.product.name}*/}
            {/*                className="absolute inset-0 w-full h-full object-cover"*/}
            {/*            />*/}
            {/*        ) : (*/}
            {/*            <div className="absolute inset-0 flex items-center justify-center text-gray-400">*/}
            {/*                Нет фото*/}
            {/*            </div>*/}
            {/*        )}*/}
            {/*    </div>*/}
            {/*</div>*/}

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
                <button
                    onClick={() => setShowReport(prev => !prev)}
                    className="w-full py-2 mb-4 rounded-lg bg-white border border-brand text-gray-600 font-semibold text-center"
                >
                    {showReport ? 'Скрыть отчет' : 'Открыть отчет'}
                </button>

                {/* Блок с отчетом, включающий все шаги до текущего момента */}
                {showReport && (
                    <div className="bg-white rounded-lg shadow p-4 mb-4">
                        <h3 className="text-lg font-bold mb-2">Отчет</h3>
                        {reportData ? (
                            <div>
                                {/* Шаг 1: Скрины поискового запроса и корзины */}
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

                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">Отчет пока пуст.</p>
                        )}
                    </div>
                )}

                <button className="bg-white border border-gray-300 rounded-lg p-3 text-sm font-semibold flex items-center gap-2 text-left">
                    <img src="/icons/telegram.png" alt="Telegram" className="w-6 h-6" />
                    <span>Подписаться на канал</span>
                </button>
                <button className="bg-white border border-gray-300 rounded-lg p-3 text-sm font-semibold text-left">
                    Нужна помощь
                </button>
            </div>
        </div>
    );
}

export default StepOrderPlacement;

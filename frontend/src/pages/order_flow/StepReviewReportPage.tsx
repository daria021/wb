import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {getOrderById, getOrderReport, updateOrder} from '../../services/api';
import {AxiosResponse} from 'axios';
import {on} from "@telegram-apps/sdk";
import GetUploadLink from "../../components/GetUploadLink";
import FileUploader from "../../components/FileUploader";

interface Product {
    id: string;
    name: string;
    brand: string;
    article: string;
    price: number;
    wb_price: number;
    requirements_agree: boolean;
    tg: string;
}

interface Order {
    id: string;
    product: Product;
    seller: User
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

    const [leftReview, setLeftReview] = useState(false);
    // const [reviewScreenshot, setReviewScreenshot] = useState<File | null>(null);
    // const [checkScreenshot, setCheckScreenshot] = useState<File | null>(null);
    const [checkNumber, setCheckNumber] = useState('');
    const [showReport, setShowReport] = useState(false);
    const [file1, setFile1] = useState<File | null>(null);
    const [preview1, setPreview1] = useState<string | null>(null);

    const [file2, setFile2] = useState<File | null>(null);
    const [preview2, setPreview2] = useState<string | null>(null);
    const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});

    const toggleStep = (step: number) => {
        setExpandedSteps(prev => ({...prev, [step]: !prev[step]}));
    };

    useEffect(() => {
        if (!file1) {
            setPreview1(null);
            return;
        }
        const url = URL.createObjectURL(file1);
        setPreview1(url);
        return () => URL.revokeObjectURL(url);
    }, [file1]);

    useEffect(() => {
        if (!file2) {
            setPreview2(null);
            return;
        }
        const url = URL.createObjectURL(file2);
        setPreview2(url);
        return () => URL.revokeObjectURL(url);
    }, [file2]);

    const canContinue =
        leftReview &&
        file1 !== null &&
        file2 !== null &&
        checkNumber.trim() !== '';

    useEffect(() => {
        const removeBackListener = on('back_button_pressed', () => {
            if (!orderId) return;
            navigate(-1);
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

    // const handleReviewScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     if (e.target.files && e.target.files.length > 0) {
    //         setReviewScreenshot(e.target.files[0]);
    //     } else {
    //         setReviewScreenshot(null);
    //     }
    // };
    //
    // const handleCheckScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     if (e.target.files && e.target.files.length > 0) {
    //         setCheckScreenshot(e.target.files[0]);
    //     } else {
    //         setCheckScreenshot(null);
    //     }
    // };

    const handleLeftReviewChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setLeftReview(checked);
        if (!checked) {
            setFile1(null);
            setFile2(null);
            setCheckNumber('');
        }
    };

    const handleCheckSeller = () => {
        if (order && order.seller && order.seller.nickname) {
            window.open(`https://t.me/${order.seller.nickname}`, '_blank');
        } else {
            alert("Информация о продавце недоступна");
        }
    };


    const handleContinue = async () => {
        if (!canContinue || !orderId) return;
        try {
            await updateOrder(orderId, {
                step: 7,
                review_screenshot: file1,
                receipt_screenshot: file2,
                receipt_number: checkNumber,
            });
            navigate(`/order/${orderId}/order-info`);
        } catch (err) {
            console.error('Ошибка при обновлении заказа:', err);
        }
    };

    const handleChannelClick = () => {
        window.open('https://t.me/grcashback', '_blank'); //todo
    };
    const handleSupportClick = () => {
        if (window.Telegram?.WebApp?.close) {
            window.Telegram.WebApp.close();
        }
        window.open(process.env.REACT_APP_SUPPORT_URL, '_blank');
    };


    if (loading) return <div className="p-4">Загрузка...</div>;
    if (error || !order) return <div className="p-4 text-red-600">{error || 'Заказ не найден'}</div>;

    return (
        <div className="p-4 max-w-screen-md bg-gradient-t-gray mx-auto">
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

            <div className="bg-gradient-tr-white border border-gradient-r-brand p-3 rounded-md text-sm text-gray-700 space-y-2 mb-4">
                <h1 className="text-lg font-bold">Шаг 7. Отзыв</h1>
                <p className="mb-2">1. Согласуйте отзыв с продавцом.</p>
                {order.product.requirements_agree ? (
                    <>
                        <p className="mb-2 text-brand">
                            Обратите внимание, что это обязательное условие для получения кешбека!
                            <p className="mb-2 text-black">2. Фото, видео, текст, оценка 5.</p>
                        </p>
                    </>
                ) : (
                    <p className="mb-2">
                        1. Напишите отзыв. Фото, видео, текст, оценка 5.
                    </p>
                )}
                <p className="mb-2 text-xs text-gray-500">ВЫ ВСЕГДА МОЖЕТЕ ВЕРНУТЬСЯ К ЭТОМУ ШАГУ В РАЗДЕЛЕ "МОИ ПОКУПКИ"</p>

            </div>

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

            {leftReview && (
                <>
                    <FileUploader
                        label="Скрин статуса «Доставка» (из личного кабинета)"
                        file={file1}
                        preview={preview1}
                        onFileChange={setFile1}
                    />
                    <FileUploader
                        label="Фото разрезанных штрихкодов на фоне товара"
                        file={file2}
                        preview={preview2}
                        onFileChange={setFile2}
                    />
                </>
            )}


            <div>
                <label className="block text-sm font-medium mb-1 mt-2">
                    Номер чека
                </label>
                <input
                    type="text"
                    value={checkNumber}
                    onChange={(e) => setCheckNumber(e.target.value)}
                    placeholder="Введите номер чека"
                    className="w-full border border-gradient-tr-darkGray rounded-md p-2 text-sm"
                />
            </div>
            <div className="flex gap-2 mb-4 mt-4">
                <button
                    onClick={() => window.open('https://t.me/bigblacklist_bot', '_blank')}
                    className="flex-1 bg-gradient-tr-white text-gray-700 text-sm py-2 rounded-lg border border-gradient-r-brand text-center"
                >
                    Проверить продавца
                </button>
                <button
                    onClick={handleContinue}
                    disabled={!canContinue}
                    className={`flex-1 py-2 rounded text-white text-sm ${
                        canContinue ? 'bg-gradient-r-brand hover:bg-gradient-r-brand-dark' : 'bg-gray-400 cursor-not-allowed'
                    }`}
                >
                    Продолжить
                </button>
            </div>

            {/* Инструкции */}
            <div className="bg-gradient-tr-white rounded-lg shadow p-4">
                <p className="text-base font-medium mb-2">Инструкция на отзыв</p>
                <div className="aspect-w-16 aspect-h-9 bg-black">
                    <iframe
                        title="Инструкция на отзыв"
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                        allowFullScreen
                        className="w-full h-full"
                    />
                </div>
            </div>

            <div className="bg-gradient-tr-white rounded-lg shadow p-4 mt-4">
                <p className="text-base font-medium mb-2">Инструкция на чек</p>
                <div className="aspect-w-16 aspect-h-9 bg-black">
                    <iframe
                        title="Инструкция на чек"
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                        allowFullScreen
                        className="w-full h-full"
                    />
                </div>
            </div>

            <div className="bg-gradient-tr-white rounded-lg shadow p-4 mt-4">
                <p className="text-base font-medium mb-2">Инструкция на номер чека</p>
                <div className="aspect-w-16 aspect-h-9 bg-black">
                    <iframe
                        title="Инструкция на номер чека"
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                        allowFullScreen
                        className="w-full h-full"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-3 mt-4">
                <button
                    onClick={() => setShowReport(prev => !prev)}
                    className="w-full py-2 mb-4 rounded-lg bg-gradient-tr-white border border-gradient-r-brand text-gray-600 font-semibold text-center"
                >
                    {showReport ? 'Скрыть отчет' : 'Открыть отчет'}
                </button>
                {showReport && (
                    <div className="bg-gradient-tr-white rounded-lg shadow p-4 mb-4">
                        <h3 className="text-lg font-bold mb-2">Отчет</h3>
                        {reportData ? (
                                <div className="space-y-2">
                                    {/* Шаг 1 */}
                                    <div className="bg-gradient-tr-white rounded-lg shadow">
                                        <button
                                            onClick={() => toggleStep(1)}
                                            className="w-full flex justify-between items-center p-4 text-left"
                                        >
                                            <span className="font-semibold">Шаг 1. Скрины корзины</span>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className={`w-5 h-5 transform transition-transform ${
                                                    expandedSteps[1] ? 'rotate-180' : ''
                                                }`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M19 9l-7 7-7-7"/>
                                            </svg>
                                        </button>
                                        {expandedSteps[1] && (
                                            <div className="border-t p-4 space-y-3">
                                                {reportData.search_screenshot_path && (
                                                    <div>
                                                        <p className="text-sm font-semibold">Скрин поискового запроса</p>
                                                        <img
                                                            src={GetUploadLink(reportData.search_screenshot_path)}
                                                            alt="Скрин поискового запроса"
                                                            className="mt-1 w-full rounded"
                                                        />
                                                    </div>
                                                )}
                                                {reportData.cart_screenshot_path && (
                                                    <div>
                                                        <p className="text-sm font-semibold">Скрин корзины</p>
                                                        <img
                                                            src={GetUploadLink(reportData.cart_screenshot_path)}
                                                            alt="Скрин корзины"
                                                            className="mt-1 w-full rounded"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Шаг 2 */}
                                    <div className="bg-gradient-tr-white rounded-lg shadow">
                                        <button
                                            onClick={() => toggleStep(2)}
                                            className="w-full flex justify-between items-center p-4 text-left"
                                        >
                                            <span className="font-semibold">Шаг 2. Артикул товара</span>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className={`w-5 h-5 transform transition-transform ${
                                                    expandedSteps[2] ? 'rotate-180' : ''
                                                }`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M19 9l-7 7-7-7"/>
                                            </svg>
                                        </button>
                                        {expandedSteps[2] && (
                                            <div className="border-t p-4">
                                                <p className="text-sm">{reportData.article}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Шаг 3 */}
                                    <div className="bg-gradient-tr-white rounded-lg shadow">
                                        <button
                                            onClick={() => toggleStep(3)}
                                            className="w-full flex justify-between items-center p-4 text-left"
                                        >
                                            <span className="font-semibold">Шаг 3. Товар и бренд в избранное</span>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className={`w-5 h-5 transform transition-transform ${
                                                    expandedSteps[3] ? 'rotate-180' : ''
                                                }`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M19 9l-7 7-7-7"/>
                                            </svg>
                                        </button>
                                        {expandedSteps[3] && (
                                            <div className="border-t p-4">
                                                <p className="text-sm">Ваш товар и бренд успешно добавлены в избранное.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Шаг 4 */}
                                    <div className="bg-gradient-tr-white rounded-lg shadow">
                                        <button
                                            onClick={() => toggleStep(4)}
                                            className="w-full flex justify-between items-center p-4 text-left"
                                        >
                                            <span className="font-semibold">Шаг 4. Реквизиты</span>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className={`w-5 h-5 transform transition-transform ${
                                                    expandedSteps[4] ? 'rotate-180' : ''
                                                }`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M19 9l-7 7-7-7"/>
                                            </svg>
                                        </button>
                                        {expandedSteps[4] && (
                                            <div className="border-t p-4 space-y-1">
                                                {reportData.card_number &&
                                                    <p className="text-sm">Номер карты: {reportData.card_number}</p>}
                                                {reportData.phone_number &&
                                                    <p className="text-sm">Телефон: {reportData.phone_number}</p>}
                                                {reportData.name && <p className="text-sm">Имя: {reportData.name}</p>}
                                                {reportData.bank && <p className="text-sm">Банк: {reportData.bank}</p>}
                                            </div>
                                        )}
                                    </div>

                                    {/* Шаг 5 */}
                                    <div className="bg-gradient-tr-white rounded-lg shadow">
                                        <button
                                            onClick={() => toggleStep(5)}
                                            className="w-full flex justify-between items-center p-4 text-left"
                                        >
                                            <span className="font-semibold">Шаг 5. Финальный скрин корзины</span>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className={`w-5 h-5 transform transition-transform ${
                                                    expandedSteps[5] ? 'rotate-180' : ''
                                                }`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M19 9l-7 7-7-7"/>
                                            </svg>
                                        </button>
                                        {expandedSteps[5] && reportData.final_cart_screenshot_path && (
                                            <div className="border-t p-4">
                                                <p className="text-sm font-semibold">Скрин корзины</p>
                                                <img
                                                    src={GetUploadLink(reportData.final_cart_screenshot_path)}
                                                    alt="Финальный скрин корзины"
                                                    className="w-full rounded"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Шаг 6 */}
                                    <div className="bg-gradient-tr-white rounded-lg shadow">
                                        <button
                                            onClick={() => toggleStep(6)}
                                            className="w-full flex justify-between items-center p-4 text-left"
                                        >
                                            <span className="font-semibold">Шаг 6. Скрины доставки и штрихкодов</span>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className={`w-5 h-5 transform transition-transform ${
                                                    expandedSteps[6] ? 'rotate-180' : ''
                                                }`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M19 9l-7 7-7-7"/>
                                            </svg>
                                        </button>
                                        {expandedSteps[6] && (
                                            <div className="border-t p-4 space-y-3">
                                                {reportData.delivery_screenshot_path && (
                                                    <div>
                                                        <p className="text-sm font-semibold">Скрин доставки</p>
                                                        <img
                                                            src={GetUploadLink(reportData.delivery_screenshot_path)}
                                                            alt="Скрин доставки"
                                                            className="mt-1 w-full rounded"
                                                        />
                                                    </div>
                                                )}
                                                {reportData.barcodes_screenshot_path && (
                                                    <div>
                                                        <p className="text-sm font-semibold">Скрин штрихкодов</p>
                                                        <img
                                                            src={GetUploadLink(reportData.barcodes_screenshot_path)}
                                                            alt="Скрин штрихкодов"
                                                            className="mt-1 w-full rounded"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-gradient-tr-white rounded-lg shadow p-4 mt-4 space-y-2 text-sm">
                                        <div className="font-semibold text-black">Шаг 7. Отзыв</div>
                                    </div>
                                </div>

                            ) :
                            <p className="text-sm text-gray-500">Отчет пока пуст.</p>
                        }
                    </div>
                )}

            </div>



            <div className="flex flex-col gap-3 mt-4 text-center">
                <button
                    onClick={handleChannelClick}
                    className="w-full bg-gradient-tr-white border border-gradient-tr-darkGray rounded-lg p-3 text-sm font-semibold flex
                    items-center justify-center gap-2"
                >
                    <img src="/icons/telegram.png" alt="Telegram" className="w-6 h-6"/>
                    Подписаться на канал
                </button>
                <button
                    onClick={handleSupportClick}
                    className="w-full bg-gradient-tr-white border border-gradient-tr-darkGray rounded-lg p-3 text-sm font-semibold"
                >
                    Нужна помощь
                </button>
            </div>
        </div>

    )
        ;
}

export default StepReviewReportPage;

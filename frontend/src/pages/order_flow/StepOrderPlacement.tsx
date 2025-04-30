import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {getOrderReport, updateOrder} from '../../services/api';
import {on} from "@telegram-apps/sdk";
import {AxiosResponse} from 'axios';
import GetUploadLink from "../../components/GetUploadLink";
import FileUploader from "../../components/FileUploader";

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
    const {orderId} = useParams<{ orderId: string }>();

    const [isOrderPlaced, setIsOrderPlaced] = useState(false);
    // const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
    const [reportData, setReportData] = useState<OrderReport | null>(null);
    const [showReport, setShowReport] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});

    const toggleStep = (step: number) => {
        setExpandedSteps(prev => ({...prev, [step]: !prev[step]}));
    };
    useEffect(() => {
        if (!file) {
            setPreview(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const canContinue = isOrderPlaced && file;

    useEffect(() => {
        const removeBackListener = on('back_button_pressed', () => {
            navigate(-1);
        });
        return () => {
            removeBackListener();
        };
    }, [orderId, navigate]);

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

    // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     if (e.target.files && e.target.files.length > 0) {
    //         setScreenshotFile(e.target.files[0]);
    //     } else {
    //         setScreenshotFile(null);
    //     }
    // };

    const handleOrderPlacedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsOrderPlaced(e.target.checked);
        if (!e.target.checked) {
            setFile(null);
        }
    };

    const handleContinue = async () => {
        if (!canContinue || !orderId) return;
        try {
            await updateOrder(orderId, {
                step: 5,
                final_cart_screenshot: file,
            });
            navigate(`/order/${orderId}/step-6`);
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


    return (
        <div className="p-4 max-w-screen-md bg-gradient-t-gray mx-auto">

            <div className="bg-gradient-tr-white border border-gradient-r-brand rounded-md p-4 text-sm text-gray-700 mb-4 space-y-2">
                <h1 className="text-lg font-bold mb-4 text-brand">Шаг 5. Оформление заказа</h1>
                <p>1. Оформите заказ на Wildberries</p>
                <p>2. Сделайте скрин из раздела «Доставки» в личном кабинете</p>
                <p>3. На скрине обязательно должна быть указана цена</p>
                <p>4. Загрузите скрин заказа в отчет</p>
                <p className="mb-2 text-xs text-gray-500">ВЫ ВСЕГДА МОЖЕТЕ ВЕРНУТЬСЯ К ЭТОМУ ШАГУ В РАЗДЕЛЕ "МОИ ПОКУПКИ"</p>

            </div>

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

            {isOrderPlaced && (
                <FileUploader
                    label="Фото товара"
                    file={file}
                    preview={preview}
                    onFileChange={setFile}
                />
            )}


            <button
                onClick={handleContinue}
                disabled={!canContinue}
                className={`w-full py-2 rounded text-white mb-4 mt-4 ${
                    canContinue
                        ? 'bg-gradient-r-brand hover:bg-gradient-r-brand'
                        : 'bg-gray-400 cursor-not-allowed'
                }`}
            >
                Продолжить
            </button>


            <div className="bg-gradient-tr-white rounded-lg shadow p-4">
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




                                    <div className="bg-gradient-tr-white rounded-lg shadow p-4 mt-4 space-y-2 text-sm">
                                        <div className="font-semibold text-black">Шаг 5. Оформление заказа</div>
                                        <div className="font-semibold text-gray-400">Шаг 6. Получение товара</div>
                                        <div className="font-semibold text-gray-400">Шаг 7. Отзыв</div>

                                    </div>
                                </div>

                            ) :
                            <p className="text-sm text-gray-500">Отчет пока пуст.</p>
                        }
                    </div>
                )}
                <div className="flex flex-col gap-3 mt-2 text-center">

                    <button
                        onClick={handleChannelClick}
                        className="bg-gradient-tr-white border border-gradient-tr-darkGray rounded-lg p-3 text-sm font-semibold flex items-center
                         justify-center gap-2">
                        <img src="/icons/telegram.png" alt="Telegram" className="w-6 h-6"/>
                        <span>Подписаться на канал</span>
                    </button>
                    <button
                        onClick={handleSupportClick}
                        className="bg-gradient-tr-white border border-gradient-tr-darkGray rounded-lg p-3 text-sm font-semibold">
                        Нужна помощь
                    </button>
                </div>
            </div>
        </div>
    );
}

export default StepOrderPlacement;

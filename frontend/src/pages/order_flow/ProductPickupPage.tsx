import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {getOrderById, getOrderReport, updateOrder} from '../../services/api';
import {AxiosResponse} from 'axios';
import GetUploadLink from "../../components/GetUploadLink";
import FileUploader from "../../components/FileUploader";

interface Product {
    id: string;
    name: string;
    brand: string;
    article: string;
    price: number;
    wb_price: number;
    tg: string;
}

interface Order {
    id: string;
    product: Product;
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

type ModalContent = { src: string; isVideo: boolean };

function ProductPickupPage() {
    const {orderId} = useParams<{ orderId: string }>();
    const navigate = useNavigate();

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reportData, setReportData] = useState<OrderReport | null>(null);

    const [pickedUp, setPickedUp] = useState(false);
    // const [deliveryScreenshot, setDeliveryScreenshot] = useState<File | null>(null);
    // const [barcodeScreenshot, setBarcodeScreenshot] = useState<File | null>(null);
    const [showReport, setShowReport] = useState(false);
    const [file1, setFile1] = useState<File | null>(null);
    const [preview1, setPreview1] = useState<string | null>(null);

    const [file2, setFile2] = useState<File | null>(null);
    const [preview2, setPreview2] = useState<string | null>(null);
    const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});
    const receivingImgPath = '/images/receiving.jpg';
    const barcodeImgPath = '/images/barcode.jpg';

    // единственное состояние для модалки
    const [modalContent, setModalContent] = useState<ModalContent | null>(null);

    const openModal = (src: string) => {
        setModalContent({src, isVideo: src.endsWith('.mp4')});
    };
    const closeModal = () => setModalContent(null);

    const toggleStep = (step: number) => {
        setExpandedSteps(prev => ({...prev, [step]: !prev[step]}));
    };

    useEffect(() => {
        if (!file1) return setPreview1(null);
        const url = URL.createObjectURL(file1);
        setPreview1(url);
        return () => URL.revokeObjectURL(url);
    }, [file1]);

    useEffect(() => {
        if (!file2) return setPreview2(null);
        const url = URL.createObjectURL(file2);
        setPreview2(url);
        return () => URL.revokeObjectURL(url);
    }, [file2]);

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

    const cashback = order.product.wb_price - order.product.price;
    const canContinue = pickedUp && file1 && file2;

    // const handleDeliveryScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     if (e.target.files && e.target.files.length > 0) {
    //         setDeliveryScreenshot(e.target.files[0]);
    //     } else {
    //         setDeliveryScreenshot(null);
    //     }
    // };
    //
    // const handleBarcodeScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     if (e.target.files && e.target.files.length > 0) {
    //         setBarcodeScreenshot(e.target.files[0]);
    //     } else {
    //         setBarcodeScreenshot(null);
    //     }
    // };

    const handlePickedUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPickedUp(e.target.checked);
        if (!e.target.checked) {
            setFile1(null);
            setFile2(null);
        }
    };


    const handleContinue = async () => {
        if (!canContinue || !orderId) return;
        try {
            await updateOrder(orderId, {
                step: 6,
                delivery_screenshot: file1,
                barcodes_screenshot: file2,
            });
            navigate(`/order/${orderId}/step-7`);
        } catch (err) {
            console.error('Ошибка при обновлении заказа:', err);
        }
    };

    const handleChannelClick = () => {
        window.open('https://t.me/Premiumcash1', '_blank');
    };
    const handleSupportClick = () => {
        if (window.Telegram?.WebApp?.close) {
            window.Telegram.WebApp.close();
        }
        window.open(process.env.REACT_APP_SUPPORT_URL, '_blank');
    };


    return (
        <div className="p-4 max-w-screen-md bg-gray-200 mx-auto">


            <div className="bg-white border border-brand p-3 rounded-md text-sm text-gray-700 space-y-2 mb-4">
                <h1 className="text-lg font-bold text-brand">Шаг 6. Получение товара</h1>
                <p>
                    Заберите товар как обычно, сделайте скрин раздела «доставки» из личного кабинета, где указана дата
                    получения и статус "Доставлено". После этого разрежьте штрихкод и сделайте фото разрезанного
                    штрихкода на фоне товара без упаковки.
                    <div
                        onClick={() => openModal(receivingImgPath)}
                        className="underline text-blue-600 cursor-pointer"
                    >
                        Пример скрина получения товара
                    </div>
                    <div
                        onClick={() => openModal(barcodeImgPath)}
                        className="underline text-blue-600 cursor-pointer"
                    >
                        Пример разрезанного штрихкода
                    </div>
                </p>
                <p>
                    Ваш кешбэк: <strong>{cashback} руб.</strong>
                </p>
                <p className="mb-2 text-xs text-gray-500">ВЫ ВСЕГДА МОЖЕТЕ ВЕРНУТЬСЯ К ЭТОМУ ШАГУ В РАЗДЕЛЕ "МОИ
                    ПОКУПКИ"</p>
            </div>

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

            {pickedUp && (
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


            <div className="flex flex-col gap-2 mb-4 mt-4">
                {/*<button*/}
                {/*    onClick={() => window.open('https://t.me/bigblacklist_bot', '_blank')}*/}
                {/*    className="flex-1 bg-white text-gray-700 py-2 rounded-lg border border-brand text-center"*/}
                {/*>*/}
                {/*    Проверить продавца*/}
                {/*</button>*/}
                <button
                    onClick={handleContinue}
                    disabled={!canContinue}
                    className={`w-full py-2 rounded text-brand mb-4 ${canContinue ? 'bg-brand text-white' : 'bg-gray-200-400 border border-brand cursor-not-allowed'}`}
                >
                    Продолжить
                </button>
            </div>

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

            <div className="flex flex-col gap-3 mt-4">
                <button
                    onClick={() => setShowReport(prev => !prev)}
                    className="w-full py-2 mb-2 rounded-lg bg-white border border-brand text-gray-600 font-semibold text-center"
                >
                    {showReport ? 'Скрыть отчет' : 'Открыть отчет'}
                </button>

                {showReport && (
                    <div className="bg-white rounded-lg shadow p-4 mb-4">
                        <h3 className="text-lg font-bold mb-2">Отчет</h3>
                        {reportData ? (
                                <div className="space-y-2">
                                    {/* Шаг 1 */}
                                    <div className="bg-white rounded-lg shadow">
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
                                    <div className="bg-white rounded-lg shadow">
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
                                    <div className="bg-white rounded-lg shadow">
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
                                    <div className="bg-white rounded-lg shadow">
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
                                    <div className="bg-white rounded-lg shadow">
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

                                    <div className="bg-white rounded-lg shadow p-4 mt-4 space-y-2 text-sm">
                                        <div className="font-semibold text-black">Шаг 6. Получение товара</div>
                                        <div className="font-semibold text-gray-400">Шаг 7. Отзыв</div>
                                    </div>
                                </div>

                            ) :
                            <p className="text-sm text-gray-500">Отчет пока пуст.</p>
                        }
                    </div>
                )}
                <div className="flex flex-col gap-3 text-center">

                    <button
                        onClick={handleChannelClick}
                        className="bg-white border border-darkGray rounded-lg p-3 text-sm font-semibold flex items-center
                         justify-center gap-2">
                        <img src="/icons/telegram.png" alt="Telegram" className="w-6 h-6"/>
                        <span>Подписаться на канал</span>
                    </button>
                    <button
                        onClick={handleSupportClick}
                        className="bg-white border border-darkGray rounded-lg p-3 text-sm font-semibold">
                        Нужна помощь
                    </button>
                </div>
            </div>
            {modalContent && (
                <>
                    {/* 1. Overlay */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity duration-300 ease-out z-40"
                        onClick={closeModal}
                    />

                    {/* 2. Окно модалки */}
                    <div
                        className="fixed inset-0 flex justify-center items-center z-50"
                        onClick={closeModal}
                    >
                        <div
                            className="relative bg-white p-4 rounded w-[90vw] h-[90vh]
                            flex items-center justify-center"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Кнопка «×» */}
                            <button
                                onClick={closeModal}
                                className="absolute top-2 right-2 bg-white rounded-full p-1 text-2xl text-gray-700 hover:text-gray-900"
                            >
                                &times;
                            </button>

                            {modalContent.isVideo ? (
                                <video width="100%" height="auto" controls>
                                    <source src={modalContent.src} type="video/mp4"/>
                                    Ваш браузер не поддерживает видео.
                                </video>
                            ) : (
                                <img
                                    src={modalContent.src}
                                    alt="Пример"
  className="max-w-full max-h-full object-contain"
                                />
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default ProductPickupPage;
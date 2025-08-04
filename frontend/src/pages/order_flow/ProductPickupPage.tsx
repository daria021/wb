import React, {useEffect, useRef, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {getOrderById, getOrderReport, updateOrder} from '../../services/api';
import {AxiosResponse} from 'axios';
import GetUploadLink from "../../components/GetUploadLink";
import FileUploader from "../../components/FileUploader";
import {VideoOverlay} from "../../App";
import OrderHeader from "../../components/OrderHeader";

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
    seller: User
    transaction_code: string;
}

interface OrderReport {
    step: number;
    search_screenshot_path?: string;
    cart_screenshot_path?: string;
    card_number?: string;
    phone_number?: string;
    name?: string;
    bank?: string;
    final_cart_screenshot?: string;
    delivery_screenshot_path?: string;
    barcodes_screenshot_path?: string;
    review_screenshot_path?: string;
    receipt_screenshot_path?: string;
    receipt_number?: string;
    article?: string;
}


interface User {
    nickname: string
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
    const handleHomeClick = () => navigate('/');

    const [file2, setFile2] = useState<File | null>(null);
    const [preview2, setPreview2] = useState<string | null>(null);
    const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});
    const receivingImgPath = '/images/receiving.jpg';
    const barcodeImgPath = '/images/barcode.jpg';

    const location = useLocation();
    const cameFromOrders = Boolean(location.state?.fromOrders);
    const [openSrc, setOpenSrc] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
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
        return <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-gray-600 always-spin"/>
            </div>;
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

    const handleSupportClick = () => {
        if (window.Telegram?.WebApp?.close) {
            window.Telegram.WebApp.close();
        }
        window.open(process.env.REACT_APP_SUPPORT_URL, '_blank');
    };
    const videos = [
        {
            id: 1,
            title: '🎥 Пояснение, что нужно сделать на данном этапе ',
            src: 'https://storage.googleapis.com/images_avocado/VideoCashback/10%20Buyer%20Step%206%20Explanation%20of%20the%20terms%20Transition%20to%20the%20WB%2C%20delivery%20screen%2C%20and%20explanation%20of%20the%20screen%20Return%20to%20the%20bot%20Explanation%20of%20the%20product%20photo.MP4',
        },
        {
            id: 2,
            title: '🎥 Пояснение про сроки отправки отчета и как его оформить ',
            src: 'https://storage.googleapis.com/images_avocado/VideoCashback/11%20Buyer%20Step%206%20Explanation%20when%20submitting%20a%20report%20Meeting%20the%20requirements%20Moving%20on%20to%20step%207.MP4',
        },

    ];


    return (
        <div className="p-4 max-w-screen-md bg-gray-200 mx-auto">
            {cameFromOrders && (
                <div className="bg-green-50 border-l-4 border-green-500 text-green-800 p-4 mb-6 rounded">
                    <p className="font-semibold">
                        Вы остановились на шестом шаге.
                    </p>
                    <p>Можете продолжить выкуп.</p>
                </div>
            )}

            <div className="bg-white border border-brand p-3 rounded-md text-sm text-gray-700">
                <p className="text-xs text-gray-500"><strong>ВАЖНО!</strong> ВЫ ВСЕГДА МОЖЕТЕ ВЕРНУТЬСЯ К ЭТОМУ ШАГУ В
                    РАЗДЕЛЕ "МОИ
                    ПОКУПКИ"</p>
                {order && <OrderHeader transactionCode={order.transaction_code} />}
                                <div className="space-y-2">


                <h1 className="text-lg font-bold text-brand">Шаг 6. Получение товара и подготовка отчета</h1>
                <p>
                    📦 Забери товар</p>

                <p>📸 Сделай{' '}
      <span
        onClick={() => openModal(receivingImgPath)}
        className="underline text-blue-600 cursor-pointer"
      >
        скриншот
      </span>{' '}
      с ценой товара, датой получения и статусом "Доставлен" из раздела Покупки и прикрепи в отчёт
    </p>

                <p>✂️ Разрежь штрихкод</p>
                <p>📸 Сфотографируй его на фоне товара и прикрепи{' '}
                          <span
        onClick={() => openModal(barcodeImgPath)}
        className="underline text-blue-600 cursor-pointer"
      >
        фото
      </span>{' '}
                     в отчёт
                </p>
                <p>⚠️ Важно: отправить отчет{' '}
                    <span className="underline">в день</span>{' '}
                    получения товара!</p>

                {/*<p>*/}
                {/*    <strong> Ваш кешбэк:</strong> {cashback} руб.*/}
                {/*</p>*/}
            </div>
            </div>

            <div className="flex items-center mb-4">
                <input
                    type="checkbox"
                    id="pickedUp"
                    className="mr-2 h-8 w-8"
                    checked={pickedUp}
                    onChange={handlePickedUpChange}
                />
                <label htmlFor="pickedUp" className="text-sm text-gray-700 mt-2">
                    Забрал(а) товар
                </label>
            </div>

            {pickedUp && (
                <>
                    <FileUploader
                        label="1. Скриншот статуса заказа в разделе 'Доставки' на WB"
                        file={file1}
                        preview={preview1}
                        onFileChange={setFile1}
                    />
                    <FileUploader
                        label="2. Фотография разрезанного штрихкода на фоне товара"
                        file={file2}
                        preview={preview2}
                        onFileChange={setFile2}
                    />
                </>
            )}

            <div className="flex flex-col gap-2 mb-2 mt-2">
                <button
                    onClick={handleContinue}
                    disabled={!canContinue}
                    className={`w-full py-2 rounded text-brand mb-4 ${canContinue ? 'bg-brand text-white' : 'bg-gray-200-400 border border-brand cursor-not-allowed'}`}
                >
                    Продолжить
                </button>
            </div>

            <div className="space-y-4">

                {videos.map(({id, title, src}) => (
                    <div key={id} className="bg-white rounded-lg shadow p-4">
                        <button
                            className="text-base font-medium mb-2 block text-blue-600 hover:underline"
                            onClick={() => setOpenSrc(src)}
                        >
                            {title}
                        </button>
                    </div>
                ))}


                <div className="flex flex-col gap-3 mt-4">
                    <button
                        onClick={() => setShowReport(prev => !prev)}
                        className="bg-white border border-darkGray rounded-lg p-3 text-sm font-semibold flex items-center justify-center"
                    >
                        {showReport ? 'Скрыть отчет' : 'Открыть отчет'}
                    </button>

                    {showReport && (
                        <div className="bg-white rounded-lg shadow p-4 mb-4">
                            <h3 className="text-lg font-bold mb-2">Отчёт по сделке выкупа товара</h3>
                            {reportData ? (
                                    <div className="space-y-2">
                                        {/* Шаг 1 */}
                                        <div className="bg-white rounded-lg shadow">
                                            <button
                                                onClick={() => toggleStep(1)}
                                                className="w-full flex justify-between items-center p-4 text-left"
                                            >
                                                <span className="font-semibold">Шаг 1. Скриншоты поиска и корзины</span>
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
                                                            <p className="text-sm font-semibold">Скриншот поискового запроса в WB</p>
                                                            <img
                                                                src={GetUploadLink(reportData.search_screenshot_path)}
                                                                alt="Скриншот поискового запроса в WB"
                                                                className="mt-1 w-full rounded"
                                                            />
                                                        </div>
                                                    )}
                                                    {reportData.cart_screenshot_path && (
                                                        <div>
                                                            <p className="text-sm font-semibold">Скриншот корзины в WB</p>
                                                            <img
                                                                src={GetUploadLink(reportData.cart_screenshot_path)}
                                                                alt="Скриншот корзины в WB"
                                                                className="mt-1 w-full rounded"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Шаг 2 */}
                                        <div className="bg-white rounded-lg shadow">
                                            <button
                                                onClick={() => toggleStep(2)}
                                                className="w-full flex justify-between items-center p-4 text-left"
                                            >
                                                <span className="font-semibold"> Шаг 2. Артикул товара продавца</span>
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

                                        {/* Шаг 3 */}
                                        <div className="bg-white rounded-lg shadow">
                                            <button
                                                onClick={() => toggleStep(3)}
                                                className="w-full flex justify-between items-center p-4 text-left"
                                            >
                                                <span className="font-semibold">Шаг 3. Товар и бренд в избранное</span>
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
                                                    <p className="text-sm">Ваш товар и бренд успешно добавлены в
                                                        избранное.</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Шаг 4 */}
                                        <div className="bg-white rounded-lg shadow">
                                            <button
                                                onClick={() => toggleStep(4)}
                                                className="w-full flex justify-between items-center p-4 text-left"
                                            >
                                                <span className="font-semibold">Шаг 4. Реквизиты для перевода
                                            кешбэка</span>
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
                                                        <p className="text-sm">Номер телефона: {reportData.phone_number}</p>}
                                                    {reportData.name && <p className="text-sm">Получатель: {reportData.name}</p>}
                                                    {reportData.bank && <p className="text-sm">Банк: {reportData.bank}</p>}
                                                </div>
                                            )}
                                        </div>

                                        {/* Шаг 5 */}
                                        <div className="bg-white rounded-lg shadow">
                                            <button
                                                onClick={() => toggleStep(5)}
                                                className="w-full flex justify-between items-center p-4 text-left"
                                            >
                                                <span className="font-semibold">Шаг 5. Скриншот оформления заказа</span>
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
                                            {expandedSteps[5] && reportData.final_cart_screenshot && (
                                                <div className="border-t p-4">
                                                    <p className="text-sm font-semibold">Скриншот корзины в WB</p>
                                                    <img
                                                        src={GetUploadLink(reportData.final_cart_screenshot)}
                                                        alt="Финальный Скриншот корзины в WB"
                                                        className="w-full rounded"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-white rounded-lg shadow p-4 mt-4 space-y-2 text-sm">
                                            <div className="font-semibold text-black">Шаг 6. Скриншоты доставки и штрихкода</div>
                                            <div className="font-semibold text-gray-400">Шаг 7. Скриншот отзыва и эл.чека</div>
                                        </div>
                                    </div>

                                ) :
                                <p className="text-sm text-gray-500">Отчет пока пуст.</p>
                            }

                        </div>
                    )}
                    <button
                        onClick={() => navigate('/instruction')}
                        className="bg-white border border-darkGray rounded-lg p-3 text-sm font-semibold">
                        <span>Полная инструкция по выкупу товара</span>
                    </button>

                    <button
                        onClick={handleSupportClick}
                        className="bg-white border border-darkGray rounded-lg p-3 text-sm font-semibold flex items-center justify-center"
                    >
                        Нужна помощь
                    </button>
                    <button
                        onClick={handleHomeClick}
                        className="bg-white border border-darkGray rounded-lg p-3 text-sm font-semibold flex items-center justify-center"
                    >
                        На главную
                    </button>
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
                                    <video
                                        src={modalContent.src}
                                        controls
                                        className="w-[95%] h-[95%] object-contain"
                                    />
                                ) : (
                                    <img
                                        src={modalContent.src}
                                        alt="Пример"
                                        className="w-[95%] h-[95%] object-contain"
                                    />
                                )}
                            </div>
                        </div>
                    </>
                )}
                {openSrc && (
                    <VideoOverlay onClose={() => setOpenSrc(null)}>
                        <div
                            className="relative bg-black p-4 max-h-[100vh] max-w-[92vw] overflow-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Close */}
                            <button
                                className="absolute top-2 right-2 z-20 text-white text-2xl"
                                onClick={() => setOpenSrc(null)}
                                aria-label="Close"
                            >
                                &times;
                            </button>

                            <video
                                ref={videoRef}
                                src={openSrc}
                                controls
                                muted
                                playsInline
                                className="block mx-auto max-h-[88vh] max-w-[88vw] object-contain"
                            />
                        </div>
                    </VideoOverlay>
                )}


            </div>


        </div>

    );


}

export default ProductPickupPage;
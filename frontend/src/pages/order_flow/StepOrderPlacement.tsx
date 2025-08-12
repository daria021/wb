import React, {useEffect, useRef, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {getOrderById, getOrderReport, updateOrder} from '../../services/api';
import {AxiosResponse} from 'axios';
import GetUploadLink from "../../components/GetUploadLink";
import FileUploader from "../../components/FileUploader";
import {VideoOverlay} from "../../App";
import OrderHeader from "../../components/OrderHeader";


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


interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    article: string;
    image_path?: string;
    key_word?: string;
    wb_price: number;
    payment_time: string;
    shortDescription?: string;
    seller_id: string;
}

interface Order {
    id: string;
    product: Product;
    seller: User
    transaction_code: string;
}

interface User {
    nickname: string
}

type ModalContent = { src: string; isVideo: boolean };

function StepOrderPlacement() {
    const navigate = useNavigate();

    // 1) достаём сразу оба параметра
    const {orderId, stepNumber} = useParams<{ orderId: string; stepNumber: string }>();
    // приводим к числу

    const [isOrderPlaced, setIsOrderPlaced] = useState(false);
    // const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
    const [reportData, setReportData] = useState<OrderReport | null>(null);
    const [showReport, setShowReport] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});
    const [modalContent, setModalContent] = useState<ModalContent | null>(null);
    const orderImgPath = '/images/order.jpg';
    const location = useLocation();
    const cameFromOrders = Boolean(location.state?.fromOrders);
    const handleHomeClick = () => navigate('/');
    const [openSrc, setOpenSrc] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const openModal = (src: string) => {
        setModalContent({src, isVideo: src.endsWith('.mp4')});
    };
    const closeModal = () => setModalContent(null);

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

    const canContinue = isOrderPlaced && file;

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
                final_cart_screenshot_path: file,
            });
            navigate(`/order/${orderId}/step-6`);
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
            title: '🎥 Как загрузить скриншот в кешбэк-бот после оформления заказа и что делать, если товара продавца нет в наличии на WB при оформлении заказа',
            src: 'https://storage.googleapis.com/images_avocado/VideoCashback/9%20Buyer%20Step%205%20Place%20an%20order%20in%20words%20Attach%20a%20screenshot%20of%20the%20order%20If%20you%20place%20an%20order%20but%20run%20out%20of%20funds%2C%20proceed%20to%20step%206.MP4',
        },

    ];
    return (
        <div className="p-4 max-w-screen-md bg-gray-200 mx-auto">

            {cameFromOrders && (
                <div className="bg-green-50 border-l-4 border-green-500 text-green-800 p-4 mb-6 rounded">
                    <p className="font-semibold">
                        Вы остановились на пятом шаге.
                    </p>
                    <p>Можете продолжить выкуп.</p>
                </div>
            )}

            <div className="bg-white border border-brand rounded-md p-4 text-sm text-gray-700">
                <p className="text-xs text-gray-500"><strong>ВАЖНО!</strong> ВЫ ВСЕГДА МОЖЕТЕ ВЕРНУТЬСЯ К ЭТОМУ ШАГУ В РАЗДЕЛЕ "МОИ
                    ПОКУПКИ"</p>
                {order && <OrderHeader transactionCode={order.transaction_code} />}
                <div className="space-y-2">
                <h1 className="text-lg font-bold mb-4 text-brand">Шаг 5. Оформление заказа</h1>
                <p>📦 Закажи товар продавца на WB</p>
                    <p>📸 Сделай{' '}
      <span
        onClick={() => openModal(orderImgPath)}
        className="underline text-blue-600 cursor-pointer"
      >
        скриншот заказа
      </span>{' '}
                         с ЦЕНОЙ из раздела Доставки
    </p>

                <p>🧾 Загрузи скриншот в отчёт
                </p>
</div>
            </div>

            <div className="flex items-center mb-4">
                <input
                    type="checkbox"
                    id="orderPlaced"
                    checked={isOrderPlaced}
                    onChange={handleOrderPlacedChange}
                    className="mr-2 h-8 w-8"
                />
                <label htmlFor="orderPlaced" className="text-sm text-gray-700 mt-2">
                    Оформил(а) заказ
                </label>
            </div>

            {isOrderPlaced && (
                <FileUploader
                    label="1. Скриншот заказа на WB"
                    file={file}
                    preview={preview}
                    onFileChange={setFile}
                />
            )}
            <button
                onClick={handleContinue}
                disabled={!canContinue}
                className={`w-full py-2 rounded text-brand mb-2 mt-2 ${
                    canContinue
                        ? 'bg-brand text-white'
                        : 'bg-gray-200-400 border border-brand cursor-not-allowed'
                }`}
            >
                Продолжить
            </button>


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
                <div className="flex flex-col gap-3 mb-4 mt-4">
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
                                                            <p className="text-sm font-semibold">1. Скриншот поискового запроса в WB</p>
                                                            <img
                                                                src={GetUploadLink(reportData.search_screenshot_path)}
                                                                alt="Скриншот поискового запроса в WB"
                                                                className="mt-1 w-full rounded"
                                                            />
                                                        </div>
                                                    )}
                                                    {reportData.cart_screenshot_path && (
                                                        <div>
                                                            <p className="text-sm font-semibold">2. Скриншот корзины в WB</p>
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

                                        <div className="bg-white rounded-lg shadow p-4 mt-4 space-y-2 text-sm">
                                            <div className="font-semibold text-black">Шаг 5. Оформление заказа</div>
                                            <div className="font-semibold text-gray-400">Шаг 6. Скриншоты доставки и штрихкода</div>
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
                        Нужна помощь с выполнением шага
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
                        {/* Overlay */}
                        <div
                            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40"
                            onClick={closeModal}
                        />

                        {/* Centered modal */}
                        <div
                            className="fixed inset-0 flex items-center justify-center z-50"
                            onClick={closeModal}
                        >
                            <div
                                onClick={e => e.stopPropagation()}
                                className="
            relative
            bg-white
            rounded-lg
            overflow-hidden
            flex items-center justify-center
            p-4
            w-[90vw]      /* now 90% of viewport width */
            h-[90vh]      /* now 90% of viewport height */
            max-w-4xl     /* optional cap on very large screens */
            max-h-[90vh]
          "
                            >
                                {/* Close button */}
                                <button
                                    onClick={closeModal}
                                    className="absolute top-2 right-2 text-2xl text-gray-700 z-10"
                                >
                                    &times;
                                </button>

                                {/* Content (95% of modal box) */}
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

export default StepOrderPlacement;

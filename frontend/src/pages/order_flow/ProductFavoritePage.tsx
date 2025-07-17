import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {getOrderById, getOrderReport, updateOrder} from "../../services/api";
import {AxiosResponse} from 'axios';
import GetUploadLink from "../../components/GetUploadLink";

interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    article: string;
    image_path?: string;
    key_word?: string;
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

function ProductFavoritePage() {
    const navigate = useNavigate();
    const {orderId} = useParams<{ orderId: string }>();

    const [productFavorited, setProductFavorited] = useState(false);
    const [brandFavorited, setBrandFavorited] = useState(false);
    // кнопка активна только когда оба true
    const canContinue = productFavorited && brandFavorited;
    const [reportData, setReportData] = useState<OrderReport | null>(null);
    const [showReport, setShowReport] = useState(false);
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});
    const location = useLocation();
    const cameFromOrders = Boolean(location.state?.fromOrders);
    const handleHomeClick = () => navigate('/');

    const toggleStep = (step: number) => {
        setExpandedSteps(prev => ({...prev, [step]: !prev[step]}));
    };

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
                setReportData(response.data);
            })
            .catch((err) => {
                console.error('Ошибка при загрузке отчета:', err);
            });
    }, [orderId]);

    const handleContinue = async () => {
        if (!canContinue || !orderId) return;
        try {
            await updateOrder(orderId, {step: 3});
            navigate(`/order/${orderId}/step-4`);
        } catch (err) {
            console.error('Ошибка при обновлении заказа:', err);
        }
    };

    if (loading) {
        return <div className="p-4">Загрузка...</div>;
    }
    if (error || !order) {
        return <div className="p-4 text-red-600">{error || 'Заказ не найден'}</div>;
    }

    const handleChannelClick = () => {
        window.open('https://t.me/Premiumcash1', '_blank'); //todo
    };
    const handleSupportClick = () => {
        if (window.Telegram?.WebApp?.close) {
            window.Telegram.WebApp.close();
        }
        window.open(process.env.REACT_APP_SUPPORT_URL, '_blank');
    };


    return (
        <div className="p-4 max-w-screen-md bg-gray-200 mx-auto">

            {cameFromOrders && (
                <div className="bg-green-50 border-l-4 border-green-500 text-green-800 p-4 mb-6 rounded">
                    <p className="font-semibold">
                        Вы остановились на третьем шаге.
                    </p>
                    <p>Можете продолжить выкуп.</p>
                </div>
            )}

            <div className="bg-white border border-brand p-4 rounded-lg shadow mb-4 text-sm text-gray-700">
                <p className="text-xs text-gray-500">ВЫ ВСЕГДА МОЖЕТЕ ВЕРНУТЬСЯ К ЭТОМУ ШАГУ В РАЗДЕЛЕ "МОИ
                    ПОКУПКИ"</p>
                <h1 className="text-lg font-bold mb-4 text-brand">Шаг 3. Добавить товар в избранное</h1>
                <p className="mb-2">• Добавьте товар в избранное</p>
                <p className="mb-2">• Добавьте бренд в избранное</p>
            </div>

            <div className="flex flex-col items-start mb-4 space-y-4">
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={productFavorited}
                        onChange={e => setProductFavorited(e.target.checked)}
                        className="mr-2"
                    />
                    Добавил товар в избранное
                </label>
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={brandFavorited}
                        onChange={e => setBrandFavorited(e.target.checked)}
                        className="mr-2"
                    />
                    Добавил бренд в избранное
                </label>
            </div>

            <button
                onClick={handleContinue}
                disabled={!canContinue}
                className={`block w-full py-2 mb-4 rounded-lg text-brand font-semibold text-center ${
                    canContinue ? 'bg-brand text-white' : 'bg-gray-200-400 border border-brand cursor-not-allowed'
                }`}
            >
                Продолжить
            </button>


            <div className="mb-4">
                <div className="w-full aspect-[3/4] bg-gray-200-100 rounded overflow-hidden relative">
                    {order!.product.image_path ? (
                        <img
                            src={
                                order!.product.image_path.startsWith('http')
                                    ? order!.product.image_path
                                    : GetUploadLink(order!.product.image_path)
                            }
                            alt={order!.product.name}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                            Нет фото
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow mb-4">
                <p className="text-base font-medium mb-2">Добавление товара и бренда в избранное на вб.<br/>
                    Отметка галочек.<br/>
                    Скрин не нужен.
                </p>
                <div className="bg-black" style={{aspectRatio: '16/9'}}>
                    <video
                        title="Инструкция"
                        src="https://storage.googleapis.com/images_avocado/VideoCashback/7%20Buyer%20Step%203%20Adding%20a%20product%20and%20brand%20to%20your%20favorites%20on%20the%20WB%20website%20Checking%20the%20boxes%20You%20do%20not%20need%20a%20screenshot.%20Proceed%20to%20Step%204.MP4"
                        controls
                        className="w-full h-full"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-3 mb-4">
                <button
                    onClick={() => setShowReport(prev => !prev)}

                    className="bg-white border border-darkGray rounded-lg p-3 text-sm font-semibold flex items-center justify-center"
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

                                <div className="bg-white rounded-lg shadow p-4 mt-4 space-y-2 text-sm">
                                    <div className="font-semibold text-black">Шаг 3. Добавить товар в избранное
                                    </div>
                                    <div className="font-semibold text-gray-400">Шаг 4. Реквизиты для перевода кешбэка
                                    </div>
                                    <div className="font-semibold text-gray-400">Шаг 5. Оформление заказа</div>
                                    <div className="font-semibold text-gray-400">Шаг 6. Получение товара</div>
                                    <div className="font-semibold text-gray-400">Шаг 7. Отзыв</div>
                                </div>


                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">Отчет пока пуст.</p>
                        )}
                    </div>

                )}
                <button
                    onClick={handleSupportClick}
                    className="bg-white border border-darkGray rounded-lg p-3 text-sm font-semibold flex items-center justify-center"
                >
                    Нужна помощь с выполнением шага
                </button>
                <button
                    onClick={handleChannelClick}
                    className="bg-white border border-darkGray rounded-lg p-3 text-sm font-semibold flex items-center justify-center"
                >
                    <img src="/icons/telegram.png" alt="Telegram" className="w-6 h-6"/>
                    <span>Подписаться на канал</span>
                </button>

                <button
                    onClick={handleHomeClick}
                    className="bg-white border border-darkGray rounded-lg p-3 text-sm font-semibold flex items-center justify-center"
                >
                    На главную
                </button>
            </div>

        </div>
    );
}

export default ProductFavoritePage;

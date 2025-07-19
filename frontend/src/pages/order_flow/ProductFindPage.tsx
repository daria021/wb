import React, {useEffect, useRef, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {AxiosResponse} from 'axios';
import {getOrderById, getOrderReport, updateOrder} from "../../services/api";
// import {on} from "@telegram-apps/sdk";
import GetUploadLink from "../../components/GetUploadLink";
import {VideoOverlay} from "../../App";

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
}

function ProductFindPage() {
    const {orderId} = useParams<{ orderId: string }>();
    const navigate = useNavigate();

    const [order, setOrder] = useState<Order | null>(null);
    const [reportData, setReportData] = useState<OrderReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [enteredArticle, setEnteredArticle] = useState('');
    const [articleStatus, setArticleStatus] = useState<'correct' | 'wrong' | ''>('');
    const [showReport, setShowReport] = useState(false);
    const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});
    const location = useLocation();
    const cameFromOrders = Boolean(location.state?.fromOrders);
    const handleHomeClick = () => navigate('/');
    const [openSrc, setOpenSrc] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

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
        if (!order) return;
        const val = enteredArticle.trim();
        if (val === '') {
            setArticleStatus('');
        } else if (val === order.product.article) {
            setArticleStatus('correct');
        } else {
            setArticleStatus('wrong');
        }
    }, [enteredArticle, order]);

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

    const toggleStep = (step: number) => {
        setExpandedSteps(prev => ({...prev, [step]: !prev[step]}));
    };


    const canContinue = articleStatus === 'correct';

    const handleContinue = async () => {
        if (!canContinue || !orderId) return;
        try {
            await updateOrder(orderId, {step: 2});
            navigate(`/order/${orderId}/step-3`);
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


    const videos = [
        {
            id: 1,
            title: '🎥 Как искать товар продавца и использовать фильтры поиска в WB, как искать и проверять артикул товара',
            src: 'https://storage.googleapis.com/images_avocado/VideoCashback/5%20Buyer%20Step%202%20Explanation%20of%20the%20conditions%20Go%20to%20the%20WB%2C%20search%20for%20a%20product%2C%20use%20the%20search%20filter%2C%20where%20the%20article%20number%20is%20located%20Go%20to%20the%20bot%20Check%20the%20article%20number%20(the%20article%20number%20is%20correct).MP4',
        },
        {
            id: 2,
            title: '🎥 Пояснение про ситуацию, когда товара нет в наличии на WB',
            src: 'https://storage.googleapis.com/images_avocado/VideoCashback/6%20Buyer%20Step%202%20If%20the%20SKU%20is%20incorrect%20Explanation%20about%20the%20situation%20when%20the%20product%20is%20not%20available%20on%20the%20WB%20and%20the%20redemption%20limit%20Step%203.MP4',
        },
    ];

    return (
        <div className="p-4 max-w-screen-md bg-gray-200 mx-auto">
            {cameFromOrders && (
                <div className="bg-green-50 border-l-4 border-green-500 text-green-800 p-4 mb-6 rounded">
                    <p className="font-semibold">
                        Вы остановились на втором шаге.
                    </p>
                    <p>Можете продолжить выкуп.</p>
                </div>
            )}
            <div className="bg-white border border-brand p-4 rounded-lg shadow mb-4 space-y-2">
                <p className="text-xs text-gray-500"><strong>ВАЖНО!</strong> ВЫ ВСЕГДА МОЖЕТЕ ВЕРНУТЬСЯ К ЭТОМУ ШАГУ В
                    РАЗДЕЛЕ "МОИ ПОКУПКИ".</p>
                <h2 className="text-lg font-bold mb-2 text-brand">Шаг 2. Найдите товар раздачи в WB</h2>
                <p>1) Найдите товар для выкупа на сайте или в приложении WB, используя предоставленное изображение.
                    Для вашего удобства можете использовать функцию поиска по фотографии.
                </p>
                <p>
                    2) Скопируйте артикул товара продавца и вставьте его в поле для проверки.
                    Если артикул неверный, система не пропустит вас дальше, вы нашли не тот товар продавца в WB.
                    Используйте фильтры по цене, цвету, бренду и другим параметрам для ускорения поиска.
                </p>
            </div>

            <div className="mb-4">
                <label htmlFor="articleInput" className="block text-sm font-medium mb-1">
                    Артикул товара продавца в WB
                </label>
                <input
                    id="articleInput"
                    type="text"
                    value={enteredArticle}
                    onChange={e => setEnteredArticle(e.target.value)}
                    placeholder="Введите артикул..."
                    className={`
    rounded-md p-2 w-full text-sm border transition-colors duration-200
    ${
                        articleStatus === 'correct'
                            ? 'border-green-500'
                            : articleStatus === 'wrong'
                                ? 'border-red-500'
                                : 'border-gray-300'
                    }
  `}
                />

                {articleStatus && (
                    <p className={`mt-2 text-sm font-semibold ${
                        articleStatus === 'correct' ? 'text-green-600' : 'text-red-600'
                    }`}>
                        {articleStatus === 'correct' ? 'Артикул правильный' : 'Артикул неверный'}
                    </p>
                )}
            </div>
            <button
                onClick={handleContinue}
                disabled={!canContinue}
                className={`w-full py-2 mb-4 rounded-lg text-brand border border-brand font-semibold text-center ${
                    canContinue ? 'bg-brand text-white hover:bg-brand' : 'bg-gray-200-400 border border-brand cursor-not-allowed'
                }`}
            >
                Продолжить
            </button>
            <button
                onClick={() => navigate(`/black-list/${order.seller.nickname}`)}
                className="w-full flex-1 bg-white text-gray-700 mb-4 py-2 rounded-lg border border-brand text-center"
            >
                Проверить продавца
            </button>

            <div className="mb-4">
                <div className="w-full aspect-[3/4] bg-gray-200-100 rounded overflow-hidden relative">
                    {order.product!.image_path ? (
                        <img
                            src={
                                order.product!.image_path.startsWith('http')
                                    ? order.product!.image_path
                                    : GetUploadLink(order.product!.image_path)
                            }
                            alt={order.product!.name}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                            Нет фото
                        </div>
                    )}
                </div>
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
                                                        <p className="text-sm font-semibold">Скрин поискового
                                                            запроса</p>
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


                                    <div className="bg-white rounded-lg shadow p-4 mt-4 space-y-2 text-sm">
                                        <div className="font-semibold text-black">Шаг 2. Найдите наш товар
                                        </div>
                                        <div className="font-semibold text-gray-400">Шаг 3. Добавить товар в избранное
                                        </div>
                                        <div className="font-semibold text-gray-400">Шаг 4. Реквизиты для перевода
                                            кешбэка
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
                        onClick={() => navigate('/instruction')}
                        className="bg-white border border-darkGray rounded-lg p-3 text-sm font-semibold">
                        <span>Полная инструкция выкупа товара</span>
                    </button>
                    <button
                        onClick={handleSupportClick}
                        className="bg-white border border-darkGray rounded-lg p-3 text-sm font-semibold">
                        Нужна помощь с выполнением шага
                    </button>

                    <button
                        onClick={handleHomeClick}
                        className="bg-white border border-darkGray rounded-lg p-3 text-sm font-semibold flex items-center justify-center"
                    >
                        На главную
                    </button>

                </div>
            </div>
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

    );

}

export default ProductFindPage;

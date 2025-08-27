import React, {useEffect, useRef, useState, useTransition} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {getOrderById, getOrderReport, updateOrder, updateOrderStatus} from "../../services/api";
import {AxiosResponse} from 'axios';
import GetUploadLink from "../../components/GetUploadLink";
import {VideoOverlay} from "../../App";
import OrderHeader from "../../components/OrderHeader";


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
    const [openSrc, setOpenSrc] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [, startT] = useTransition();
const lastClickRef = useRef(0);
const [sending, setSending] = useState(false);


    const toggleStep = (step: number) => {
        setExpandedSteps(prev => ({...prev, [step]: !prev[step]}));
    };

 const handleCancelOrder = async (orderId: string) => {
  try {
    const formData = new FormData();
    formData.append("status", "cancelled");
    await updateOrderStatus(orderId, formData);
  } catch (err) {
    console.error("Ошибка отмены заказа:", err);
  } finally {
    navigate('/catalog', { replace: true });
  }
};


            useEffect(() => {
  if (productFavorited && brandFavorited) {
    import(/* webpackPrefetch: true */ './PaymentDetailsPage').catch(() => {});
  }
}, [productFavorited, brandFavorited]);



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

    const handleContinue = () => {
  if (!canContinue || !orderId) return;

  const now = performance.now();
  if (now - lastClickRef.current < 250 || sending) return;
  lastClickRef.current = now;
  setSending(true);

  startT(() => navigate(`/order/${orderId}/step-4`)); // мгновенно уходим

  queueMicrotask(async () => {
    try {
      await updateOrder(orderId, { step: 3 });
    } catch (err) {
      console.error('Фоновое обновление шага 3 упало:', err);
    } finally {
      setSending(false);
    }
  });
};


    if (loading) {
        return <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-gray-600 always-spin"/>
            </div>;
    }
    if (error || !order) {
        return <div className="p-4 text-red-600">{error || 'Заказ не найден'}</div>;
    }

    // const handleChannelClick = () => {
    //     window.open('https://t.me/Premiumcash1', '_blank'); //todo
    // };
    const handleSupportClick = () => {
        if (window.Telegram?.WebApp?.close) {
            window.Telegram.WebApp.close();
        }
        window.open(process.env.REACT_APP_SUPPORT_URL, '_blank');
    };


    const videos = [
        {
            id: 1,
            title: '🎥 Как добавить товар и бренд продавца в избранное WB',
            src: 'https://storage.googleapis.com/images_avocado/VideoCashback/7%20Buyer%20Step%203%20Adding%20a%20product%20and%20brand%20to%20your%20favorites%20on%20the%20WB%20website%20Checking%20the%20boxes%20You%20do%20not%20need%20a%20screenshot.%20Proceed%20to%20Step%204.MP4',
        },

    ];
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

            <div className="bg-white border border-brand p-4 rounded-lg shadow text-sm text-gray-700">
                <p className="text-xs text-gray-500"><strong>ВАЖНО!</strong> ВЫ ВСЕГДА МОЖЕТЕ ВЕРНУТЬСЯ К ЭТОМУ ШАГУ В
                    РАЗДЕЛЕ "МОИ
                    ПОКУПКИ"</p>
                {order && <OrderHeader transactionCode={order.transaction_code} />}

                <h1 className="text-lg font-bold mb-4 text-brand">Шаг 3. Добавление товара в избранное</h1>
                <p className="mb-2">⭐ Добавь товар и бренд продавца в избранное на WB</p>
            </div>

            <div className="flex flex-col items-start mb-4 mt-2 space-y-4">
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={productFavorited}
                        onChange={e => setProductFavorited(e.target.checked)}
                        className="mr-2 h-8 w-8"
                    />
                    Добавил(a) товар в избранное WB
                </label>
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={brandFavorited}
                        onChange={e => setBrandFavorited(e.target.checked)}
                        className="mr-2 h-8 w-8"
                    />
                    Добавил(a) бренд в избранное WB
                </label>
            </div>

            <button
  onPointerUp={handleContinue}
  disabled={!canContinue}
  className={`block w-full py-2 mb-2 rounded-lg text-brand font-semibold text-center ${
    canContinue ? 'bg-brand text-white' : 'bg-gray-200-400 border border-brand cursor-not-allowed'
  } ${sending ? 'opacity-90' : ''}`}
>
  {sending ? 'Продолжаем…' : 'Продолжить'}
</button>

                  <button
  onClick={() => handleCancelOrder(order.id)}
                className="w-full flex-1 bg-white text-gray-700 mb-2 mt-2 py-2 rounded-lg border border-brand text-center"

            >
                Отменить выкуп товара
            </button>
            <button
                onClick={() => navigate(`/black-list/${order.seller.nickname}`)}
                className="w-full flex-1 bg-white text-gray-700 mb-4 py-2 rounded-lg border border-brand text-center"
            >
                Проверить продавца
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

                <div className="flex flex-col gap-3 mb-4">
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

                                    <div className="bg-white rounded-lg shadow p-4 mt-4 space-y-2 text-sm">
                                        <div className="font-semibold text-black">Шаг 3. Товар и бренд добавлены в избранное
                                        </div>
                                        <div className="font-semibold text-gray-400">Шаг 4. Реквизиты для перевода
                                            кешбэка
                                        </div>
                                        <div className="font-semibold text-gray-400">Шаг 5. Оформление заказа</div>
                                        <div className="font-semibold text-gray-400">Шаг 6. Скриншоты доставки и штрихкода</div>
                                        <div className="font-semibold text-gray-400">Шаг 7. Скриншот отзыва и эл.чека</div>
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

export default ProductFavoritePage;

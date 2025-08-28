import React, {useEffect, useRef, useState, useTransition} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {getOrderById, getProductById, updateOrder, updateOrderStatus} from '../../services/api';
import {useUser} from '../../contexts/user';
import {AxiosResponse} from 'axios';
import FileUploader from "../../components/FileUploader";
import {VideoOverlay} from '../../App';
import {OrderStatus} from '../../enums';
import OrderHeader from "../../components/OrderHeader";

interface Product {
    id: string;
    article: string;
    key_word: string;
    seller_id: string;
}

interface User {
    id: string;
    nickname: string;
}

interface Order {
    id: string;
    transaction_code: string;
    product: Product;
    user: User;
    seller: User;
    status: OrderStatus;
    step: number;
    created_at: string;
}


function CartScreenshotPage() {
    // const {productId} = useParams<{ productId: string }>();
    const navigate = useNavigate();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [file1, setFile1] = useState<File | null>(null);
    const [preview1, setPreview1] = useState<string | null>(null);
    const {orderId} = useParams<{ orderId: string }>();

    const [, startT] = useTransition();


    const lastClickRef = useRef(0);
    const [sending, setSending] = useState(false); // без визуального дизейбла

    const [file2, setFile2] = useState<File | null>(null);
    const [preview2, setPreview2] = useState<string | null>(null);
    const {user, loading: userLoading} = useUser();
    const location = useLocation();
    const cameFromOrders = Boolean(location.state?.fromOrders);
    const handleHomeClick = () => navigate('/');
    const [showReport, setShowReport] = useState(false);
    const [openSrc, setOpenSrc] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [order, setOrder] = useState<Order | null>(null);


    useEffect(() => {
        if (file1 && file2) {
            // префетч следующей страницы
            import(/* webpackPrefetch: true */ './ProductFindPage');
        }
    }, [file1, file2]);


    useEffect(() => {
        if (!orderId) {
            console.log(`orderId ${orderId}`);
            return;
        }
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
        if (!file1) {
            return setPreview1(null);
        }
        const url = URL.createObjectURL(file1);
        setPreview1(url);
        return () => URL.revokeObjectURL(url);
    }, [file1]);

    // создаём preview URL для file2
    useEffect(() => {
        if (!file2) {
            return setPreview2(null);
        }
        const url = URL.createObjectURL(file2);
        setPreview2(url);
        return () => URL.revokeObjectURL(url);
    }, [file2]);

    const canContinue = Boolean(file1 && file2);

    useEffect(() => {
        if (!order?.product.id) return;
        getProductById(order.product.id)
            .then((response: AxiosResponse<Product>) => {
                setProduct(response.data);
            })
            .catch((err) => {
                console.error('Ошибка при загрузке товара:', err);
                setError('Не удалось загрузить данные о товаре');
            })
            .finally(() => setLoading(false));
    }, [order]);

    const handleContinue = () => {
        if (!canContinue || !orderId) return;

        // мягкая защита от «дребезга» / двойных тапов
        const now = performance.now();
        if (now - lastClickRef.current < 250 || sending) return;
        lastClickRef.current = now;
        setSending(true);

        // 1) мгновенно уходим на следующий экран
        const nextUrl = `/order/${orderId}/step-2`;
        startT(() => navigate(nextUrl));

        // 2) отправку делаем в фоне — без await
        queueMicrotask(async () => {
            try {
                await updateOrder(orderId, {
                    step: 1,
                    search_screenshot_path: file1!,
                    cart_screenshot_path: file2!,
                });
            } catch (e) {
                // необязательно, но можно показать тост и предложить ретрай из шапки Step-2
                console.error('Фоновая отправка шага 1 упала', e);
            } finally {
                setSending(false);
            }
        });
    };


    if (loading || error || !product) {
        return <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-gray-600 always-spin"/>
        </div>;
    }


    const handleCancelOrder = async (orderId: string) => {
        try {
            const fd = new FormData();
            fd.append('status', 'cancelled');
            await updateOrderStatus(orderId, fd);
        } catch (err) {
            console.error('Ошибка отмены заказа:', err);
        } finally {
            navigate('/catalog', {replace: true});
        }
    };


    const handleSupportClick = () => {
        if (window.Telegram?.WebApp?.close) {
            window.Telegram.WebApp.close();
        }
        window.open(process.env.REACT_APP_SUPPORT_URL, '_blank');
    };


    if (userLoading) {
        return <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-gray-600 always-spin"/>
        </div>;
    }

    const videos = [
        {
            id: 1,
            title: '🎥 Пояснение, что нужно сделать на данном этапе.',
            src: 'https://storage.googleapis.com/images_avocado/VideoCashback/2%20Buyer%20Step%201%20Explanation%20of%20what%20needs%20to%20be%20done%2C%20transition%20to%20the%20website.MP4',
        },
        {
            id: 2,
            title: '🎥 Как искать товар выкупа по ключевому слову на WB и сделать скриншоты. Важно! Не ищите товар продавца из кешбэк-бота на этом этапе.',
            src: 'https://storage.googleapis.com/images_avocado/VideoCashback/3%20Buyer%20Step%201%20Search%20for%20a%20product%20by%20keyword%20in%20the%20WB%2C%20take%20screenshots%2C%20and%20return%20to%20the%20bot.MP4',
        },
        {
            id: 3,
            title: '🎥 Как загрузить скриншоты в кешбэк-бот',
            src: 'https://storage.googleapis.com/images_avocado/VideoCashback/4%20Buyer%20Step%201%20Uploading%20screenshots%2C%20moving%20on%20to%20Step%202.MP4',
        },
    ];

    return (
        <div className="p-4 max-w-screen-md bg-gray-200 mx-auto space-y-4 relative">
            {cameFromOrders && (
                <div className="bg-green-50 border-l-4 border-green-500 text-green-800 p-4 mb-6 rounded">
                    <p className="font-semibold">
                        Вы остановились на первом шаге.
                    </p>
                    <p>Можете продолжить выкуп.</p>
                </div>
            )}
            <div className="bg-white border border-brand rounded-lg shadow p-4 text-sm text-gray-700 space-y-2">

                {order && <OrderHeader transactionCode={order.transaction_code}/>}

                <h2 className="text-lg font-semibold top-10 text-brand">Шаг 1. Поиск товара по ключевому слову</h2>

                <p>🔍 Найди товары по ключевому слову на WB (НЕ товар кешбэк-продавца!)</p>
                <p>🛒 Добавь несколько конкурентов в корзину WB</p>
                <p>📸 Сделай скриншоты и прикрепи в отчёт</p>

                <p>
                    Ключевое слово для поиска: <strong>{product.key_word}</strong>
                </p>
            </div>

            <FileUploader
                label="1. Скриншот поискового запроса в WB"
                file={file1}
                preview={preview1}
                onFileChange={setFile1}
            />
            <FileUploader
                label="2. Скриншот корзины в WB"
                file={file2}
                preview={preview2}
                onFileChange={setFile2}
            />

            <button
                onPointerUp={handleContinue}
                disabled={!canContinue}
                className={`w-full py-2 rounded-lg text-brand font-semibold ${
                    canContinue ? 'bg-brand hover:bg-brand text-white' : 'bg-gray-200-400 border border-brand cursor-not-allowed'
                } ${sending ? 'opacity-90' : ''}`} // лёгкая подсказка, без блокировки
            >
                {sending ? 'Продолжаем…' : 'Продолжить'}
            </button>

            {orderId ? (
                <button
                    onClick={() => handleCancelOrder(orderId)}
                    className="w-full flex-1 bg-white text-gray-700 mb-2 mt-2 py-2 rounded-lg border border-brand text-center"
                >
                    Отменить выкуп товара
                </button>
            ) : null}

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

                            <div className="bg-white rounded-lg shadow p-4 mt-4 space-y-2 text-sm">
                                <div className="font-semibold text-gray-400">Шаг 1. Скриншоты поиска и корзины
                                </div>
                                <div className="font-semibold text-gray-400"> Шаг 2. Артикул товара продавца продавца
                                </div>
                                <div className="font-semibold text-gray-400">Шаг 3. Товар и бренд добавлены в избранное
                                </div>
                                <div className="font-semibold text-gray-400">Шаг 4. Реквизиты для получения кешбэка
                                </div>
                                <div className="font-semibold text-gray-400">Шаг 5. Оформление заказа</div>
                                <div className="font-semibold text-gray-400">Шаг 6. Скриншоты доставки и штрихкода</div>
                                <div className="font-semibold text-gray-400">Шаг 7. Скриншот отзыва и эл.чека</div>
                            </div>


                        </div>


                    )}
                    <button
                        onClick={() => navigate('/instruction')}
                        className="bg-white border border-darkGray rounded-lg p-3 text-sm font-semibold">
                        <span>Полная инструкция по выкупу товара</span>
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

export default CartScreenshotPage;

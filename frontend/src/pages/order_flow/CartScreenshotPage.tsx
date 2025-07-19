import React, {useEffect, useRef, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {createOrder, getProductById} from '../../services/api';
import {useUser} from '../../contexts/user';
import {AxiosResponse} from 'axios';
import FileUploader from "../../components/FileUploader";
import {VideoOverlay} from '../../App';

interface Product {
    id: string;
    article: string;
    key_word: string;
    seller_id: string;
}

function CartScreenshotPage() {
    const {productId} = useParams<{ productId: string }>();
    const navigate = useNavigate();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [file1, setFile1] = useState<File | null>(null);
    const [preview1, setPreview1] = useState<string | null>(null);

    const [file2, setFile2] = useState<File | null>(null);
    const [preview2, setPreview2] = useState<string | null>(null);
    const {user, loading: userLoading} = useUser();
    const location = useLocation();
    const cameFromOrders = Boolean(location.state?.fromOrders);
    const handleHomeClick = () => navigate('/');
    const [showReport, setShowReport] = useState(false);
    const [openSrc, setOpenSrc] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (!file1) {
            setPreview1(null);
            return;
        }
        const url = URL.createObjectURL(file1);
        setPreview1(url);
        return () => URL.revokeObjectURL(url);
    }, [file1]);

    // создаём preview URL для file2
    useEffect(() => {
        if (!file2) {
            setPreview2(null);
            return;
        }
        const url = URL.createObjectURL(file2);
        setPreview2(url);
        return () => URL.revokeObjectURL(url);
    }, [file2]);

    const canContinue = Boolean(file1 && file2);

    useEffect(() => {
        if (file2) {
            const url = URL.createObjectURL(file2);
            setPreview2(url);
            return () => URL.revokeObjectURL(url);
        }
        setPreview2(null);
    }, [file2]);


    useEffect(() => {
        if (!productId) return;
        getProductById(productId)
            .then((response: AxiosResponse<Product>) => {
                setProduct(response.data);
            })
            .catch((err) => {
                console.error('Ошибка при загрузке товара:', err);
                setError('Не удалось загрузить данные о товаре');
            })
            .finally(() => setLoading(false));
    }, [productId]);

    const handleContinue = async () => {
        if (!canContinue) return;
        try {
            if (!user) return;              // если профиль ещё не загрузился или неавторизован
            const formData = new FormData();
            formData.append('user_id', user.id);

            formData.append('step', '1');
            formData.append('seller_id', product!.seller_id);
            formData.append('product_id', productId || '');
            formData.append('search_query_screenshot', file1 as File);
            formData.append('cart_screenshot', file2 as File);

            const response = await createOrder(formData);
            const createdOrderId = response.data; // Ожидается, что backend вернет объект заказа с полем id

            navigate(`/order/${createdOrderId}/step-2`);
        } catch (err) {
            console.error('Ошибка при создании заказа', err);
        }
    };

    if (loading) {
        return <div className="p-4">Загрузка...</div>;
    }
    if (error || !product) {
        return <div className="p-4 text-red-600">{error || 'Товар не найден'}</div>;
    }

    const handleSupportClick = () => {
        if (window.Telegram?.WebApp?.close) {
            window.Telegram.WebApp.close();
        }
        window.open(process.env.REACT_APP_SUPPORT_URL, '_blank');
    };


    if (userLoading) {
        return <div className="p-4">Загрузка профиля…</div>;
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

                <h2 className="text-lg font-semibold top-10 text-brand">Шаг 1. Загрузите скриншоты поиска товара</h2>

                <p>1) Найдите товар выкупа по ключевому слову в поиске на сайте или в приложении WB. Сделайте скриншот
                    поискового запроса в WB.</p>
                <p>2) Добавьте несколько товаров конкурентов (разных брендов) в корзину WB. Сделайте скриншот корзины в
                    WB. <strong>Важно!</strong> Не ищите товар продавца из кешбэк-бота на этом этапе.</p>
                <p>3) Прикрепите скриншоты в отчет для получения кешбэка.</p>

                <p>
                    Ключевое слово для поиска: <strong>{product.key_word}</strong>
                </p>
            </div>


            <FileUploader
                label="1.Скриншот поискового запроса в WB"
                file={file1}
                preview={preview1}
                onFileChange={setFile1}
            />
            <FileUploader
                label="2.Скриншот корзины в WB"
                file={file2}
                preview={preview2}
                onFileChange={setFile2}
            />


            <button
                onClick={handleContinue}
                disabled={!canContinue}
                className={`w-full py-2 rounded-lg text-brand font-semibold ${
                    canContinue ? 'bg-brand hover:bg-brand text-white' : 'bg-gray-200-400 border border-brand cursor-not-allowed'
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

                            <div className="bg-white rounded-lg shadow p-4 mt-4 space-y-2 text-sm">
                                <div className="font-semibold text-gray-400">Шаг1. Скрины корзины
                                </div>
                                <div className="font-semibold text-gray-400">Шаг 2. Найдите наш товар
                                </div>
                                <div className="font-semibold text-gray-400">Шаг 3. Добавить товар в избранное
                                </div>
                                <div className="font-semibold text-gray-400">Шаг 4. Реквизиты для перевода кешбэка
                                </div>
                                <div className="font-semibold text-gray-400">Шаг 5. Оформление заказа</div>
                                <div className="font-semibold text-gray-400">Шаг 6. Получение товара</div>
                                <div className="font-semibold text-gray-400">Шаг 7. Отзыв</div>
                            </div>


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

export default CartScreenshotPage;

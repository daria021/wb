import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {createOrder, getProductById} from '../../services/api';
import {useUser} from '../../contexts/user';
import {AxiosResponse} from 'axios';
import FileUploader from "../../components/FileUploader";

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

    // для второго скрина
    const [file2, setFile2] = useState<File | null>(null);
    const [preview2, setPreview2] = useState<string | null>(null);
    const {user, loading: userLoading} = useUser();
    const location = useLocation();
    const cameFromOrders = Boolean(location.state?.fromOrders);


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

    const handleChannelClick = () => {
        window.open('https://t.me/Premiumcash1', '_blank'); //todo
    };

    if (userLoading) {
        return <div className="p-4">Загрузка профиля…</div>;
    }

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

                <h2 className="text-lg font-semibold top-10 text-brand">Шаг 1. Загрузите скриншоты по поиску товара</h2>

                <p>
                    <strong>ВАЖНО!</strong> Оформление заказа происходит только на 5-м шаге.
                </p>
                <p>
                    Сначала выполните поиск нашего товара по ключевому слову, затем добавьте несколько товаров в
                    корзину.
                </p>
                <p>
                    <strong>Сделайте два скриншота</strong>: первый – скриншот поискового запроса, второй – скриншот
                    корзины.
                </p>
                <p>
                    Ключевое слово: <strong>{product.key_word}</strong>
                </p>
            </div>


            <FileUploader
                label="1.Скриншот поискового запроса"
                file={file1}
                preview={preview1}
                onFileChange={setFile1}
            />
            <FileUploader
                label="2.Скриншот корзины"
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

            <div className="bg-white rounded-lg shadow p-4">
                <p className="text-base font-medium mb-2">Пояснение, что нужно сделать, переход на вб.</p>
                <div className="bg-black" style={{ aspectRatio: '16/9' }}>
        <video
                        title="Инструкция"
                        src="https://storage.googleapis.com/images_avocado/VideoCashback/2%20Buyer%20Step%201%20Explanation%20of%20what%20needs%20to%20be%20done%2C%20transition%20to%20the%20website.MP4"
                        controls
                        className="w-full h-full"
                    />
                </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
                <p className="text-base font-medium mb-2">Поиск товара по ключевому слову в вб, делаем скриншоты, возвращаемся в бота.</p>
                <div className="bg-black" style={{ aspectRatio: '16/9' }}>
        <video
                        title="Инструкция"
                        src="https://storage.googleapis.com/images_avocado/VideoCashback/3%20Buyer%20Step%201%20Search%20for%20a%20product%20by%20keyword%20in%20the%20WB%2C%20take%20screenshots%2C%20and%20return%20to%20the%20bot.MP4"
                        controls
                        className="w-full h-full"
                    />
                </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
                <p className="text-base font-medium mb-2">Загрузка скриншотов.</p>
                <div className="bg-black" style={{ aspectRatio: '16/9' }}>
        <video
                        title="Инструкция"
                        src="https://storage.googleapis.com/images_avocado/VideoCashback/4%20Buyer%20Step%201%20Uploading%20screenshots%2C%20moving%20on%20to%20Step%202.MP4"
                        controls
                        className="w-full h-full"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-3 mt-4 text-center">

                <button
                    onClick={handleSupportClick}
                    className="bg-white border border-darkGray rounded-lg p-3 text-sm font-semibold"
                >
                    Нужна помощь с выполнением шага
                </button>

                <button
                    onClick={handleChannelClick}
                    className="bg-white border border-darkGray rounded-lg p-3 text-sm font-semibold flex items-center
                    justify-center gap-2">
                    <img src="/icons/telegram.png" alt="Telegram" className="w-6 h-6"/>
                    <span>Подписаться на канал</span>
                </button>

            </div>

        </div>
    );
}

export default CartScreenshotPage;

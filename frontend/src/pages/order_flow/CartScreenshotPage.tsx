import React, {ChangeEvent, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {createOrder, getMe, getProductById} from '../../services/api';
import {AxiosResponse} from 'axios';
import {on} from "@telegram-apps/sdk";

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
    const [file2, setFile2] = useState<File | null>(null);

    const canContinue = Boolean(file1 && file2);

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
            const me = await getMe();
            const userId = me.id;
            const formData = new FormData();
            formData.append('user_id', userId);
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

    useEffect(() => {
        const removeBackListener = on('back_button_pressed', () => {
            navigate(`/product/${productId}/instruction`);
        });

        return () => {
            removeBackListener();
        };
    }, [productId, navigate]);

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
        window.open('https://t.me/grcashback', '_blank'); //todo
    };

    return (
        <div className="p-4 max-w-screen-md bg-gray-200 mx-auto space-y-4 relative">

            <div className="bg-brandlight rounded-lg shadow p-4 text-sm text-gray-700 space-y-2">
                <h2 className="text-lg font-semibold top-10">Шаг 1. Загрузите скрины</h2>

                <p>
                    <strong>ВАЖНО!</strong> Оформление заказа происходит только на 5-м шаге.
                </p>
                <p>
                    Сначала выполните поиск нашего товара по ключевому слову, затем добавьте несколько товаров в
                    корзину.
                </p>
                <p>
                    Сделайте два скрина: первый – скрин поискового запроса, второй – скрин корзины.
                </p>
                <p>
                    Ключевое слово: <strong>{product.key_word}</strong>
                </p>
            </div>

            <div className="flex flex-col gap-2 items-start px-4">
                <p className="uppercase text-xs text-gray-500">Скрин поискового запроса</p>
                <label
                    className="bg-brandlight text-brand py-2 px-4 rounded cursor-pointer hover:shadow-lg transition-shadow duration-200 text-sm flex items-center gap-2">
                    <img src="/icons/paperclip.png" alt="paperclip" className="h-4 w-4"/>
                    Выбрать файл
                    <input
                        accept="image/*"
                        className="hidden"
                        type="file"
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setFile1(e.target.files?.[0] || null)
                        }
                    />
                </label>
            </div>

            <div className="flex flex-col gap-2 items-start px-4">
                <p className="uppercase text-xs text-gray-500">Скрин корзины</p>
                <label
                    className="bg-brandlight text-brand py-2 px-4 rounded cursor-pointer hover:shadow-lg transition-shadow duration-200 text-sm flex items-center gap-2">

                    <img src="/icons/paperclip.png" alt="paperclip" className="h-4 w-4"/>
                    Выбрать файл
                    <input
                        accept="image/*"
                        className="hidden"
                        type="file"
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setFile2(e.target.files?.[0] || null)
                        }
                    />
                </label>
            </div>


            <button
                onClick={handleContinue}
                disabled={!canContinue}
                className={`w-full py-2 rounded-lg text-white font-semibold ${
                    canContinue ? 'bg-brand hover:bg-brand' : 'bg-gray-400 cursor-not-allowed'
                }`}
            >
                Продолжить
            </button>

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

            <div className="flex flex-col gap-3">
                <button
                    onClick={handleChannelClick}
                    className="bg-white border border-gray-300 rounded-lg p-3 text-sm font-semibold flex items-center gap-2 text-left">
                    <img src="/icons/telegram.png" alt="Telegram" className="w-6 h-6"/>
                    <span>Подписаться на канал</span>
                </button>
                <button
                    onClick={handleSupportClick}
                    className="bg-white border border-gray-300 rounded-lg p-3 text-sm font-semibold text-left"
                >
                    Нужна помощь
                </button>

            </div>
        </div>
    );
}

export default CartScreenshotPage;

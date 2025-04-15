import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {getOrderById, getOrderReport, updateOrder} from "../../services/api";
import {on} from "@telegram-apps/sdk";
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
    // Другие поля заказа, если необходимо
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

    const [addedToFavorite, setAddedToFavorite] = useState(false);
    const [reportData, setReportData] = useState<OrderReport | null>(null);
    const [showReport, setShowReport] = useState(false);
    const canContinue = addedToFavorite;
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const removeBackListener = on('back_button_pressed', () => {
            navigate(`/order/${orderId}/step-2`);
        });
        return () => {
            removeBackListener();
        };
    }, [orderId, navigate]);

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
        window.open('https://t.me/grcashback', '_blank'); //todo
    };
    const handleSupportClick = () => {
        if (window.Telegram?.WebApp?.close) {
            window.Telegram.WebApp.close();
        }
        window.open(process.env.REACT_APP_SUPPORT_URL, '_blank');
    };


    return (
        <div className="p-4 max-w-screen-md bg-gray-200 mx-auto">

            <div className="bg-brandlight p-4 rounded-lg shadow mb-4 text-sm text-gray-700">
                <h1 className="text-lg font-bold mb-4">Шаг 3. Добавить товар в избранное</h1>
                <p className="mb-2">• Добавьте товар в избранное</p>
                <p className="mb-2">• Добавьте бренд в избранное</p>
            </div>

            <div className="flex items-center mb-4">
                <input
                    type="checkbox"
                    id="favoriteCheckbox"
                    checked={addedToFavorite}
                    onChange={(e) => setAddedToFavorite(e.target.checked)}
                    className="mr-2"
                />
                <label htmlFor="favoriteCheckbox" className="text-sm text-gray-700">
                    Добавил товар в избранное
                </label>
            </div>

            <button
                onClick={handleContinue}
                disabled={!canContinue}
                className={`block w-full py-2 mb-4 rounded-lg text-white font-semibold text-center ${
                    canContinue ? 'bg-brand hover:bg-brand' : 'bg-gray-400 cursor-not-allowed'
                }`}
            >
                Продолжить
            </button>


            <div className="mb-4">
                <div className="w-full aspect-[3/4] bg-gray-100 rounded overflow-hidden relative">
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

            <div className="flex flex-col gap-3 mt-4">
                <button
                    onClick={() => setShowReport(prev => !prev)}
                    className="w-full py-2 mb-4 rounded-lg bg-white border border-brand text-gray-600 font-semibold text-center"
                >
                    {showReport ? 'Скрыть отчет' : 'Открыть отчет'}
                </button>

                {showReport && (
                    <div className="bg-white rounded-lg shadow p-4 mb-4">
                        <h3 className="text-lg font-bold mb-2">Отчет</h3>
                        {reportData ? (
                            <div>
                                {reportData.search_screenshot_path && (
                                    <div className="mb-3">
                                        <p className="text-sm font-semibold">Шаг 1. Скрин поискового запроса</p>
                                        <img
                                            src={GetUploadLink(reportData.search_screenshot_path)}
                                            alt="Скрин поискового запроса"
                                            className="mt-1 w-full rounded"
                                        />
                                    </div>
                                )}
                                {reportData.cart_screenshot_path && (
                                    <div className="mb-3">
                                        <p className="text-sm font-semibold">Скрин корзины</p>
                                        <img
                                            src={GetUploadLink(reportData.cart_screenshot_path)}
                                            alt="Скрин корзины"
                                            className="mt-1 w-full rounded"
                                        />
                                    </div>
                                )}
                                {reportData.article && (

                                    <div className="mb-3">
                                        <p className="text-sm font-semibold">Шаг 2. Артикул товара</p>
                                        <p className="text-sm">{reportData.article}</p>
                                    </div>

                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">Отчет пока пуст.</p>
                        )}
                    </div>
                )}
                <button
                    onClick={handleChannelClick}
                    className="bg-white border border-gray-300 rounded-lg p-3 text-sm font-semibold flex items-center gap-2 text-left">
                    <img src="/icons/telegram.png" alt="Telegram" className="w-6 h-6"/>
                    <span>Подписаться на канал</span>
                </button>
                <button
                    onClick={handleSupportClick}
                    className="bg-white border border-gray-300 rounded-lg p-3 text-sm font-semibold text-left">
                    Нужна помощь
                </button>
            </div>
        </div>
    );
}

export default ProductFavoritePage;

import React, { useEffect, useState, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AxiosResponse } from 'axios';
import { getOrderById, updateOrder, getOrderReport } from "../../services/api";
import { on } from "@telegram-apps/sdk";

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
    // другие поля заказа...
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
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();

    const [order, setOrder] = useState<Order | null>(null);
    const [reportData, setReportData] = useState<OrderReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [enteredArticle, setEnteredArticle] = useState('');
    const [articleStatus, setArticleStatus] = useState('');
    const [showReport, setShowReport] = useState(false);

    // Загружаем заказ
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

    // Загружаем отчет с сервера
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

    // Проверяем, совпадает ли введённый артикул с артикулом товара
    useEffect(() => {
        if (!order) return;
        if (enteredArticle.trim() === order.product.article) {
            setArticleStatus('Артикул правильный');
        } else {
            setArticleStatus('');
        }
    }, [enteredArticle, order]);

    const canContinue = articleStatus === 'Артикул правильный';

    const handleContinue = async () => {
        if (!canContinue || !orderId) return;
        try {
            await updateOrder(orderId, { step: 2 });
            navigate(`/order/${orderId}/step-3`);
        } catch (err) {
            console.error('Ошибка при обновлении заказа:', err);
        }
    };

    // Слушатель для кнопки "Назад" (например, в Telegram Mini App)
    useEffect(() => {
        const removeBackListener = on('back_button_pressed', () => {
            if (!orderId) return;
            getOrderById(orderId)
                .then((response: AxiosResponse<Order>) => {
                    const productId = response.data.product.id;
                    navigate(`/product/${productId}/step-1`);
                })
                .catch((err) => {
                    console.error('Ошибка при загрузке заказа:', err);
                    setError('Не удалось загрузить заказ');
                });
        });
        return () => removeBackListener();
    }, [orderId, navigate]);

    if (loading) {
        return <div className="p-4">Загрузка...</div>;
    }
    if (error || !order) {
        return <div className="p-4 text-red-600">{error || 'Заказ не найден'}</div>;
    }

    const { product } = order;

    return (
        <div className="p-4 max-w-screen-md bg-gray-200 mx-auto">
            {/* Инструкция по поиску товара */}
            <div className="bg-brandlight p-4 rounded-lg shadow mb-4">
                <h2 className="text-lg font-bold mb-2">Шаг 2. Найдите наш товар</h2>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    <li>Найдите наш товар</li>
                    <li>
                        Используйте ключевое слово{product.key_word ? `: «${product.key_word}»` : ''}
                    </li>
                    <li>Фото товара ниже</li>
                    <li>Введите артикул товара для проверки</li>
                    <li>
                        <strong>Если артикул правильный, вы перейдёте на следующий шаг</strong>
                    </li>
                </ul>
            </div>

            {/* Поле ввода артикула */}
            <div className="mb-4">
                <label htmlFor="articleInput" className="block text-sm font-medium mb-1">
                    Артикул товара
                </label>
                <input
                    id="articleInput"
                    type="text"
                    value={enteredArticle}
                    onChange={(e) => setEnteredArticle(e.target.value)}
                    placeholder="Введите артикул..."
                    className="border border-gray-300 rounded-md p-2 w-full text-sm"
                />
                {articleStatus && (
                    <p className={`mt-2 text-sm font-semibold ${articleStatus === 'Артикул правильный' ? 'text-green-600' : 'text-red-600'}`}>
                        {articleStatus}
                    </p>
                )}
            </div>

            {/* Кнопка "Продолжить" */}
            <button
                onClick={handleContinue}
                disabled={!canContinue}
                className={`w-full py-2 mb-4 rounded-lg text-white font-semibold text-center ${
                    canContinue ? 'bg-brand hover:bg-brand' : 'bg-gray-400 cursor-not-allowed'
                }`}
            >
                Продолжить
            </button>


            {/* Фото карточки товара */}
            <div className="mb-4">
                <div className="w-full aspect-[3/4] bg-gray-100 rounded overflow-hidden relative">
                    {product.image_path ? (
                        <img
                            src={
                                product.image_path.startsWith('http')
                                    ? product.image_path
                                    : `${process.env.REACT_APP_MEDIA_BASE}/${product.image_path}`
                            }
                            alt={product.name}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                            Нет фото
                        </div>
                    )}
                </div>
            </div>

            {/* Видео-инструкция */}
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

            {/* Кнопки снизу, расположенные вертикально */}
            <div className="flex flex-col gap-3 mt-4">
                {/* Кнопка "Открыть отчет" */}
                <button
                    onClick={() => setShowReport(prev => !prev)}
                    className="w-full py-2 mb-4 rounded-lg bg-white border border-brand text-gray-600 font-semibold text-center"
                >
                    {showReport ? 'Скрыть отчет' : 'Открыть отчет'}
                </button>

                {/* Блок с отчетом (используем данные, полученные из getOrderReport) */}
                {showReport && (
                    <div className="bg-white rounded-lg shadow p-4 mb-4">
                        <h3 className="text-lg font-bold mb-2">Отчет</h3>
                        {reportData ? (
                            <div>
                                {/* Выводим каждый шаг отчёта, если данные заполнены */}
                                {reportData.search_screenshot_path && (
                                    <div className="mb-3">
                                        <p className="text-sm font-semibold">Шаг 1. Скрин поискового запроса</p>
                                        <img
                                            src={reportData.search_screenshot_path}
                                            alt="Скрин поискового запроса"
                                            className="mt-1 w-full rounded"
                                        />
                                    </div>
                                )}
                                {reportData.cart_screenshot_path && (
                                    <div className="mb-3">
                                        <p className="text-sm font-semibold">Скрин корзины</p>
                                        <img
                                            src={reportData.cart_screenshot_path}
                                            alt="Скрин корзины"
                                            className="mt-1 w-full rounded"
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">Отчет пока пуст.</p>
                        )}
                    </div>
                )}
                <button className="bg-white border border-gray-300 rounded-lg p-3 text-sm font-semibold flex items-center gap-2 text-left">
                    <img src="/icons/telegram.png" alt="Telegram" className="w-6 h-6" />
                    <span>Подписаться на канал</span>
                </button>
                <button className="bg-white border border-gray-300 rounded-lg p-3 text-sm font-semibold text-left">
                    Нужна помощь
                </button>
            </div>
        </div>
    );
}

export default ProductFindPage;

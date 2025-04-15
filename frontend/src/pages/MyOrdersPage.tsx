import React, {useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {getUserOrders, updateOrderStatus} from '../services/api';
import {on} from "@telegram-apps/sdk";
import GetUploadLink from "../components/GetUploadLink";

const STEP_NAMES: { [key: number]: string } = {
    1: 'Шаг 1: Поиск товара по ключевому слову',
    2: 'Шаг 2: Артикул товара',
    3: 'Шаг 3: Добавить в избранное',
    4: 'Шаг 4: Ввод реквизитов',
    5: 'Шаг 5: Оформление заказа',
    6: 'Шаг 6: Получение товара',
    7: 'Шаг 7: Отзыв и чек',
    8: 'Шаг 8: Все выполнено',
};

const getOrderStepLink = (order: Order): string => {
    if (order.step === 1) {
        return `/product/${order.product.id}/step-1`;
    }
    if (order.step >= 2 && order.step <= 7) {
        return `/order/${order.id}/step-${order.step + 1}`;
    }
    return `/order/${order.id}/order-info`;
};

interface Product {
    id: string;
    name: string;
    brand: string;
    article: string;
    category: string;
    key_word: string;
    general_repurchases: number;
    daily_repurchases: number;
    price: number;
    wb_price: number;
    tg: string;
    payment_time: string;
    review_requirements: string;
    image_path?: string;
    seller_id: string;
    created_at: string;
    updated_at: string;
}

interface Order {
    id: string;
    user_id: string;
    product_id: string;
    card_number: string;
    screenshot_path: string;
    status: string;
    created_at: string;
    updated_at: string;
    step: number;
    product: Product;
    user: {
        nickname: string;
    };
}

function MyOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const removeBackListener = on('back_button_pressed', () => {
            navigate('/');
        });
        return () => {
            removeBackListener();
        };
    }, [navigate]);

    const handleSupportClick = () => {
        if (window.Telegram?.WebApp?.close) {
            window.Telegram.WebApp.close();
        }
        window.open(process.env.REACT_APP_SUPPORT_URL, '_blank');
    };


    const fetchOrders = async () => {
        try {
            const response = await getUserOrders();
            setOrders(response.data);
        } catch (err) {
            console.error('Ошибка при загрузке покупок:', err);
            setError('Не удалось загрузить список покупок.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const filteredOrders = orders.filter(order => order.status !== 'cancelled');

    const handleCancelOrder = async (orderId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Предотвращаем переход по карточке
        e.preventDefault();
        if (!window.confirm('Вы уверены, что хотите отменить заказ?')) return;
        try {
            const formData = new FormData();
            formData.append("status", "cancelled");
            await updateOrderStatus(orderId, formData);
            alert("Заказ отменён");
            fetchOrders();
        } catch (err) {
            console.error("Ошибка отмены заказа:", err);
            alert("Ошибка отмены заказа");
        }
    };

    if (loading) {
        return <div className="p-4">Загрузка покупок...</div>;
    }

    if (error) {
        return (
            <div className="p-4 bg-brandlight border border-brand rounded text-center">
                <p className="text-sm text-brand">{error}</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-200 min-h-screen p-4 pb-8">
            <div className="sticky top-0 z-10 bg-gray-200">
                <div className="flex items-center justify-center relative mb-4">
                    <h2 className="text-2xl font-bold text-center">Мои покупки</h2>
                </div>

                <p className="text-sm text-gray-600 mb-4 text-center">
                    Нажмите на карточку, чтобы открыть инструкцию
                </p>
            </div>

            <div className="w-full flex flex-col gap-3 mb-4">
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => {
                        const stepName = STEP_NAMES[order.step] || `Шаг ${order.step}`;
                        const linkTo = getOrderStepLink(order);
                        return (
                            <Link to={linkTo} key={order.id}>
                                <div
                                    className="relative bg-white rounded-md shadow-sm p-3 flex flex-col gap-2 hover:shadow-md transition-shadow">
                                    {order.step < 7 && (
                                        <button
                                            onClick={(e) => handleCancelOrder(order.id, e)}
                                            className="absolute top-2 right-2 px-2 py-1 border border-red-500 text-red-500 text-xs rounded hover:bg-red-50 transition"
                                        >
                                            Отменить
                                        </button>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <div className="w-16 h-16 bg-gray-100 relative flex-shrink-0">
                                            {order.product.image_path ? (
                                                <img
                                                    src={
                                                        order.product.image_path.startsWith('http')
                                                            ? order.product.image_path
                                                            : GetUploadLink(order.product.image_path)
                                                    }
                                                    alt={order.product.name}
                                                    className="absolute inset-0 object-cover w-full h-full"
                                                />
                                            ) : (
                                                <div
                                                    className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                                                    Нет фото
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                        <span className="font-semibold text-sm">
                                            {order.product.name}
                                        </span>
                                            <br/>
                                            <span className="text-md font-bold text-brand">
                                            {order.product.price} ₽
                                        </span>
                                            <br/>
                                            <span className="text-xs text-gray-500">
                                            Текущий шаг: {stepName}
                                        </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                ) : (
                    <div className="bg-white rounded-md shadow-sm p-3 text-center">
                        Покупки не найдены
                    </div>
                )}
            </div>

            <div
                onClick={handleSupportClick}
                className="bg-white border border-brand rounded-xl shadow-sm p-4 mb-4 font-semibold cursor-pointer flex items-center gap-3"
            >
                <img src="/icons/support.png" alt="Support" className="w-7 h-7"/>
                <div className="flex flex-col">
                    <span>Техподдержка</span>
                    <span className="text-xs text-gray-500">
                            Оперативно ответим на все вопросы
                        </span>
                </div>
                <img
                    src="/icons/small_arrow.png"
                    alt="arrow"
                    className="w-5 h-5 ml-auto"
                />
            </div>
        </div>
    );
}

export default MyOrdersPage;

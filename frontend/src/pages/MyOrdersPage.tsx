import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {getUserOrders} from '../services/api';
import { useNavigate } from 'react-router-dom';

interface Product {
    id: string;
    name: string;
    brand: string;
    article: string;
    category: string; // Можно заменить на enum Category, если требуется
    key_word: string;
    general_repurchases: number;
    daily_repurchases: number;
    price: number;
    wb_price: number;
    tg: string;
    payment_time: string; // Можно заменить на enum PayoutTime
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
    product: Product;
}

function MyOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleBackClick = () => {
        navigate('/');
    };

    useEffect(() => {
        async function fetchOrders() {
            try {
                // Теперь получаем заказы пользователя по его id
                const response = await getUserOrders();
                setOrders(response.data);
            } catch (error) {
                console.error('Ошибка при загрузке покупок:', error);
                setError('Не удалось загрузить список покупок.');
            } finally {
                setLoading(false);
            }
        }
        fetchOrders();
    }, []);

    if (loading) {
        return <div className="p-4">Загрузка покупок...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-600">{error}</div>;
    }

    return (
        <div className="p-4 max-w-screen-md mx-auto">
            <h2 className="text-2xl font-bold mb-6">Мои покупки</h2>
            <button
                onClick={handleBackClick}
                className="flex-1 border border-gray-300 text-gray-600 p-2 rounded"
            >
                Назад
            </button>
            {/* Сетка карточек заказов */}
            <div className="grid grid-cols-2 gap-4">
                {orders.map(order => (
                    <Link to={`/my-purchases/${order.id}`} key={order.id}>
                        <div className="border border-gray-200 rounded-md shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
                            {/* Блок с фото товара */}
                            <div className="relative w-full aspect-[3/4] bg-gray-100">
                                {order.product.image_path ? (
                                    <img
                                        src={
                                            order.product.image_path.startsWith('http')
                                                ? order.product.image_path
                                                : `${process.env.REACT_APP_MEDIA_BASE}/${order.product.image_path}`
                                        }
                                        alt={order.product.name}
                                        className="absolute top-0 left-0 w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                        Нет фото
                                    </div>
                                )}
                            </div>
                            {/* Информация о товаре и заказе */}
                            <div className="p-3 flex flex-col">
                                <h3 className="text-sm font-semibold mb-1">{order.product.name}</h3>
                                <p className="text-md font-bold mb-1" style={{ color: "#981e97" }}>
                                    {order.product.price} ₽
                                </p>
                                <p className="text-xs text-gray-600">Статус: {order.status}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default MyOrdersPage;

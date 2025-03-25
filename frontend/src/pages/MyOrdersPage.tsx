// src/pages/MyOrdersPage.tsx

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserOrders } from '../services/api';
import {on} from "@telegram-apps/sdk";

// Словарь для отображения названия шага
const STEP_NAMES: { [key: number]: string } = {
    1: 'Шаг 1: Поиск товара по ключевому слову',
    2: 'Шаг 2: Артикул товар',
    3: 'Шаг 3: Добавить в избранное',
    4: 'Шаг 4: Ввод реквизитов',
    5: 'Шаг 5: Оформление заказа',
    6: 'Шаг 6: Получение товара',
    7: 'Шаг 7: Отзыв и чек',
    8: 'Шаг 8: Все выполнено',
};

// Функция, которая возвращает URL для заказа в зависимости от шага
const getOrderStepLink = (order: Order): string => {
    // Если заказ на шагах 1–7, перенаправляем на /order/:orderId/step-X
    if (order.step === 1) {
        return `/product/${order.product.id}/step-1`;
    }
    // (+1, если нужна другая логика — подстройте)
    if (order.step >= 2 && order.step <= 7) {
        return `/order/${order.id}/step-${order.step+1}`;
    }
    // Иначе финальный шаг
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
        alert('Открыть чат техподдержки...');
    };

    useEffect(() => {
        async function fetchOrders() {
            try {
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
        <div className="bg-gray-200 min-h-screen p-4">
            {/* Шапка: кнопка «Назад» слева, заголовок по центру */}
            <div className="flex items-center justify-center relative mb-4 right-6">
                <h2 className="text-2xl font-bold text-center">Мои покупки</h2>
            </div>

            <p className="text-sm text-gray-600 mb-4 text-center">
                Нажмите на карточку, чтобы открыть инструкцию
            </p>

            {/* Список заказов (вертикальный) */}
            <div className="w-full flex flex-col gap-3">
                {orders.map((order) => {
                    const stepName = STEP_NAMES[order.step] || `Шаг ${order.step}`;
                    const linkTo = getOrderStepLink(order);

                    return (
                        <Link to={linkTo} key={order.id}>
                            <div className="bg-white rounded-md shadow-sm p-3 flex items-center gap-3 hover:shadow-md transition-shadow">
                                {/* Фото товара (небольшое) */}
                                <div className="w-16 h-16 bg-gray-100 relative flex-shrink-0">
                                    {order.product.image_path ? (
                                        <img
                                            src={
                                                order.product.image_path.startsWith('http')
                                                    ? order.product.image_path
                                                    : `${process.env.REACT_APP_MEDIA_BASE}/${order.product.image_path}`
                                            }
                                            alt={order.product.name}
                                            className="absolute inset-0 object-cover w-full h-full"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                                            Нет фото
                                        </div>
                                    )}
                                </div>

                                {/* Информация: название, цена, текущий шаг */}
                                <div className="flex-1 flex flex-col">
                  <span className="font-semibold text-sm">
                    {order.product.name}
                  </span>
                                    <span className="text-md font-bold" style={{ color: '#981e97' }}>
                    {order.product.price} ₽
                  </span>
                                    <span className="text-xs text-gray-500">
                    Текущий шаг: {stepName}
                  </span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Кнопка "Техподдержка" внизу */}
            <div className="flex justify-center mt-6">
                <button
                    onClick={handleSupportClick}
                    className="px-4 py-2 border border-gray-300 text-gray-600 rounded"
                >
                    Техподдержка
                </button>
            </div>
        </div>
    );
}
export default MyOrdersPage;

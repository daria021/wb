import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {getMe, getOrderBySellerId, updateOrderStatus} from '../services/api';
import {AxiosResponse} from 'axios';
import {on} from "@telegram-apps/sdk";
import {OrderStatus} from '../enums';

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

interface User {
    id: string;
    telegram_id?: number;
    nickname?: string;
    created_at: string;
    updated_at: string;
}

interface Order {
    id: string;
    user_id: string;
    product_id: string;
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
    status: OrderStatus;
    product: Product;
    user: User;
}

function SellerReportsPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sellerId, setSellerId] = useState<string>('');
    const { search } = useLocation();
    const params = new URLSearchParams(search);
    const initialTab = params.get('tab') === 'paid'
        ? OrderStatus.CASHBACK_PAID
        : OrderStatus.CASHBACK_NOT_PAID;
    const [activeTab, setActiveTab] = useState<OrderStatus>(initialTab);

    const fetchReports = async () => {
        if (!sellerId) return;
        try {
            const response: AxiosResponse<Order[]> = await getOrderBySellerId(sellerId);
            console.log("sheesh");
            console.log(response.data[0]);
            setOrders(response.data);
        } catch (err) {
            console.error("Ошибка при загрузке отчетов:", err);
            setError("Не удалось загрузить отчеты по выкупам");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const removeBackListener = on('back_button_pressed', () => {
            navigate('/seller-cabinet');
        });
        return () => {
            removeBackListener();
        };
    }, [navigate]);


    useEffect(() => {
        async function fetchSellerId() {
            try {
                const me = await getMe();
                setSellerId(me.id);
            } catch (err) {
                console.error("Ошибка при получении sellerId:", err);
            }
        }

        fetchSellerId();
    }, []);

    useEffect(() => {
        if (sellerId) {
            fetchReports();
        }
    }, [sellerId]);

    const filteredOrders = orders.filter(order => order.status === activeTab);

    const handleCashbackPaid = async (orderId: string) => {
        try {
            const formData = new FormData();
            formData.append("status", OrderStatus.CASHBACK_PAID);
            await updateOrderStatus(orderId, formData);
            alert("Статус обновлен!");
            fetchReports();
        } catch (err) {
            console.error("Ошибка обновления статуса:", err);
            alert("Ошибка обновления статуса");
        }
    };

    if (loading) {
        return <div className="p-4 text-center">Загрузка отчетов...</div>;
    }
    if (error) {
        return (
            <div className="p-4 bg-brandlight border border-brand rounded text-center">
                <p className="text-sm text-brand">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-200">
            <div className="p-4 max-w-screen-md mx-auto">
                <div className="sticky top-0 z-10 bg-gray-200">

                    <h1 className="text-2xl font-bold mb-4 text-center">Отчеты по выкупам</h1>

                    <div className="flex mb-4 border-b">
                        <button
                            onClick={() => setActiveTab(OrderStatus.CASHBACK_NOT_PAID)}
                            className={`px-4 py-2 font-semibold ${activeTab === OrderStatus.CASHBACK_NOT_PAID ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}
                        >
                            Кешбек не выплачен
                        </button>
                        <button
                            onClick={() => setActiveTab(OrderStatus.CASHBACK_PAID)}
                            className={`px-4 py-2 font-semibold ${activeTab === OrderStatus.CASHBACK_PAID ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}
                        >
                            Кешбек выплачен
                        </button>

                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    {filteredOrders.length ? (
                        filteredOrders.map((order) => (
                            <div
                                key={order.id}
                                onClick={() => navigate(`/seller-cabinet/reports/${order.id}`)}
                                className="border border-gray-200 rounded-md shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer bg-white"
                            >
                                <h2 className="text-lg font-semibold">{order.product.name}</h2>
                                <p className="text-sm text-gray-600">
                                    Покупатель: {order.user.nickname || "Не указан"}
                                </p>
                                <p className="text-sm text-gray-600">Статус: {order.status}</p>
                                {activeTab === OrderStatus.CASHBACK_NOT_PAID && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation(); // предотвращает переход по клику на карточку
                                            handleCashbackPaid(order.id);
                                        }}
                                        className="mt-2 w-full py-2 rounded bg-green-500 text-white font-semibold text-base hover:opacity-90 transition"
                                    >
                                        Отметить как выплаченный
                                    </button>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-600">Заказов не найдено</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SellerReportsPage;

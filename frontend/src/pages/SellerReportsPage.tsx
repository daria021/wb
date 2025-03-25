// src/pages/SellerReportsPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, getOrderBySellerId } from '../services/api';
import { AxiosResponse } from 'axios';
import {on} from "@telegram-apps/sdk";

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
    status: string;
    product: Product;
    user: User;
}

function SellerReportsPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sellerId, setSellerId] = useState<string>('');

    useEffect(() => {
        const removeBackListener = on('back_button_pressed', () => {
            navigate('/seller-cabinet');
        });

        return () => {
            removeBackListener();
        };
    }, [navigate]);

    // Получаем sellerId (предполагается, что getMe возвращает строку с id продавца)
    useEffect(() => {
        async function fetchSellerId() {
            try {
                const id = await getMe();
                setSellerId(id);
            } catch (err) {
                console.error("Ошибка при получении sellerId:", err);
            }
        }
        fetchSellerId();
    }, []);

    // Загружаем отчеты по выкупам для данного sellerId
    useEffect(() => {
        if (!sellerId) return;
        async function fetchReports() {
            try {
                const response: AxiosResponse<Order[]> = await getOrderBySellerId(sellerId);
                setOrders(response.data);
            } catch (err) {
                console.error("Ошибка при загрузке отчетов:", err);
                setError("Не удалось загрузить отчеты по выкупам");
            } finally {
                setLoading(false);
            }
        }
        fetchReports();
    }, [sellerId]);

    if (loading) {
        return <div className="p-4">Загрузка отчетов...</div>;
    }
    if (error) {
        return <div className="p-4 text-red-600">{error}</div>;
    }

    return (
        <div className="p-4 max-w-screen-md bg-gray-200 mx-auto">
            <h1 className="text-2xl font-bold mb-4 text-center">Отчеты по выкупам</h1>
            <div className="flex flex-col gap-4">
                {orders.map((order) => (
                    <div
                        key={order.id}
                        onClick={() => navigate(`/seller-cabinet/reports/${order.id}`)}
                        className="border border-gray-200 rounded-md shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                        <h2 className="text-lg font-semibold">{order.product.name}</h2>
                        <p className="text-sm text-gray-600">Покупатель: {order.user.nickname || "Не указан"}</p>
                        <p className="text-sm text-gray-600">Статус: {order.status}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SellerReportsPage;

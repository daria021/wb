// src/pages/SellerCabinet.tsx
import React, {useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import {on} from "@telegram-apps/sdk";

function SellerCabinet() {
    const navigate = useNavigate();

    const handleMyProductsClick = () => navigate('/my-products');
    useEffect(() => {
        const removeBackListener = on('back_button_pressed', () => {
            navigate('/');
        });

        return () => {
            removeBackListener();
        };
    }, [navigate]);

    const handleReportsClick = () => {
        navigate(`/seller-cabinet/reports`);
    };

    return (
        <div className="min-h-screen bg-gray-200">  {/* Обертка на весь экран */}

            {/* Основной контейнер с контентом */}
            <div className="p-4 max-w-screen-sm mx-auto relative">
                {/* Заголовок страницы */}
                <h1 className="text-xl font-bold mb-4 text-center">Кабинет продавца</h1>

                {/* Описание под заголовком */}
                <p className="text-sm text-gray-700 mb-6 text-center">
                    ВБКэшбэк — сервис для управления раздачами товара за кэшбэк
                </p>

                {/* Карточка с балансом */}
                <div className="bg-gray-300 border border-gray-300 rounded-md p-4 mb-4">
                    <p className="text-md font-semibold mb-1">Баланс</p>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-sm text-gray-500">Доступное количество раздач</p>
                </div>

                {/* Карточка «Мои товары» */}
                <div
                    onClick={handleMyProductsClick}
                    className="bg-gray-300 border border-gray-300 rounded-md p-4 mb-4 cursor-pointer"
                >
                    <p className="text-md font-semibold mb-1">Мои товары</p>
                    <p className="text-sm text-gray-500">Товары по раздачам</p>
                </div>

                {/* Новая карточка "Отчеты по выкупам" */}
                <div
                    onClick={handleReportsClick}
                    className="bg-gray-300 border border-gray-300 rounded-md p-4 mb-4 cursor-pointer"
                >
                    <p className="text-md font-semibold mb-1">Отчеты по выкупам</p>
                    <p className="text-sm text-gray-500">
                        Просмотр отчетов по покупкам ваших товаров
                    </p>
                </div>


                {/* Карточка «Техподдержка» с иконкой */}
                <div className="bg-gray-300 border border-gray-300 rounded-md p-4 flex items-center gap-2 cursor-pointer">
                    <img src="/icons/support.png" alt="Support" className="w-8 h-8" />
                    <div>
                        <p className="text-sm font-semibold">Техподдержка</p>
                        <p className="text-xs text-gray-500">Оперативно ответим на все вопросы</p>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default SellerCabinet;

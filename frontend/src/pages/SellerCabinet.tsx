import React from 'react';
import {useNavigate} from "react-router-dom";

function SellerCabinet() {

    const navigate = useNavigate();
    const handleMyProductsClick = () => navigate('/my-products');
    const handleBackClick = () => navigate(`/`);

    return (
        <div className="p-4 max-w-screen-sm mx-auto">
            {/* Заголовок страницы */}
            <h1 className="text-xl font-bold mb-4">Кабинет продавца</h1>

            {/* Описание под заголовком */}
            <p className="text-sm text-gray-700 mb-6">
                ВБКэшбэк — сервис для управления раздачами товара за кэшбэк
            </p>

            {/* Карточка с балансом */}
            <div className="bg-white border border-gray-200 rounded-md p-4 mb-4">
                <p className="text-md font-semibold mb-1">Баланс</p>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-gray-500">Доступное количество раздач</p>
            </div>

            {/* Карточка «Мои товары» */}
            <div
                onClick={handleMyProductsClick}
                className="bg-white border border-gray-200 rounded-md p-4 mb-4">
                <p className="text-md font-semibold mb-1">Мои товары</p>
                <p className="text-sm text-gray-500">Товары по раздачам</p>
            </div>

            {/* Карточка «Техподдержка» с иконкой */}
            <div className="bg-white border border-gray-200 rounded-md p-4 flex items-center gap-2 cursor-pointer">
                <img src="/icons/support.png" alt="support" className="w-5 h-5" />
                <div>
                    <p className="text-sm font-semibold">Техподдержка</p>
                    <p className="text-xs text-gray-500">Оперативно ответим на все вопросы</p>
                </div>
            </div>

            <button
                onClick={handleBackClick}
                className="flex-1 border border-gray-300 text-gray-600 p-2 rounded"
            >
                Назад
            </button>
        </div>
    );
}

export default SellerCabinet;

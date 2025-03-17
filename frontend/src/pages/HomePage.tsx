// src/pages/HomePage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {getMe} from "../services/api";

function HomePage() {
    const navigate = useNavigate();

    // Обработчики (примеры). Замените на нужные вам действия (navigate('/about') и т.п.)
    const handleAboutClick = () => alert('О сервисе');
    const handleInstructionClick = () => alert('Инструкция');
    const handleComplaintsClick = () => alert('Книга жалоб');
    const handleMyOrdersClick = async () => {
        try {
            const response = await getMe();
            console.log(response.data)
            navigate(`/user/orders`);
        } catch (error) {
            console.error('Ошибка получения данных пользователя:', error);
        }
    };
    const handleSellerClick = () => navigate(`/seller-cabinet`);
    const handleCatalogClick = () => navigate(`/catalog`);
    const handleReferralClick = () => alert('Реферальная программа');
    const handleChannelClick = () => alert('Переход в Telegram-канал');
    const handleSupportClick = () => alert('Переход в Техподдержку');

    return (
        // Фон страницы чуть серый
        <div className="min-h-screen bg-gray-100 p-4">
            {/* Заголовок */}
            <h1 className="text-xl font-bold mb-4">ВБ Кэшбэк — безопасные сделки</h1>

            {/* --- Верхний ряд (3 плитки): О сервисе, Инструкция, Книга жалоб --- */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                {/* О сервисе */}
                <div
                    onClick={handleAboutClick}
                    className="bg-white border border-[#981e97] rounded-md shadow-sm p-3 text-sm font-semibold cursor-pointer"
                >
                    <div className="flex items-center gap-2">
                        <img src="/icons/about.png" alt="Книга жалоб" className="w-5 h-5" />
                        <span>О сервисе</span>
                    </div>
                </div>

                {/* Инструкция */}
                <div
                    onClick={handleInstructionClick}
                    className="bg-white border border-[#981e97] rounded-md shadow-sm p-3 text-sm font-semibold cursor-pointer"
                >
                    <div className="flex items-center gap-2">
                        <img src="/icons/instruction.png" alt="Книга жалоб" className="w-5 h-5" />
                        <span>Инструкция</span>
                    </div>
                </div>

                {/* Книга жалоб (иконка "book" слева) */}
                <div
                    onClick={handleComplaintsClick}
                    className="bg-white border border-[#981e97] rounded-md shadow-sm p-3 text-sm font-semibold cursor-pointer"
                >
                    {/* Горизонтальный flex: иконка слева, текст справа */}
                    <div className="flex items-center gap-2">
                        <img src="/icons/book.png" alt="Книга жалоб" className="w-5 h-5" />
                        <span>Книга жалоб</span>
                    </div>
                </div>
            </div>

            {/* --- Средний блок: слева (Мои покупки, Кабинет продавца), справа (Каталог) --- */}
            <div
                // onClick={handleMyOrdersClick}
                className="grid grid-cols-3 gap-3 mb-4">
                {/* Левая часть (2 столбца) с двумя плитками: Мои покупки, Кабинет продавца */}
                <div className="flex flex-col gap-3 col-span-2">
                    {/* Мои покупки (иконка "small_arrow" справа) */}
                    <div
                        onClick={handleMyOrdersClick}
                        className="bg-white border border-[#981e97] rounded-md shadow-sm p-3 text-sm font-semibold cursor-pointer"
                    >
                        <div className="flex items-center justify-between">
                            <span>Мои покупки</span>
                            <img src="/icons/small_arrow.png" alt="arrow" className="w-3 h-3" />
                        </div>
                    </div>

                    {/* Кабинет продавца (иконка "small_arrow" справа) */}
                    <div
                        onClick={handleSellerClick}
                        className="bg-white border border-[#981e97] rounded-md shadow-sm p-3 text-sm font-semibold cursor-pointer"
                    >
                        <div className="flex items-center justify-between">
                            <span>Кабинет продавца</span>
                            <img src="/icons/small_arrow.png" alt="arrow" className="w-3 h-3" />
                        </div>
                    </div>
                </div>

                {/* Правая часть (1 столбец): Каталог (фиолетовый фон, иконка "arrow" справа) */}
                <div
                    onClick={handleCatalogClick}
                    className="bg-[#981e97] rounded-md shadow-sm p-3 text-sm font-semibold text-white cursor-pointer"
                >
                    <div className="flex items-center justify-between">
                        <span>Каталог актуальных товаров</span>
                        <img src="/icons/arrow.png" alt="arrow" className="w-8 h-8 relative top-9" />
                    </div>
                </div>
            </div>

            {/* --- Реферальная программа (без иконки) --- */}
            <div
                onClick={handleReferralClick}
                className="bg-white border border-[#981e97] rounded-md shadow-sm p-3 mb-4 text-sm font-semibold cursor-pointer"
            >
                Реферальная программа
            </div>

            {/* --- Ссылки на канал и техподдержку (убираем иконки) --- */}
            <div className="grid grid-cols-2 gap-3">
                <div
                    onClick={handleChannelClick}
                    className="bg-white border border-[#981e97] rounded-md shadow-sm p-3 text-sm font-semibold cursor-pointer"
                >
                    <div className="flex items-center justify-between">
                        <span>@wbcashback_go</span>
                        <img src="/icons/telegram.png" alt="arrow" className="w-8 h-8 relative" />
                    </div>
                </div>
                <div
                    onClick={handleSupportClick}
                    className="bg-white border border-[#981e97] rounded-md shadow-sm p-3 text-sm font-semibold cursor-pointer"
                >
                    <div className="flex items-center justify-between">
                        <span>Техподдержка</span>
                        <img src="/icons/support.png" alt="arrow" className="w-8 h-8 relative " />
                    </div>

                </div>
            </div>
        </div>
    );
}

export default HomePage;

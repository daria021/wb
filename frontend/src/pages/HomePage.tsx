// src/pages/HomePage.tsx
import React from 'react';
import {useNavigate} from 'react-router-dom';
import {getMe} from '../services/api';

function HomePage() {
    const navigate = useNavigate();

    window.onerror = (message, source, lineno, colno, error) => {
        if (typeof message === "string" && message.includes("window.TelegramGameProxy.receiveEvent")) {
            // Return true to indicate that the error has been handled
            return true;
        }
        console.log(typeof message, typeof message === "string");
        // Otherwise, let the error propagate
        return false;
    };

    // Примерные обработчики
    const handleAboutClick = () => alert('О сервисе');
    const handleInstructionClick = () => alert('Инструкция');
    const handleComplaintsClick = () => alert('Книга жалоб');
    const handleMyOrdersClick = async () => {
        try {
            await getMe();
            navigate(`/user/orders`);
        } catch (error) {
            console.error('Ошибка получения данных пользователя:', error);
        }
    };
    const handleSellerClick = () => {
        navigate(`/seller-cabinet`);
    };
    const handleCatalogClick = () => navigate(`/catalog`);
    const handleReferralClick = () => alert('Реферальная программа');
    const handleChannelClick = () => alert('Переход в Telegram-канал');
    const handleSupportClick = () => alert('Переход в Техподдержку');

    return (
        <div className="min-h-screen bg-gray-200 p-6">

            {/* --- Верхний ряд (3 плитки): О сервисе, Инструкция, Книга жалоб --- */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                {/* О сервисе */}
                <div
                    onClick={handleAboutClick}
                    className="bg-white border border-gray-300 text-center rounded-md shadow-sm p-2 text-xs font-medium cursor-pointer flex flex-col items-center justify-center"
                >
                    <img src="/icons/about.png" alt="О сервисе" className="w-4 h-4 mb-1" />
                    <span>О сервисе</span>
                </div>

                {/* Инструкция */}
                <div
                    onClick={handleInstructionClick}
                    className="bg-white border border-gray-300 text-center rounded-md shadow-sm p-2 text-xs font-medium cursor-pointer flex flex-col items-center justify-center"
                >
                    <img src="/icons/instruction.png" alt="Инструкция" className="w-4 h-4 mb-1" />
                    <span>Инструкция</span>
                </div>

                {/* Книга жалоб */}
                <div
                    onClick={handleComplaintsClick}
                    className="bg-white border border-gray-300 text-center rounded-md shadow-sm p-2 text-xs font-medium cursor-pointer flex flex-col items-center justify-center"
                >
                    <img src="/icons/book.png" alt="Книга жалоб" className="w-4 h-4 mb-1" />
                    <span>Книга жалоб</span>
                </div>
            </div>


            {/* --- Средний блок: слева (Мои покупки, Кабинет продавца), справа (Каталог) --- */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                {/* Левая часть (2 столбца) */}
                <div className="flex flex-col gap-4 col-span-2">
                    {/* Мои покупки */}
                    <div
                        onClick={handleMyOrdersClick}
                        className="bg-white border-2 border-brand rounded-lg shadow-sm p-4 text-base font-bold cursor-pointer"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span>Мои покупки</span>
                                <span className="text-xs font-normal text-gray-500">
                  Список ваших покупок
                </span>
                            </div>
                            <img
                                src="/icons/small_arrow.png"
                                alt="arrow"
                                className="w-5 h-5"
                            />
                        </div>
                    </div>

                    {/* Кабинет продавца */}
                    <div
                        onClick={handleSellerClick}
                        className="bg-white border-2 border-brand rounded-lg shadow-sm p-4 text-base font-bold cursor-pointer"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span>Кабинет продавца</span>
                                <span className="text-xs font-normal text-gray-500">
                  Для продавцов
                </span>
                            </div>
                            <img
                                src="/icons/small_arrow.png"
                                alt="arrow"
                                className="w-5 h-5"
                            />
                        </div>
                    </div>
                </div>

                {/* Правая часть (1 столбец): Каталог */}
                {/* Правая часть (1 столбец): Каталог (фиолетовый фон) */}
                {/* Правая часть (1 столбец): Каталог (фиолетовый фон) */}
                {/* Правая часть (1 столбец): Каталог (фиолетовый фон) */}
                <div
                    onClick={handleCatalogClick}
                    className="bg-brand rounded-lg px-1 py-4 text-sm font-semibold text-white cursor-pointer relative"
                >
                    {/* Текст слева, может переноситься, если не влезает в одну строку */}
                    <span className="block text-left">
    Каталог актуальных товаров
  </span>

                    <img
                        src="/icons/arrow.png"
                        alt="arrow"
                        className="w-11 h-11 absolute top-28 right-2"
                    />
                </div>


            </div>

            {/* --- Реферальная программа (круглая кнопка) --- */}
            <div
                onClick={handleReferralClick}
                className="bg-white border border-brand rounded-full shadow-sm p-4 mb-8 text-sm font-semibold cursor-pointer text-center"
            >
                Реферальная программа
            </div>

            {/* --- Ссылки на канал и техподдержку (вертикально) --- */}
            <div className="flex flex-col gap-4">
                {/* Канал */}
                <div
                    onClick={handleChannelClick}
                    className="bg-white border border-brand rounded-xl shadow-sm p-4 text-sm font-semibold cursor-pointer flex items-center gap-3"
                >
                    <img src="/icons/telegram.png" alt="Telegram" className="w-7 h-7"/>
                    <div className="flex flex-col">
                        <span>@wbcashback_go</span>
                        <span className="text-xs text-gray-500">Подпишись на канал</span>
                    </div>
                    <img
                        src="/icons/small_arrow.png"
                        alt="arrow"
                        className="w-5 h-5 ml-auto"
                    />
                </div>

                {/* Техподдержка */}
                <div
                    onClick={handleSupportClick}
                    className="bg-white border border-brand rounded-xl shadow-sm p-4 text-sm font-semibold cursor-pointer flex items-center gap-3"
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
        </div>
    );
}

export default HomePage;

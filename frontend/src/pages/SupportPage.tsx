import React from 'react';
import {useNavigate} from 'react-router-dom';

function SupportPage() {
    const navigate = useNavigate();


    window.onerror = (message, source, lineno, colno, error) => {
        if (typeof message === "string" && message.includes("window.TelegramGameProxy.receiveEvent")) {
            return true;
        }
        console.log(typeof message, typeof message === "string");
        return false;
    };


    const handleAboutClick = () => navigate('/about');
    const handleInstructionClick = () => navigate('/instruction', {state: {backRoute: '/'}});
    const handleComplaintsClick = () => {
        window.open('https://t.me/Premiumcashb', '_blank');
    };

    // Урезанная страница поддержки: оставляем только верхние 3 кнопки и подписку на канал
    const handleChannelClick = () => {
        window.open('https://t.me/Premiumcash1', '_blank');
    };
    const handleSupportClick = () => {
        if (window.Telegram?.WebApp?.close) {
            window.Telegram.WebApp.close();
        }
        window.open(process.env.REACT_APP_SUPPORT_URL, '_blank');
    };

    return (
        <div className="min-h-screen bg-gray-200 p-6 font-body">
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div
                    onClick={handleAboutClick}
                    className="bg-white border border-darkGray text-center rounded-md shadow-sm p-2 text-xs font-medium cursor-pointer flex flex-col items-center justify-center"
                >
                    <img src="/icons/about.png" alt="О сервисе" className="w-4 h-4 mb-1"/>
                    <span className="font-body">О сервисе</span> {/* заголовок */}
                </div>

                <div
                    onClick={handleInstructionClick}
                    className="bg-white border border-darkGray text-center rounded-md shadow-sm p-2 text-xs font-medium cursor-pointer flex flex-col items-center justify-center"
                >
                    <img src="/icons/instruction.png" alt="Инструкция" className="w-4 h-4 mb-1"/>
                    <span className="font-body">Инструкция</span>
                </div>

                <div
                    onClick={handleComplaintsClick}
                    className="bg-white border border-darkGray text-center rounded-md shadow-sm p-2 text-xs font-medium cursor-pointer flex flex-col items-center justify-center"
                >
                    <img src="/icons/book.png" alt="Книга жалоб" className="w-4 h-4 mb-1"/>
                    <span className="font-body">Книга жалоб</span>
                </div>
            </div>

            {/* Убраны центральные большие карточки */}

            {/* Реферальная кнопка скрыта на странице поддержки */}

            {/* Блок модерации скрыт на странице поддержки */}

            <div className="flex flex-col gap-4">

            <div
                    onClick={handleSupportClick}
                    className="bg-white border border-brand rounded-xl shadow-sm p-4 text-sm font-semibold cursor-pointer flex items-center gap-3"
                >
                    <img src="/icons/support.png" alt="Support" className="w-7 h-7"/>
                    <div className="flex flex-col">
                        <span className="font-body">Техподдержка</span>
                        <span className="text-xs text-gray-500">
                            Быстрые ответы на ваши вопросы
                        </span>
                    </div>
                    <img
                        src="/icons/small_arrow.png"
                        alt="arrow"
                        className="w-5 h-5 ml-auto"
                    />
                </div>
                <div
                    onClick={handleChannelClick}
                    className="bg-white border border-brand rounded-xl shadow-sm p-4 text-sm font-semibold cursor-pointer flex items-center gap-3"
                >
                    <img src="/icons/telegram.png" alt="Telegram" className="w-7 h-7"/>
                    <div className="flex flex-col">
                        <span className="font-body">@Premiumcash1</span>
                        <span className="text-xs text-gray-500">Подписаться на канал</span>
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


export default SupportPage;

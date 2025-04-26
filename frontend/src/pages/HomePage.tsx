import React from 'react';
import {useNavigate} from 'react-router-dom';
import {getMe} from '../services/api';
import {useAuth} from '../contexts/auth';

function HomePage() {
    const navigate = useNavigate();
    const {isModerator, loading} = useAuth();

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
        window.open('https://t.me/bookshaloba', '_blank');
    };
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
    const handleReferralClick = () => navigate('/invite');
    const handleChannelClick = () => {
        window.open('https://t.me/grcashback', '_blank');
    };
    const handleSupportClick = () => {
        if (window.Telegram?.WebApp?.close) {
            window.Telegram.WebApp.close();
        }
        window.open(process.env.REACT_APP_SUPPORT_URL, '_blank');
    };

    return (
        <div className="min-h-screen bg-gradient-t-gray p-6 font-body">
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div
                    onClick={handleAboutClick}
                    className="bg-gradient-tr-white border border-gradient-tr-darkGray text-center rounded-md shadow-sm p-2 text-xs font-medium cursor-pointer flex flex-col items-center justify-center"
                >
                    <img src="/icons/about.png" alt="О сервисе" className="w-4 h-4 mb-1"/>
                    <span className="font-body">О сервисе</span> {/* заголовок */}
                </div>

                <div
                    onClick={handleInstructionClick}
                    className="bg-gradient-tr-white border border-gradient-tr-darkGray text-center rounded-md shadow-sm p-2 text-xs font-medium cursor-pointer flex flex-col items-center justify-center"
                >
                    <img src="/icons/instruction.png" alt="Инструкция" className="w-4 h-4 mb-1"/>
                    <span className="font-body">Инструкция</span>
                </div>

                <div
                    onClick={handleComplaintsClick}
                    className="bg-gradient-tr-white border border-gradient-tr-darkGray text-center rounded-md shadow-sm p-2 text-xs font-medium cursor-pointer flex flex-col items-center justify-center"
                >
                    <img src="/icons/book.png" alt="Книга жалоб" className="w-4 h-4 mb-1"/>
                    <span className="font-body">Книга жалоб</span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="flex flex-col gap-4 col-span-2">
                    <div
                        onClick={handleMyOrdersClick}
                        className="bg-gradient-tr-white border-2 border-gradient-r-brand rounded-lg shadow-sm p-4 text-base font-bold cursor-pointer"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                {/* заголовок карточки */}
                                <span className="font-heading">Мои покупки</span>
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

                    <div
                        onClick={handleSellerClick}
                        className="bg-gradient-tr-white border-2 border-gradient-r-brand rounded-lg shadow-sm p-4 text-base font-bold cursor-pointer"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="font-heading">Кабинет продавца</span>
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

                <div
                    onClick={handleCatalogClick}
                    className="bg-gradient-r-brand rounded-lg px-1 py-4 text-sm font-semibold text-white cursor-pointer relative"
                >
                    <span className="block text-left font-heading">
                        Каталог актуальных товаров
                    </span>
                    <img
                        src="/icons/arrow.png"
                        alt="arrow"
                        className="w-11 h-11 absolute top-28 right-2"
                    />
                </div>
            </div>

            <div
                onClick={handleReferralClick}
                className="bg-gradient-tr-white border border-gradient-r-brand rounded-full shadow-sm p-4 mb-4 text-sm font-semibold cursor-pointer text-center"
            >
                <span className="font-body">Реферальная программа</span>
            </div>

            {!loading && isModerator && (
                <div
                    onClick={() => navigate('/moderator')}
                    className="bg-gradient-tr-white border border-gradient-r-brand rounded-full shadow-sm p-4 mb-4 text-sm font-semibold cursor-pointer text-center"
                >
                    <span className="font-body">Помодерируем?</span>
                </div>
            )}

            <div className="flex flex-col gap-4">
                <div
                    onClick={handleChannelClick}
                    className="bg-gradient-tr-white border border-gradient-r-brand rounded-xl shadow-sm p-4 text-sm font-semibold cursor-pointer flex items-center gap-3"
                >
                    <img src="/icons/telegram.png" alt="Telegram" className="w-7 h-7"/>
                    <div className="flex flex-col">
                        <span className="font-body">@wbcashback_go</span>
                        <span className="text-xs text-gray-500">Подпишись на канал</span>
                    </div>
                    <img
                        src="/icons/small_arrow.png"
                        alt="arrow"
                        className="w-5 h-5 ml-auto"
                    />
                </div>

                <div
                    onClick={handleSupportClick}
                    className="bg-gradient-tr-white border border-gradient-r-brand rounded-xl shadow-sm p-4 text-sm font-semibold cursor-pointer flex items-center gap-3"
                >
                    <img src="/icons/support.png" alt="Support" className="w-7 h-7"/>
                    <div className="flex flex-col">
                        <span className="font-body">Техподдержка</span>
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

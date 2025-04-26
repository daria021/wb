import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {on} from "@telegram-apps/sdk";
import {getMe, getSellerBalance} from "../services/api";

function SellerCabinet() {
    const navigate = useNavigate();
    const [balance, setBalance] = useState(0);

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
    const handleMyBalanceClick = () => {
        navigate(`/seller-cabinet/balance`);
    }

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const sellerId = await getMe()
                const response = await getSellerBalance(sellerId.toString());
                console.log("response");
                console.log(response);
                console.log(response.data);
                console.log(response.data.balance);
                setBalance(response.data);
            } catch (error) {
                console.error("Ошибка получения баланса продавца:", error);
            }
        };
        fetchBalance();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-t-gray">  {/* Обертка на весь экран */}

            <div className="p-4 max-w-screen-sm mx-auto relative">
                <h1 className="text-xl font-bold mb-4 text-center">Кабинет продавца</h1>

                <p className="text-sm text-gray-700 mb-6 text-center">
                    ВБКэшбэк — сервис для управления раздачами товара за кэшбэк
                </p>

                <div className="border-gradient-tr-darkGray border border-gradient-tr-darkGray rounded-md p-4 mb-4"
                     onClick={handleMyBalanceClick}
                >
                    <p className="text-md font-semibold mb-1">Баланс</p>
                    <p className="text-2xl font-bold">{balance}</p>
                    <p className="text-sm text-gray-500">Доступное количество раздач</p>
                </div>

                {/*<div className="flex justify-end mb-4">*/}
                    <button
                        onClick={() => navigate('/create-product')}
                        className="w-full border border-gradient-r-brand rounded-md px-4 py-2 text-base font-semibold hover:bg-gray-100"
                    >
                        Разместить товар
                    </button>
                {/*</div>*/}

                <div
                    onClick={handleMyProductsClick}
                    className="border-gradient-tr-darkGray border border-gradient-tr-darkGray rounded-md p-4 mb-4 mt-4 cursor-pointer"
                >
                    <p className="text-md font-semibold mb-1">Мои товары</p>
                    <p className="text-sm text-gray-500">Товары по раздачам</p>
                </div>

                <div
                    onClick={handleReportsClick}
                    className="bg-gradient-tr-white border border-gradient-tr-darkGray rounded-md p-4 mb-4 cursor-pointer"
                >
                    <p className="text-md font-semibold mb-1">Отчеты по выкупам</p>
                    <p className="text-sm text-gray-500">
                        Просмотр отчетов по покупкам ваших товаров
                    </p>
                </div>


                <div
                    className="border-gradient-tr-darkGray border border-gradient-tr-darkGray rounded-md p-4 flex items-center gap-2 cursor-pointer">
                    <img src="/icons/support.png" alt="Support" className="w-8 h-8"/>
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

import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {on} from "@telegram-apps/sdk";
import {getMe, getSellerBalance} from "../services/api";

function SellerCabinet() {
    const navigate = useNavigate();
    const [balance, setBalance] = useState(0);

    const handleMyProductsClick = () => navigate('/my-products');


    // useEffect(() => {
    //   const unsub = on('back_button_pressed', () => {
    //     navigate('/', { replace: true });
    //   });
    //   return unsub;
    // }, [navigate]);


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

    const handleSupportClick = () => {
        if (window.Telegram?.WebApp?.close) {
            window.Telegram.WebApp.close();
        }
        window.open(process.env.REACT_APP_SUPPORT_URL, '_blank');
    };



    return (
        <div className="min-h-screen bg-gray-200">  {/* Обертка на весь экран */}

            <div className="p-4 max-w-screen-sm mx-auto relative">
                <h1 className="text-xl font-bold mb-4 text-center">Кабинет продавца</h1>

                <p className="text-sm text-gray-700 mb-6 text-center">
                    ВБКэшбэк — сервис для управления раздачами товара за кэшбэк
                </p>

                <div className="bg-white border border-darkGray rounded-md p-4 mb-4 relative"
                >
                    <button
                        onClick={handleMyBalanceClick}
                        className="
    absolute top-2 right-2
    bg-brand
    hover:bg-brand-dark
    text-white
    rounded-md
    px-3 py-1.5
    text-sm font-semibold
    transition-colors
  "
                    >
                        Пополнить
                    </button>

                    <p className="text-md font-semibold mb-1">Баланс</p>
                    <p className="text-2xl font-bold">{balance} раздач</p>
                    <p className="text-sm text-gray-500">Доступное количество раздач</p>
                </div>

                {/*<div className="flex justify-end mb-4">*/}
                    <button
                        onClick={() => navigate('/create-product')}
                        className="w-full border bg-white border-brand rounded-md px-4 py-2 text-base font-semibold hover:bg-gray-200-100"
                    >
                        Разместить товар
                    </button>
                {/*</div>*/}

                <div
                    onClick={handleMyProductsClick}
                    className="bg-white border border-darkGray rounded-md p-4 mb-4 mt-4 cursor-pointer"
                >
                    <p className="text-md font-semibold mb-1">Мои товары</p>
                    <p className="text-sm text-gray-500">Товары по раздачам</p>
                </div>

                <div
                    onClick={handleReportsClick}
                    className="bg-white border border-darkGray rounded-md p-4 mb-4 cursor-pointer"
                >
                    <p className="text-md font-semibold mb-1">Отчеты по выкупам</p>
                    <p className="text-sm text-gray-500">
                        Просмотр отчетов по покупкам ваших товаров
                    </p>
                </div>


                <div
                    onClick={handleSupportClick}
                    className="bg-white border border-brand rounded-xl shadow-sm p-4 mb-4 font-semibold cursor-pointer flex items-center gap-3"
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


export default SellerCabinet;

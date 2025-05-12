import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {on} from "@telegram-apps/sdk";
import {getMe, getSellerBalance} from "../services/api";

function SellerBalancePage() {
    const handleContactAdmin = () => {
        if (window.Telegram?.WebApp?.close) {
            window.Telegram.WebApp.close();
        }
        window.open(process.env.REACT_APP_SUPPORT_URL, '_blank');
    };

    const navigate = useNavigate();
    const [balance, setBalance] = useState(0);


    useEffect(() => {
        const removeBackListener = on('back_button_pressed', () => {
            navigate('/seller-cabinet');
        });

        return () => {
            removeBackListener();
        };
    }, [navigate]);

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
        <div className="min-h-screen bg-gray-200 flex flex-col gap-4">

            <div className="border-darkGray border border-darkGray rounded-md p-4 mx-4 mt-4">
                <p className="text-md font-semibold mb-1">Баланс</p>
                <p className="text-2xl font-bold">{balance}</p>
                <p className="text-sm text-gray-500">Доступное количество раздач</p>
            </div>
            <p className="text-center text-gray-700 mx-4">
                Чтобы пополнить кабинет, свяжитесь с админом.
            </p>
            <button
                onClick={handleContactAdmin}
                className="p-2 rounded-lg mx-4 text-white font-semibold bg-brand hover:bg-brand justify-center"
            >
                Написать администратору
            </button>
        </div>
    );
}

export default SellerBalancePage;
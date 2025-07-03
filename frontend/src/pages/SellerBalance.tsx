import React, {useEffect} from 'react';
import {useUser} from '../contexts/user';
import {useLocation} from "react-router-dom";

function SellerBalancePage() {

    const {user, loading: userLoading, refresh} = useUser();
    const location = useLocation();

    useEffect(() => {

        if (location.pathname === '/seller-cabinet/balance') {
            refresh();
        }
    }, [location.pathname, refresh]);

        useEffect(() => {
        const handleFocus = () => {
            if (location.pathname === '/seller-cabinet/balance') {
                refresh();
            }
        };
        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [location.pathname, refresh]);

    const handleContactAdmin = () => {
        if (window.Telegram?.WebApp?.close) {
            window.Telegram.WebApp.close();
        }
        window.open(process.env.REACT_APP_SUPPORT_URL, '_blank');
    };

    // const navigate = useNavigate();

    if (userLoading) {
        return <div className="p-4">Загрузка профиля…</div>;
    }
    if (!user) {
        return <div className="p-4 text-red-600">Не авторизован</div>;
    }
    return (
        <div className="min-h-screen bg-gray-200 flex flex-col gap-4">

            <div className="border-darkGray bg-white border-darkGray rounded-md p-4 mx-4 mt-4">
                <p className="text-md font-semibold mb-1">Баланс</p>
                <p className="text-2xl font-bold">{user.free_balance}</p>
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
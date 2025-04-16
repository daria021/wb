import React, {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {on} from "@telegram-apps/sdk";

function ModeratorDashboard() {
    const navigate = useNavigate();

    useEffect(() => {
        const removeBackListener = on('back_button_pressed', () => {
            navigate('/');
        });
        return () => {
            removeBackListener();
        };
    }, [navigate]);

    const handleUsersClick = () => navigate('/moderator/users');
    const handleProductsClick = () => navigate('/moderator/products');
    const handlePushClick = () => navigate('/moderator/pushes');
    return (
        <div className="min-h-screen bg-gray-200 p-6">
            <h1 className="text-xl font-bold mb-4">Панель модератора</h1>
            <div className="grid grid-cols-2 gap-4">
                <div
                    onClick={handleUsersClick}
                    className="bg-white border border-brand text-center rounded-md shadow-sm p-4 cursor-pointer"
                >
                    <span>Управление пользователями</span>
                </div>
                <div
                    onClick={handleProductsClick}
                    className="bg-white border border-brand text-center rounded-md shadow-sm p-4 cursor-pointer"
                >
                    <span>Проверка товаров</span>
                </div>
                <div
                    onClick={handlePushClick}
                    className="bg-white border border-brand text-center rounded-md shadow-sm p-4 cursor-pointer"
                >
                    <span>Управление рассылками</span>
                </div>
            </div>
        </div>
    );
}

export default ModeratorDashboard;

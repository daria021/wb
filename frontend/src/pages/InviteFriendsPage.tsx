import React, {useEffect, useState} from 'react';
import {redirect, useNavigate} from 'react-router-dom';
import {on, shareURL} from '@telegram-apps/sdk';
import {getInviteLink} from '../services/api';

const InviteFriendsPage: React.FC = () => {
    const navigate = useNavigate();
    const [inviteLink, setInviteLink] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const removeBackListener = on('back_button_pressed', () => navigate('/'));
        return () => removeBackListener();
    }, [navigate]);

    useEffect(() => {
        async function fetchInviteLink() {
            try {
                const response = await getInviteLink();
                setInviteLink(response.data);
            } catch (err) {
                console.error('Ошибка при получении ссылки для приглашения:', err);
                setError('Не удалось получить реферальную ссылку. Попробуйте позже.');
            } finally {
                setLoading(false);
            }
        }
        fetchInviteLink();
    }, []);

    const displayLink = inviteLink
        ? inviteLink.length > 50
            ? `${inviteLink.slice(0, 25)}...${inviteLink.slice(-25)}`
            : inviteLink
        : '';

    const copyInviteLink = () => {
        navigator.clipboard.writeText(inviteLink);
        alert('Ссылка скопирована');
    };

    const handleShareInvite = () => {
        if (shareURL.isAvailable()) {
            shareURL(inviteLink, 'Заходи по моей ссылке!');
            redirect(inviteLink);
        } else {
            copyInviteLink();
        }
    };

    if (loading) {
        return <div className="p-4 text-center">Загрузка…</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-t-gray flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-gradient-tr-white rounded-lg shadow-lg p-6">
                <h1 className="text-2xl font-bold text-center text-brand mb-6">
                    Приглашай продавцов и зарабатывай с нами!
                </h1>

                <p className="leading-relaxed mb-4 text-gray-800">
                    Получи за каждое приглашение по твоей реферальной ссылке <strong>20%</strong>.

                </p>
                <p className="leading-relaxed mb-4 text-gray-800">
                    Также <strong>20%</strong> скидки получит продавец.
                </p>

                <p className="leading-relaxed mb-4 text-gray-800">
                    Минимальная выплата 1000р.
                </p>

                <div className="bg-gradient-r-brandlight border-l-4 border-gradient-r-brand p-4 mb-6 rounded">
                    <p className="text-center text-gray-900">
                        Деньги начисляются после того, как продавец совершит покупку.
                    </p>
                </div>

                {/* Invite link display */}
                <div className="flex items-center bg-gray-100 border border-gradient-tr-darkGray rounded p-2 mb-6 break-all">
                    <span className="flex-1 text-sm text-gray-700">{displayLink}</span>
                    <button onClick={copyInviteLink} className="ml-2">
                        <img src="/icons/copy.png" alt="Копировать" className="w-4 h-4" />
                    </button>
                </div>

                {/* Error message */}
                {error && (
                    <div className="p-4 mb-4 bg-red-100 text-red-800 rounded text-center">
                        {error}
                    </div>
                )}

                {/* Share button */}
                <button
                    onClick={handleShareInvite}
                    className="w-full flex items-center justify-center bg-gradient-r-brand text-white py-3 rounded-lg hover:bg-gradient-r-brand-dark transition"
                >
                    <img src="/icons/telegram.png" alt="Telegram" className="w-5 h-5 mr-2" />
                    Поделиться в Telegram
                </button>
            </div>
        </div>
    );
};

export default InviteFriendsPage;

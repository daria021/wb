import React, {useEffect, useState} from 'react';
import {redirect, useNavigate} from 'react-router-dom';
import {on, shareURL} from '@telegram-apps/sdk';
import {getInviteLink} from '../services/api';

const InviteFriendsPage: React.FC = () => {
    const navigate = useNavigate();
    const [inviteLink, setInviteLink] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    // Listen for Telegram back button event.
    useEffect(() => {
        const removeBackListener = on('back_button_pressed', () => {
            navigate('/');
        });
        return () => removeBackListener();
    }, [navigate]);

    // Fetch the invite link from your backend.
    useEffect(() => {
        async function fetchInviteLink() {
            try {
                const response = await getInviteLink();
                setInviteLink(response.data);
            } catch (err) {
                console.error('Ошибка при получении ссылки для приглашения:', err);
                setError('Не удалось получить ссылку для приглашения.');
            } finally {
                setLoading(false);
            }
        }

        fetchInviteLink();
    }, []);

    // Handle sharing using Telegram's shareURL
    const handleShareInvite = () => {
        // const shareLink = `t.me/share?url=${encodeURIComponent(inviteLink)}&text=hello`
        // navigate(shareLink);
        if (shareURL.isAvailable()) {
            shareURL(inviteLink, 'Заходи!');
            redirect(inviteLink);
        } else {
            // Fallback: copy the link to clipboard and notify user
            navigator.clipboard.writeText(inviteLink);
            alert('Ссылка скопирована в буфер обмена!');
        }
    };

    if (loading) {
        return <div className="p-4 text-center">Загрузка...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
            <div className="max-w-screen-md w-full bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-2xl font-bold mb-6 text-center text-brand">
                    Пригласите друзей
                </h1>
                <p className="text-base text-gray-800 mb-4 text-center">
                    Поделитесь своей уникальной ссылкой, чтобы приглашать друзей и получать бонусы!
                </p>
                {error ? (
                    <div className="p-4 bg-brandlight border border-gray-300 rounded text-center">
                        <p className="text-sm text-gray-700">{error}</p>
                    </div>
                ) : (
                    <div className="p-4 bg-brandlight border border-gray-300 rounded break-all text-center mb-6">
                        {inviteLink}
                    </div>
                )}
                <div className="flex justify-center">
                    <button
                        onClick={handleShareInvite}
                        className="bg-brand text-white px-4 py-2 rounded hover:bg-brand/90 transition-colors"
                    >
                        Поделиться ссылкой
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InviteFriendsPage;

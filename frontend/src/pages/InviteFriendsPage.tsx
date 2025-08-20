import React, {useEffect, useState} from 'react';
import {redirect, useNavigate} from 'react-router-dom';
import {on, shareURL} from '@telegram-apps/sdk';
import {getInviteLink} from '../services/api';
import {useUser} from "../contexts/user";
import {UserRole} from "../enums";


interface User {
    id: string;
    telegram_id: number;
    nickname: string;
    role: UserRole;
    is_banned: boolean;
    is_seller: boolean;
    balance: number;
    invited_by: string | null;
    has_discount: boolean;
    referrer_bonus: number;
    inviter: { id: string; nickname: string };
}

const InviteFriendsPage: React.FC = () => {
    const [inviteLink, setInviteLink] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const {user, loading: userLoading, refresh} = useUser();

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
        return <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-gray-600 always-spin"/>
            </div>;
    }

    return (
        <div className="min-h-screen bg-gray-200 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-2xl font-bold text-center text-brand mb-6">
                    Приглашай продавцов и зарабатывай с нами!
                </h1>

{/* Реферальный баланс (показываем только если > 0) */}
{(user?.referrer_bonus ?? 0) > 0 && (
  <div className="mb-6">
    <div className="flex items-center justify-between rounded-2xl bg-white px-5 py-4 shadow-md border border-gray-100">
      {/* Левая часть */}
      <div className="flex items-center gap-3">
        <span className="text-2xl">🎁</span>
        <span className="text-base font-semibold">
          Реферальный баланс
        </span>
      </div>

      {/* Правая часть */}
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold ">
          {user!.referrer_bonus}
        </span>
        <span className="text-base">₽</span>
      </div>
    </div>
  </div>
)}




                <p className="leading-relaxed mb-4 text-gray-800">
                    Получи за каждое приглашение по твоей реферальной ссылке <strong>20%</strong>.
                </p>
                <p className="leading-relaxed mb-4 text-gray-800">
                    Также <strong>20%</strong> скидки получит продавец.
                </p>

                <p className="leading-relaxed mb-4 text-gray-800">
                    Минимальная сумма для вывода средств 1000р.
                </p>

                <div className="bg-brandlight border-l-4 border-brand p-4 mb-6 rounded">
                    <p className="text-center text-gray-900">
                        Деньги начисляются после того, как продавец совершит покупку.
                    </p>
                </div>

                {/* Invite link display */}
                <div className="flex items-center bg-gray-200-100 border border-darkGray rounded p-2 mb-6 break-all">
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
                    className="w-full flex items-center justify-center bg-brand text-white py-3 rounded-lg hover:bg-brand-dark transition"
                >
                    <img src="/icons/telegram.png" alt="Telegram" className="w-5 h-5 mr-2" />
                    Поделиться в Telegram
                </button>
                <button
        onClick={() => {
          if (window.Telegram?.WebApp?.close) window.Telegram.WebApp.close();
          window.open(process.env.REACT_APP_SUPPORT_URL, '_blank');
        }}
        className="w-full flex items-center justify-center bg-brand mt-2 text-white py-3 rounded-lg hover:bg-brand-dark transition"
      >
        Написать администратору
      </button>
            </div>
        </div>
    );
};

export default InviteFriendsPage;

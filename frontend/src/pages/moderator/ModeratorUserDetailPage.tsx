import React, { useEffect, useState, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    getUser,
    banUser,
    unbanUser,
    promoteUser,
    demoteUser,
    increaseSellerBalance,
    increaseReferralBonus,
    markDiscountUsed
} from '../../services/api';
import {ProductStatus, UserRole} from '../../enums';
import { on } from '@telegram-apps/sdk';

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
    inviter: User;
}

function ModeratorUserDetailPage() {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Состояния для пополнения/списания баланса продавца
    const [balanceInput, setBalanceInput] = useState('');
    // Состояния для реферального бонуса
    const [bonusInput, setBonusInput] = useState('');

    useEffect(() => {
        const removeBackListener = on('back_button_pressed', () => {
            navigate('/moderator/users');
        });
        return () => {
            removeBackListener();
        };
    }, [navigate]);

    useEffect(() => {
        if (!userId) return;
        getUser(userId)
            .then((res) => setUser(res.data))
            .finally(() => setLoading(false));
    }, [userId]);

    if (loading || !user) return <div className="p-4">Загрузка...</div>;

    const handleBanToggle = async () => {
        try {
            if (user.is_banned) {
                await unbanUser(user.id);
            } else {
                await banUser(user.id);
            }
            setUser({ ...user, is_banned: !user.is_banned });
        } catch (error) {
            console.error('Ошибка при изменении статуса бана:', error);
        }
    };

    const handleRoleToggle = async () => {
        try {
            if (user.role === UserRole.MODERATOR) {
                await demoteUser(user.id);
                setUser({ ...user, role: UserRole.USER });
            } else {
                await promoteUser(user.id);
                setUser({ ...user, role: UserRole.MODERATOR });
            }
        } catch (error) {
            console.error('Ошибка при изменении роли:', error);
        }
    };


    // Функции для баланса продавца
    const handleBalanceIncrease = async () => {
        const amount = parseInt(balanceInput, 10);
        if (!amount || amount <= 0) return;
        const fd = new FormData();
        fd.append("balance", amount.toString());
        try {
            await increaseSellerBalance(user.id, fd);
            setUser({ ...user, balance: user.balance + amount });
            setBalanceInput('');
        } catch (error) {
            console.error("Ошибка при пополнении баланса:", error);
            alert("Не удалось пополнить баланс");
        }
    };

    const handleBalanceDecrease = async () => {
        const amount = parseInt(balanceInput, 10);
        if (!amount || amount <= 0) return;
        const fd = new FormData();
        // Передаем отрицательное число для списания
        fd.append("balance", (-amount).toString());
        try {
            await increaseSellerBalance(user.id, fd);
            setUser({ ...user, balance: user.balance - amount });
            setBalanceInput('');
        } catch (error) {
            console.error("Ошибка при списании баланса:", error);
            alert("Не удалось списать баланс");
        }
    };

    const handleBalanceClear = async () => {
        if (user.balance <= 0) return;
        const fd = new FormData();
        fd.append("balance", (-user.balance).toString());
        try {
            await increaseSellerBalance(user.id, fd);
            setUser({ ...user, balance: 0 });
        } catch (error) {
            console.error("Ошибка при полном списании баланса:", error);
            alert("Не удалось списать весь баланс");
        }
    };

    // Функции для реферального бонуса
    const handleReferralBonusIncrease = async () => {
        const amount = parseInt(bonusInput, 10);
        if (!amount || amount <= 0) return;
        try {
            await increaseReferralBonus(user.id, {bonus: amount});
            setUser({ ...user, referrer_bonus: user.referrer_bonus + amount });
            setBonusInput('');
        } catch (error) {
            console.error("Ошибка при начислении бонуса:", error);
            alert("Не удалось начислить бонус");
        }
    };

    const handleReferralBonusDecrease = async () => {
        const amount = parseInt(bonusInput, 10);
        if (!amount || amount <= 0) return;
        try {
            await increaseReferralBonus(user.id, { bonus: -amount });
            setUser({ ...user, referrer_bonus: user.referrer_bonus - amount });
            setBonusInput('');
        } catch (error) {
            console.error("Ошибка при списании бонуса:", error);
            alert("Не удалось списать бонус");
        }
    };

    const handleReferralBonusClear = async () => {
        if (user.referrer_bonus <= 0) return;
        const fd = new FormData();
        fd.append("bonus", (-user.referrer_bonus).toString());
        try {
            await increaseReferralBonus(user.id, {bonus: -user.referrer_bonus});
            setUser({ ...user, referrer_bonus: 0 });
        } catch (error) {
            console.error("Ошибка при полном списании бонуса:", error);
            alert("Не удалось списать весь бонус");
        }
    };

    // Функция для отметки использования скидки
    const handleDiscountUsed = async () => {
        try {
            await markDiscountUsed(user.id);
            setUser({ ...user, has_discount: false });
        } catch (error) {
            console.error("Ошибка при использовании скидки:", error);
            alert("Не удалось отметить использование скидки");
        }
    };

    return (
        <div className="p-4 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold text-center mb-4 text-brand">Профиль пользователя</h1>

            <div className="bg-white rounded shadow p-4 mb-4">
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Telegram ID:</strong> {user.telegram_id}</p>
                <p><strong>Никнейм:</strong> {user.nickname}</p>
                <p><strong>Роль:</strong> {user.role}</p>
                <p><strong>Забанен:</strong> {user.is_banned ? 'Да' : 'Нет'}</p>
                <p><strong>Продавец:</strong> {user.is_seller ? 'Да' : 'Нет'}</p>
                <strong>Баланс:</strong> {user.balance != null ? user.balance + ' руб' : '0 руб'}
                <p>
                    <strong>Пригласивший:</strong>{' '}
                    {user.inviter && user.inviter.nickname ? (
                        <a
                            href={`https://t.me/${user.inviter.nickname}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                        >
                            {user.inviter.nickname}
                        </a>
                    ) : (
                        '—'
                    )}
                </p>
                <strong>Реферальный бонус:</strong> {user.referrer_bonus != null ? user.referrer_bonus + ' руб' : '0 руб'}
                <p><strong>Скидка использована:</strong> {user.has_discount ? 'Нет' : 'Да'}</p>
            </div>

            {/* Действия над пользователем */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <button
                    onClick={handleBanToggle}
                    className="bg-red-500 text-white p-2 rounded"
                >
                    {user.is_banned ? 'Разбанить' : 'Забанить'}
                </button>
                <button
                    onClick={handleRoleToggle}
                    className="bg-yellow-500 text-white p-2 rounded"
                >
                    {user.role === 'moderator' ? 'Разжаловать' : 'Назначить модератором'}
                </button>
            </div>

            {/* Блок для управления балансом продавца */}
            {user.is_seller && (
                <div className="mb-4 p-4 bg-white rounded shadow">
                    <h2 className="text-lg font-bold mb-2 text-brand">Баланс продавца</h2>
                    <div className="flex gap-2 mb-2">
                        <input
                            type="number"
                            placeholder="Сумма"
                            value={balanceInput}
                            onChange={(e) => setBalanceInput(e.target.value)}
                            className="border p-2 rounded flex-1 text-sm min-w-0"
                        />
                        <button
                            onClick={handleBalanceIncrease}
                            className="bg-brand text-white px-2 py-1 rounded text-sm"
                        >
                            Пополнить
                        </button>
                        <button
                            onClick={handleBalanceDecrease}
                            className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                        >
                            Списать
                        </button>
                    </div>
                    <button
                        onClick={handleBalanceClear}
                        className="bg-brandlight text-brand px-2 py-1 rounded text-sm w-full"
                    >
                        Списать весь баланс
                    </button>
                </div>
            )}

            {/* Блок для управления реферальным бонусом */}
            {user.invited_by && (
                <div className="mb-4 p-4 bg-white rounded shadow">
                    <h2 className="text-lg font-bold mb-2 text-brand">Реферальный бонус</h2>
                    <div className="flex gap-2 mb-2">
                        <input
                            type="number"
                            placeholder="Сумма бонуса"
                            value={bonusInput}
                            onChange={(e) => setBonusInput(e.target.value)}
                            className="border p-2 rounded flex-1 text-sm min-w-0"
                        />
                        <button
                            onClick={handleReferralBonusIncrease}
                            className="bg-brand text-white px-2 py-1 rounded text-sm"
                        >
                            Начислить
                        </button>
                        <button
                            onClick={handleReferralBonusDecrease}
                            className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                        >
                            Списать
                        </button>
                    </div>
                    <button
                        onClick={handleReferralBonusClear}
                        className="bg-brandlight text-brand px-2 py-1 rounded text-sm w-full"
                    >
                        Списать весь бонус
                    </button>
                    {user.has_discount && (
                        <button
                            onClick={handleDiscountUsed}
                            className="mt-2 bg-brandlight text-brand p-2 rounded text-sm w-full"
                        >
                            Использовал скидку
                        </button>
                    )}
                </div>
            )}

        </div>
    );
}

export default ModeratorUserDetailPage;

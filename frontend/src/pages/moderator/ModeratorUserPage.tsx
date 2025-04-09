import React, { useEffect, useState } from 'react';
import {
    getUsers,
    getModerators,
    getSellers,
    getBannedUsers,
    banUser,
    unbanUser,
    promoteUser,
    demoteUser,
    increaseSellerBalance, getClients
} from '../../services/api';
import { UserRole } from '../../enums';
import { on } from "@telegram-apps/sdk";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/auth";
import CopyableUuid from "../../components/CopyableUuid";

interface User {
    id: string;
    telegram_id: bigint;
    nickname: string;
    role: UserRole;
    is_banned: boolean;
    is_seller: boolean;
    balance: number;
}

type FilterType = 'all' | 'moderators' | 'sellers' | 'clients' | 'banned';

function ModeratorUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<FilterType>('all');
    const { isAdmin } = useAuth();
    const navigate = useNavigate();

    const [showBalanceModal, setShowBalanceModal] = useState(false);
    const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
    const [balanceInput, setBalanceInput] = useState("");
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const removeBackListener = on('back_button_pressed', () => {
            navigate('/moderator');
        });
        return () => {
            removeBackListener();
        };
    }, [navigate]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            let response;
            switch (filter) {
                case 'moderators':
                    response = await getModerators();
                    break;
                case 'sellers':
                    response = await getSellers();
                    break;
                case 'banned':
                    response = await getBannedUsers();
                    break;
                case 'clients':
                    response = await getClients();
                    break;
                case 'all':
                default:
                    response = await getUsers();
                    break;
            }
            setUsers(response.data);
        } catch (error) {
            console.error('Ошибка при получении пользователей:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [filter]);

    const handleBan = async (userId: string) => {
        try {
            await banUser(userId);
            fetchUsers();
        } catch (error) {
            console.error('Ошибка при бане пользователя:', error);
        }
    };

    const handleUnban = async (userId: string) => {
        try {
            await unbanUser(userId);
            fetchUsers();
        } catch (error) {
            console.error('Ошибка при разбане пользователя:', error);
        }
    };

    const handlePromote = async (userId: string) => {
        try {
            await promoteUser(userId);
            fetchUsers();
        } catch (error) {
            console.error('Ошибка при назначении модератором:', error);
        }
    };

    const handleDemote = async (userId: string) => {
        try {
            await demoteUser(userId);
            fetchUsers();
        } catch (error) {
            console.error('Ошибка при разжаловании пользователя:', error);
        }
    };

    // Открытие модального окна пополнения баланса
    const openBalanceModal = (sellerId: string) => {
        setSelectedSellerId(sellerId);
        setBalanceInput("");
        setShowBalanceModal(true);
    };

    // Функция подтверждения пополнения баланса
    const handleConfirmBalance = async () => {
        const amount = parseInt(balanceInput, 10);
        if (isNaN(amount) || amount <= 0) {
            alert("Введите корректное положительное число");
            return;
        }
        const formData = new FormData();
        formData.append("balance", amount.toString());
        try {
            if (selectedSellerId) {
                await increaseSellerBalance(selectedSellerId, formData);
                alert("Баланс пополнен!");
                fetchUsers();
            }
        } catch (error) {
            console.error('Ошибка при пополнении баланса продавца:', error);
            alert("Не удалось пополнить баланс");
        }
        setShowBalanceModal(false);
    };

    const filteredUsers = users.filter(user =>
        user.nickname.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bg-gray-200 h-screen p-2">
            <h1 className="text-xl font-bold mb-3 text-center">
                Управление пользователями
            </h1>

            {/* Блок с поиском и фильтром в одну строку */}
            <div className="mb-4 flex gap-2 bg-white p-4 rounded shadow">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Поиск по нику"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full border border-gray-300 rounded p-2 text-sm"
                    />
                </div>
                <div className="flex-1 flex items-center">
                    <label
                        htmlFor="userFilter"
                        className="mr-2 text-sm font-medium whitespace-nowrap"
                    >
                        Фильтр:
                    </label>
                    <select
                        id="userFilter"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as FilterType)}
                        className="w-full border p-2 rounded text-sm"
                    >
                        <option value="all">Все пользователи</option>
                        <option value="moderators">Модераторы</option>
                        <option value="sellers">Продавцы</option>
                        <option value="banned">Забаненные</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <p className="text-center text-xs">Загрузка...</p>
            ) : (
                <div className="w-full overflow-hidden">
                    <table className="w-full table-auto divide-y divide-gray-200 text-[8px]">
                        <thead className="bg-brand text-white text-center">
                        <tr>
                            <th className="py-1 px-1">ID</th>
                            <th className="py-1 px-1">Telegram ID</th>
                            <th className="py-1 px-1">Никнейм</th>
                            <th className="py-1 px-1">Роль</th>
                            <th className="py-1 px-1">Забанен</th>
                            <th className="py-1 px-1">Продавец</th>
                            <th className="py-1 px-1">Баланс</th>
                            <th className="py-1 px-1">Действия</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-center">
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="px-1 py-1 text-[5px]">
                                    <CopyableUuid uuid={user.id} />
                                </td>
                                <td className="px-1 py-1 text-[7px]">
                                    {user.telegram_id.toString()}
                                </td>
                                <td className="px-1 py-1">{user.nickname}</td>
                                <td className="px-1 py-1">{user.role}</td>
                                <td className="px-1 py-1">{user.is_banned ? "Да" : "Нет"}</td>
                                <td className="px-1 py-1">{user.is_seller ? "Да" : "Нет"}</td>
                                <td className="px-1 py-1">{user.balance || 0}</td>
                                <td className="px-1 py-1 flex flex-wrap gap-1 justify-center">
                                    {!user.is_banned && (
                                        <button
                                            onClick={() => handleBan(user.id)}
                                            className="bg-red-500 text-white px-1 py-1 rounded text-[8px] hover:opacity-90 transition duration-150"
                                        >
                                            Бан
                                        </button>
                                    )}
                                    {user.is_banned && (
                                        <button
                                            onClick={() => handleUnban(user.id)}
                                            className="bg-brandlight text-white px-1 py-1 rounded text-[8px] hover:opacity-90 transition duration-150"
                                        >
                                            Разбан
                                        </button>
                                    )}
                                    {isAdmin && (user.role === 'user') && (
                                        <button
                                            onClick={() => handlePromote(user.id)}
                                            className="bg-blue-500 text-white px-1 py-1 rounded text-[8px] hover:opacity-90 transition duration-150"
                                        >
                                            Мод
                                        </button>
                                    )}
                                    {isAdmin && (user.role === 'moderator') && (
                                        <button
                                            onClick={() => handleDemote(user.id)}
                                            className="bg-yellow-500 text-white px-1 py-1 rounded text-[8px] hover:opacity-90 transition duration-150"
                                        >
                                            Разжаловать
                                        </button>
                                    )}
                                    {user.is_seller && (
                                        <button
                                            onClick={() => openBalanceModal(user.id)}
                                            className="bg-green-500 text-white px-1 py-1 rounded text-[8px] hover:opacity-90 transition duration-150"
                                        >
                                            Пополнить
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal для пополнения баланса */}
            {showBalanceModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-2xl shadow-2xl w-80">
                        <h2 className="text-xl font-bold text-brand mb-4 text-center">
                            Введите сумму пополнения
                        </h2>
                        <input
                            type="number"
                            placeholder="Сумма"
                            value={balanceInput}
                            onChange={(e) => setBalanceInput(e.target.value)}
                            className="border border-brandlight p-2 w-full mb-4 rounded focus:outline-none focus:ring-2 focus:ring-brand"
                        />
                        <div className="flex justify-between">
                            <button
                                onClick={() => setShowBalanceModal(false)}
                                className="px-4 py-1 bg-brandlight text-brand font-semibold rounded hover:bg-brandlight/80 transition-colors"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleConfirmBalance}
                                className="px-4 py-1 bg-brand text-white rounded font-semibold hover:bg-brand/90 transition-colors"
                            >
                                Подтвердить
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ModeratorUsersPage;

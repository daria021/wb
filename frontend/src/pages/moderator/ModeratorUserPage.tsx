import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getUsers,
    getModerators,
    getSellers,
    getBannedUsers, getUser,
    // banUser,
    // unbanUser,
    // promoteUser,
    // demoteUser,
    // increaseSellerBalance
} from '../../services/api';
import { UserRole } from '../../enums';
import { on } from '@telegram-apps/sdk';
import { useAuth } from '../../contexts/auth';
import CopyableUuid from '../../components/CopyableUuid';

interface User {
    id: string;
    telegram_id: bigint;
    nickname: string;
    role: UserRole;
    is_banned: boolean;
    is_seller: boolean;
    balance: number;
    invited_by?: string;
    inviter_tg?: string;
}

type FilterType = 'all' | 'moderators' | 'sellers' | 'banned';

function ModeratorUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<FilterType>('all');
    const { isAdmin } = useAuth();
    const navigate = useNavigate();

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
                case 'all':
                default:
                    response = await getUsers();
                    break;
            }

            // rawUsers — это список сразу после API
            const rawUsers: User[] = response.data;

            // теперь «обогащаем» каждого: если есть invited_by, достаём inviter_tg
            const enriched: User[] = await Promise.all(
                rawUsers.map(async u => {
                    if (!u.invited_by) return u;
                    try {
                        const res = await getUser(u.invited_by);
                        return {
                            ...u,
                            inviter_tg: res.data.nickname,
                        };
                    } catch {
                        // если по какой-то причине не удалось — возвращаем без inviter_tg
                        return u;
                    }
                })
            );

            setUsers(enriched);
        } catch (error) {
            console.error('Ошибка при получении пользователей:', error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchUsers();
    }, [filter]);


    // Фильтруем пользователей по нику
    const filteredUsers = users.filter(user =>
        user.nickname.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bg-gray-200 h-screen p-2">
            <h1 className="text-xl font-bold mb-3 text-center">
                Управление пользователями
            </h1>

            {/* Блок с поиском и фильтром */}
            <div className="mb-4 flex gap-2 bg-white p-4 rounded shadow">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Поиск по нику"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full border border-darkGray rounded p-2 text-sm"
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
                <div className="w-full overflow-x-auto">
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
                            <th className="py-1 px-1">Пригласивший</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-center">
                        {filteredUsers.map(user => (
                            <tr
                                key={user.id}
                                className="hover:bg-gray-200-50 cursor-pointer"
                                onClick={() => navigate(`/moderator/users/${user.id}`)}
                            >
                                <td className="px-1 py-1 text-[5px]">
                                    <CopyableUuid uuid={user.id} />
                                </td>
                                <td className="px-1 py-1 text-[7px]">
                                    {user.telegram_id.toString()}
                                </td>
                                <td className="px-1 py-1">
                                    <a
                                        href={`https://t.me/${user.nickname}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:underline"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        {user.nickname}
                                    </a>
                                </td>
                                <td className="px-1 py-1">{user.role}</td>
                                <td className="px-1 py-1">{user.is_banned ? "Да" : "Нет"}</td>
                                <td className="px-1 py-1">{user.is_seller ? "Да" : "Нет"}</td>
                                <td className="px-1 py-1">{user.balance || 0}</td>
                                <td className="px-1 py-1 text-[7px]">
                                    {user.invited_by && user.inviter_tg ? (
                                        <a
                                            href={`https://t.me/${user.inviter_tg}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:underline"
                                            onClick={e => e.stopPropagation()}
                                        >
                                            @{user.inviter_tg}
                                        </a>
                                    ) : (
                                        <span className="text-gray-400">—</span>
                                    )}
                                </td>

                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

        </div>
    );
}

export default ModeratorUsersPage;

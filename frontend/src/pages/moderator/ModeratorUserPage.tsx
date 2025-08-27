import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {getBannedUsers, getModerators, getSellers, getUser, getUsers,} from '../../services/api';
import {UserRole} from '../../enums';
import {useAuth} from '../../contexts/auth';

interface User {
    id: string;
    telegram_id: bigint;
    nickname?: string;
    role: UserRole;
    is_banned: boolean;
    is_seller: boolean;
    balance: number;
    invited_by?: string;
    inviter_tg?: string;
    phone_number?: string;
}

type FilterType = 'all' | 'moderators' | 'sellers' | 'banned';

function ModeratorUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<FilterType>('all');
    const {isAdmin} = useAuth();
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('');

    // useEffect(() => {
    //   const unsub = on('back_button_pressed', () => {
    //     navigate(`/moderator`, { replace: true });
    //   });
    //   return unsub;
    // }, [navigate]);

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
    const filteredUsers = users.filter((u) => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return true; // без запроса показываем всех
        return (
            (u.nickname ?? '').toLowerCase().includes(q) ||
            String(u.telegram_id ?? '').includes(q) ||
            (u.inviter_tg ?? '').toLowerCase().includes(q)
        );
    });

    function openChat(opts: { username?: string; id?: bigint | number | string; phone?: string }) {
        const wa: any = (window as any)?.Telegram?.WebApp;
        const idStr = opts.id ? opts.id.toString() : '';
        const phoneDigits = opts.phone ? opts.phone.replace(/\D/g, '') : '';

        // Составляем кандидаты в порядке надёжности
        const candidates: string[] = [];
        if (opts.username && opts.username.trim()) candidates.push(`https://t.me/${opts.username.trim()}`);
        if (idStr) candidates.push(`tg://user?id=${idStr}`);
        if (phoneDigits) candidates.push(`tg://resolve?phone=${phoneDigits}`);

        // Внутри мини-аппа — используем API Telegram
        if (wa && typeof wa.openTelegramLink === 'function') {
            for (const url of candidates) {
                try {
                    wa.openTelegramLink(url);
                    return;
                } catch {
                }
            }
        }
        if (wa && typeof wa.openLink === 'function' && opts.username) {
            wa.openLink(`https://t.me/${opts.username}`);
            return;
        }

        // Вне Telegram — лучшая попытка
        if (opts.username) {
            window.open(`https://t.me/${opts.username}`, '_blank', 'noopener,noreferrer');
            return;
        }
        if (idStr) {
            // tg:// может блокироваться в браузере — но пробуем
            window.location.href = `tg://user?id=${idStr}`;
            return;
        }
        if (phoneDigits) {
            window.location.href = `tg://resolve?phone=${phoneDigits}`;
        }
    }


    return (
        <div className="bg-gray-200 h-screen p-2">
            <h1 className="text-xl font-bold mb-3 text-center">
                Управление пользователями
            </h1>

            {/* Блок с поиском и фильтром */}
            <div className="mb-4 bg-white p-4 rounded shadow">
                <div className="flex flex-wrap items-center gap-3">
                    {/* Поиск */}
                    <input
                        type="text"
                        placeholder="Поиск по нику"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-[1_1_280px] min-w-[220px] border border-darkGray rounded p-2 text-sm
                 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
                    />

                    {/* Фильтр */}
                    <div className="flex items-center gap-2 flex-[0_0_auto]">
                        <label htmlFor="userFilter" className="text-sm font-medium whitespace-nowrap">
                            Фильтр:
                        </label>

                        <div className="relative">
                            <select
                                id="userFilter"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value as FilterType)}
                                className="h-10 pl-3 pr-8 min-w-[220px] max-w-full rounded-md border border-gray-300 bg-white
                     text-sm font-medium text-gray-800 appearance-none
                     focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
                            >
                                <option value="all">Все пользователи</option>
                                <option value="moderators">Модераторы</option>
                                <option value="sellers">Продавцы</option>
                                <option value="banned">Забаненные</option>
                            </select>

                            {/* стрелка */}
                            <svg
                                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-brand"
                                viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
                            >
                                <path d="M5.25 7.5l4.5 4.5 4.5-4.5h-9z"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>


            {loading ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-gray-600 always-spin"/>
                </div>
            ) : (
                <div className="w-full overflow-x-auto">
                    <table className="w-full table-auto divide-y divide-gray-200 text-[8px]">
                        <thead className="bg-brand text-white text-center">
                        <tr>
                            {/*<th className="py-1 px-1">ID</th>*/}
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
                                {/*<td className="px-1 py-1 text-[5px]">*/}
                                {/*    <CopyableUuid uuid={user.id}/>*/}
                                {/*</td>*/}
                                <td className="px-1 py-1 text-[7px]">
                                    <button
                                        className="text-blue-500 hover:underline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openChat({
                                                id: user.telegram_id,
                                                username: user.nickname,
                                                phone: user.phone_number
                                            });
                                        }}
                                        title="Открыть диалог в Telegram"
                                    >
                                        {user.telegram_id.toString()}
                                    </button>
                                </td>

                                <td className="px-1 py-1">
                                    {user.nickname ? (
                                        <a
                                            href={`https://t.me/${user.nickname}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:underline"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {user.nickname}
                                        </a>
                                    ) : (
                                        <span className="text-gray-600">{user.phone_number}</span>
                                    )}
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

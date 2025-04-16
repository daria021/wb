import React, {useEffect, useRef, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {on} from '@telegram-apps/sdk';
import {
    activatePush,
    deletePush,
    getBannedUsers,
    getClients,
    getModerators,
    getPush,
    getSellers,
    getUsers,
} from '../../services/api';
import GetUploadLink from '../../components/GetUploadLink';

interface Push {
    id: string;
    title: string;
    text: string;
    image_path?: string;
    button_text?: string;
    button_link?: string;
    creator: User;
}

interface User {
    id: string;
    name: string;
    nickname: string;
}

const PushDetailsPage: React.FC = () => {
    const {pushId} = useParams<{ pushId: string }>();
    const navigate = useNavigate();

    const [push, setPush] = useState<Push | null>(null);
    const [filter, setFilter] = useState<string>('all');
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
    const [loadingPush, setLoadingPush] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const [actionsOpen, setActionsOpen] = useState<boolean>(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActionsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const removeBackListener = on('back_button_pressed', () => {
            navigate('/moderator/pushes');
        });
        return () => {
            removeBackListener();
        };
    }, [navigate]);

    useEffect(() => {
        const fetchPushDetails = async () => {
            if (!pushId) return;
            setLoadingPush(true);
            try {
                const response = await getPush(pushId);
                setPush(response.data);
            } catch (err) {
                console.error('Ошибка загрузки рассылки:', err);
                setError('Ошибка загрузки рассылки');
            } finally {
                setLoadingPush(false);
            }
        };
        fetchPushDetails();
    }, [pushId]);

    const fetchUsers = async () => {
        setLoadingUsers(true);
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
        } catch (err) {
            console.error('Ошибка при получении пользователей:', err);
            setError('Ошибка загрузки пользователей');
        } finally {
            setLoadingUsers(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [filter]);

    const handleUserSelect = (userId: string) => {
        setSelectedUserIds((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    const handleActivatePush = async () => {
        if (!pushId) return;
        try {
            const data = {userIds: selectedUserIds};
            await activatePush(pushId, data);
            alert('Push успешно активирован!');
        } catch (err) {
            console.error('Ошибка активации push:', err);
            alert('Ошибка активации push');
        }
    };

    const handleDeletePush = async () => {
        if (!pushId) return;
        if (!window.confirm('Вы действительно хотите удалить рассылку?')) return;
        try {
            await deletePush(pushId);
            alert('Рассылка удалена');
            navigate('/moderator/pushes');
        } catch (err) {
            console.error('Ошибка удаления push:', err);
            alert('Ошибка удаления push');
        }
    };

    const handleUpdatePush = () => {
        if (!pushId) return;
        navigate(`/moderator/pushes/${pushId}/edit`);
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4 text-brand">Детали рассылки Push</h1>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            {loadingPush ? (
                <div>Загрузка рассылки...</div>
            ) : push ? (
                <div className="bg-brandlight border border-gray-300 p-6 rounded mb-6 shadow relative">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-xl font-semibold">{push.title}</h2>
                            <p className="mt-2">{push.text}</p>
                            {push.image_path && (
                                <img
                                    src={GetUploadLink(push.image_path)}
                                    alt="Изображение рассылки"
                                    className="mt-4 rounded"
                                />
                            )}
                            {push.button_text && (
                                <div className="mt-4">
                                    <strong>Кнопка: </strong>
                                    {push.button_link ? (
                                        <a
                                            href={push.button_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            {push.button_text}
                                        </a>
                                    ) : (
                                        <span>{push.button_text}</span>
                                    )}
                                </div>
                            )}
                        </div>
                        <div ref={menuRef} className="relative">
                            <img
                                src="/icons/menu.png"
                                alt="Меню"
                                className="w-6 h-6 cursor-pointer"
                                onClick={() => setActionsOpen((prev) => !prev)}
                            />
                            {actionsOpen && (
                                <div
                                    className="absolute right-0 mt-2 w-32 bg-white border border-gray-300 rounded shadow z-10">
                                    <button
                                        onClick={() => {
                                            setActionsOpen(false);
                                            handleUpdatePush();
                                        }}
                                        className="w-full text-left px-2 py-1 text-sm hover:bg-brandlight"
                                    >
                                        Редактировать
                                    </button>
                                    <button
                                        onClick={() => {
                                            setActionsOpen(false);
                                            handleDeletePush();
                                        }}
                                        className="w-full text-left px-2 py-1 text-sm hover:bg-brandlight text-red-500"
                                    >
                                        Удалить
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div>Рассылка не найдена.</div>
            )}

            <div className="mb-4 flex items-center gap-4">
                <label className="font-semibold">Фильтр пользователей:</label>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="border p-2 rounded"
                >
                    <option value="all">Все</option>
                    <option value="moderators">Модераторы</option>
                    <option value="sellers">Продавцы</option>
                    <option value="banned">Забаненные</option>
                    <option value="clients">Клиенты</option>
                </select>
            </div>

            <div className="bg-white border border-gray-300 rounded shadow overflow-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2 text-left">Выбрать</th>
                        <th className="p-2 text-left">Никнейм</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loadingUsers ? (
                        <tr>
                            <td className="p-2" colSpan={2}>
                                Загрузка пользователей...
                            </td>
                        </tr>
                    ) : users.length > 0 ? (
                        users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="p-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedUserIds.includes(user.id)}
                                        onChange={() => handleUserSelect(user.id)}
                                        className="cursor-pointer"
                                    />
                                </td>
                                <td className="p-2">{user.nickname}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td className="p-2" colSpan={2}>
                                Пользователи не найдены.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            <div className="mt-6 flex justify-center">
                <button
                    onClick={handleActivatePush}
                    className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    disabled={selectedUserIds.length === 0}
                >
                    Отправить push
                </button>
            </div>
        </div>
    );
};

export default PushDetailsPage;

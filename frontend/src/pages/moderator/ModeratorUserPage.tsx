import React, { useEffect, useState } from 'react';
import { getUsers, getModerators, getSellers, getBannedUsers, banUser, unbanUser, promoteUser, demoteUser } from '../../services/api';
import { UserRole } from '../../enums';
import { on } from "@telegram-apps/sdk";
import { useNavigate } from "react-router-dom";

interface User {
    id: string;
    telegram_id: bigint;
    nickname: string;
    role: UserRole;
    is_banned: boolean;
    is_seller: boolean;
}

type FilterType = 'all' | 'moderators' | 'sellers' | 'banned';

function ModeratorUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<FilterType>('all');
    const navigate = useNavigate();


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
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
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
            console.error('Error banning user:', error);
        }
    };

    const handleUnban = async (userId: string) => {
        try {
            await unbanUser(userId);
            fetchUsers();
        } catch (error) {
            console.error('Error unbanning user:', error);
        }
    };

    const handlePromote = async (userId: string) => {
        try {
            await promoteUser(userId);
            fetchUsers();
        } catch (error) {
            console.error('Error promoting user:', error);
        }
    };

    const handleDemote = async (userId: string) => {
        try {
            await demoteUser(userId);
            fetchUsers();
        } catch (error) {
            console.error('Error demoting user:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-200 p-6">
            <h1 className="text-xl font-bold mb-4">Manage Users</h1>

            {/* Selector for filtering users */}
            <div className="mb-4">
                <label htmlFor="userFilter" className="mr-2 font-medium">Show:</label>
                <select
                    id="userFilter"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as FilterType)}
                    className="border p-2 rounded"
                >
                    <option value="all">All Users</option>
                    <option value="moderators">Moderators</option>
                    <option value="sellers">Sellers</option>
                    <option value="banned">Banned Users</option>
                </select>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <table className="min-w-full bg-white">
                    <thead>
                    <tr>
                        <th className="py-2 border">ID</th>
                        <th className="py-2 border">Telegram ID</th>
                        <th className="py-2 border">Username</th>
                        <th className="py-2 border">Role</th>
                        <th className="py-2 border">Banned</th>
                        <th className="py-2 border">Seller</th>
                        <th className="py-2 border">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td className="border px-4 py-2">{user.id}</td>
                            <td className="border px-4 py-2">{user.telegram_id.toString()}</td>
                            <td className="border px-4 py-2">{user.nickname}</td>
                            <td className="border px-4 py-2">{user.role}</td>
                            <td className="border px-4 py-2">{user.is_banned ? "Yes" : "No"}</td>
                            <td className="border px-4 py-2">{user.is_seller ? "Yes" : "No"}</td>
                            <td className="border px-4 py-2">
                                {!user.is_banned && (
                                    <button
                                        onClick={() => handleBan(user.id)}
                                        className="bg-red-500 text-white px-2 py-1 mr-2"
                                    >
                                        Ban
                                    </button>
                                )}
                                {user.is_banned && (
                                    <button
                                        onClick={() => handleUnban(user.id)}
                                        className="bg-green-500 text-white px-2 py-1 mr-2"
                                    >
                                        Unban
                                    </button>
                                )}
                                {user.role !== 'moderator' && (
                                    <button
                                        onClick={() => handlePromote(user.id)}
                                        className="bg-blue-500 text-white px-2 py-1 mr-2"
                                    >
                                        Promote
                                    </button>
                                )}
                                {user.role === 'moderator' && (
                                    <button
                                        onClick={() => handleDemote(user.id)}
                                        className="bg-yellow-500 text-white px-2 py-1"
                                    >
                                        Demote
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default ModeratorUsersPage;

import React, { useEffect, useState } from 'react';
import { fetchPushes, createPush, deletePush } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { on } from '@telegram-apps/sdk';

interface Push {
    id: string;
    title: string;
    text: string;
    button_text?: string;
    button_link?: string;
}

const PushAdminPage: React.FC = () => {
    const navigate = useNavigate();

    const [pushes, setPushes] = useState<Push[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const removeBackListener = on('back_button_pressed', () => {
            navigate('/moderator');
        });
        return () => {
            removeBackListener();
        };
    }, [navigate]);

    // Load pushes on mount
    useEffect(() => {
        const loadPushes = async () => {
            setIsLoading(true);
            try {
                const data = await fetchPushes();
                setPushes(data);
            } catch (err) {
                setError('Ошибка загрузки рассылок');
            } finally {
                setIsLoading(false);
            }
        };
        loadPushes();
    }, []);

    // Handle delete push with trash icon
    const handleDeletePush = async (id: string, event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent row click
        if (!window.confirm('Вы действительно хотите удалить эту рассылку?')) return;
        try {
            await deletePush(id);
            const updatedPushes = await fetchPushes();
            setPushes(updatedPushes);
            alert('Рассылка удалена');
        } catch (err) {
            alert('Ошибка удаления рассылки');
            console.error(err);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4 text-brand">Управление рассылками</h1>
            {isLoading ? (
                <div>Загрузка...</div>
            ) : error ? (
                <div className="text-red-500">{error}</div>
            ) : (
                <>
                    <table className="min-w-full border border-gray-300">
                        <thead className="bg-brandlight">
                        <tr>
                            <th className="border border-gray-300 p-2 text-left text-base">Название</th>
                            <th className="border border-gray-300 p-2 text-left text-base">Текст рассылки</th>
                            <th className="border border-gray-300 p-2 text-left text-base">Кнопка</th>
                            <th className="border border-gray-300 p-2"></th>
                        </tr>
                        </thead>
                        <tbody>
                        {pushes.map((push) => (
                            <tr
                                key={push.id}
                                className="cursor-pointer hover:bg-gray-50"
                                onClick={() => navigate(`/moderator/pushes/${push.id}`)}
                            >
                                <td className="border border-gray-300 p-2 text-base">{push.title}</td>
                                <td className="border border-gray-300 p-2 text-base">{push.text}</td>
                                <td className="border border-gray-300 p-2 text-base">
                                    {push.button_text ? (
                                        <span>{push.button_text}</span>
                                    ) : (
                                        '—'
                                    )}
                                </td>
                                <td className="border border-gray-300 p-2 text-center">
                                    <img
                                        src="/icons/trash.png"
                                        alt="Удалить"
                                        className="w-7 h-4 cursor-pointer"
                                        onClick={(e) => handleDeletePush(push.id, e)}
                                    />
                                </td>
                            </tr>
                        ))}
                        {pushes.length === 0 && (
                            <tr>
                                <td colSpan={4} className="border border-gray-300 p-2 text-center">
                                    Нет созданных рассылок.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>

                    {/* Fixed "+" button at the bottom right */}
                    <div className="fixed bottom-4 right-4">
                        <button
                            onClick={() => navigate(`/moderator/pushes/new`)}
                            className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500 text-white shadow-xl hover:bg-green-600"
                            title="Добавить новую рассылку"
                        >
                            +
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default PushAdminPage;

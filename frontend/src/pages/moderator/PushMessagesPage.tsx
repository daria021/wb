import React, { useEffect, useState } from 'react';


function PushMessagesPage() {
    const [pushes, setPushes] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newText, setNewText] = useState('');


    const handleAddNew = () => {
        // Формируем новый объект рассылки
        const newPush = {
            id: Date.now(), // Используется timestamp в качестве уникального идентификатора
            title: newTitle,
            text: newText,
        };

        // Добавляем новую рассылку в список
        setPushes(prevPushes => [...prevPushes, newPush]);

        // Сбрасываем состояние формы и закрываем её
        setNewTitle('');
        setNewText('');
        setShowForm(false);
    };

    const handleDelete = (id) => {
        // Простейший вариант удаления: фильтрация элементов
        setPushes(prevPushes => prevPushes.filter(push => push.id !== id));
    };

    return (
        <div className="p-4">
            {/* Заголовок страницы */}
            <h1 className="text-2xl font-bold mb-4">Рассылки Push</h1>

            {/* Кнопка для открытия формы добавления новой рассылки */}
            <button
                onClick={() => setShowForm(true)}
                className="bg-blue-500 text-white px-4 py-2 mb-4 rounded"
            >
                Добавить новую рассылку
            </button>

            {/* Форма добавления новой рассылки */}
            {showForm && (
                <div className="border border-gray-300 p-4 rounded mb-4">
                    <h2 className="text-xl font-semibold mb-2">Новая рассылка</h2>
                    <div className="mb-2">
                        <label className="block mb-1">Название</label>
                        <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="Введите название рассылки"
                            className="border border-gray-300 p-2 w-full rounded"
                        />
                    </div>
                    <div className="mb-2">
                        <label className="block mb-1">Текст рассылки</label>
                        <textarea
                            value={newText}
                            onChange={(e) => setNewText(e.target.value)}
                            placeholder="Введите текст рассылки"
                            className="border border-gray-300 p-2 w-full rounded"
                        ></textarea>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setShowForm(false)}
                            className="px-4 py-2 border border-gray-300 rounded"
                        >
                            Отмена
                        </button>
                        <button
                            onClick={handleAddNew}
                            className="bg-green-500 text-white px-4 py-2 rounded"
                        >
                            Добавить
                        </button>
                    </div>
                </div>
            )}

            {/* Таблица со списком рассылок */}
            <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2 text-left">Название</th>
                    <th className="border border-gray-300 p-2 text-left">Текст рассылки</th>
                    <th className="border border-gray-300 p-2 text-left">Действия</th>
                </tr>
                </thead>
                <tbody>
                {pushes.length > 0 ? (
                    pushes.map(push => (
                        <tr key={push.id}>
                            <td className="border border-gray-300 p-2">{push.title}</td>
                            <td className="border border-gray-300 p-2">{push.text}</td>
                            <td className="border border-gray-300 p-2">
                                <button
                                    onClick={() => handleDelete(push.id)}
                                    className="bg-red-500 text-white px-3 py-1 rounded"
                                >
                                    Удалить
                                </button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="3" className="border border-gray-300 p-2 text-center">
                            Нет созданных рассылок.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
}

export default PushMessagesPage;

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { on } from "@telegram-apps/sdk";

function AboutPage() {
    const navigate = useNavigate();

    useEffect(() => {
        const removeBackListener = on('back_button_pressed', () => {
            navigate(`/`);
        });

        return () => {
            removeBackListener();
        };
    }, [navigate]);

    const handleQuestion = () => navigate('/question');
    const handleInstruction = () => navigate('/instruction');
    const handleRequirements = () => navigate('/requirements');

    return (
        <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
            <div className="max-w-screen-md w-full bg-white rounded-lg shadow-lg p-6">
                <div className="gap-6">
                    {/* Основной заголовок */}
                    <h1 className="text-3xl font-bold mb-6 text-left">О сервисе:</h1>

                    <div className="bg-brandlight rounded-lg p-4">
                        {/* Обзор сервиса */}
                        <section className="mb-6 text-left">
                            <p className="text-lg text-gray-800 mb-4">
                                ВБ КЭШБЭК - бот поможет менеджерам эффективнее проводить раздачи, а покупателям безопасно выкупать. Инструкция для покупателей, Обзор на кабинет продавца, Канал по раздачам.
                            </p>
                        </section>

                        {/* Информация для менеджеров */}
                        <section className="mb-6 text-left">
                            <h2 className="text-2xl font-bold mb-3">Для менеджеров</h2>
                            <ul className="list-disc list-inside text-lg text-gray-800 space-y-2">
                                <li>Сократит количество чатов</li>
                                <li>Удобные отчеты</li>
                                <li>Управление раздачами через кабинет</li>
                                <li>Моментальные уведомления о выкупах и выплатах</li>
                                <li>Неограниченное количество товаров</li>
                                <li>Можно раздавать одновременно товары разных продавцов</li>
                            </ul>
                        </section>

                        {/* Информация для покупателей */}
                        <section className="mb-6 text-left">
                            <h2 className="text-2xl font-bold mb-3">Для покупателей</h2>
                            <ul className="list-disc list-inside text-lg text-gray-800 space-y-2">
                                <li>Безопасные сделки</li>
                                <li>Простая инструкция</li>
                                <li>Проверенные продавцы</li>
                            </ul>
                        </section>

                        {/* Кнопки для других статей */}
                        <section className="mb-6 text-left">
                            <h2 className="text-2xl font-bold mb-3">Другие статьи</h2>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={handleQuestion}
                                    className="py-2 px-4 rounded-lg text-sm font-semibold border border-brand text-brand bg-transparent w-auto"
                                >
                                    Ответы на частые вопросы
                                </button>
                                <button
                                    onClick={handleInstruction}
                                    className="py-2 px-4 rounded-lg text-sm font-semibold border border-brand text-brand bg-transparent w-auto"
                                >
                                    Инструкция
                                </button>
                                <button
                                    onClick={handleRequirements}
                                    className="py-2 px-4 rounded-lg text-sm font-semibold border border-brand text-brand bg-transparent w-auto"
                                >
                                    Требования к отчету
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AboutPage;

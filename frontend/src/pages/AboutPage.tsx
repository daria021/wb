import React from 'react';
import {Link, useNavigate} from 'react-router-dom';

function AboutPage() {
    const navigate = useNavigate();

    const handleQuestion = () => navigate('/question');
    const handleInstruction = () => navigate('/instruction', {state: {backRoute: '/about'}});
    const handleRequirements = () => navigate('/requirements');
    const handleHomeClick = () => navigate('/');


    return (
        <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
            <div className="max-w-screen-md w-full bg-white border border-brand rounded-lg shadow-lg p-6">
                <div className="gap-6">
                    <h1 className="text-2xl font-bold mb-6 text-left">О сервисе:</h1>

                    {/*<div className="bg-white rounded-lg p-4">*/}
                    <section className="mb-6 text-left">
                        <p className="text-base text-gray-800 mb-4">
                            Premium Cash Back - бот поможет селлерам эффективнее проводить раздачи, а покупателям
                            безопасно выкупать. Инструкция для покупателей, Обзор на кабинет продавца, Канал по
                            раздачам.
                        </p>
                    </section>

                    <div className="space-y-2">
                        <Link
                            to="/instruction"
                            className="text-blue-600 hover:underline"
                        >
                            Инструкция для покупателей
                        </Link>
                    </div>
                    <div>
                        <a
                            href="https://storage.googleapis.com/images_avocado/VideoCashback/1%20Seller%20Access%20to%20the%20seller%20is%20account.MP4"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                        >
                            Обзор на кабинет продавца
                        </a>
                    </div>
                    <div>
                        <a
                            href="https://t.me/Premiumcashb/13"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                        >
                            Канал по раздачам
                        </a>
                    </div>
                </div>


                <section className="mb-6 mt-6 text-left">
                    <h2 className="text-xl font-bold mb-3">Для селлеров</h2>
                    <ul className="list-disc list-inside text-base text-gray-800 space-y-2">
                        <li>Сократит количество чатов</li>
                        <li>Удобные отчеты</li>
                        <li>Управление раздачами через кабинет</li>
                        <li>Моментальные уведомления о выкупах и выплатах</li>
                        <li>Неограниченное количество товаров</li>
                        <li>Можно раздавать одновременно товары разных продавцов</li>
                    </ul>
                </section>

                <section className="mb-6 text-left">
                    <h2 className="text-xl font-bold mb-3">Для покупателей</h2>
                    <ul className="list-disc list-inside text-base text-gray-800 space-y-2">
                        <li>Безопасные сделки</li>
                        <li>Простая инструкция</li>
                        <li>Проверенные продавцы</li>
                    </ul>
                    <hr className="my-6 border-darkGray"/>
                </section>

                <section className="mb-6 text-left">
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
                        <button
                            onClick={handleHomeClick}
                            className="py-2 px-4 rounded-lg text-sm font-semibold border border-brand text-brand bg-transparent w-auto"
                        >
                            На главную
                        </button>
                    </div>
                </section>
                {/*</div>*/}
            </div>
        </div>
)
    ;
}

export default AboutPage;

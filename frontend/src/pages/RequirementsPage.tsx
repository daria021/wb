import React, { useEffect, useState } from 'react';
import { on } from "@telegram-apps/sdk";
import { useNavigate } from 'react-router-dom';

function RequirementsPage() {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);

    const handleHomeClick = () => navigate('/');

    useEffect(() => {
        const removeBackListener = on('back_button_pressed', () => {
            navigate('/about');
        });
        return () => {
            removeBackListener();
        };
    }, [navigate]);

    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);

    return (
        <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
            <div className="max-w-screen-md w-full bg-brandlight rounded-lg shadow-lg p-8 relative">
                <div className="space-y-8">
                    {/* Заголовок раздела */}
                    <div className="mb-4">
                        <h2 className="text-2xl font-bold mb-4 text-left">Требования к отчету</h2>
                        <p className="text-base font-semibold text-left">
                            Не закрашивайте и не обрезайте скрины — они должны быть без повреждений.<br />
                            За нарушение требований кэшбэк не будет выплачиваться.
                        </p>
                    </div>

                    <hr className="border-gray-300" />

                    {/* Список требований */}
                    <ol className="list-decimal list-inside space-y-6 text-gray-800">
                        {/* Каждый пункт оформлен как отдельный блок */}
                        <li className="px-4">
                            <p className="font-semibold mb-1 text-lg">Заказ оформлен</p>
                            <p className="mt-1">
                                На скрине должна быть указана цена покупки и адрес ПВЗ.{' '}
                                <span onClick={openModal} className="underline text-blue-600 cursor-pointer">
                  Пример скрина заказа
                </span>
                            </p>
                        </li>
                        <li className="px-4">
                            <p className="font-semibold mb-1 text-lg">Товар получен</p>
                            <p className="mt-1">
                                На скрине должен быть указан статус "Доставлено" и дата получения.{' '}
                                <span onClick={openModal} className="underline text-blue-600 cursor-pointer">
                  Пример скрина получения товара
                </span>
                            </p>
                        </li>
                        <li className="px-4">
                            <p className="font-semibold mb-1 text-lg">Отзыв оставлен</p>
                            <p className="mt-1">
                                На скрине должен быть опубликованный отзыв из вашего личного кабинета.{' '}
                                <span onClick={openModal} className="underline text-blue-600 cursor-pointer">
                  Пример отзыва
                </span>
                            </p>
                        </li>
                        <li className="px-4">
                            <p className="font-semibold mb-1 text-lg">Разрезанный штрихкод</p>
                            <p className="mt-1">
                                Разрежьте штрихкод на мелкие кусочки и сделайте фото на фоне товара.{' '}
                                <span onClick={openModal} className="underline text-blue-600 cursor-pointer">
                  Пример разрезанного штрихкода
                </span>
                            </p>
                        </li>
                        <li className="px-4">
                            <p className="font-semibold mb-1 text-lg">Электронный чек</p>
                            <p className="mt-1">
                                Как сделать скрин электронного чека — посмотрите на ВК.{' '}
                                <span onClick={openModal} className="underline text-blue-600 cursor-pointer">
                  Пример электронного чека
                </span>
                            </p>
                        </li>
                    </ol>

                    <hr className="border-gray-300" />

                    {/* Дополнительные кнопки */}
                    <div className="flex flex-col gap-2 mt-6">
                        <button
                            onClick={() => navigate('/about')}
                            className="py-2 px-4 rounded-lg text-sm font-semibold border border-brand text-brand bg-transparent"
                        >
                            О сервисе
                        </button>
                        <button
                            onClick={() => navigate('/instruction')}
                            className="py-2 px-4 rounded-lg text-sm font-semibold border border-brand text-brand bg-transparent"
                        >
                            Инструкция
                        </button>
                        <button
                            onClick={() => navigate('/requirements')}
                            className="py-2 px-4 rounded-lg text-sm font-semibold border border-brand text-brand bg-transparent"
                        >
                            Требования к отчету
                        </button>
                        <button
                            onClick={() => {
                                if (window.Telegram?.WebApp?.close) {
                                    window.Telegram.WebApp.close();
                                }
                                window.open(process.env.REACT_APP_SUPPORT_URL, '_blank');
                            }}


                            className="py-2 px-4 rounded-lg text-sm font-semibold border border-brand text-brand bg-transparent"
                        >
                            Нужна помощь
                        </button>
                        <button
                            onClick={handleHomeClick}
                            className="py-2 px-4 rounded-lg text-sm font-semibold border border-brand text-brand bg-transparent w-auto"
                        >
                            На главную
                        </button>
                    </div>
                </div>

                {/* Модальное окно для примеров */}
                {showModal && (
                    <div
                        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                        onClick={closeModal}
                    >
                        <div
                            className="bg-white p-4 rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img src="/example4.png" alt="Пример" className="max-w-full h-auto" />
                            <button
                                onClick={closeModal}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Закрыть
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

export default RequirementsPage;

import React, { useEffect, useState } from 'react';
import { on } from "@telegram-apps/sdk";
import { useNavigate } from 'react-router-dom';

function RequirementsPage() {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);

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
            <div className="max-w-screen-md w-full bg-white rounded-lg shadow-lg p-6 relative">
                <div className="gap-6">
                    <div className="bg-brandlight rounded-lg p-4">
                        {/* Заголовок */}
                        <h2 className="text-2xl font-bold mb-4 text-left">Требования к отчету</h2>

                        {/* Вводный текст */}
                        <p className="text-base font-semibold mb-6 text-left">
                            Не закрашивайте и не обрезайте скрины. Они должны быть без повреждений. <br />
                            За нарушение требований кэшбэк не будет выплачиваться.
                        </p>

                        {/* Список требований */}
                        <ol className="list-decimal list-inside text-left text-lg text-gray-800 space-y-4">
                            <li>
                                <p className="font-semibold mb-1">Заказ оформлен</p>
                                <p>
                                    На скрине должна быть указана цена покупки и адрес ПВЗ. <br />
                                    <span onClick={openModal} className="underline text-blue-600 cursor-pointer">
                    Пример скрина заказа
                  </span>
                                </p>
                            </li>
                            <li>
                                <p className="font-semibold mb-1">Товар получен</p>
                                <p>
                                    На скрине должен быть указан статус "Доставлено" и дата получения. <br />
                                    <span onClick={openModal} className="underline text-blue-600 cursor-pointer">
                    Пример скрина получения товара
                  </span>
                                </p>
                            </li>
                            <li>
                                <p className="font-semibold mb-1">Отзыв оставлен</p>
                                <p>
                                    На скрине должен быть опубликованный отзыв из вашего личного кабинета. <br />
                                    <span onClick={openModal} className="underline text-blue-600 cursor-pointer">
                    Пример отзыва
                  </span>
                                </p>
                            </li>
                            <li>
                                <p className="font-semibold mb-1">Разрезанный штрихкод</p>
                                <p>
                                    Разрежьте штрихкод на мелкие кусочки и сделайте фото на фоне товара. <br />
                                    <span onClick={openModal} className="underline text-blue-600 cursor-pointer">
                    Пример разрезанного штрихкода
                  </span>
                                </p>
                            </li>
                            <li>
                                <p className="font-semibold mb-1">Электронный чек</p>
                                <p>
                                    Как сделать скрин электронного чека — посмотреть на ВК. <br />
                                    <span onClick={openModal} className="underline text-blue-600 cursor-pointer">
                    Пример электронного чека
                  </span>
                                </p>
                            </li>
                        </ol>
                    </div>
                </div>

                {/* Модальное окно для показа примера */}
                {showModal && (
                    <div
                        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                        onClick={closeModal}
                    >
                        <div className="bg-white p-4 rounded-lg" onClick={(e) => e.stopPropagation()}>
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

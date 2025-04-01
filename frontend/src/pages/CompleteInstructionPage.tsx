import React, { useState, useEffect } from 'react';
import { on } from "@telegram-apps/sdk";
import { useNavigate } from 'react-router-dom';


function CompleteInstructionPage() {
    const [showModal, setShowModal] = useState(false);

    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);

    const navigate = useNavigate()

    useEffect(() => {
        const removeBackListener = on('back_button_pressed', () => {
            navigate(`/`);
        });

        return () => {
            removeBackListener();
        };
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
            <div className="max-w-screen-md w-full bg-white rounded-lg shadow-lg p-6 relative">
                <div className="bg-brandlight rounded-lg p-4">
                    {/* Заголовок страницы */}
                    <h2 className="text-2xl font-bold mb-4 text-left">
                        Инструкция выкупа для покупателя
                    </h2>
                    <p className="text-lg mb-6 text-left">
                        ВБ КЭШБЭК — это бот с пошаговой инструкцией для раздачи товаров за отзыв.{' '}
                        <span onClick={openModal} className="underline text-blue-600 cursor-pointer">
                            Посмотреть видео инструкцию
                        </span>
                    </p>

                    {/* Шаг 1 */}
                    <section className="mb-6">
                        <h3 className="text-xl font-bold mb-3 text-left">
                            Шаг 1. Поиск по ключевому слову
                        </h3>
                        <ul className="list-disc list-inside text-lg text-gray-800 space-y-2">
                            <li>
                                Напишите ключевое слово в поисковик, сделайте скрин поискового запроса.
                            </li>
                            <li>
                                Смотрите товары по ключевому слову. Некоторые из товаров добавьте в корзину, сделайте скрин корзины.
                            </li>
                            <li>
                                Загрузите скрин поискового запроса и скрин корзины на первом шаге.
                            </li>
                        </ul>
                        <p className="text-base font-semibold mt-3 text-left">
                            Важно! Вводите ключевое слово вручную.
                        </p>
                    </section>

                    {/* Шаг 2 */}
                    <section className="mb-6">
                        <h3 className="text-xl font-bold mb-3 text-left">
                            Шаг 2. Найти товар продавца
                        </h3>
                        <p className="text-lg text-gray-800 text-left">
                            Найдите товар по фото на втором шаге, скопируйте артикул и вставьте его для проверки. Если артикул неверный, вы не сможете перейти на следующий шаг.
                        </p>
                    </section>

                    {/* Шаг 3 */}
                    <section className="mb-6">
                        <h3 className="text-xl font-bold mb-3 text-left">
                            Шаг 3. Добавить товар и бренд в избранное
                        </h3>
                        <p className="text-lg text-gray-800 text-left">
                            Добавьте товар и бренд в избранное.
                        </p>
                    </section>

                    {/* Шаг 4 */}
                    <section className="mb-6">
                        <h3 className="text-xl font-bold mb-3 text-left">
                            Шаг 4. Добавьте реквизиты
                        </h3>
                        <p className="text-lg text-gray-800 text-left">
                            Принимаются только банки РФ, которые есть в списке.
                        </p>
                    </section>

                    {/* Шаг 5 */}
                    <section className="mb-6">
                        <h3 className="text-xl font-bold mb-3 text-left">
                            Шаг 5. Оформление заказа
                        </h3>
                        <p className="text-lg text-gray-800 text-left">
                            Оформите заказ и прикрепите скрин заказа. На скрине должна быть указана цена покупки и адрес ПВЗ.{' '}
                            <span onClick={openModal} className="underline text-blue-600 cursor-pointer">
                Пример скрина заказа
              </span>
                        </p>
                    </section>

                    {/* Шаг 6 */}
                    <section className="mb-6">
                        <h3 className="text-xl font-bold mb-3 text-left">
                            Шаг 6. Получение товара
                        </h3>
                        <ul className="list-disc list-inside text-lg text-gray-800 space-y-2">
                            <li>Загрузите скрин полученного товара.</li>
                            <li>Сделайте фото разрезанного штрих кода на фоне товара.</li>
                            <li>
                                Загрузите скрины на 6-м шаге. На скрине должна быть указан статус "Доставлено" и дата получения.{' '}
                                <span onClick={openModal} className="underline text-blue-600 cursor-pointer">
                  Пример скрина получения товара
                </span>
                            </li>
                        </ul>
                    </section>

                    {/* Шаг 7 */}
                    <section className="mb-6">
                        <h3 className="text-xl font-bold mb-3 text-left">
                            Шаг 7. Отчет об отзыве
                        </h3>
                        <ul className="list-disc list-inside text-lg text-gray-800 space-y-2">
                            <li>Оставьте отзыв согласно требованиям на 7-м шаге.</li>
                            <li>Сделайте скрин электронного чека.</li>
                            <li>Скопируйте номер чека.</li>
                            <li>Загрузите скрины и номер чека на этом этапе.</li>
                            <li>
                <span onClick={openModal} className="underline text-blue-600 cursor-pointer">
                  Как сделать скрин электронного чека — посмотреть на ВК
                </span>
                            </li>
                        </ul>
                    </section>

                    {/* Завершение */}
                    <section>
                        <h3 className="text-xl font-bold mb-3 text-left">На этом все</h3>
                        <ul className="list-disc list-inside text-lg text-gray-800 space-y-2">
                            <li>Отчет будет направлен на проверку селлеру.</li>
                            <li>После проверки вам выплатят кэшбэк на указанные реквизиты.</li>
                        </ul>
                    </section>
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

export default CompleteInstructionPage;

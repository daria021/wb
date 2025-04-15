import React, {useEffect, useState} from 'react';
import {on} from "@telegram-apps/sdk";
import {useLocation, useNavigate} from 'react-router-dom';

function CompleteInstructionPage() {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const location = useLocation();
    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);
    const handleHomeClick = () => navigate('/');

    const backRoute = location.state?.backRoute || '/';

    useEffect(() => {
        const removeBackListener = on('back_button_pressed', () => {
            navigate(backRoute);
        });

        return () => {
            removeBackListener();
        };
    }, [navigate, backRoute]);


    return (
        <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
            <div className="max-w-screen-md w-full bg-white rounded-lg shadow-lg p-8 relative">
                <div className="bg-brandlight rounded-lg p-6 mb-8">
                    <h2 className="text-2xl font-bold mb-6 text-center">
                        Инструкция выкупа для покупателя
                    </h2>
                    <p className="text-base mb-8 text-left">
                        ВБ КЭШБЭК — это бот с пошаговой инструкцией для раздачи товаров за отзыв.{' '}
                        <span onClick={openModal} className="underline text-blue-600 cursor-pointer">
              Посмотреть видео инструкцию
            </span>
                    </p>

                    <section className="mb-8">
                        <h3 className="text-xl font-bold mb-2 text-left">Шаг 1. Поиск по ключевому слову</h3>
                        <div className="ml-4 space-y-2">
                            <p className="text-base">Напишите ключевое слово в поисковик, сделайте скрин поискового
                                запроса.</p>
                            <p className="text-base">Смотрите товары по ключевому слову. Некоторые из товаров добавьте в
                                корзину, сделайте скрин корзины.</p>
                            <p className="text-base">Загрузите скрин поискового запроса и скрин корзины на первом
                                шаге.</p>
                        </div>
                        <p className="text-base font-semibold mt-4 text-left">Важно! Вводите ключевое слово вручную.</p>
                    </section>

                    <hr className="my-6 border-gray-300"/>

                    <section className="mb-8">
                        <h3 className="text-xl font-bold mb-2 text-left">Шаг 2. Найти товар продавца</h3>
                        <p className="text-base text-gray-800 text-left ml-4">
                            Найдите товар по фото на втором шаге, скопируйте артикул и вставьте его для проверки. Если
                            артикул неверный,
                            вы не сможете перейти на следующий шаг.
                        </p>
                    </section>

                    <hr className="my-6 border-gray-300"/>

                    <section className="mb-8">
                        <h3 className="text-xl font-bold mb-2 text-left">Шаг 3. Добавить товар и бренд в избранное</h3>
                        <p className="text-base text-gray-800 text-left ml-4">
                            Добавьте товар и бренд в избранное.
                        </p>
                    </section>

                    <hr className="my-6 border-gray-300"/>

                    <section className="mb-8">
                        <h3 className="text-xl font-bold mb-2 text-left">Шаг 4. Добавьте реквизиты</h3>
                        <p className="text-base text-gray-800 text-left ml-4">
                            Принимаются только банки РФ, которые есть в списке.
                        </p>
                    </section>

                    <hr className="my-6 border-gray-300"/>

                    <section className="mb-8">
                        <h3 className="text-xl font-bold mb-2 text-left">Шаг 5. Оформление заказа</h3>
                        <p className="text-base text-gray-800 text-left ml-4">
                            Оформите заказ и прикрепите скрин заказа. На скрине должна быть указана цена покупки и адрес
                            ПВЗ.{' '}
                            <span onClick={openModal} className="underline text-blue-600 cursor-pointer">
                Пример скрина заказа
              </span>
                        </p>
                    </section>

                    <hr className="my-6 border-gray-300"/>

                    <section className="mb-8">
                        <h3 className="text-xl font-bold mb-2 text-left">Шаг 6. Получение товара</h3>
                        <div className="ml-4 space-y-2">
                            <p className="text-base">Загрузите скрин полученного товара.</p>
                            <p className="text-base">Сделайте фото разрезанного штрих кода на фоне товара.</p>
                            <p className="text-base">
                                Загрузите скрины на 6-м шаге. На скрине должна быть указана дата получения и статус
                                "Доставлено".{' '}
                                <span onClick={openModal} className="underline text-blue-600 cursor-pointer">
                  Пример скрина получения товара
                </span>
                            </p>
                        </div>
                    </section>

                    <hr className="my-6 border-gray-300"/>

                    <section className="mb-8">
                        <h3 className="text-xl font-bold mb-2 text-left">Шаг 7. Отчет об отзыве</h3>
                        <div className="ml-4 space-y-2">
                            <p className="text-base">Оставьте отзыв согласно требованиям на 7-м шаге.</p>
                            <p className="text-base">Сделайте скрин электронного чека.</p>
                            <p className="text-base">Скопируйте номер чека.</p>
                            <p className="text-base">Загрузите скрины и номер чека на этом этапе.</p>
                            <p className="text-base">
                <span onClick={openModal} className="underline text-blue-600 cursor-pointer">
                  Как сделать скрин электронного чека — посмотреть на ВК
                </span>
                            </p>
                        </div>
                    </section>

                    <hr className="my-6 border-gray-300"/>

                    <section className="mb-8">
                        <h3 className="text-xl font-bold mb-2 text-left">На этом все</h3>
                        <div className="ml-4 space-y-2">
                            <p className="text-base">Отчет будет направлен на проверку селлеру.</p>
                            <p className="text-base">После проверки вам выплатят кэшбэк на указанные реквизиты.</p>
                        </div>
                    </section>

                    <div className="flex flex-col gap-2">

                        <button
                            onClick={handleHomeClick}
                            className="py-2 px-4 rounded-lg text-sm font-semibold border border-brand text-brand bg-transparent w-auto"
                        >
                            На главную
                        </button>
                    </div>
                </div>

                {showModal && (
                    <div
                        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                        onClick={closeModal}
                    >
                        <div className="bg-white p-4 rounded-lg" onClick={(e) => e.stopPropagation()}>
                            <img src="/example4.png" alt="Пример" className="max-w-full h-auto"/>
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

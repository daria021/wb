import React, { useEffect, useState } from 'react';
import { on } from "@telegram-apps/sdk";
import { useNavigate } from 'react-router-dom';

function RequirementsPage() {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [modalImage, setModalImage] = useState('');

    // Пути к картинкам в public
    const orderImgPath = '/images/order.jpg';
    const receivingImgPath = '/images/receiving.jpg';
    const feedbackImgPath = '/images/feedback.jpg';
    const barcodeImgPath = '/images/barcode.jpg';
    const receiptImgPath = '/images/receipt.jpg';

    const handleHomeClick = () => navigate('/');

    useEffect(() => {
        const removeBackListener = on('back_button_pressed', () => {
            navigate('/about');
        });
        return () => {
            removeBackListener();
        };
    }, [navigate]);

    const openModal = (imgPath: string) => {
        setModalImage(imgPath);
        setShowModal(true);
    };
    const closeModal = () => {
        setShowModal(false);
        setModalImage('');
    };

    return (
        <div className="min-h-screen bg-gradient-t-gray flex items-center justify-center p-4">
            <div className="max-w-screen-md w-full bg-gradient-tr-white border border-gradient-r-brand rounded-lg shadow-lg p-8 relative">
                <div className="space-y-8">
                    <div className="mb-4">
                        <h2 className="text-2xl font-bold mb-4 text-left">Требования к отчету</h2>
                        <p className="text-base font-semibold text-left">
                            Не закрашивайте и не обрезайте скрины — они должны быть без повреждений.<br />
                            За нарушение требований кэшбэк не будет выплачиваться.
                        </p>
                    </div>

                    <hr className="border-gradient-tr-darkGray" />

                    <ol className="list-decimal list-inside space-y-6 text-gray-800">
                        <li className="px-4">
                            <p className="font-semibold mb-1 text-lg">Заказ оформлен</p>
                            <p className="mt-1">
                                На скрине должна быть указана цена покупки и адрес ПВЗ.{' '}
                                <span
                                    onClick={() => openModal(orderImgPath)}
                                    className="underline text-blue-600 cursor-pointer"
                                >
                  Пример скрина заказа
                </span>
                            </p>
                        </li>
                        <li className="px-4">
                            <p className="font-semibold mb-1 text-lg">Товар получен</p>
                            <p className="mt-1">
                                На скрине должен быть указан статус "Доставлено" и дата получения.{' '}
                                <span
                                    onClick={() => openModal(receivingImgPath)}
                                    className="underline text-blue-600 cursor-pointer"
                                >
                  Пример скрина получения товара
                </span>
                            </p>
                        </li>
                        <li className="px-4">
                            <p className="font-semibold mb-1 text-lg">Отзыв оставлен</p>
                            <p className="mt-1">
                                На скрине должен быть опубликованный отзыв из вашего личного кабинета.{' '}
                                <span
                                    onClick={() => openModal(feedbackImgPath)}
                                    className="underline text-blue-600 cursor-pointer"
                                >
                  Пример отзыва
                </span>
                            </p>
                        </li>
                        <li className="px-4">
                            <p className="font-semibold mb-1 text-lg">Разрезанный штрихкод</p>
                            <p className="mt-1">
                                Разрежьте штрихкод на мелкие кусочки и сделайте фото на фоне товара.{' '}
                                <span
                                    onClick={() => openModal(barcodeImgPath)}
                                    className="underline text-blue-600 cursor-pointer"
                                >
                  Пример разрезанного штрихкода
                </span>
                            </p>
                        </li>
                        <li className="px-4">
                            <p className="font-semibold mb-1 text-lg">Электронный чек</p>
                            <p className="mt-1">
                                Как сделать скрин электронного чека — посмотрите на ВК.{' '}
                                <span
                                    onClick={() => openModal(receiptImgPath)}
                                    className="underline text-blue-600 cursor-pointer"
                                >
                  Пример электронного чека
                </span>
                            </p>
                        </li>
                    </ol>

                    <hr className="border-gradient-tr-darkGray" />

                    <div className="flex flex-col gap-2 mt-6">
                        <button onClick={() => navigate('/about')} className="btn">
                            О сервисе
                        </button>
                        <button onClick={() => navigate('/instruction')} className="btn">
                            Инструкция
                        </button>
                        <button onClick={() => navigate('/requirements')} className="btn">
                            Требования к отчету
                        </button>
                        <button
                            onClick={() => {
                                window.Telegram?.WebApp?.close?.();
                                window.open(process.env.REACT_APP_SUPPORT_URL, '_blank');
                            }}
                            className="btn"
                        >
                            Нужна помощь
                        </button>
                        <button onClick={handleHomeClick} className="btn">
                            На главную
                        </button>
                    </div>
                </div>

                {showModal && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                        onClick={closeModal}
                    >
                        <div
                            className="relative bg-white rounded-lg shadow-lg p-4 max-w-lg max-h-[80vh] overflow-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={closeModal}
                                className="absolute top-2 right-2 bg-white rounded-full p-1 text-2xl text-gray-700 hover:text-gray-900"
                            >
                                &times;
                            </button>
                            <img
                                src={modalImage}
                                alt="Пример"
                                className="w-full h-auto"
                            />
                        </div>
                    </div>
                )}


            </div>
        </div>
    );
}

export default RequirementsPage;

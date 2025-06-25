import React, { useEffect, useState } from 'react';
import { on } from "@telegram-apps/sdk";
import { useNavigate } from 'react-router-dom';


type ModalContent = { src: string; isVideo: boolean };

function RequirementsPage() {
    const navigate = useNavigate();


    // Пути к картинкам в public
    const orderImgPath = '/images/order.jpg';
    const receivingImgPath = '/images/receiving.jpg';
    const feedbackImgPath = '/images/feedback.jpg';
    const barcodeImgPath = '/images/barcode.jpg';
    const receiptVideoPath = '/images/electronic_receipt.mp4';

    // единственное состояние для модалки
    const [modalContent, setModalContent] = useState<ModalContent | null>(null);

    const openModal = (src: string) => {
        setModalContent({ src, isVideo: src.endsWith('.mp4') });
    };
    const closeModal = () => setModalContent(null);

    const handleHomeClick = () => navigate('/');

    useEffect(() => {
      const unsub = on('back_button_pressed', () => {
        navigate('/about', { replace: true });
      });
      return unsub;
    }, [navigate]);

    const handleSupportClick = () => {
        if (window.Telegram?.WebApp?.close) {
            window.Telegram.WebApp.close();
        }
        window.open(process.env.REACT_APP_SUPPORT_URL, '_blank');
    };


    return (
        <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
            <div className="max-w-screen-md w-full bg-white border border-brand rounded-lg shadow-lg p-8 relative">
                <div className="space-y-8">
                    <div className="mb-4">
                        <h2 className="text-2xl font-bold mb-4 text-left">Требования к отчету</h2>
                        <p className="text-base font-semibold text-left">
                            Не закрашивайте и не обрезайте скрины — они должны быть без повреждений.<br />
                            За нарушение требований кэшбэк не будет выплачиваться.
                        </p>
                    </div>

                    <hr className="border-darkGray" />

                    <ol className="list-decimal list-inside space-y-6 text-gray-800">
                        <li className="px-4">
                            <p className="font-semibold mb-1 text-lg">Заказ оформлен</p>
                            <p className="mt-1">
                                На скрине должна быть указана цена покупки и адрес ПВЗ.{' '}
                                <div
                                    onClick={() => openModal(orderImgPath)}
                                    className="underline text-blue-600 cursor-pointer"
                                >
                  Пример скрина заказа
                </div>
                            </p>
                        </li>
                        <li className="px-4">
                            <p className="font-semibold mb-1 text-lg">Товар получен</p>
                            <p className="mt-1">
                                На скрине должен быть указан статус "Доставлено" и дата получения.{' '}
                                <div
                                    onClick={() => openModal(receivingImgPath)}
                                    className="underline text-blue-600 cursor-pointer"
                                >
                  Пример скрина получения товара
                </div>
                            </p>
                        </li>
                        <li className="px-4">
                            <p className="font-semibold mb-1 text-lg">Отзыв оставлен</p>
                            <p className="mt-1">
                                На скрине должен быть опубликованный отзыв из вашего личного кабинета.{' '}
                                <div
                                    onClick={() => openModal(feedbackImgPath)}
                                    className="underline text-blue-600 cursor-pointer"
                                >
                  Пример отзыва
                </div>
                            </p>
                        </li>
                        <li className="px-4">
                            <p className="font-semibold mb-1 text-lg">Разрезанный штрихкод</p>
                            <p className="mt-1">
                                Разрежьте штрихкод на мелкие кусочки и сделайте фото на фоне товара.{' '}
                                <div
                                    onClick={() => openModal(barcodeImgPath)}
                                    className="underline text-blue-600 cursor-pointer"
                                >
                  Пример разрезанного штрихкода
                </div>
                            </p>
                        </li>
                        <li className="px-4">
                            <p className="font-semibold mb-1 text-lg">Электронный чек</p>
                            <p className="mt-1">
                                Для того чтобы получить Электронный чек перейдите в Профиль &rarr;
                                Финансы &rarr; вкладка "Эл. чеки" &rarr; Найдите ваш чек, откройте его &rarr;
                                Скопируйте номер чека и сделайте скриншот.{' '}
                                <div>
                                    {/* Кнопка для открытия модального окна */}
                                    <div
                                        onClick={() => openModal(receiptVideoPath)}
                                        className="underline text-blue-600 cursor-pointer"
                                    >
                                  Пример получения электронного чека
                                </div>
                                </div>
                            </p>
                        </li>
                    </ol>

                    <hr className="border-darkGray" />

                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => navigate('/about')}
                            className="py-2 px-4 rounded-lg text-sm font-semibold border border-brand text-brand bg-transparent w-auto"
                        >
                            О сервисе
                        </button>
                        <button
                            onClick={() => navigate('/instruction')}
                            className="py-2 px-4 rounded-lg text-sm font-semibold border border-brand text-brand bg-transparent w-auto"
                        >
                            Инструкция
                        </button>
                        <button
                            onClick={handleSupportClick}
                            className="py-2 px-4 rounded-lg text-sm font-semibold border border-brand text-brand bg-transparent w-auto"
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

                {modalContent && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                        onClick={closeModal}
                    >
                        <div
                            className="relative bg-white p-4 rounded max-w-lg max-h-[80vh] overflow-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Крестик в правом верхнем углу */}
                            <button
                                onClick={closeModal}
                                className="absolute top-2 right-2 bg-white rounded-full p-1 text-2xl text-gray-700 hover:text-gray-900"
                            >
                                &times;
                            </button>

                            {modalContent.isVideo ? (
                                <video width="100%" height="auto" controls>
                                    <source src={modalContent.src} type="video/mp4" />
                                    Ваш браузер не поддерживает видео.
                                </video>
                            ) : (
                                <img src={modalContent.src} alt="Пример" className="w-full h-auto" />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default RequirementsPage;

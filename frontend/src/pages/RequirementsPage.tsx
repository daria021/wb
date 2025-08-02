import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';

/**
 * «Требования к отчёту» – копия текста со скринов без добавлений.
 * 👉 Поп‑апы теперь открываются прямо из заголовков (синие ссылки на примеры).
 */
export default function RequirementsPage() {
    const navigate = useNavigate();

    const EXAMPLES = {
        ORDER: '/images/screanorder.jpg',
        DELIVERY: '/images/order.jpg',
        BARCODE: '/images/barcode.jpg',
        REVIEW: '/images/feedback.jpg',
        RECEIPT: '/images/electronic_receipt.mp4',
    } as const;

    /* Модалка */
    type Modal = { src: string; isVideo: boolean } | null;
    const [modal, setModal] = useState<Modal>(null);
    const open = (src: string) => setModal({src, isVideo: src.endsWith('.mp4')});
    const close = () => setModal(null);

    /* Навигация */
    const goHome = () => navigate('/');
    const goInstruction = () => navigate('/instruction', {state: {backRoute: '/requirements'}});
    const goAbout = () => navigate('/about');

    return (
        <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4 font-body">
            <div
                className="w-full max-w-screen-lg bg-white border border-brand rounded-xl shadow-lg p-6 sm:p-8 space-y-6">
                {/* Заголовок */}
                <h1 className="text-2xl sm:text-3xl font-semibold flex items-center gap-2">
                    <span>✅ Требования к отчёту для получения кешбэка</span>
                </h1>

                {/* Важно */}
                <section className="space-y-1">
                    <p className="font-medium flex items-center gap-2">
                        <strong>⚠️ Важно:</strong>
                    </p>
                    <p>Скриншоты должны быть чёткими, без обрезок и закрашенных участков.</p>
                    <p>Все фото/скрины должны быть оригинальными — не скачанными, не смонтированными.</p>
                    <p>Невыполнение одного из пунктов может привести к <strong>отказу в выплате кешбэка.</strong></p>
                </section>

                <hr className="border-darkGray"/>

                {/* Требования */}
                <ol className="space-y-8 list-decimal list-inside text-gray-800">
                    {/* 1 */}
                    <li className="space-y-2">
                        <p className="text-lg font-medium flex flex-wrap items-center gap-2">
                            {/* Основной текст */}
                            <span className="underline text-blue-600 cursor-pointer"
                                  onClick={() => open(EXAMPLES.ORDER)}>
                📦 Скриншот подтверждения заказа
              </span>
                            {/* Ссылка‑пример */}
                            <span className="underline text-blue-600 cursor-pointer"
                                  onClick={() => open(EXAMPLES.ORDER)}>
              </span>
                        </p>

                        <strong>Что должно быть видно:</strong>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Название и цена товара</li>
                            <li>Адрес ПВЗ (пункта выдачи заказов)</li>
                        </ul>
                        <p className="flex items-start gap-1">
              <span>
                📍 Где взять: раздел <strong>"Доставки"</strong> в личном кабинете WB
              </span>
                        </p>
                    </li>

                    {/* 2 */}
                    <li className="space-y-2">
                        <p className="text-lg font-medium flex flex-wrap items-center gap-2">
              <span className="underline text-blue-600 cursor-pointer" onClick={() => open(EXAMPLES.DELIVERY)}>
                📬 Скриншот получения товара
              </span>
                            <span className="underline text-blue-600 cursor-pointer"
                                  onClick={() => open(EXAMPLES.DELIVERY)}>


              </span>
                        </p>

                        <strong>Что обязательно:</strong>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Цена товара</li>
                            <li>Статус: <strong>"Доставлено"</strong></li>
                            <li>Дата получения</li>
                        </ul>
                        <p className="flex items-start gap-1">
              <span>
                📍 Где взять: раздел <strong>"Покупки"</strong> в личном кабинете WB
              </span>
                        </p>
                    </li>

                    {/* 3 */}
                    <li className="space-y-2">
                        <p className="text-lg font-medium flex flex-wrap items-center gap-2">
              <span className="underline text-blue-600 cursor-pointer" onClick={() => open(EXAMPLES.BARCODE)}>
                ✂️ Фото разрезанного штрихкода
              </span>
                            <span className="underline text-blue-600 cursor-pointer"
                                  onClick={() => open(EXAMPLES.BARCODE)}>
              </span>
                        </p>

                        <strong>Что сделать:</strong>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Разрежьте штрихкод на несколько частей</li>
                            <li>Положите его рядом с самим товаром (без упаковки)</li>
                            <li>Сделайте общее фото</li>
                        </ul>
                        <p className="flex items-start gap-1">
                            <span>📍 Фото должно быть живым, без обработки</span>
                        </p>
                    </li>

                    {/* 4 */}
                    <li className="space-y-2">
                        <p className="text-lg font-medium flex flex-wrap items-center gap-2">
              <span className="underline text-blue-600 cursor-pointer" onClick={() => open(EXAMPLES.REVIEW)}>
                ⭐ Скриншот опубликованного отзыва
              </span>
                            <span className="underline text-blue-600 cursor-pointer"
                                  onClick={() => open(EXAMPLES.REVIEW)}>
              </span>
                        </p>

                        <strong>Требования:</strong>
                        <p>Отзыв уже должен быть размещён на WB</p>

                        <p>Должно быть видно:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Фото товара без упаковки</li>
                            <li>Текст отзыва от 2–3 предложений</li>
                            <li>Оценка (5 звёзд)</li>
                            <li>Видео, если прикладывали</li>
                        </ul>

                        <p className="flex items-start gap-1">
              <span>
                📍 Где взять: раздел <strong>"Отзывы и вопросы"</strong> или карточка товара
              </span>
                        </p>
                    </li>

                    {/* 5 */}
                    <li className="space-y-2">
                        <p className="text-lg font-medium flex flex-wrap items-center gap-2">
              <span className="underline text-blue-600 cursor-pointer" onClick={() => open(EXAMPLES.RECEIPT)}>
                🧾 Электронный чек
              </span>
                            <span className="underline text-blue-600 cursor-pointer"
                                  onClick={() => open(EXAMPLES.RECEIPT)}>

              </span>
                        </p>

                        <strong>Что нужно:</strong>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Скопировать <strong>номер чека</strong></li>
                            <li>Сделать <strong>скриншот самого чека</strong></li>
                        </ul>

                        <p className="font-medium">📍 Где взять:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Войдите в <strong>профиль WB</strong></li>
                            <li>Раздел <strong>"Финансы"</strong> → вкладка <strong>"Эл. чеки"</strong></li>
                            <li>Найдите чек по нужному заказу</li>
                        </ul>
                    </li>
                </ol>

                <hr className="border-darkGray"/>

                <p className="flex items-start gap-2 text-sm italic">
                    <span>💬 Все материалы нужно загрузить в отчёт внутри кешбэк-бота в течение дня, когда вы получили товар</span>
                </p>

                {/* Back to main button */}
                <div className="flex flex-col gap-2">
                    <button
                        onClick={goAbout}
                        className="py-2 px-4 rounded-lg text-sm font-semibold border border-brand text-brand bg-transparent w-auto"
                    >
                        О сервисе
                    </button>
                    <button
                        onClick={goInstruction}
                        className="py-2 px-4 rounded-lg text-sm font-semibold border border-brand text-brand bg-transparent w-auto"
                    >
                        Инструкция пользователя
                    </button>
                    <button
                        onClick={() => {
                            if (window.Telegram?.WebApp?.close) window.Telegram.WebApp.close();
                            window.open(process.env.REACT_APP_SUPPORT_URL, '_blank');
                        }}
                        className="px-4 py-2 border border-brand text-brand rounded-lg text-sm font-semibold hover:bg-brandlight transition"
                    >
                        Нужна помощь с отчётом
                    </button>
                    <button
                        onClick={goHome}
                        className="py-2 px-4 rounded-lg text-sm font-semibold border border-brand text-brand bg-transparent w-auto"
                    >
                        На главную
                    </button>
                </div>
            </div>

            {/* Modal */}
            {modal && (
                <>
                    <div
                        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity duration-300 ease-out z-40"
                        onClick={close}/>
                    <div className="fixed inset-0 flex justify-center items-center z-50" onClick={close}>
                        <div
                            className="relative bg-white p-4 rounded w-[90vw] h-[90vh] flex items-center justify-center"
                            onClick={e => e.stopPropagation()}
                        >
                            <button onClick={close}
                                    className="absolute top-2 right-2 bg-white rounded-full p-1 text-2xl text-gray-700 hover:text-gray-900">
                                &times;
                            </button>
                            {modal.isVideo ? (
                                <video src={modal.src} controls className="w-[95%] h-[95%] object-contain"/>
                            ) : (
                                <img src={modal.src} alt="Пример" className="w-[95%] h-[95%] object-contain"/>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

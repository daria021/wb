import React, {useRef, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {VideoOverlay} from "../App";

// Видео для вкладки "О сервисе"
const videos = [
    {
        id: 1,
        title: '📺 Знакомство с приложением',
        src: 'https://storage.googleapis.com/images_avocado/VideoCashback/1%20Getting%20to%20know%20the%20app.MP4',
    },
];

function AboutPage() {
    const navigate = useNavigate();
    const [openSrc, setOpenSrc] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleQuestion = () => navigate('/question');
    const handleInstruction = () => navigate('/instruction');
    const handleRequirementsClick = () => navigate('/requirements');

    const handleHomeClick = () => navigate('/');

    return (
        <div className="min-h-screen bg-gray-200 flex items-start justify-center p-4 pt-8 text-sm">
            <div className="max-w-screen-lg w-full bg-white border border-brand rounded-lg shadow-lg p-6">

                {/* Заголовок вкладки */}
                <h1 className="relative text-2xl font-medium mb-4 text-center">
                    <strong>О сервисе</strong>
                </h1>

                {/* Основной текст */}
                <section className="mb-6">
                    <p className="text-gray-800 mb-2">
                        <strong>Premium Cash Back</strong> — это Telegram-сервис, который помогает покупателям получать
                        кешбэк за покупки товаров на Wildberries от продавцов, а продавцам — продвигать свои товары
                        через честные отзывы и активность пользователей.
                    </p>
                    <h2 className="text-lg font-semibold mb-2 mt-4">🔍 Как работает сервис?</h2>
                    <p className="text-sm text-gray-800 mb-4">
                        <strong>Покупатель выбирает товар из списка раздач.<br/>

                            Проходит пошаговую инструкцию:</strong> ищет товар → добавляет в избранное → оформляет заказ
                        → получает товар → оставляет отзыв.<br/>

                        <strong>Загружает отчёт в боте:</strong> скриншоты заказа, получения, отзыва и фото разрезанного
                        штрихкода.<br/>

                        <strong>Продавец проверяет отчёт и выплачивает кешбэк.</strong><br/>

                        📌 Важно! <strong>Бот не осуществляет выплаты.</strong> Все расчёты происходят напрямую между
                        покупателем и продавцом.
                    </p>
                </section>


                {/* Видео "Знакомство с приложением" в "О сервисе" */}
             <section className="mb-6">
  {videos.map(({ id, title, src }) => (
    <div key={id} className="bg-white rounded-lg shadow p-4 mb-3 flex items-center justify-center min-h-14">
      <button
        className="w-full text-sm font-medium text-blue-600 hover:underline text-center bg-transparent shadow-none p-0"
        onClick={() => setOpenSrc(src)}
      >
        {title}
      </button>
    </div>
  ))}
</section>

                <section className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">🛒 Для кого этот сервис?</h2>
                    <p className="text-sm text-gray-800 mb-4">
                        <strong>Покупателям</strong> — чтобы получить реальный товар почти бесплатно + вернуть деньги
                        через кешбэк.<br/>

                        <strong>Продавцам</strong> — чтобы продвигать карточки товаров, увеличивать продажи и собирать
                        отзывы.</p>
                </section>

                <section className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">⚠️ Риски и безопасность</h2>
                    <p className="text-sm text-gray-800 mb-4">
                        <strong>Бот не несёт финансовой ответственности.<br/>

                            Проверка продавцов ограничена.</strong> Мы рекомендуем использовать <a
                        href="https://t.me/bigblacklist_bot" target="_blank" rel="noopener noreferrer"
                        className="text-blue-600 hover:underline">@bigblacklist_bot</a> и проверять продавца вручную.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">📦 Как покупателю получить кешбэк?</h2>
                    <p className="text-sm text-gray-800 mb-4">
                        Выберите товар → Пройдите инструкцию<br/>

                        Получите товар → Соберите фото- и скриншоты<br/>

                        Загрузите отчёт в боте<br/>

                        Дождитесь выплаты кешбэка от продавца</p>

<div className="bg-white rounded-lg shadow p-4 mb-3 flex items-center justify-center min-h-14">
                        <Link to="/instruction">
                            📁 Подробная инструкция для покупателей по выкупу товара
                        </Link>
</div>
                    <div className="bg-white rounded-lg shadow p-4 mb-3 flex items-center justify-center min-h-14">
  <a
    href="https://t.me/Premiumcashb"
    target="_blank"
    rel="noopener noreferrer"
    className="text-sm font-medium text-blue-600 hover:underline text-center"
  >
    📱Канал по раздачам товаров от продавцов
  </a>
</div>

                </section>

                <section className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">🤝 Как продавцу разместить товар?</h2>
                    <p className="text-sm text-gray-800 mb-4">
                        Свяжитесь с техподдержкой <br/>

                        Укажите артикул товара, сумму кешбэка, условия по отзыву <br/>

                        Оплатите размещение и отслеживайте выкупы товара
                    </p>
                    <p className="text-sm mb-4">
                        <button
                            className="bg-white rounded-lg shadow p-4 mb-3 text-center text-sm font-medium text-blue-600 hover:underline"
                            onClick={() => navigate('/instruction', {state: {openTab: 'seller'}})}
                        >
                            📁 Подробная инструкция для продавцов по раздаче товара
                        </button>
                    </p>
                </section>
                <section className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">📮 Есть вопросы?</h2>
                    <p className="text-sm text-gray-800 mb-4">
                        Сначала загляните в наш{' '}
                        <Link to="/question" className="underline italic">
                            FAQ
                        </Link>, он отвечает на 90% вопросов.
                        Если не нашли нужной информации — обратитесь в <a href="https://t.me/wbcashmoney"
                                                                          target="_blank" rel="noopener noreferrer"
                                                                          className="text-blue-600 hover:underline">техподдержку</a>
                    </p>
                </section>

                {/* Оверлей для видео */}
                {openSrc && (
                    <VideoOverlay onClose={() => setOpenSrc(null)}>
                        <div
                            className="relative bg-black p-4 max-h-[100vh] max-w-[92vw] overflow-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                className="absolute top-2 right-2 z-20 text-white text-2xl"
                                onClick={() => setOpenSrc(null)}
                                aria-label="Close"
                            >&times;</button>
                            <video
                                ref={videoRef}
                                src={openSrc!}
                                controls
                                muted
                                playsInline
                                className="block mx-auto max-h-[88vh] max-w-[88vw] object-contain"
                            />
                        </div>
                    </VideoOverlay>
                )}

                {/* Кнопки внизу */}
                <section className="flex flex-col gap-2">
                    <button
                        onClick={handleQuestion}
                        className="py-2 px-4 rounded-lg font-semibold border border-brand text-brand bg-transparent"
                    >
                        Ответы на частые вопросы
                    </button>
                    <button
                        onClick={handleInstruction}
                        className="py-2 px-4 rounded-lg font-semibold border border-brand text-brand bg-transparent"
                    >
                        Инструкция пользователя
                    </button>
                    <button
                        onClick={handleRequirementsClick}
                        className="py-2 px-4 rounded-lg font-semibold border border-brand text-brand bg-transparent"
                    >
                        Требования к отчёту
                    </button>
                    <button
                        onClick={handleHomeClick}
                        className="py-2 px-4 rounded-lg font-semibold border border-brand text-brand bg-transparent"
                    >
                        На главную
                    </button>
                </section>

            </div>
        </div>
    );
}

export default AboutPage;

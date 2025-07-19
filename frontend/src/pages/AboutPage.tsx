import React, {useRef, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {VideoOverlay} from "../App";

// Видео для вкладки "О сервисе"
const videos = [
    {
        id: 1,
        title: '🎥 Знакомство с приложением Premium Cash Back WB',
        src: 'https://storage.googleapis.com/images_avocado/VideoCashback/1%20Getting%20to%20know%20the%20app.MP4',
    },
];

// Видео для обзора кабинета продавца (располагается в секции продавцов)
const sellerVideo = {
    id: 2,
    title: '🎥 Обзор на кабинет продавца',
    src: 'https://storage.googleapis.com/images_avocado/VideoCashback/1%20Seller%20Access%20to%20the%20seller%20is%20account.MP4',
};

function AboutPage() {
    const navigate = useNavigate();
    const [openSrc, setOpenSrc] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleQuestion = () => navigate('/question');
    const handleHomeClick = () => navigate('/');

    return (
        <div className="min-h-screen bg-gray-200 flex items-start justify-center p-4 pt-8">
            <div className="max-w-screen-lg w-full bg-white border border-brand rounded-lg shadow-lg p-6">

                {/* Заголовок вкладки */}
                <h1 className="text-xl font-bold mb-4">О сервисе</h1>

                {/* Основной текст */}
                <section className="mb-6">
                    <p className="text-base font-semibold mb-2">
                        Добро пожаловать в мир выгодных покупок и эффективных продаж на WB!
                    </p>
                    <p className="text-base italic text-gray-800 mb-2">
                        Наш сервис <strong>Premium Cash Back WB</strong> создан, чтобы сделать ваш опыт на Wildberries
                        максимально комфортным и прибыльным.
                    </p>
                    <h2 className="text-lg font-semibold mb-2">Что мы предлагаем?</h2>
                    <p className="text-base text-gray-800 mb-4">
                        Мы — ваш незаменимый помощник для работы с кешбэком на WB, предлагающий решения как для
                        продавцов, так и для покупателей.
                    </p>
                </section>

                {/* Видео "Знакомство с приложением" в "О сервисе" */}
                <section className="mb-6">
                    {videos.map(({id, title, src}) => (
                        <div key={id} className="bg-white rounded-lg shadow p-4 mb-3">
                            <button
                                className="text-base font-medium text-blue-600 hover:underline"
                                onClick={() => setOpenSrc(src)}
                            >
                                {title}
                            </button>
                        </div>
                    ))}
                </section>

                {/* Секция для покупателей */}
                <section className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">Для покупателей: безопасные и выгодные покупки!</h2>
                    <ul className="list-inside space-y-1 mb-4 text-base">
                        <li><strong>✔️ Безопасные сделки по выкупу товара:</strong> мы гарантируем защиту ваших средств
                            и данных.
                        </li>
                        <li><strong>✔️ Простая инструкция:</strong> все предельно ясно и понятно — никаких сложностей!
                        </li>
                        <li><strong>✔️ Проверенные продавцы:</strong> покупайте только у надежных поставщиков.</li>
                    </ul>
                    <p className="text-base mb-2">
                        <Link to="/instruction" className="underline italic">
                            Инструкция для покупателей: подробное руководство по использованию сервиса
                        </Link>
                    </p>
                    <p className="text-base">
                        Канал по раздачам товаров: <a href="https://t.me/Premiumcashb" target="_blank"
                                                      rel="noopener noreferrer" className="underline">
                        @Premiumcashb
                    </a>
                    </p>
                </section>

                {/* Секция для продавцов */}
                <section className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">Для продавцов: эффективное управление продажами и
                        раздачами!</h2>
                    <ul className="list-inside space-y-1 mb-4 text-base">
                        <li><strong>✔️ Сокращение количества чатов:</strong> забудьте о хаосе в переписке!</li>
                        <li><strong>✔️ Удобные отчеты:</strong> все данные о продажах и раздачах в одном месте.</li>
                        <li><strong>✔️ Управление раздачами через кабинет:</strong> полный контроль над процессом.</li>
                        <li><strong>✔️ Моментальные уведомления:</strong> будьте в курсе каждой выплаты и выкупа.</li>
                        <li><strong>✔️ Неограниченное количество товаров:</strong> работайте с любым количеством
                            позиций.
                        </li>
                        <li><strong>✔️ Раздача товаров разных продавцов одновременно:</strong> экономьте время и
                            ресурсы.
                        </li>
                    </ul>

                    {/* Ссылка на инструкцию продавцов */}
                    <p className="text-base mb-4 text-center">
                        <button
                            className="underline italic"
                            onClick={() => navigate('/instruction', {state: {openTab: 'seller'}})}
                        >
                            Инструкция для продавцов: подробное руководство по использованию сервиса
                        </button>
                    </p>

                    {/* Обзор кабинета продавца как текстовая ссылка */}
                    <p className="text-base mb-4 text-center">
                        <button
                            className="underline italic"
                            onClick={() => setOpenSrc(sellerVideo.src)}
                        >
                            Обзор на кабинет продавца: узнайте все возможности личного кабинета
                        </button>
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

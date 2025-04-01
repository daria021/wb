import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {on} from "@telegram-apps/sdk";

function QuestionPage() {
    const navigate = useNavigate();
    const handleInstruction = () => navigate('/instruction');
    const handleRequirements = () => navigate('/requirements');
    const handleSupportClick = () => {
        window.open('https://t.me/snow_irbis20', '_blank');
    };
    const handleAbout = () => navigate('/about');

    useEffect(() => {
        const removeBackListener = on('back_button_pressed', () => {
            navigate('/about');
        });

        return () => {
            removeBackListener();
        };
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
            <div className="max-w-screen-md w-full bg-white rounded-lg shadow-lg p-6">
                <div className="bg-brandlight rounded-lg p-4">
                    {/* Основной заголовок */}
                    <h1 className="text-2xl font-bold mb-6 text-left">
                        ЧАСТО ЗАДАВАЕМЫЕ ВОПРОСЫ (FAQ):
                    </h1>

                    {/* 1. Общие вопросы */}
                    <section className="mb-6">
                        <h2 className="text-xl font-bold mb-3 text-left">
                            1. Общие вопросы
                        </h2>
                        <div className="mb-4 text-left text-sm">
                            <h3 className="text-lg font-bold mb-2">Как работает бот?</h3>
                            <p>
                                Бот помогает покупать товары с кэшбэком, соблюдая пошаговую инструкцию. Выбираете товар - проходите инструкцию - оформляете заказ → загружаете отчеты → получаете кэшбэк.
                            </p>
                        </div>
                        <div className="mb-4 text-left text-sm">
                            <h3 className="text-lg font-bold mb-2">Кто проводит выплаты?</h3>
                            <p>
                                Выплаты осуществляет продавец, а бот помогает фиксировать все этапы сделки.
                            </p>
                        </div>
                        <div className="mb-4 text-left text-sm">
                            <h3 className="text-lg font-bold mb-2">Как разместить товар в боте?</h3>
                            <p>
                                Если вы продавец, оставьте заявку в боте или напишите в поддержку.
                            </p>
                        </div>
                        <div className="mb-4 text-left text-sm">
                            <h3 className="text-lg font-bold mb-2">Что делать если продавец оказался мошенником?</h3>
                            <ul className="list-disc list-inside ml-4">
                                <li>
                                    После того как мы выясним, что продавец является мошенником будет создана группа куда будут добавлены все обманутые покупатели.
                                </li>
                                <li>
                                    Подробнее читайте тут //todo
                                </li>
                            </ul>
                        </div>
                    </section>

                    {/* 2. Выплаты кэшбэка */}
                    <section className="mb-6">
                        <h2 className="text-xl font-bold mb-3 text-left">
                            2. Выплаты кэшбэка
                        </h2>
                        <div className="mb-4 text-left text-sm">
                            <h3 className="text-lg font-bold mb-2">Когда я получу кэшбэк?</h3>
                            <p>
                                Кэшбэк выплачивается по согалсоно условиям в сделке:
                            </p>
                            <p>После получения товара + 7 дней</p>
                            <p>После публикации отзыва + 7 дней</p>
                            <p>На 15-й день после получения товара + 7 дней</p>
                        </div>
                        <div className="mb-4 text-left text-sm">
                            <h3 className="text-lg font-bold mb-2">Возможны ли задержки?</h3>
                            <p>
                                Да, возможны задержки из-за загрузки продавца, выходных или лимитов на переводы. Все вопросы по оплате решайте с ним.
                            </p>
                        </div>
                        <div className="mb-4 text-left text-sm">
                            <h3 className="text-lg font-bold mb-2">Как проверить, что кэшбэк отправлен?</h3>
                            <p>
                                Вы получите уведомление в боте (если продавец его отправил). Некоторые продавцы могут не отправлять уведомления, поэтому проверяйте поступления в банке.
                            </p>
                        </div>
                        <div className="mb-4 text-left text-sm">
                            <h3 className="text-lg font-bold mb-2">Какие гарантии выплат?</h3>
                            <p>
                                Нет никаких гарантий, проверяйте продавца перед тем как заключать сделку. Перед покупкой проверяйте отзывы тут @bigblacklist_bot.
                            </p>
                        </div>
                    </section>

                    {/* 3. Вопросы по инструкции */}
                    <section className="mb-6">
                        <h2 className="text-xl font-bold mb-3 text-left">
                            3. Вопросы по инструкции
                        </h2>
                        <div className="mb-4 text-left text-sm">
                            <h3 className="text-lg font-bold mb-2">Что делать, если артикул не проходит проверку?</h3>
                            <p>
                                Если бот не пускает дальше, значит это не тот товар. Попробуйте найти товар заново через поиск.
                            </p>
                        </div>
                        <div className="mb-4 text-left text-sm">
                            <h3 className="text-lg font-bold mb-2">Как поменять реквизиты?</h3>
                            <ul className="list-disc list-inside ml-4">
                                <li>Если кэшбэк уже отправлен - изменить ничего нельзя.</li>
                                <li>Пройдите все этапы до конца и там будет возможность поменять реквизиты ?</li>
                            </ul>
                        </div>
                        <div className="mb-4 text-left text-sm">
                            <h3 className="text-lg font-bold mb-2">Как поменять скриншины в отчете?</h3>
                            <p>
                                Никак. как только полностью сдадите отчет, свяжитесь с продавцом и направьте ему всю информаци.
                            </p>
                        </div>
                        <div className="mb-4 text-left text-sm">
                            <h3 className="text-lg font-bold mb-2">Можно ли купить у одного продавца несколько товаров?</h3>
                            <p>
                                Только после получения кэшбэка за предыдущий товар. ВАЖНО! не выкупайте несколько товаров пока не получите оплату.
                            </p>
                        </div>
                    </section>

                    {/* 4. Отзывы */}
                    <section className="mb-6">
                        <h2 className="text-xl font-bold mb-3 text-left">
                            4. Отзывы
                        </h2>
                        <div className="mb-4 text-left text-sm">
                            <h3 className="text-lg font-bold mb-2">Нужно ли согласовывать отзыв с продавцом?</h3>
                            <p>
                                Да, если в инструкции указано "С согласованием".
                            </p>
                        </div>
                        <div className="mb-4 text-left text-sm">
                            <h3 className="text-lg font-bold mb-2">Продавец не отвечает на согласование отзыва. Что делать?</h3>
                            <p>
                                Пишите повторно. Техподдежка будет решать вопросы только в случае если продавец окажется мошенником.
                            </p>
                        </div>
                    </section>

                    {/* 5. Проблемы с ботом */}
                    <section className="mb-6">
                        <h2 className="text-xl font-bold mb-3 text-left">
                            5. Проблемы с ботом
                        </h2>
                        <div className="mb-4 text-left text-sm">
                            <h3 className="text-lg font-bold mb-2">Не грузится бот</h3>
                            <p
                                onClick={handleSupportClick}
                                className="cursor-pointer text-blue-600 underline"
                            >
                                Обратитесь в техподдерку
                            </p>
                        </div>
                    </section>

                    {/* 6. Прочие вопросы */}
                    <section className="mb-6">
                        <h2 className="text-xl font-bold mb-3 text-left">
                            6. Прочие вопросы
                        </h2>
                        <div className="mb-4 text-left text-sm">
                            <h3 className="text-lg font-bold mb-2">Можно ли вернуть товар?</h3>
                            <p>
                                Только если обнаружен брак. Подайте заявку на возврат через приложение ВБ. укажите номер сделки. Не пишите что вы выкупали по кэшбэку.
                            </p>
                        </div>
                        <div className="mb-4 text-left text-sm">
                            <h3 className="text-lg font-bold mb-2">Остались вопросы?</h3>
                            <p
                                onClick={handleSupportClick}
                                className="cursor-pointer text-blue-600 underline"
                            >
                                Обратитесь в техподдерку
                            </p>
                        </div>
                    </section>

                    <div className="flex flex-col gap-2">
                        <button
                            onClick={handleAbout}
                            className="py-2 px-4 rounded-lg text-sm font-semibold border border-brand text-brand bg-transparent w-auto"
                        >
                            О сервисе
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
                            onClick={handleSupportClick}
                            className="py-2 px-4 rounded-lg text-sm font-semibold border border-brand text-brand bg-transparent w-auto"
                        >
                            Нужна помощь
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default QuestionPage;
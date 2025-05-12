import React, {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {on} from "@telegram-apps/sdk";

function QuestionPage() {
    const navigate = useNavigate();
    const handleInstruction = () => navigate('/instruction');
    const handleRequirements = () => navigate('/requirements');
    const handleSupportClick = () => {
        if (window.Telegram?.WebApp?.close) {
            window.Telegram.WebApp.close();
        }
        window.open(process.env.REACT_APP_SUPPORT_URL, '_blank');
    };

    const handleAbout = () => navigate('/about');
    const handleHomeClick = () => navigate('/');

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
            <div className="max-w-screen-md w-full bg-white border border-brand rounded-lg shadow-lg p-6">
                <p className="italic">
                    Привет! Наша команда создала бота, чтобы покупатели и продавцы могли легче заключать сделки.
                    <br/><br/>
                    <strong>ВАЖНО!</strong> Бот не проводит выплат, не дает никаких гарантий, поэтому будьте осторожны.
                    Мы проверяем каждого продавца перед тем как разместить его, но гарантий на 100% нет.
                    <br/><br/>
                    Перед выкупом проверяйте продавцов через бота{" "}
                    <a
                        href="https://t.me/bigblacklist_bot"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                    >
                        @bigblacklist_bot
                    </a>{" "}
                    или в других группах, где пишут отзывы. Не выкупайте одновременно много товара — вам никто не возместит деньги, если продавец окажется мошенником.
                </p>

                {/*<div className="bg-white rounded-lg p-4 mb-6">*/}
                    <h1 className="text-2xl font-bold mb-6 mt-2 text-left">
                        ЧАСТО ЗАДАВАЕМЫЕ ВОПРОСЫ (FAQ):
                    </h1>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold mb-6 text-left">
                            1. Общие вопросы
                        </h2>
                        <div className="mb-4 text-left text-sm">
                            <h3 className="text-lg font-bold mb-1">Как работает бот?</h3>
                            <p className="mt-1">
                                Бот помогает покупать товары с кэшбэком, соблюдая пошаговую инструкцию. Выбираете товар
                                – проходите инструкцию – оформляете заказ, загружаете отчеты и получаете кэшбэк.
                            </p>
                        </div>
                        <div className="mb-4 text-left text-sm">
                            <h3 className="text-lg font-bold mb-1">Кто проводит выплаты?</h3>
                            <p className="mt-1">
                                Выплаты осуществляет продавец, а бот помогает фиксировать все этапы сделки.
                            </p>
                        </div>
                        <div className="mb-4 text-left text-sm">
                            <h3 className="text-lg font-bold mb-1">Как разместить товар в боте?</h3>
                            <p className="mt-1">
                                Если вы продавец, оставьте заявку в боте или напишите в поддержку.
                            </p>
                        </div>
                        <div className="mb-4 text-left text-sm">
                            <h3 className="text-lg font-bold mb-1">Что делать если продавец оказался мошенником?</h3>
                            <ul className="list-disc list-inside ml-4 mt-1">
                                <li>
                                    После того как мы выясним, что продавец является мошенником, будет создана группа,
                                    куда будут добавлены все обманутые покупатели.
                                </li>
                                <li>
                                    Подробнее читайте{' '}
                                    <a
                                        href="https://telegra.ph/Protokol-protiv-moshennikov-03-04"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        тут
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <hr className="my-6 border-darkGray"/>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold mb-6 text-left">
                            2. Выплаты кэшбэка
                        </h2>
                        <div className="mb-4 text-left text-sm">
                            <h3 className="text-lg font-bold mb-1">Когда я получу кэшбэк?</h3>
                            <p className="mt-1">
                                Кэшбэк выплачивается согласно условиям в сделке:
                            </p>
                            <ul className="list-disc list-inside ml-4 mt-1">
                                <li>После получения товара + 7 дней</li>
                                <li>После публикации отзыва + 7 дней</li>
                                <li>На 15-й день после получения товара + 7 дней</li>
                            </ul>
                        </div>
                        <div className="mb-4 text-left text-sm">
                            <h3 className="text-lg font-bold mb-1">Возможны ли задержки?</h3>
                            <p className="mt-1">
                                Да, возможны задержки из-за загрузки продавца, выходных или лимитов на переводы. Все
                                вопросы по оплате решайте с продавцом.
                            </p>
                        </div>
                        <div className="mb-4 text-left text-sm">
                            <h3 className="text-lg font-bold mb-1">Как проверить, что кэшбэк отправлен?</h3>
                            <p className="mt-1">
                                Вы получите уведомление в боте (если продавец его отправил). Некоторые продавцы могут не
                                отправлять уведомления, поэтому проверяйте поступления в банке.
                            </p>
                        </div>
                        <div className="mb-4 text-left text-sm">
                            <h3 className="text-lg font-bold mb-1">Какие гарантии выплат?</h3>
                            <p className="mt-1">
                                Нет никаких гарантий, проверяйте продавца перед тем, как заключать сделку. Перед
                                покупкой проверяйте отзывы.
                                {/*<a*/}
                                {/*    href="https://t.me/bigblacklist_bot"*/}
                                {/*    target="_blank"*/}
                                {/*    rel="noopener noreferrer"*/}
                                {/*    className="text-blue-600 hover:underline"*/}
                                {/*>*/}
                                {/*    @bigblacklist_bot*/}
                                {/*</a>.*/}
                            </p>
                        </div>
                        <hr className="my-6 border-darkGray"/>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold mb-6 text-left">
                            3. Вопросы по инструкции
                        </h2>
                        <div className="mb-4 text-left text-sm">
                            <h3 className="text-lg font-bold mb-1">Что делать, если артикул не проходит проверку?</h3>
                            <p className="mt-1">
                                Если бот не пускает дальше, значит это не тот товар. Попробуйте найти товар заново через
                                поиск.
                            </p>
                        </div>
                        <div className="mb-4 text-left text-sm">
                            <h3 className="text-lg font-bold mb-1">Как поменять реквизиты?</h3>
                            <ul className="list-disc list-inside ml-4 mt-1">
                                <li>Если кэшбэк уже отправлен – изменить ничего нельзя.</li>
                                <li>Пройдите все этапы до конца, и там будет возможность поменять реквизиты.</li>
                            </ul>
                        </div>
                        <div className="mb-4 text-left text-sm">
                            <h3 className="text-lg font-bold mb-1">Как поменять скриншины в отчете?</h3>
                            <p className="mt-1">
                                Никак. Как только полностью сдадите отчет, свяжитесь с продавцом и направьте ему всю
                                информацию.
                            </p>
                        </div>
                        <div className="mb-4 text-left text-sm">
                            <h3 className="text-lg font-bold mb-1">Можно ли купить у одного продавца несколько
                                товаров?</h3>
                            <p className="mt-1">
                                Только после получения кэшбэка за предыдущий товар. Важно! Не выкупайте несколько
                                товаров, пока не получите оплату.
                            </p>
                        </div>
                        <hr className="my-6 border-darkGray"/>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold mb-6 text-left">
                            4. Отзывы
                        </h2>
                        <div className="mb-4 text-left text-sm">
                            <h3 className="text-lg font-bold mb-1">Нужно ли согласовывать отзыв с продавцом?</h3>
                            <p className="mt-1">
                                Да, если в инструкции указано "С согласованием".
                            </p>
                        </div>
                        <div className="mb-4 text-left text-sm">
                            <h3 className="text-lg font-bold mb-1">Продавец не отвечает на согласование отзыва. Что
                                делать?</h3>
                            <p className="mt-1">
                                Пишите повторно. Техподдержка будет решать вопросы только, если продавец окажется
                                мошенником.
                            </p>
                        </div>
                        <hr className="my-6 border-darkGray"/>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold mb-6 text-left">
                            5. Проблемы с ботом
                        </h2>
                        <div className="mb-4 text-left text-sm">
                            <h3 className="text-lg font-bold mb-1">Не грузится бот</h3>
                            <p
                                onClick={handleSupportClick}
                                className="cursor-pointer text-blue-600 underline mt-1"
                            >
                                Обратитесь в техподдержку
                            </p>
                        </div>
                        <hr className="my-6 border-darkGray"/>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold mb-6 text-left">
                            6. Прочие вопросы
                        </h2>
                        <div className="mb-4 text-left text-sm">
                            <h3 className="text-lg font-bold mb-1">Можно ли вернуть товар?</h3>
                            <p className="mt-1">
                                Только если обнаружен брак. Подайте заявку на возврат через приложение ВБ, укажите номер
                                сделки. Не пишите, что вы выкупали по кэшбэку.
                            </p>
                        </div>
                        <div className="mb-4 text-left text-sm">
                            <h3 className="text-lg font-bold mb-1">Остались вопросы?</h3>
                            <p
                                onClick={handleSupportClick}
                                className="cursor-pointer text-blue-600 underline mt-1"
                            >
                                Обратитесь в техподдержку
                            </p>
                        </div>
                        <hr className="my-6 border-darkGray"/>
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
                        <button
                            onClick={handleHomeClick}
                            className="py-2 px-4 rounded-lg text-sm font-semibold border border-brand text-brand bg-transparent w-auto"
                        >
                            На главную
                        </button>
                    </div>
                {/*</div>*/}
            </div>
        </div>
    );
}

export default QuestionPage;

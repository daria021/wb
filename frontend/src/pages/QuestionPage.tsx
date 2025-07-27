import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

function QuestionPage() {
    const navigate = useNavigate();

    const handleSupportClick = () => {
        if (window.Telegram?.WebApp?.close) {
            window.Telegram.WebApp.close();
        }
        window.open('https://t.me/wbcashmoney', '_blank');
    };

    const handleAbout = () => navigate('/about');
    const handleRequirements = () => navigate('/requirements');
    const handleInstruction = () => navigate('/instruction');
    const handleHomeClick = () => navigate('/');

    return (
        <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4 text-sm">
            <div className="max-w-screen-md w-full bg-white border border-brand rounded-lg shadow-lg p-6">

                <section className="mb-8">
                    <h1 className="text-2xl font-medium mb-6 text-left">
                        <strong>Покупателям: Частые вопросы (FAQ)</strong>
                    </h1>

                    <div className="mb-4 text-left">
                        <p>⚠️ <strong>Важная информация:</strong></p>
                        <p>
                            Бот <strong>не проводит выплаты кешбэка</strong> и не несёт <strong>финансовой ответственности</strong> за них.<br/>
                            Все обязательства лежат <strong>на продавце</strong>.<br/>
                            Мы рекомендуем проверять продавцов перед покупкой: <a href="https://t.me/bigblacklist_bot" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">@bigblacklist_bot</a> или сайты с отзывами.<br/>
                            Не выкупайте сразу много товаров у одного продавца.
                        </p>
                    </div>

                    <div className="mb-4 text-left">
                        <h3 className="text-lg font-medium mb-1">
                            <strong>🔹 1. Кто выплачивает кешбэк?</strong>
                        </h3>
                        <p className="mt-1"><strong>Кешбэк выплачивает продавец.</strong> Бот только помогает с организацией раздачи и сбором отчётов.</p>
                        <p>⚠️ Бот <strong>не несет ответственности</strong> за выплаты.</p>
                    </div>

                    <div className="mb-4 text-left">
                        <h3 className="text-lg font-medium mb-1">
                            <strong>🔹 2. Когда я получу кешбэк?</strong>
                        </h3>
                        <p>Сроки выплаты кешбэка <strong>устанавливаются продавцом</strong>:</p>
                        <ul className="list-disc list-inside ml-4">
                            <li>После публикации отзыва на WB.</li>
                            <li>После получения товара.</li>
                            <li>Через 15 дней после получения товара.</li>
                        </ul>
                        <p className="mt-1">
                            <strong>Важно!</strong> Возможна задержка до 7 дней из-за ручной проверки отчета продавцом и очереди на выплаты.
                        </p>
                        <p><strong>Как узнать, что кешбэк отправлен?</strong> Вы получите уведомление в боте и проверяйте поступление на карту.</p>
                        <p><strong>Какие гарантии выплат?</strong> Гарантий нет. Проверяйте продавца заранее.</p>
                        <p><strong>Что делать, если кешбэк не пришел?</strong> Свяжитесь с продавцом в Telegram. Если ответа нет более 7 дней, обращайтесь в <a href="https://t.me/wbcashmoney" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">техподдержку</a>.</p>
                        {/*<p className="mt-1">*/}
                        {/*    <a*/}
                        {/*        href="https://storage.googleapis.com/images_avocado/VideoCashback/17%20Buyer%20Step%20Cashback%203%20payment%20options%20Why%20there%20may%20be%20delays%20Where%20to%20mark%20the%20receipt%20of%20cashback.MP4"*/}
                        {/*        target="_blank" rel="noopener noreferrer"*/}
                        {/*        className="text-blue-600 hover:underline"*/}
                        {/*    >*/}
                        {/*        Кешбэк: возможные задержки и где отметить получение*/}
                        {/*    </a>*/}
                        {/*</p>*/}
                    </div>

                    <div className="mb-4 text-left">
                        <h3 className="text-lg font-medium mb-1">
                            <strong>🔹 3. Что делать, если продавец не отвечает для согласования отзыва?</strong>
                        </h3>
                        <p>Попробуйте повторно написать продавцу в Telegram. Мы не можем вмешиваться в согласование отзыва, только в случае мошенничества.</p>
                        <p>Если он не отвечает более 7 дней, <strong>не публикуйте отзыв</strong> и сообщите <a href="https://t.me/wbcashmoney" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">техподдержке</a>.</p>
                    </div>

                    <div className="mb-4 text-left">
                        <h3 className="text-lg font-medium mb-1">
                            <strong>🔹 4. Можно ли отменить участие в раздаче?</strong>
                        </h3>
                        <p>Если заказ ещё не оформлен на WB — нажмите "Отменить" на карточке товара в разделе "Мои покупки". Продавцу вернётся слот раздачи. Если заказ уже оформлен — пишите продавцу в Telegram для отмены.</p>
                    </div>

                    <div className="mb-4 text-left">
                        <h3 className="text-lg font-medium mb-1">
                            <strong>🔹 5. Почему отклонили мой отчет?</strong>
                        </h3>
                        <p>Основные причины:</p>
                        <ul className="list-disc list-inside ml-4">
                            <li>Нет нужных скриншотов</li>
                            <li>Не разрезан штрихкод</li>
                            <li>Нарушен срок отправки отчета</li>
                            <li>Отзыв не соответствует требованиям (например, без фото/видео)</li>
                        </ul>
                        <p className="mt-1">
                            Полный список требований можно посмотреть в разделе <Link to="/requirements" className="text-blue-600 hover:underline">«Требования к отчету»</Link>.
                        </p>
                    </div>

                    <div className="mb-4 text-left">
                        <h3 className="text-lg font-medium mb-1">
                            <strong>🔹 6. Можно ли удалить или изменить отправленный отчет?</strong>
                        </h3>
                        <p className="mt-1">Нет, после отправки отчет <strong>редактировать нельзя</strong>.</p>
                        <p>Проверьте все материалы перед отправкой.</p>
                    </div>

                    <div className="mb-4 text-left">
                        <h3 className="text-lg font-medium mb-1">
                            <strong>🔹 7. Как найти товар, если не видно в поиске?</strong>
                        </h3>
                        <p className="mt-1">
                            Используйте <strong>поиск по фото</strong> или примените <strong>фильтры по бренду/цене</strong>.
                        </p>
                    </div>

<div className="mb-4 text-left">
  <h3 className="text-lg font-medium mb-1">
    <strong>🔹 8. Вопросы по инструкции выкупа товара</strong>
  </h3>
  <ul className="list-disc list-inside ml-4">
    <li>
      <strong>Почему не проходит артикул?</strong> Скорее всего, вы выбрали не тот товар. Повторите поиск по ключевому слову или воспользуйтесь функцией поиска по фото.
    </li>
    <li>
      <strong>Как изменить реквизиты для выплаты?</strong> Пока вы не завершили сделку — можно. После выхода в раздел "Мои покупки" — уже нельзя.
    </li>
    <li>
      <strong>Можно ли заменить скриншоты?</strong> Только в процессе прохождения шагов. После отправки отчета — нет. Но вы можете связаться с продавцом в Telegram и отправить ему актуальные данные.
    </li>
    <li>
      <strong>Можно ли участвовать в нескольких раздачах у одного продавца?</strong> Да, но только после получения кешбэка за предыдущий товар от этого продавца.
    </li>
    <li>
      <strong>Нет товара в наличии на WB?</strong> Добавьте товар в "Лист ожидания" на WB и вернитесь позже.
    </li>
  </ul>
</div>

                </section>

                <section className="mb-8">
                    <h1 className="text-2xl font-medium mb-6 text-left">
                        <strong>Продавцам: Частые вопросы (FAQ)</strong>
                    </h1>

                    <div className="mb-4 text-left">
                        <h3 className="text-lg font-medium mb-1">
                            <strong>🔸 1. Что нужно, чтобы начать раздачи товара?</strong>
                        </h3>
                        <ul className="list-disc list-inside ml-4">
                            <li>Запустить бот.</li>
                            <li>Пополнить баланс.</li>
                            <li>Разместить карточку товара.</li>
                            <li>Дождаться модерации.</li>
                        </ul>
                    </div>

                    <div className="mb-4 text-left">
                        <h3 className="text-lg font-medium mb-1">
                            <strong>🔸 2. Когда списываются средства с баланса?</strong>
                        </h3>
                        <p className="mt-1">
                            Списания происходят только <strong>при подтверждённом выкупе товара и одобренном отчете</strong> от покупателя.
                        </p>
                    </div>

                    <div className="mb-4 text-left">
                        <h3 className="text-lg font-medium mb-1">
                            <strong>🔸 3. Как изменить условия по отзыву?</strong>
                        </h3>
                        <p>Зайдите в карточку товара → "Редактировать" → измените требования к отзыву.</p>
                        <p>После этого карточка временно станет неактивной и снова пройдет модерацию.</p>
                    </div>

                    <div className="mb-4 text-left">
                        <h3 className="text-lg font-medium mb-1">
                            <strong>🔸 4. Что делать, если бот не работает?</strong>
                        </h3>
                        <p className="mt-1">
                            Попробуйте перезапустить бота → /start. Если проблема не исчезает — напишите в <a href="https://t.me/wbcashmoney" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline"><strong>техподдержку</strong></a> и приложите скриншот ошибки с описанием ваших действий.
                        </p>
                    </div>
                </section>

            <div className="flex flex-col gap-2">
                    <button onClick={handleInstruction}
                    className="py-2 px-4 rounded-lg text-sm font-semibold border border-brand text-brand bg-transparent w-auto"
                    >
                        Инструкция пользователя
                    </button>
                    <button onClick={handleRequirements}
                    className="py-2 px-4 rounded-lg text-sm font-semibold border border-brand text-brand bg-transparent w-auto"
                    >
                        Требования к отчёту
                    </button>
                    <button onClick={handleAbout}
                    className="py-2 px-4 rounded-lg text-sm font-semibold border border-brand text-brand bg-transparent w-auto"
                    >
                        О сервисе
                    </button>
                    <button onClick={handleSupportClick}
                    className="py-2 px-4 rounded-lg text-sm font-semibold border border-brand text-brand bg-transparent w-auto"
                    >
                        Нужна помощь с вопросом
                    </button>
                    <button onClick={handleHomeClick}
                    className="py-2 px-4 rounded-lg text-sm font-semibold border border-brand text-brand bg-transparent w-auto"
                    >
                        На главную
                    </button>
                </div>

            </div>
        </div>
    );
}

export default QuestionPage;

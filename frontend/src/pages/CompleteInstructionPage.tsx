import React, {useRef, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {VideoOverlay} from "../App";


type ModalContent = { src: string; isVideo: boolean };

function InstructionsPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const state = (location.state as { openTab?: 'buyer' | 'seller' }) || {};
    const [activeTab, setActiveTab] = useState<'buyer' | 'seller'>(state.openTab ?? 'buyer');

    const handleHomeClick = () => navigate('/');
    const handleRequirementsClick = () => navigate('/requirements');
    const handleAboutClick = () => navigate('/about');

    const [modalContent, setModalContent] = useState<ModalContent | null>(null);
        const barcodeImgPath = '/images/barcode.jpg';
    const feedbackImgPath = '/images/feedback.jpg';
    const orderImgPath = '/images/order.jpg';


    const [openSrc, setOpenSrc] = useState<string | null>(null);
    const openModal = (src: string) => {
        setModalContent({src, isVideo: src.endsWith('.mp4')});
    };
        const receivingImgPath = '/images/receiving.jpg';

    const closeModal = () => setModalContent(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const videos = [
        {
            id: 1,
            title: '🎥 Как выбрать товар для выкупа и проверить продавца',
            src: 'https://storage.googleapis.com/images_avocado/VideoCashback/1%20Buyer%20Purchase%20of%20a%20product%20Selection%20of%20a%20product%20%2B%20seller%20verification.MP4',
        },
    ];

// Видео для обзора кабинета продавца (располагается в секции продавцов)
    const videoStep1 = [{
        id: 1,
        title: '🎥 Пояснение, что нужно сделать на данном этапе',
        src: 'https://storage.googleapis.com/images_avocado/VideoCashback/2%20Buyer%20Step%201%20Explanation%20of%20what%20needs%20to%20be%20done%2C%20transition%20to%20the%20website.MP4',
    },
        {
            id: 2,
            title: '🎥 Как искать товар выкупа по ключевому слову на WB и сделать скриншоты',
            src: 'https://storage.googleapis.com/images_avocado/VideoCashback/3%20Buyer%20Step%201%20Search%20for%20a%20product%20by%20keyword%20in%20the%20WB%2C%20take%20screenshots%2C%20and%20return%20to%20the%20bot.MP4',
        },
        {
            id: 3,
            title: '🎥 Как загрузить скриншоты в кешбэк-бот',
            src: 'https://storage.googleapis.com/images_avocado/VideoCashback/4%20Buyer%20Step%201%20Uploading%20screenshots%2C%20moving%20on%20to%20Step%202.MP4',
        },
    ];

    const videoStep2 = [{
        id: 1,
        title: '🎥 Как искать товар продавца и использовать фильтры поиска в WB, как искать и проверять артикул товара ',
        src: 'https://storage.googleapis.com/images_avocado/VideoCashback/5%20Buyer%20Step%202%20Explanation%20of%20the%20conditions%20Go%20to%20the%20WB%2C%20search%20for%20a%20product%2C%20use%20the%20search%20filter%2C%20where%20the%20article%20number%20is%20located%20Go%20to%20the%20bot%20Check%20the%20article%20number%20(the%20article%20number%20is%20correct).MP4',
    },
        {
            id: 2,
            title: '🎥 Пояснение про ситуацию, когда товара нет в наличии на WB',
            src: 'https://storage.googleapis.com/images_avocado/VideoCashback/6%20Buyer%20Step%202%20If%20the%20SKU%20is%20incorrect%20Explanation%20about%20the%20situation%20when%20the%20product%20is%20not%20available%20on%20the%20WB%20and%20the%20redemption%20limit%20Step%203.MP4',
        },
    ];

    const videoStep3 = [{
        id: 1,
        title: '🎥 Как добавить товар и бренд продавца в избранное WB',
        src: 'https://storage.googleapis.com/images_avocado/VideoCashback/7%20Buyer%20Step%203%20Adding%20a%20product%20and%20brand%20to%20your%20favorites%20on%20the%20WB%20website%20Checking%20the%20boxes%20You%20do%20not%20need%20a%20screenshot.%20Proceed%20to%20Step%204.MP4',
    },
    ];
    const videoStep4 = [{
        id: 1,
        title: '🎥 Как заполнять реквизиты для получения кешбэка и что делать, если указали неверные реквизиты',
        src: 'https://storage.googleapis.com/images_avocado/VideoCashback/8%20Buyer%20Step%204%20Fill%20in%20the%20details%20If%20you%20have%20entered%20the%20wrong%20details%2C%20how%20to%20contact%20technical%20support%20Step%205.MP4',
    },
    ];
    const videoStep5 = [{
        id: 1,
        title: '🎥 Как загрузить скриншот в кешбэк-бот после оформления заказа и что делать, если товара продавца нет в наличии на WB при оформлении заказа',
        src: 'https://storage.googleapis.com/images_avocado/VideoCashback/9%20Buyer%20Step%205%20Place%20an%20order%20in%20words%20Attach%20a%20screenshot%20of%20the%20order%20If%20you%20place%20an%20order%20but%20run%20out%20of%20funds%2C%20proceed%20to%20step%206.MP4',
    },
    ];
    const videoStep6 = [{
        id: 1,
        title: '🎥 Пояснение, что нужно сделать на данном этапе ',
        src: 'https://storage.googleapis.com/images_avocado/VideoCashback/10%20Buyer%20Step%206%20Explanation%20of%20the%20terms%20Transition%20to%20the%20WB%2C%20delivery%20screen%2C%20and%20explanation%20of%20the%20screen%20Return%20to%20the%20bot%20Explanation%20of%20the%20product%20photo.MP4',
    },
        {
            id: 2,
            title: '🎥 Пояснение про сроки отправки отчета и как его оформить',
            src: 'https://storage.googleapis.com/images_avocado/VideoCashback/11%20Buyer%20Step%206%20Explanation%20when%20submitting%20a%20report%20Meeting%20the%20requirements%20Moving%20on%20to%20step%207.MP4',
        },

    ];
    const videoStep7 = [{
        id: 1,
        title: '🎥 Пояснение, что нужно сделать на данном этапе',
        src: 'https://storage.googleapis.com/images_avocado/VideoCashback/12%20Buyer%20Step%207%20What%20conditions%20must%20be%20met%20How%20to%20contact%20the%20buyer.MP4',
    },
        {
            id: 2,
            title: '🎥 Как связаться с продавцом и спросить про требования к публикации отзыва',
            src: 'https://storage.googleapis.com/images_avocado/VideoCashback/13%20Buyer%20Step%207%20Review%20approval%20with%20the%20seller%20What%20to%20do%20if%20the%20seller%20does%20not%20respond%20Possible%20option%20without%20review%20approval.MP4',
        },
        {
            id: 3,
            title: '🎥 Базовые требования к публикации отзыва товара ',
            src: 'https://storage.googleapis.com/images_avocado/VideoCashback/14%20Buyer%20Step%207%20Screenshot%20of%20the%20review%20publication%20Photo%20requirements%20Text%20requirements.MP4',
        },
        {
            id: 4,
            title: '🎥 Как найти электронный чек заказа в WB',
            src: 'https://storage.googleapis.com/images_avocado/VideoCashback/15%20Buyer%20Step%207%20After%20the%20screenshot%20of%20the%20review%2C%20how%20to%20find%20the%20email.receipt%20Copying%20the%20receipt%20and%20screenshot.MP4',
        },
        {
            id: 5,
            title: '🎥 Как загрузить скриншоты отзыва товара и электронного чека заказа и вставить номер чека',
            src: 'https://storage.googleapis.com/images_avocado/VideoCashback/16%20Buyer%20Step%207%20Uploading%20screenshots%20and%20inserting%20the%20receipt%20number.MP4',
        },
    ];


    const videoSellerStep1 = [{
        id: 1,
        title: '🎥 Как открыть кабинет продавца ',
        src: 'https://storage.googleapis.com/images_avocado/VideoCashback/1%20Seller%20Access%20to%20the%20seller%20is%20account.MP4',
    },
    ];
    const videoSellerStep2 = [{
        id: 1,
        title: '🎥 Как пополнить баланс раздач',
        src: 'https://storage.googleapis.com/images_avocado/VideoCashback/2%20Seller%20Top%20up%20balance%20Without%20dialogue%20with%20the%20administrator.MP4',
    },
    ];
    const videoSellerStep3 = [{
        id: 1,
        title: '🎥 Как разместить товар ',
        src: 'https://storage.googleapis.com/images_avocado/VideoCashback/3%20Seller%20Working%20with%20Products%20Placing%20a%20product%20card%20without%20sending%20it.MP4',
    },
    ];
    const videoSellerStep4 = [{
        id: 1,
        title: '🎥 Как оформить заявку на размещение товара ',
        src: 'https://storage.googleapis.com/images_avocado/VideoCashback/4%20Seller%20Working%20with%20Products%20Placing%20a%20product%20card%20filled%20with%20information%20and%20sending%20it.MP4',
    },
    ];
    const videoSellerStep5 = [{
        id: 1,
        title: '🎥 Как карточка товара получает статус ',
        src: 'https://storage.googleapis.com/images_avocado/VideoCashback/5%20Seller%20Working%20with%20Products%20Placing%20a%20product%20card%20and%20explaining%20its%20status.MP4',
    },{
        id: 2,
        title: '🎥 Как проверить статус карточек товаров',
        src: 'https://storage.googleapis.com/images_avocado/VideoCashback/6%20Seller%20Card%20Statuses%20How%20to%20view%20statuses%2C%20how%20many%20there%20are%20in%20total.MP4',
    },
    ];

    const videoSellerStep6 = [{
        id: 1,
        title: '🎥 Как обновить информацию о вашем товаре',
        src: 'https://storage.googleapis.com/images_avocado/VideoCashback/12%20Seller%20How%20to%20edit%20a%20product%20card.MP4',
    },{
        id: 2,
        title: '🎥 Что происходит после сохранения изменений в карточке товара ',
        src: 'https://storage.googleapis.com/images_avocado/VideoCashback/13%20Seller%20How%20to%20edit%20a%20product%20card%20Continuation%20with%20an%20explanation%20of%20what%20happens%20to%20the%20card%20after%20editing.MP4',
    },
    ];

    const videoSellerStep7 = [{
        id: 1,
        title: '🎥 Как снять карточку товара с публикации',
        src: 'https://storage.googleapis.com/images_avocado/VideoCashback/14%20Seller%20How%20to%20remove%20a%20card%20from%20a%20publication.MP4',
    },
    ];
    const videoSellerStep8 = [{
        id: 1,
        title: '🎥 Как вернуть карточку товара из архива',
        src: 'https://storage.googleapis.com/images_avocado/VideoCashback/15%20Seller%20How%20to%20return%20a%20card%20from%20the%20archive%20to%20a%20publication.MP4',
    },
    ];

    const videoSellerStep9 = [{
        id: 1,
        title: '🎥 Как посмотреть отчеты по выкупам и статус кешбэка',
        src: 'https://storage.googleapis.com/images_avocado/VideoCashback/16%20Seller%20Reports%20on%20Buybacks.MP4',
    },
    ];

    const videoSellerStep10 = [{
        id: 1,
        title: '🎥 Как работает реферальная программа',
        src: 'https://storage.googleapis.com/images_avocado/VideoCashback/17%20Seller%20Referral%20Program.MP4',
    },
    ];

return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
        <div className="max-w-screen-lg w-full bg-white border border-brand rounded-lg shadow-lg p-8 relative">
            {/* Tabs */}
            <div className="flex mb-8 border-b">
                <button
                    onClick={() => setActiveTab('buyer')}
                    className={`px-4 py-2 font-semibold ${activeTab === 'buyer' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}
                >
                    Покупателю
                </button>
                <button
                    onClick={() => setActiveTab('seller')}
                    className={`px-4 py-2 font-semibold ${activeTab === 'seller' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}
                >
                    Продавцу
                </button>
            </div>

            {/* Buyer Instructions */}
            {activeTab === 'buyer' && (
                <>
                    <h2 className="text-2xl font-bold mb-6 text-center">Инструкция выкупа товара для покупателя</h2>
                    <p className="items-start gap-2 text-sm italic">
                        Premium Cash Back WB — <strong>ваш помощник в получении товаров за отзыв!</strong> Следуйте этой пошаговой
                        инструкции, чтобы получить кешбэк и приятный опыт покупок.
                        <br/>
                    </p>
                                            <br/>
                    <p className="text-sm mb-8 text-left">
                        <strong>Важно!</strong> Прежде чем приступить к сделке по выкупу товара, убедитесь в надежности
                        продавца. Это поможет избежать неприятных ситуаций. <strong>Рекомендуем посмотреть
                        видео.</strong>
                        {" "}
                        <section className="mb-6 mt-4">
                            {videos.map(({id, title, src}) => (
                                <div key={id} className="bg-white rounded-lg shadow p-4 mb-3">
                                    <button
                                        className="text-sm font-medium text-blue-600 hover:underline"
                                        onClick={() => setOpenSrc(src)}
                                    >
                                        {title}
                                    </button>
                                </div>
                            ))}
                        </section>
                    </p>

                    <section className="mb-8 space-y-2">
                        <h3 className="text-xl font-bold mb-4 text-left">Шаг 1. Ключевое слово</h3>
                        <p>1) Найдите товар выкупа по ключевому слову в поиске на сайте или в приложении WB. Сделайте
                            скриншот поискового запроса в WB.</p>

                        <p>2) Добавьте несколько товаров конкурентов (разных брендов) в корзину WB. Сделайте скриншот
                            корзины в WB.
                            Важно! Не ищите товар продавца из кешбэк-бота на этом этапе.</p>

                        <p>3) Прикрепите скриншоты в отчет для получения кешбэка.</p>

                    </section>
                    <section className="mb-6">
                        {videoStep1.map(({id, title, src}) => (
                            <div key={id} className="bg-white rounded-lg shadow p-4 mb-3">
                                <button
                                    className="text-sm font-medium text-blue-600 hover:underline"
                                    onClick={() => setOpenSrc(src)}
                                >
                                    {title}
                                </button>
                            </div>
                        ))}
                    </section>

                    <hr className="my-6 border-darkGray"/>

                    <section className="mb-8 space-y-2">
                        <h3 className="text-xl font-bold mb-4 text-left">Шаг 2. Поиск товара</h3>

                        <p>1) Найдите товар для выкупа на сайте или в приложении WB, используя предоставленное
                            изображение. Для вашего удобства можете использовать функцию поиска по фотографии.
                        </p>

                        <p>2) Скопируйте артикул товара продавца и вставьте его в поле для проверки.
                            Если артикул неверный, система не пропустит вас дальше, вы нашли не тот товар продавца в WB.
                            Используйте фильтры по цене, цвету, бренду и другим параметрам для ускорения поиска.</p>

                    </section>

                    <section className="mb-6">
                        {videoStep2.map(({id, title, src}) => (
                            <div key={id} className="bg-white rounded-lg shadow p-4 mb-3">
                                <button
                                    className="text-sm font-medium text-blue-600 hover:underline"
                                    onClick={() => setOpenSrc(src)}
                                >
                                    {title}
                                </button>
                            </div>
                        ))}
                    </section>

                    <hr className="my-6 border-darkGray"/>

                    <section className="mb-8 space-y-2">
                        <h3 className="text-xl font-bold mb-4 text-left">Шаг 3. Товар и бренд в избранное</h3>
                        <p> Добавьте товар и бренд продавца в избранное на сайте или в приложении WB.</p>

                    </section>
                    <section className="mb-6">
                        {videoStep3.map(({id, title, src}) => (
                            <div key={id} className="bg-white rounded-lg shadow p-4 mb-3">
                                <button
                                    className="text-sm font-medium text-blue-600 hover:underline"
                                    onClick={() => setOpenSrc(src)}
                                >
                                    {title}
                                </button>
                            </div>
                        ))}
                    </section>

                    <hr className="my-6 border-darkGray"/>

                    <section className="mb-8 space-y-2">
                        <h3 className="text-xl font-bold mb-4 text-left">Шаг 4. Реквизиты для получения кешбэка</h3>
                        <ul className="list-disc list-inside ml-6">
                            <p>
                                1) Укажите реквизиты для получения кешбэка:
                            </p>
                            <li>Номер карты.</li>
                            <li>Номер телефона.</li>
                            <li>Фамилия и имя.</li>
                        </ul>
                        <p><strong>Внимание!</strong> Вы можете выбрать только банки, представленные в списке.</p>
                        <p>
                            2) Убедитесь, что все данные указаны верно.
                            Кешбэк может быть выплачен как на карту, так и через СБП на усмотрение продавца.
                        </p>
                    </section>
                    <section className="mb-6">
                        {videoStep4.map(({id, title, src}) => (
                            <div key={id} className="bg-white rounded-lg shadow p-4 mb-3">
                                <button
                                    className="text-sm font-medium text-blue-600 hover:underline"
                                    onClick={() => setOpenSrc(src)}
                                >
                                    {title}
                                </button>
                            </div>
                        ))}
                    </section>

                    <hr className="my-6 border-darkGray"/>

                    <section className="mb-8 space-y-2">
                        <h3 className="text-xl font-bold mb-4 text-left">Шаг 5. Оформление заказа</h3>
                        <p>1) Оформите заказ на товар продавца для выкупа в WB.</p>
                        <p>2) Сделайте скриншот заказа из раздела "Доставки" в личном кабинете WB и загрузите его в
                            отчет.
                        <br/>
                            <strong>Внимание!</strong> На скриншоте обязательно должна быть указана цена товара.
                        </p>

                                        <div
                    onClick={() => openModal(orderImgPath)}
                    className="underline text-blue-600 cursor-pointer"
                >
                    📷 Пример скриншота заказа в WB
                </div>
                    </section>
                    <section className="mb-6">
                        {videoStep5.map(({id, title, src}) => (
                            <div key={id} className="bg-white rounded-lg shadow p-4 mb-3">
                                <button
                                    className="text-sm font-medium text-blue-600 hover:underline"
                                    onClick={() => setOpenSrc(src)}
                                >
                                    {title}
                                </button>
                            </div>
                        ))}
                    </section>


                    <hr className="my-6 border-darkGray"/>

                    <section className="mb-8 space-y-2">
                        <h3 className="text-xl font-bold mb-4 text-left">Шаг 6. Скриншоты доставки и штрихкода</h3>
                        <p>1) Заберите товар как обычно.</p>
                        <p>2) Сделайте и загрузите скриншот информации о получении товара в разделе "Покупки" из личного
                            кабинета WB, где указаны стоимость товара, дата получения и статус "Доставлен".</p>
                                        <div
                    onClick={() => openModal(receivingImgPath)}
                    className="underline text-blue-600 cursor-pointer"
                >
                    📷 Пример скриншота получения товара в WB
                </div>
                        <p>3) Разрежьте штрихкод товара.</p>
                        <p>4) Сделайте и загрузите фотографию разрезанного штрихкода на фоне товара (без упаковки).</p>
                                        <div
                    onClick={() => openModal(barcodeImgPath)}
                    className="underline text-blue-600 cursor-pointer"
                >
                    📷 Пример разрезанного штрихкода товара
                </div>
                        <p>
                            <strong>Внимание!</strong> Для выполнения условий по получению кешбэка за выкуп товара важно
                            отправить отчет <u>в день</u> получения товара.
                        </p>
                    </section>
                    <section className="mb-6">
                        {videoStep6.map(({id, title, src}) => (
                            <div key={id} className="bg-white rounded-lg shadow p-4 mb-3">
                                <button
                                    className="text-sm font-medium text-blue-600 hover:underline"
                                    onClick={() => setOpenSrc(src)}
                                >
                                    {title}
                                </button>
                            </div>
                        ))}
                    </section>

                    <hr className="my-6 border-darkGray"/>

                    <section className="mb-8 space-y-4">
  <h3 className="text-xl font-bold text-left">
    Шаг 7. Публикация отзыва
  </h3>

  <div className="space-y-2">
    <p>
      1) Напишите и согласуйте отзыв товара с продавцом в Telegram перед публикацией, если это
      предусмотрено условиями программы по получению кешбэка. Если согласование не требуется, вы можете
      оставить отзыв самостоятельно.
    </p>

    <p>
      <strong>Важно!</strong> Не публикуйте согласованный отзыв без предварительного одобрения
      продавца, даже если он не отвечает более 5 дней. В таком случае, пожалуйста, напомните ему о себе.
    </p>

    <p>
      2) Оставьте отзыв товара в WB и прикрепите его скриншот:
    </p>

    <ul className="list-disc pl-5 space-y-1">
      <li>Фото: качественное изображение товара в использовании и без упаковки.</li>
      <li>Видео (если возможно): демонстрация товара.</li>
      <li>Текст: подробное описание опыта использования товара.</li>
      <li>Оценка: 5 звёзд.</li>
    </ul>

    <div
      onClick={() => openModal(feedbackImgPath)}
      className="underline text-blue-600 cursor-pointer"
    >
      📷 Пример скриншота хорошего отзыва
    </div>

    <p>
      3) Скопируйте номер электронного чека заказа из раздела "Финансы" в личном кабинете WB и вставьте
      его в поле для ввода.
    </p>

    <p>
      4) Сделайте и загрузите скриншот электронного чека заказа.
    </p>
  </div>
</section>

                    <section className="mb-6">
                        {videoStep7.map(({id, title, src}) => (
                            <div key={id} className="bg-white rounded-lg shadow p-4 mb-3">
                                <button
                                    className="text-sm font-medium text-blue-600 hover:underline"
                                    onClick={() => setOpenSrc(src)}
                                >
                                    {title}
                                </button>
                            </div>
                        ))}
                    </section>


                </>
            )}



            {/* Seller Instructions */}
            {activeTab === 'seller' && (
                <>
                    <h2 className="text-2xl font-bold mb-6 text-center">Инструкция для продавца</h2>
                           <p className="items-start gap-2 text-sm italic">
                        Premium Cash Back WB — <strong>ваш помощник в получении товаров за отзыв!</strong> Следуйте этой пошаговой
                        инструкции, чтобы получить кешбэк и приятный опыт покупок.
                        <br/>
                    </p>
                        <br/>

                    <section className="mb-8 space-y-2">
                        <h3 className="text-xl font-bold mb-4 text-left">Шаг 1. Доступ в кабинет продавца</h3>
                        <p>1) Запустите бота, нажав кнопку "Старт", чтобы войти в кабинет продавца.</p>

<p>2) Выберите "Открыть приложение" и перейдите в раздел "Кабинет продавца".
</p>

                    </section>
                         <section className="mb-6">
                        {videoSellerStep1.map(({id, title, src}) => (
                            <div key={id} className="bg-white rounded-lg shadow p-4 mb-3">
                                <button
                                    className="text-sm font-medium text-blue-600 hover:underline"
                                    onClick={() => setOpenSrc(src)}
                                >
                                    {title}
                                </button>
                            </div>
                        ))}
                    </section>

                    <hr className="my-6 border-darkGray"/>

                    <section className="mb-8 space-y-2">
                        <h3 className="text-xl font-bold mb-4 text-left">Шаг 2. Пополнение баланса для раздачи товаров</h3>
                        <p>
1) Откройте "Кабинет продавца", перейдите в раздел "Баланс" и нажмите на кнопку "Пополнить".
</p>
                        <p>
2) Свяжитесь с администратором для дальнейших действий, чтобы пополнить счет на необходимую сумму для раздачи товаров. Средства используются для выплаты кешбэка покупателям.
</p>

                    </section>

                         <section className="mb-6">
                        {videoSellerStep2.map(({id, title, src}) => (
                            <div key={id} className="bg-white rounded-lg shadow p-4 mb-3">
                                <button
                                    className="text-sm font-medium text-blue-600 hover:underline"
                                    onClick={() => setOpenSrc(src)}
                                >
                                    {title}
                                </button>
                            </div>
                        ))}
                    </section>

                    <hr className="my-6 border-darkGray"/>

                    <section className="mb-8">
                        <h3 className="text-xl font-bold mb-4 text-left">Шаг 3. Размещение товаров или добавление новых позиций  (часть 1)
</h3>

                        <p>1) Войдите в кабинет продавца и выберите раздел "Мои товары".
                        </p>
                        <p>
                            2) Нажмите на кнопку "Разместить товар".
                        </p>
                        <p>3) Заполните все необходимые поля, загрузите фотографии вашего товара и обязательно укажите требования к отзыву.
Укажите, нужно ли добавлять фото или видео, ставить оценку и какие требования предъявляются к тексту отзыва. </p>
                        <p>Важно! Не забудьте указать свой ник в Telegram с символом «@», чтобы покупатели могли легко связаться с вами для согласования отзыва.
</p>
                    </section>
                         <section className="mb-6">
                        {videoSellerStep3.map(({id, title, src}) => (
                            <div key={id} className="bg-white rounded-lg shadow p-4 mb-3">
                                <button
                                    className="text-sm font-medium text-blue-600 hover:underline"
                                    onClick={() => setOpenSrc(src)}
                                >
                                    {title}
                                </button>
                            </div>
                        ))}
                    </section>

                    <hr className="my-6 border-darkGray"/>

                    <section className="mb-8">
                        <h3 className="text-xl font-bold mb-4 text-left">Шаг 4. Размещение товаров или добавление новых позиций (часть 2)
</h3>
                        {/* Пункт 1 нумерованного списка */}
                          <p>
    1) После заполнения всех необходимых полей и загрузки изображения товара выберите дату выплаты кешбэка покупателю:
  </p>

  <ul className="list-disc pl-5 space-y-1">
    <li>После публикации отзыва товара в WB.</li>
    <li>После получения товара.</li>
    <li>На 15-й день после получения товара.</li>
  </ul>

                        <p>2) Нажмите на "Согласовать отзыв с продавцом", если требуется.</p>
                        <p>3) Нажмите на "Отправить заявку". В ближайшее время ваша карточка товара будет рассмотрена модератором.
При достаточном балансе раздач и одобрении модератором, карточка станет активной, и товар будет доступен для выкупа.
</p>

                    </section>
                                             <section className="mb-6">
                        {videoSellerStep4.map(({id, title, src}) => (
                            <div key={id} className="bg-white rounded-lg shadow p-4 mb-3">
                                <button
                                    className="text-sm font-medium text-blue-600 hover:underline"
                                    onClick={() => setOpenSrc(src)}
                                >
                                    {title}
                                </button>
                            </div>
                        ))}
                    </section>


                    <hr className="my-6 border-darkGray"/>

                    <section className="mb-8">
                        <h3 className="text-xl font-bold mb-4 text-left">Шаг 5. Статусы карточки товаров</h3>
                        <p>
Войдите в кабинет продавца и выберите раздел "Мои товары", чтобы узнать текущий статус вашей карточки товара, используя кнопки фильтра для сортировки.
</p>
                        <ul className="list-disc pl-5 space-y-1">
  <li>Активные — карточки товаров с оплаченным балансом раздач прошли модерацию и доступны для выкупа покупателям.</li>
  <li>Созданные — карточки товаров после размещения ожидают проверки модератором, после которой будут в статусе «Активные».</li>
  <li>Отклонённые — карточки товаров не прошли модерацию и не доступны для раздачи, но их можно отредактировать, после чего они будут в статусе «Созданные».</li>
  <li>Архивные — карточки товаров сняты с публикации, а также вы можете переместить любую карточку товара в архив.</li>
  <li>Не оплаченные — карточки товаров прошли модерацию, но после пополнения баланса раздачи будут в статусе «Активные».</li>
</ul>

                    </section>

                                                                 <section className="mb-6">
                        {videoSellerStep5.map(({id, title, src}) => (
                            <div key={id} className="bg-white rounded-lg shadow p-4 mb-3">
                                <button
                                    className="text-sm font-medium text-blue-600 hover:underline"
                                    onClick={() => setOpenSrc(src)}
                                >
                                    {title}
                                </button>
                            </div>
                        ))}
                    </section>

                    <hr className="my-6 border-darkGray"/>

                    <section className="mb-8">
                        <h3 className="text-xl font-bold mb-4 text-left">Шаг 6. Редактирование опубликованной карточки товара
</h3>
                        <p>1) Войдите в кабинет продавца и выберите раздел "Мои товары".
</p>
                        <p>2) Найдите нужную карточку товара в статусе "Активные" и нажмите на неё, затем нажмите кнопку "Редактировать", чтобы внести любые необходимые изменения, например, цену, ключевые слова, изображение товара и другие данные.
</p>
                        <p>3) Убедитесь, что все изменения внесены корректно. Затем нажмите "Все верно. Применить" для сохранения изменений.
</p>
                        <p><strong>Важно!</strong> После редактирования карточка товара временно снимается с публикации и приобретает статус "Созданные", после успешной проверки модератором вернется в "Активные".
</p>


                    </section>

                                                                 <section className="mb-6">
                        {videoSellerStep6.map(({id, title, src}) => (
                            <div key={id} className="bg-white rounded-lg shadow p-4 mb-3">
                                <button
                                    className="text-sm font-medium text-blue-600 hover:underline"
                                    onClick={() => setOpenSrc(src)}
                                >
                                    {title}
                                </button>
                            </div>
                        ))}
                    </section>




                    <hr className="my-6 border-darkGray"/>

                    <section className="mb-8 space-y-2">
                        <h3 className="text-xl font-bold mb-4 text-left">Шаг 7. Снятие карточки с публикации</h3>
                        <p>
1) Войдите в кабинет продавца и выберите раздел "Мои товары", чтобы временно скрыть карточку товара от раздачи для покупателей.
</p>
                        <p>
2) Найдите и откройте необходимую карточку товара.
</p>
                         <p>
3) В нижней части экрана нажмите кнопку "Снять с публикации".
Карточка товара станет невидимой для покупателей и приобретет статус "Архивные".
</p>
                    </section>

                                                                 <section className="mb-6">
                        {videoSellerStep7.map(({id, title, src}) => (
                            <div key={id} className="bg-white rounded-lg shadow p-4 mb-3">
                                <button
                                    className="text-sm font-medium text-blue-600 hover:underline"
                                    onClick={() => setOpenSrc(src)}
                                >
                                    {title}
                                </button>
                            </div>
                        ))}
                    </section>



                    <hr className="my-6 border-darkGray"/>

                    <section className="mb-8">
                        <h3 className="text-xl font-bold mb-4 text-left">Шаг 8. Возврат карточки из архива</h3>
                        <p>1) Войдите в кабинет продавца и выберите раздел "Мои товары", чтобы вернуть карточку товара из архива и снова возобновить раздачу выкупа.
</p>
                        <p>
2) Найдите и откройте необходимую карточку товара.
</p>
                        <p>
3) В нижней части экрана нажмите кнопку "Опубликовать".
Карточка товара станет видимой для покупателей и вернется в свой прежний статус "Активные".
</p>

                    </section>
                                                                                     <section className="mb-6">
                        {videoSellerStep8.map(({id, title, src}) => (
                            <div key={id} className="bg-white rounded-lg shadow p-4 mb-3">
                                <button
                                    className="text-sm font-medium text-blue-600 hover:underline"
                                    onClick={() => setOpenSrc(src)}
                                >
                                    {title}
                                </button>
                            </div>
                        ))}
                    </section>

                    <hr className="my-6 border-darkGray"/>

                    <section className="mb-8">
                        <h3 className="text-xl font-bold mb-4 text-left">Шаг 9. Отчёты по выкупам</h3>
                        <p>Войдите в кабинет продавца и выберите раздел "Отчеты по выкупам", чтобы получить полную информацию о выкупах ваших товаров и отследить статус начисления кэшбэка по каждому заказу: был ли он выплачен или еще нет.
</p>

                    </section>
                                                                                                             <section className="mb-6">
                        {videoSellerStep9.map(({id, title, src}) => (
                            <div key={id} className="bg-white rounded-lg shadow p-4 mb-3">
                                <button
                                    className="text-sm font-medium text-blue-600 hover:underline"
                                    onClick={() => setOpenSrc(src)}
                                >
                                    {title}
                                </button>
                            </div>
                        ))}
                    </section>

                    <hr className="my-6 border-darkGray"/>

                    <section className="mb-8 space-y-2">
                        <h3 className="text-xl font-bold mb-4 text-left">Шаг 10. Реферальная программа</h3>
                        <p>Приглашайте новых продавцов в кешбэк-бот и получайте бонусы за их первые покупки. Вознаграждение начисляется согласно условиям реферальной программы.
</p>
                        <p>
1) Нажмите на кнопку "Реферальная программа", чтобы начать.
</p>
                        <p>2) Скопируйте вашу ссылку и поделитесь ею с друзьями через кнопку "Поделиться в Telegram".
</p>

                    </section>

                                                                                                             <section className="mb-6">
                        {videoSellerStep9.map(({id, title, src}) => (
                            <div key={id} className="bg-white rounded-lg shadow p-4 mb-3">
                                <button
                                    className="text-sm font-medium text-blue-600 hover:underline"
                                    onClick={() => setOpenSrc(src)}
                                >
                                    {title}
                                </button>
                            </div>
                        ))}
                    </section>


                </>
            )}

            {/* Back to main button */}
            <div className="flex flex-col gap-2">
                                <button
                    onClick={handleAboutClick}
                    className="py-2 px-4 rounded-lg text-sm font-semibold border border-brand text-brand bg-transparent w-auto"
                >
                    О сервисе
                </button>
                                <button
                    onClick={handleRequirementsClick}
                    className="py-2 px-4 rounded-lg text-sm font-semibold border border-brand text-brand bg-transparent w-auto"
                >
                    Требования к отчету
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
            <>
                {/* Overlay */}
                <div
                    className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40"
                    onClick={closeModal}
                />

                {/* Centered modal */}
                <div
                    className="fixed inset-0 flex items-center justify-center z-50"
                    onClick={closeModal}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        className="
            relative
            bg-white
            rounded-lg
            overflow-hidden
            flex items-center justify-center
            p-4
            w-[90vw]      /* now 90% of viewport width */
            h-[90vh]      /* now 90% of viewport height */
            max-w-4xl     /* optional cap on very large screens */
            max-h-[90vh]
          "
                    >
                        {/* Close button */}
                        <button
                            onClick={closeModal}
                            className="absolute top-2 right-2 text-2xl text-gray-700 z-10"
                        >
                            &times;
                        </button>

                        {/* Content (95% of modal box) */}
                        {modalContent.isVideo ? (
                            <video
                                src={modalContent.src}
                                controls
                                className="w-[95%] h-[95%] object-contain"
                            />
                        ) : (
                            <img
                                src={modalContent.src}
                                alt="Пример"
                                className="w-[95%] h-[95%] object-contain"
                            />
                        )}
                    </div>
                </div>
            </>
        )}

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
    </div>
);
}

export default InstructionsPage;

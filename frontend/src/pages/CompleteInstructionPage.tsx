import React, {useEffect, useState} from 'react';
import {on} from "@telegram-apps/sdk";
import {useLocation, useNavigate} from 'react-router-dom';

function CompleteInstructionPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleHomeClick = () => navigate('/');

    const backRoute = location.state?.backRoute || '/';

    return (
        <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4">
            <div className="max-w-screen-lg w-full bg-white border border-brand rounded-lg shadow-lg p-8 relative">
                {/*<div className="bg-white rounded-lg p-4 mb-8">*/}
                    <h2 className="text-2xl font-bold mb-6 text-center">
                        Инструкция выкупа для покупателя
                    </h2>
                    <p className="text-base mb-8 text-left">
                        ВБ КЭШБЭК — это бот с пошаговой инструкцией для раздачи товаров за отзыв.&nbsp;
                        <a
                            href="tg://resolve?domain=Premiumcash1&post=9"
                            onClick={e => {
                                // если хочешь fallback на веб, можно проверять
                            }}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline text-blue-600"
                        >
                            Посмотреть видео инструкцию
                        </a>

                    </p>

                    <section className="mb-8">
                        <h3 className="text-xl font-bold mb-4 text-left">Шаг 1. Ключевое слово</h3>
                        <ul className="list-disc list-inside space-y-2 ml-6">
                            <li>Напишите ключевое слово и добавьте в корзину несколько товаров конкурентов. Все товары должны быть разных брендов. На этом этапе не ищите товар продавца. Поиск товара на втором шаге</li>
                            <li><span className="font-semibold">Важно! Вводите ключевое слово вручную</span></li>
                        </ul>
                    </section>

                    <hr className="my-6 border-darkGray"/>

                    <section className="mb-8">
                        <h3 className="text-xl font-bold mb-4 text-left">Шаг 2. Поиск товара</h3>
                        <ul className="list-disc list-inside space-y-2 ml-6">
                            <li>Найдите товар используя фото на втором шаге, скопируйте арткиул и вставьте в поле для проверки</li>
                            <p className="text-sm">Если указан не правильный артикул, система не откроет доступ к следующему шагу. Артикул мы не даем.</p>
                            <p><strong>Товара нет в наличии на ВБ</strong></p>
                            <li>Добавьте товар в лист ожидания, как товар поступит, откройте инструкцию, дойдите до 5 го шага, если товар доступен к выкупу то можете выкупать</li>
                            <p className="text-sm">Лимит на выкуп может закончится, поэтому обязательно проверьте доступность на 5м шаге</p>
                            <p className="font-bold">Не могу найти товар</p>
                            <li>Чтобы быстрее найти товар, используйте фильтры по цене, цвету, размеру и другие</li>
                            <p className="font-bold">Артикул не правильный</p>
                            <li>Если система показывает что артикул неправильный, значит это не тот товар</li>
                        </ul>
                    </section>

                    <hr className="my-6 border-darkGray"/>

                    <section className="mb-8">
                        <h3 className="text-xl font-bold mb-4 text-left">Шаг 3. Товар в избранное</h3>
                        <ul className="list-disc list-inside space-y-2 ml-6">
                            <li>Добавьте товар и бренд в избранное. Скрин прикладывать не требуется</li>
                        </ul>
                    </section>

                    <hr className="my-6 border-darkGray"/>

                    <section className="mb-8">
                        <h3 className="text-xl font-bold mb-4 text-left">Шаг 4. Реквизиты</h3>
                        <ul className="list-disc list-inside space-y-2 ml-6">
                            <li>Заполняйте реквизиты одного банка. Перевод будет проводится на усмотрение продавца по номеру карты или СБП выбранного банка. Убедитесь, что вы верно указали реквизиты</li>
                            <p className="font-bold">Моего банка нет в списке</p>
                            <li>Вы можете выбрать только те банки, которые есть в списке</li>
                            <p className="font-bold">Я указал не те реквизиты</p>
                            <li>Если оплата уже проведена, реквизиты поменять нельзя. В других случаях обратитесь в техподдержку</li>
                        </ul>
                    </section>

                    <hr className="my-6 border-darkGray"/>

                    <section className="mb-8">
                        <h3 className="text-xl font-bold mb-4 text-left">Шаг 5. Оформление заказа</h3>
                        <ul className="list-disc list-inside space-y-2 ml-6">
                            <li>Оформите заказ, сделайте скрин и прикрепите его в отчет.
                                {/*Требования к скрину заказа смотрите здесь&nbsp;*/}
                                {/*<span onClick={openModal} className="underline text-blue-600 cursor-pointer">Пример скрина заказа</span>*/}
                            </li>
                            <p className="font-bold">Оформила заказ, а лимит закончился</p>
                            <li>Свяжитесь с техподдержкой. Мы пожем решить данный вопрос</li>
                        </ul>
                    </section>

                    <hr className="my-6 border-darkGray"/>

                    <section className="mb-8">
                        <h3 className="text-xl font-bold mb-4 text-left">Шаг 6. Получение товара</h3>
                        <ul className="list-disc list-inside space-y-2 ml-6">
                            <li>Забирайте товар как обычно это делаете или через несколько дней после получения товара</li>
                            <li>Сделайте скрин полученного товара в личном кабинете ВБ. На скрине дожна быть указана стоимость товара, дата получения и статус доставки</li>
                            <li>Сделайте фото разрезанных штрих кодов на фоне товара без упаковки</li>
                            <li>Сдавайте отчет в день получения товара. Дата сдачи отчета и дата получения товара должны быть в один день</li>
                        </ul>
                    </section>

                    <hr className="my-6 border-darkGray"/>

                    <section className="mb-8">
                        <h3 className="text-xl font-bold mb-4 text-left">Шаг 7. Публикация отзыва</h3>
                        <ul className="list-disc list-inside space-y-2 ml-6">
                            <li>С согласованием. Перед публикацией вам обязательно надо согласовать отзыв с продавцом. Не публикуйте без согласования, даже если продавец не отвечает больше 5 дней</li>
                            <li>Без согласования. Публикуйте отзыв через несколько дней после получения товара</li>
                            <li>Требования к фото. Делайте фото высокого качества, без упаковки, покажите как используете товар в своей жизни</li>
                            <li>Требования к тексту. Пишите больше про свои чувства и ощущения</li>
                            <p className="font-bold">Продавец мне не отвечает несколько дней</p>
                            <li>Если продавец прочитал сообщение и не ответил в течение 3х дней напишите ему повторно</li>
                            <li>Если продавец не отвечает больше недели, свяжитесь с нами</li>
                            <li>Возможно вам не требуется согласование. Проверьте в вашей инструкции</li>
                        </ul>
                    </section>

                    <hr className="my-6 border-darkGray"/>

                    <section className="mb-8">
                        <h3 className="text-xl font-bold mb-4 text-left">Кэшбэк</h3>
                        <ul className="list-disc list-inside space-y-2 ml-6">
                            <p>3 варианта выплаты кэшбэка:</p>
                            <li>После получения товара</li>
                            <li>После публикации отзыва</li>
                            <li>на 15й день после получения товара</li>
                            <p>Выплаты могут задерживаться до 7 дней. Это может быть связано с очередью на оплату. Выплаты проводятся вручную. Наберитесь терпения</p>
                            <p>Не надо писать продавцу или в техподдержку раньше чем через 7 дней</p>
                        </ul>
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

            {/*</div>*/}
        </div>
    );
}

export default CompleteInstructionPage;

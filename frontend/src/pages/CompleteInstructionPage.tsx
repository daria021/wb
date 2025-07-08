import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function InstructionsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('buyer');

  const handleHomeClick = () => navigate('/');

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
            Селлеру
          </button>
        </div>

        {/* Buyer Instructions */}
        {activeTab === 'buyer' && (
          <>
            <h2 className="text-2xl font-bold mb-6 text-center">Инструкция выкупа для покупателя</h2>
            <p className="text-base mb-8 text-left">
              ВБ КЕШБЭК — это бот с пошаговой инструкцией для раздачи товаров за отзыв.&nbsp;
              <br/>
              <a
                href="https://storage.googleapis.com/images_avocado/VideoCashback/1%20Getting%20to%20know%20the%20app.MP4"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-600"
              >
                Для знакомства с приложением
              </a>
              .
            </p>
            <p className="text-base mb-8 text-left">
              Перед началом выкупа товара обязательно проверьте надежность продавца. Это поможет избежать мошенничества. Рекомендуем посмотреть видео{" "}
                <br/>
              <a
                href="https://storage.googleapis.com/images_avocado/VideoCashback/1%20Buyer%20Purchase%20of%20a%20product%20Selection%20of%20a%20product%20%2B%20seller%20verification.MP4"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-600"
              >
                Выкуп товара: выбор + проверка продавца
              </a>
              .
            </p>

            <section className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-left">Шаг 1. Ключевое слово</h3>
              <ul className="list-disc list-inside space-y-2 ml-6">
                <li>Напишите ключевое слово и добавьте в корзину несколько товаров конкурентов. Все товары должны быть разных брендов. На этом этапе не ищите товар продавца – поиск товара будет на втором шаге.</li>
                <li><span className="font-semibold">Важно! Вводите ключевое слово вручную.</span></li>
              </ul>
            </section>

            <hr className="my-6 border-darkGray" />

            <section className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-left">Шаг 2. Поиск товара</h3>
              <ul className="list-disc list-inside space-y-2 ml-6">
                <li>Найдите товар, используя предоставленное изображение на втором шаге, скопируйте его артикул и вставьте в поле для проверки.</li>
                <p className="text-sm">Если указан неправильный артикул, система не откроет доступ к следующему шагу. Обратите внимание: мы не предоставляем артикул – его нужно найти самостоятельно.</p>
                <p className="font-bold">Товара нет в наличии на ВБ</p>
                <li>Добавьте товар в лист ожидания. Как только товар поступит в продажу, откройте инструкцию и дойдите до 5-го шага – если товар доступен к выкупу, вы можете его выкупать.</li>
                <p className="text-sm">Лимит на выкуп может закончиться, поэтому обязательно проверьте доступность товара на 5-м шаге.</p>
                <p className="font-bold">Не могу найти товар</p>
                <li>Чтобы быстрее найти товар, используйте фильтры по цене, цвету, размеру и другие.</li>
                <p className="font-bold">Артикул неправильный</p>
                <li>Если система показывает, что артикул неправильный, значит вы нашли не тот товар.</li>
              </ul>
            </section>

            <hr className="my-6 border-darkGray" />

            <section className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-left">Шаг 3. Товар в избранное</h3>
              <ul className="list-disc list-inside space-y-2 ml-6">
                <li>Добавьте товар и бренд в избранное. На этом шаге скриншот прикладывать не требуется.</li>
              </ul>
            </section>

            <hr className="my-6 border-darkGray" />

            <section className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-left">Шаг 4. Реквизиты</h3>
              <ul className="list-disc list-inside space-y-2 ml-6">
                <li>Заполните реквизиты одного выбранного банка. Перевод кешбэка будет проводиться либо по номеру карты, либо через СБП выбранного банка – на усмотрение продавца. Убедитесь, что вы верно указали все данные.</li>
                <p className="font-bold">Моего банка нет в списке</p>
                <li>Вы можете выбрать только те банки, которые представлены в списке.</li>
                <p className="font-bold">Я указал не те реквизиты</p>
                <li>Если оплата уже проведена, изменить реквизиты нельзя. В остальных случаях обратитесь в техподдержку.</li>
              </ul>
            </section>

            <hr className="my-6 border-darkGray" />

            <section className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-left">Шаг 5. Оформление заказа</h3>
              <ul className="list-disc list-inside space-y-2 ml-6">
                <li>Оформите заказ на товар, сделайте скриншот оформления заказа и прикрепите его в отчет.</li>
                {/* Пример скриншота заказа – можно добавить при необходимости */}
                <p className="font-bold">Оформила заказ, а лимит закончился</p>
                <li>Свяжитесь с техподдержкой – мы постараемся решить этот вопрос.</li>
              </ul>
            </section>

            <hr className="my-6 border-darkGray" />

            <section className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-left">Шаг 6. Получение товара</h3>
              <ul className="list-disc list-inside space-y-2 ml-6">
                <li>Получите товар так, как вы обычно это делаете при покупке на маркетплейсе.</li>
                <li>Сделайте скриншот информации о получении товара в личном кабинете WB. На скриншоте должны быть видны стоимость товара, дата получения и статус доставки.</li>
                <li>Сделайте фотографию разрезанных штрих-кодов на фоне товара (без упаковки).</li>
                <li>Сдайте отчет в день получения товара. Дата сдачи отчета и дата получения товара должны совпадать (один день).</li>
              </ul>
            </section>

            <hr className="my-6 border-darkGray" />

            <section className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-left">Шаг 7. Публикация отзыва</h3>
              <ul className="list-disc list-inside space-y-2 ml-6">
                <li>С согласованием. Перед публикацией отзыва обязательно согласуйте его с продавцом. Не публикуйте отзыв без согласования, даже если продавец не отвечает более 5 дней.</li>
                <li>Без согласования. Если согласование не требуется, публикуйте отзыв через несколько дней после получения товара.</li>
                <li>Требования к фото. Фотография должна быть высокого качества, товар без упаковки, на фото покажите использование товара в жизни.</li>
                <li>Требования к тексту. Отзыв пишите подробно, делитесь своими ощущениями и опытом использования товара.</li>
                <p className="font-bold">Продавец мне не отвечает несколько дней</p>
                <li>Если продавец прочитал ваше сообщение и не ответил в течение 3 дней, напишите ему повторно.</li>
                <li>Если продавец не отвечает более недели, свяжитесь с нами – мы постараемся помочь.</li>
                <li>Обратите внимание: в некоторых инструкциях может не требоваться согласование отзыва. Проверьте условия вашей раздачи.</li>
              </ul>
            </section>

            <hr className="my-6 border-darkGray" />

            <section className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-left">Кешбэк</h3>
              <ul className="list-disc list-inside space-y-2 ml-6">
                <p><strong>3 варианта выплаты кешбэка</strong> – см. видео{" "}
                  <a
                    href="https://storage.googleapis.com/images_avocado/VideoCashback/17%20Buyer%20Step%20Cashback%203%20payment%20options%20Why%20there%20may%20be%20delays%20Where%20to%20mark%20the%20receipt%20of%20cashback.MP4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-600"
                  >
                    Кэшбэк — 3 варианта, возможные задержки и где отметить получение
                  </a>:
                </p>
                <li>После получения товара.</li>
                <li>После публикации отзыва.</li>
                <li>На 15-й день после получения товара.</li>
                <p>Выплата кешбэка может задержаться до 7 дней. Это связано с очередью на оплату – выплаты проводятся вручную, пожалуйста, наберитесь терпения.</p>
                <p>Не обращайтесь к продавцу или в поддержку по поводу выплаты раньше, чем через 7 дней после срока выплаты.</p>
              </ul>
            </section>
          </>
        )}

        {/* Seller Instructions */}
        {activeTab === 'seller' && (
          <>
            <h2 className="text-2xl font-bold mb-6 text-center">Инструкция для селлера</h2>
            <p className="text-base mb-8 text-left">
              ВБ КЕШБЭК — платформа, на которой продавцы раздают товары за отзывы, привлекая покупателей. Ниже приведена пошаговая инструкция по работе в кабинете продавца.
            </p>

            <section className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-left">Шаг 1. Доступ в кабинет продавца</h3>
              <ul className="list-disc list-inside space-y-2 ml-6">
                <li>Откройте интерфейс кабинета продавца. (<a
                    href="https://storage.googleapis.com/images_avocado/VideoCashback/1%20Seller%20Access%20to%20the%20seller%20is%20account.MP4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-600"
                  >
                    Доступ в кабинет продавца
                  </a>)</li>
              </ul>
            </section>

            <hr className="my-6 border-darkGray" />

            <section className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-left">Шаг 2. Пополнение баланса</h3>
              <ul className="list-disc list-inside space-y-2 ml-6">
                <li>Перейдите в раздел баланса и пополните счет вашего кабинета на необходимую сумму. Эти средства будут использоваться для выплат кешбэка покупателям. (<a
                    href="https://storage.googleapis.com/images_avocado/VideoCashback/2%20Seller%20Top%20up%20balance%20Without%20dialogue%20with%20the%20administrator.MP4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-600"
                  >
                    Пополнение баланса
                  </a>)</li>
              </ul>
            </section>

            <hr className="my-6 border-darkGray" />

            <section className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-left">Шаг 3. Размещение карточки товара</h3>
              <ul className="list-disc list-inside space-y-2 ml-6">
                <li>Создайте карточку товара в кабинете, заполнив все требуемые поля.<a
                    href="https://storage.googleapis.com/images_avocado/VideoCashback/3%20Seller%20Working%20with%20Products%20Placing%20a%20product%20card%20without%20sending%20it.MP4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-600"
                  >
                    Размещение карточки товара (без отправки)
                  </a>)</li>
              </ul>
            </section>

            <hr className="my-6 border-darkGray" />

            <section className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-left">Шаг 4. Размещение карточки товара</h3>
              <ul className="list-disc list-inside space-y-2 ml-6">
                <li>После заполнения карточки товара отправьте ее на модерацию (публикацию). После одобрения модератором, при достаточном балансе раздач, карточка станет активной и товар будет доступен для выкупа покупателями. (<a
                    href="https://storage.googleapis.com/images_avocado/VideoCashback/4%20Seller%20Working%20with%20Products%20Placing%20a%20product%20card%20filled%20with%20information%20and%20sending%20it.MP4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-600"
                  >
                    Размещение карточки товара (с отправкой)
                  </a>)</li>
              </ul>
            </section>

            <hr className="my-6 border-darkGray" />

            <section className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-left">Шаг 5. Статусы карточки товара</h3>
              <ul className="list-disc list-inside space-y-2 ml-6">
                <li>После отправки карточка товара получает определенный статус. Всего предусмотрено несколько статусов. <a
                    href="https://storage.googleapis.com/images_avocado/VideoCashback/5%20Seller%20Working%20with%20Products%20Placing%20a%20product%20card%20and%20explaining%20its%20status.MP4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-600"
                  >
                    Размещение карточки товара: статусы
                  </a>).</li>
                <li>Просмотреть статус каждой вашей карточки вы можете в разделе &laquo;Мои товары&raquo; в кабинете продавца. <a
                    href="https://storage.googleapis.com/images_avocado/VideoCashback/6%20Seller%20Card%20Statuses%20How%20to%20view%20statuses%2C%20how%20many%20there%20are%20in%20total.MP4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-600"
                  >
                    Как посмотреть статусы карточек
                  </a>).</li>
                <p className="text-sm">Основные статусы карточек товара:</p>
                <li><a
                    href="https://storage.googleapis.com/images_avocado/VideoCashback/7%20Seller%20Card%20Statuses%20Status%20Active.MP4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-600"
                  >
                    Статус активные
                  </a> – карточка прошла модерацию и товар виден покупателям (активна).</li>
                <li><a
                    href="https://storage.googleapis.com/images_avocado/VideoCashback/8%20Seller%20Card%20Statuses%20Status%20created.MP4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-600"
                  >
                    Статус созданные
                  </a> – карточка сохранена, но еще не проверена модератором.</li>
                <li><a
                    href="https://storage.googleapis.com/images_avocado/VideoCashback/9%20Seller%20Card%20Statuses%20Status%20Rejected.MP4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-600"
                  >
                    Статус отклонённые
                  </a> – карточка не прошла модерацию (отклонена и не опубликована).</li>
                <li><a
                    href="https://storage.googleapis.com/images_avocado/VideoCashback/10%20Seller%20Card%20Statuses%20Status%20archived.MP4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-600"
                  >
                    Статус архивированные
                  </a> – карточка снята с публикации и перемещена в архив.</li>
                <li><a
                    href="https://storage.googleapis.com/images_avocado/VideoCashback/11%20Seller%20Card%20Statuses%20Unpaid%20Status.MP4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-600"
                  >
                    Статус не оплаченные
                  </a> – карточка прошла модерацию, как только на балансе появится нужное количество раздач, карточка опубликуется для покупателей.</li>
              </ul>
            </section>

            <hr className="my-6 border-darkGray" />

            <section className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-left">Шаг 6. Редактирование карточки товара</h3>
              <ul className="list-disc list-inside space-y-2 ml-6">
                <li>Вы можете внести изменения в карточку товара (например, изменить цену или описание товара). Для этого отройте карточку в разделе &laquo;Мои товары&raquo;, внесите правки и сохраните изменения. (<a
                    href="https://storage.googleapis.com/images_avocado/VideoCashback/12%20Seller%20How%20to%20edit%20a%20product%20card.MP4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-600"
                  >
                    Как отредактировать карточку товара
                  </a>)</li>
                <li>После редактирования карточка может снова перейти в статус &laquo;созданные&raquo; и потребовать повторной модерации перед повторной публикацией. (<a
                    href="https://storage.googleapis.com/images_avocado/VideoCashback/13%20Seller%20How%20to%20edit%20a%20product%20card%20Continuation%20with%20an%20explanation%20of%20what%20happens%20to%20the%20card%20after%20editing.MP4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-600"
                  >
                    Продолжение редактирования: что происходит после изменений
                  </a>).</li>
              </ul>
            </section>

            <hr className="my-6 border-darkGray" />

            <section className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-left">Шаг 7. Снятие карточки с публикации</h3>
              <ul className="list-disc list-inside space-y-2 ml-6">
                <li>Если вы временно не хотите раздавать товар, вы можете снять карточку с публикации. После этого товар перестанет быть виден покупателям и новые выкупы по нему совершать не смогут. (<a
                    href="https://storage.googleapis.com/images_avocado/VideoCashback/14%20Seller%20How%20to%20remove%20a%20card%20from%20a%20publication.MP4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-600"
                  >
                    Как снять карточку с публикации
                  </a>)</li>
              </ul>
            </section>

            <hr className="my-6 border-darkGray" />

            <section className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-left">Шаг 8. Возврат карточки из архива</h3>
              <ul className="list-disc list-inside space-y-2 ml-6">
                <li>Вы можете вернуть ранее архивированную карточку обратно на публикацию, если решили возобновить раздачу товара. После восстановления карточка перейдет в статус &laquo;активные&raquo; и снова станет видна покупателям. (<a
                    href="https://storage.googleapis.com/images_avocado/VideoCashback/15%20Seller%20How%20to%20return%20a%20card%20from%20the%20archive%20to%20a%20publication.MP4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-600"
                  >
                    Как вернуть карточку из архива
                  </a>)</li>
              </ul>
            </section>

            <hr className="my-6 border-darkGray" />

            <section className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-left">Шаг 9. Отчёты по выкупам</h3>
              <ul className="list-disc list-inside space-y-2 ml-6">
                <li>В разделе &laquo;Отчёты&raquo; вы найдете информацию по всем выкупам ваших товаров. Здесь отображаются детали каждого выкупа: какой товар был выкуплен, когда, кем. (<a
                    href="https://storage.googleapis.com/images_avocado/VideoCashback/16%20Seller%20Reports%20on%20Buybacks.MP4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-600"
                  >
                    Отчёты по выкупам
                  </a>)</li>
              </ul>
            </section>

            <hr className="my-6 border-darkGray" />

            <section className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-left">Шаг 10. Реферальная программа</h3>
              <ul className="list-disc list-inside space-y-2 ml-6">
                <li>Вы можете приглашать новых продавцов на платформу и получать бонусы за их участие. Если приглашенные вами продавцы активно раздают товары, вам будут начисляться вознаграждения согласно условиям реферальной программы. Подробнее об этом – в видео (<a
                    href="https://storage.googleapis.com/images_avocado/VideoCashback/17%20Seller%20Referral%20Program.MP4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-600"
                  >
                    Реферальная программа
                  </a>).</li>
              </ul>
            </section>
          </>
        )}

        {/* Back to main button */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleHomeClick}
            className="py-2 px-4 rounded-lg text-sm font-semibold border border-brand text-brand bg-transparent w-auto"
          >
            На главную
          </button>
        </div>
      </div>
    </div>
  );
}

export default InstructionsPage;

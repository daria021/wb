import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {getOrderById, getOrderReport} from '../../services/api';
import GetUploadLink from '../../components/GetUploadLink';
import { AxiosResponse } from 'axios';
import { OrderStatus } from '../../enums';

interface Product {
  name: string;
  price?: number;
  wb_price?: number;
  payment_time: string;
  tg_nick: string;            // без "@"
  image_path: string;
}

interface Order {
  id: string;
  product: Product;
  card_number?: string;
  phone_number?: string;
  bank?: string;
  name?: string;
  status: OrderStatus;
  transaction_code: string;
  created_at: string;
  seller: User
}

interface User {
    nickname: string
}


interface OrderReport {
    step: number;
    search_screenshot_path?: string;
    cart_screenshot_path?: string;
    card_number?: string;
    phone_number?: string;
    name?: string;
    bank?: string;
    final_cart_screenshot_path?: string;
    delivery_screenshot_path?: string;
    barcodes_screenshot_path?: string;
    review_screenshot_path?: string;
    receipt_screenshot_path?: string;
    receipt_number?: string;
    article?: string;
}

export default function FinalDealPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [reportData, setReportData] = useState<OrderReport | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});

  const toggleStep = (step: number) => {
      setExpandedSteps(prev => ({...prev, [step]: !prev[step]}));
  };

  useEffect(() => {
    if (!orderId) return;
    getOrderById(orderId)
      .then((res: AxiosResponse<Order>) => setOrder(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

    useEffect(() => {
      if (!orderId) return;
      getOrderReport(orderId)
          .then((response: AxiosResponse<OrderReport>) => {
              setReportData(response.data);
          })
          .catch((err) => {
              console.error('Ошибка при загрузке отчета:', err);
          });
  }, [orderId]);

  if (loading) return <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-gray-600 always-spin"/>
            </div>;
  if (!order) return <div className="p-4 text-red-600">Не удалось загрузить данные</div>;

  const { product } = order;
  const price   = product.price   ?? 0;
  const wbPrice  = product.wb_price ?? 0;
  const cashback = wbPrice - price;

    // теперь TS знает, что order точно не null
  const statusText =
    order.status === OrderStatus.CASHBACK_PAID     ? 'Выплачен кешбэк'
  : order.status === OrderStatus.CASHBACK_NOT_PAID ? 'Кешбэк не выплачен'
  : order.status === OrderStatus.CANCELLED         ? 'Отменён'
  : order.status === OrderStatus.PAYMENT_CONFIRMED ? 'Оплата подтверждена'
  :                                                   '';

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });



  return (
    <div className="p-4 bg-gray-200 max-w-screen-md mx-auto space-y-4">

      {/* 1. Заголовок */}
      <div className="bg-white border border-brand p-4 rounded-md text-sm space-y-2">
        <p className="items-center font-bold text-lg">
          <span className="mr-2">✅</span>
          Ваш отчёт успешно отправлен продавцу!
        </p>
        <p>Спасибо! Все данные и скриншоты отправлены продавцу для проверки.</p>
        <p>Ниже — важная информация о следующих шагах:</p>
      </div>

      {/* 2. Реквизиты */}
      <div className="bg-white border border-brand p-4 rounded-md text-sm space-y-1">
        <p className="font-bold">💳 Ваши реквизиты для выплаты:</p>
        <p><strong>Номер карты:</strong> {order.card_number || '—'}</p>
        <p><strong>Номер телефона:</strong> {order.phone_number || '—'}</p>
        <p><strong>Банк:</strong> {order.bank || '—'}</p>
        <p><strong>Получатель:</strong> {order.name || '—'}</p>
      </div>

      {/* 3. Что будет дальше */}
      <div className="bg-white border border-brand p-4 rounded-md text-sm space-y-1">
        <p className="font-bold">⏱️ Что будет дальше:</p>
        <p>Продавец проверит ваш отчёт в течение <strong>1–7 дней</strong>.</p>
        <p>Выплата кешбэка будет произведена <strong>в течение 7 дней</strong> после проверки.</p>
        <p>Уведомление о выплате вы получите в боте.</p>
      </div>

      {/* 4. Напоминаем */}
      <div className="bg-white border border-brand p-4 rounded-md text-sm space-y-1">
        <p className="font-bold">🛡️ Напоминаем:</p>
        <p><strong>Бот не выплачивает кешбэк и не участвует в денежных переводах.</strong></p>
        <p>Ответственность за выплаты несёт только продавец.</p>
        <p>Если кешбэк не поступил в указанный срок — <strong>сначала свяжитесь с продавцом</strong> в Telegram.</p>
        <p>Если продавец не выходит на связь или есть подозрение на мошенничество — <strong>сообщите нам:</strong></p>
        <p>
          🔧{' '}
          <a
            href={process.env.REACT_APP_SUPPORT_URL}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Техподдержка
          </a>
        </p>
        <p>
          <a
            href="https://t.me/Premiumcashb/1153"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            📢 Групповой чат сообщества
          </a>
        </p>
      </div>

{/* 5. Детализация */}
<div className="bg-white border border-brand p-4 rounded-md text-sm space-y-1">
  <p className="font-bold">🧾 Детализация:</p>
  <p>Товар: <strong>{product.name}</strong></p>
  <p>Цена выкупа: <strong>{price} ₽</strong></p>
  <p>Кешбэк: <strong>{cashback} ₽</strong></p>
  <p>Выплата: <strong>{product.payment_time}</strong></p>
  <p>Статус: <strong>{statusText}</strong></p>
  <p>
    Продавец:{' '}
    <a
      href={`https://t.me/${order.seller.nickname}`}
      target="_blank"
      rel="noreferrer"
      className="font-medium underline"
    >
      @{order.seller.nickname}
    </a>
  </p>
  <p>
    Дата сделки по выкупу товара: <strong>{formatDate(order.created_at)}</strong>
  </p>
  <p>Код сделки: <strong>{order.transaction_code}</strong></p>
</div>


      {/* 6. Отзыв */}
      <div className="bg-white border border-brand p-4 rounded-md text-sm space-y-2">
        <p className="font-bold">💬 Поделитесь отзывом:</p>
        <p>Расскажите, как прошла ваша сделка, помогите другим избежать ошибок 👇</p>
        <p>
          <a
            href="https://t.me/Premiumcashb/8"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Поделиться отзывом в чате
          </a>
        </p>
      </div>

      {/* 7. Спасибо */}
      <div className="bg-white border border-brand p-4 rounded-md text-sm space-y-1">
        <p className="font-bold">👌 Спасибо, что пользуетесь Premium Cash Back!</p>
        <p>Мы делаем покупки выгоднее — вместе 💜</p>
      </div>
      <div className="flex flex-col space-y-2">
                <button
                    onClick={() => setShowReport(prev => !prev)}
                className="bg-white border border-darkGray rounded-lg p-3 text-sm font-semibold flex items-center justify-center"
                >
                    {showReport ? 'Скрыть отчет' : 'Открыть отчет'}
                </button>


                {showReport && (
                    <div className="bg-white rounded-lg shadow p-4 mb-4">
                                                    <h3 className="text-lg font-bold mb-2">Отчёт по сделке выкупа товара</h3>
                            {reportData ? (
                                    <div className="space-y-2">
                                        {/* Шаг 1 */}
                                        <div className="bg-white rounded-lg shadow">
                                            <button
                                                onClick={() => toggleStep(1)}
                                                className="w-full flex justify-between items-center p-4 text-left"
                                            >
                                                <span className="font-semibold">Шаг 1. Скриншоты поиска и корзины</span>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className={`w-5 h-5 transform transition-transform ${
                                                        expandedSteps[1] ? 'rotate-180' : ''
                                                    }`}
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                          d="M19 9l-7 7-7-7"/>
                                                </svg>
                                            </button>
                                            {expandedSteps[1] && (
                                                <div className="border-t p-4 space-y-3">
                                                    {reportData.search_screenshot_path && (
                                                        <div>
                                                            <p className="text-sm font-semibold">Скриншот поискового запроса в WB
                                                            </p>
                                                            <img
                                                                src={GetUploadLink(reportData.search_screenshot_path)}
                                                                alt="Скриншот поискового запроса в WB"
                                                                className="mt-1 w-full rounded"
                                                            />
                                                        </div>
                                                    )}
                                                    {reportData.cart_screenshot_path && (
                                                        <div>
                                                            <p className="text-sm font-semibold">Скриншот корзины в WB</p>
                                                            <img
                                                                src={GetUploadLink(reportData.cart_screenshot_path)}
                                                                alt="Скриншот корзины в WB"
                                                                className="mt-1 w-full rounded"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Шаг 2 */}
                                        <div className="bg-white rounded-lg shadow">
                                            <button
                                                onClick={() => toggleStep(2)}
                                                className="w-full flex justify-between items-center p-4 text-left"
                                            >
                                                <span className="font-semibold"> Шаг 2. Артикул товара продавца</span>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className={`w-5 h-5 transform transition-transform ${
                                                        expandedSteps[2] ? 'rotate-180' : ''
                                                    }`}
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                          d="M19 9l-7 7-7-7"/>
                                                </svg>
                                            </button>
                                            {expandedSteps[2] && (
                                                <div className="border-t p-4">
                                                    <p className="text-sm">{reportData.article}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Шаг 3 */}
                                        <div className="bg-white rounded-lg shadow">
                                            <button
                                                onClick={() => toggleStep(3)}
                                                className="w-full flex justify-between items-center p-4 text-left"
                                            >
                                                <span className="font-semibold">Шаг 3. Товар и бренд в избранное</span>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className={`w-5 h-5 transform transition-transform ${
                                                        expandedSteps[3] ? 'rotate-180' : ''
                                                    }`}
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                          d="M19 9l-7 7-7-7"/>
                                                </svg>
                                            </button>
                                            {expandedSteps[3] && (
                                                <div className="border-t p-4">
                                                    <p className="text-sm">Добавлены</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Шаг 4 */}
                                        <div className="bg-white rounded-lg shadow">
                                            <button
                                                onClick={() => toggleStep(4)}
                                                className="w-full flex justify-between items-center p-4 text-left"
                                            >
                                                <span className="font-semibold">Шаг 4. Реквизиты для перевода
                                            кешбэка</span>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className={`w-5 h-5 transform transition-transform ${
                                                        expandedSteps[4] ? 'rotate-180' : ''
                                                    }`}
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                          d="M19 9l-7 7-7-7"/>
                                                </svg>
                                            </button>
                                            {expandedSteps[4] && (
                                                <div className="border-t p-4 space-y-1">
                                                    {reportData.card_number &&
                                                        <p className="text-sm">Номер карты: {reportData.card_number}</p>}
                                                    {reportData.phone_number &&
                                                        <p className="text-sm">Номер телефона: {reportData.phone_number}</p>}
                                                    {reportData.name && <p className="text-sm">Получатель: {reportData.name}</p>}
                                                    {reportData.bank && <p className="text-sm">Банк: {reportData.bank}</p>}
                                                </div>
                                            )}
                                        </div>

                                        {/* Шаг 5 */}
                                        <div className="bg-white rounded-lg shadow">
                                            <button
                                                onClick={() => toggleStep(5)}
                                                className="w-full flex justify-between items-center p-4 text-left"
                                            >
                                                <span className="font-semibold">Шаг 5. Скриншот оформления заказа</span>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className={`w-5 h-5 transform transition-transform ${
                                                        expandedSteps[5] ? 'rotate-180' : ''
                                                    }`}
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                          d="M19 9l-7 7-7-7"/>
                                                </svg>
                                            </button>
                                            {expandedSteps[5] && reportData.final_cart_screenshot_path && (
                                                <div className="border-t p-4">
                                                    <p className="text-sm font-semibold">Скриншот заказа на WB</p>
                                                    <img
                                                        src={GetUploadLink(reportData.final_cart_screenshot_path)}
                                                        alt="Финальный Скриншот корзины в WB"
                                                        className="w-full rounded"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Шаг 6 */}
                                        <div className="bg-white rounded-lg shadow">
                                            <button
                                                onClick={() => toggleStep(6)}
                                                className="w-full flex justify-between items-center p-4 text-left"
                                            >
                                                <span className="font-semibold">Шаг 6. Скриншоты доставки и штрихкода</span>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className={`w-5 h-5 transform transition-transform ${
                                                        expandedSteps[6] ? 'rotate-180' : ''
                                                    }`}
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                          d="M19 9l-7 7-7-7"/>
                                                </svg>
                                            </button>
                                            {expandedSteps[6] && (
                                                <div className="border-t p-4 space-y-3">
                                                    {reportData.delivery_screenshot_path && (
                                                        <div>
                                                            <p className="text-sm font-semibold">1. Скриншот статуса заказа в разделе "Доставки" на WB</p>
                                                            <img
                                                                src={GetUploadLink(reportData.delivery_screenshot_path)}
                                                                alt="Скрин доставки"
                                                                className="mt-1 w-full rounded"
                                                            />
                                                        </div>
                                                    )}
                                                    {reportData.barcodes_screenshot_path && (
                                                        <div>
                                                            <p className="text-sm font-semibold">2. Фотография разрезанного штрихкода на фоне товара</p>
                                                            <img
                                                                src={GetUploadLink(reportData.barcodes_screenshot_path)}
                                                                alt="Скрин штрихкодов"
                                                                className="mt-1 w-full rounded"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-white rounded-lg shadow">
                                    <button
                                        onClick={() => toggleStep(7)}
                                        className="w-full flex justify-between items-center p-4 text-left"
                                    >
                                        <span className="font-semibold">Шаг 7. Скриншот отзыва и эл.чека</span>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className={`w-5 h-5 transform transition-transform ${
                                                expandedSteps[7] ? 'rotate-180' : ''
                                            }`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M19 9l-7 7-7-7"/>
                                        </svg>
                                    </button>
                                    {expandedSteps[7] && (
                                        <div className="border-t p-4 space-y-3">
                                            {reportData.review_screenshot_path && (
                                                <div>
                                                    <p className="text-sm font-semibold">Скриншот отзыва товара в WB

                                                    </p>
                                                    <img
                                                        src={GetUploadLink(reportData.review_screenshot_path)}
                                                        alt="Скрин отзыва"
                                                        className="mt-1 w-full rounded"
                                                    />
                                                </div>
                                            )}
                                            {reportData.receipt_screenshot_path && (
                                                <div>
                                                    <p className="text-sm font-semibold">Скриншот электронного чека заказа в WB</p>
                                                    <img
                                                        src={GetUploadLink(reportData.receipt_screenshot_path)}
                                                        alt="Скрин электронного чека"
                                                        className="mt-1 w-full rounded"
                                                    />
                                                </div>
                                            )}
                                            {reportData.receipt_number && (
                                                <div>
                                                    <p className="text-sm font-semibold">Номер чека</p>
                                                    <p className="text-sm">{reportData.receipt_number}</p>
                                                </div>
                                            )}

                                        </div>
                                    )}
                                </div>
                            </div>
                        ) :
                                <p className="text-sm text-gray-500">Отчет пока пуст.</p>
                        }
                    </div>

                )}
      <button
        onClick={() => navigate('/')}
        className="w-full bg-white border border-darkGray rounded-lg p-3 text-sm font-semibold"
      >
        На главную
      </button>

    </div>
            </div>



    );
}
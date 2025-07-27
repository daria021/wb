import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById } from '../../services/api';
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

export default function FinalDealPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!orderId) return;
    getOrderById(orderId)
      .then((res: AxiosResponse<Order>) => setOrder(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <div className="p-4">Загрузка...</div>;
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
  <p>Выплата: <em>{product.payment_time}</em></p>
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

      <button
        onClick={() => navigate('/')}
        className="w-full bg-white border border-darkGray rounded-lg p-3 text-sm font-semibold"
      >
        На главную
      </button>
    </div>
  );
}

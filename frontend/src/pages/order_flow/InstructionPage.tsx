import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {createOrder, getBlackListUser, getProductById, getUserOrders} from '../../services/api';
import { AxiosResponse } from 'axios';
import { useUser } from '../../contexts/user';
import {OrderStatus} from "../../enums";

function translatePaymentTime(value: string): string {
  switch (value) {
    case 'AFTER_REVIEW': return '— после публикации отзыва на WB';
    case 'AFTER_DELIVERY': return '— после получения товара';
    case 'ON_15TH_DAY': return '— через 15 дней после получения товара';
    default: return value;
  }
}

interface Product {
  id: string;
  seller_id: string;
  price: number;
  wb_price: number;
  tg: string;
  payment_time: string;
  requirements_agree: boolean;
  review_requirements: string;
}

const InstructionPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { search } = useLocation();
  const preview = new URLSearchParams(search).get('preview') === '1';
  const { user } = useUser();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [agreeRules, setAgreeRules] = useState(false);
  const [agreeData, setAgreeData] = useState(false);

const isActiveStatus = (s: OrderStatus) =>
  s !== OrderStatus.CANCELLED && s !== OrderStatus.CASHBACK_PAID;

const getOrderRoute = (o: { id: string; step: number }) => {
  const st = Number(o.step) || 0;
  if (st <= 1) return `/product/${o.id}/step-1`;
  if (st >= 7) return `/order/${o.id}/order-info`;
  return `/order/${o.id}/step-${st}`;
};

const matchesProduct = (o: any, pid: string) => {
  const p = String(pid);
  const byField = o.product_id != null && String(o.product_id) === p;
  const byObj   = o.product?.id != null && String(o.product.id) === p;
  return byField || byObj;
};

  useEffect(() => {
    if (!productId) return;
    getProductById(productId)
      .then((res: AxiosResponse<Product>) => setProduct(res.data))
      .catch(() => setError('Не удалось загрузить данные о товаре'))
      .finally(() => setLoading(false));
  }, [productId]);

  const canContinue = agreeRules && agreeData;

const handleContinue = async () => {
  if (!canContinue || !user || !productId || !product) return;

  try {
    const res = await getUserOrders();
    const existing = res.data.find(
      (o: any) => isActiveStatus(o.status) && matchesProduct(o, productId)
    );
    if (existing) {
      navigate(getOrderRoute(existing));
      return;
    }
  } catch (e) {
    console.error(e);
  }

  const formData = new FormData();
  formData.append('user_id', user.id);
  formData.append('seller_id', product.seller_id);
  formData.append('product_id', productId);

  const orderId = (await createOrder({ formData })).data as string;
  navigate(`/product/${orderId}/step-1`);
};


  const handleBack = () => navigate(-1);

  if (loading) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-gray-600 animate-spin" />
    </div>
  );
  if (error || !product) return <div className="p-4 text-red-600">{error || 'Товар не найден'}</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow p-6 space-y-6">
        {/* Header */}
        <h1 className="text-2xl font-bold text-center">
          Перед началом — изучите правила сервиса и выкупа товара за кешбэк
        </h1>
        <p className="text-gray-700 text-sm">
          Вы собираетесь начать сделку по выкупу товара с кешбэком.<br />
          Пожалуйста, внимательно ознакомьтесь с условиями и подтвердите согласие:
        </p>
        <hr />

        {/* Terms Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center space-x-2">
            <span>Условия сделки по выкупу товара:</span>
          </h2>
          <ul className="list-inside list-none space-y-2 text-gray-800 text-sm">
            <li className="flex items-start space-x-2">
              <span role="img" aria-label="cash">💸</span>
              <span>
                <strong>Выплата кешбэка осуществляется продавцом</strong>, напрямую на ваши реквизиты после выполнения всех условий сделки.
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span role="img" aria-label="robot">🤖</span>
              <span>
                <strong>Бот не является участником сделки</strong>, не проводит выплаты и не несёт ответственности за действия продавцов.
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span role="img" aria-label="document">🧾</span>
              <div>
                <span className="font-semibold">Условия получения кешбэка:</span>
                <ul className="list-disc list-inside space-y-1 mt-1 ml-6">
                  <li>Выкуп товара на Wildberries</li>
                  <li>Подтверждение получения товара через скриншоты</li>
                  <li>Публикация отзыва по правилам сделки</li>
                  <li>Согласование отзыва с продавцом, если требуется</li>
                </ul>
              </div>
            </li>
            <li className="flex items-start space-x-2">
              <span role="img" aria-label="clock">🕒</span>
              <span className="text-gray-700">
                Выплата кешбэка — <strong>{translatePaymentTime(product.payment_time)}</strong>
              </span>
            </li>
          </ul>
        </section>
        <hr />

        {/* Warnings */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold flex items-center space-x-2 ">
            <span>Предупреждения:</span>
          </h2>
          <ul className="space-y-2 text-gray-800 text-sm">
            <li className="flex space-x-2">
              <span role="img" aria-label="exclamation">❗</span>
              <span>
                Перед сделкой <strong>проверьте продавца</strong> также в <a
  href="https://t.me/bigblacklist_bot"
  target="_blank"
  rel="noopener noreferrer"
  className="text-blue-600 hover:underline"
>
  <strong>@bigblacklist_bot</strong>
</a>.
              </span>
            </li>
            <li className="flex space-x-2">
              <span role="img" aria-label="cross">❌</span>
              <span>
                Не выкупайте сразу несколько товаров у одного продавца до получения кешбэка.
              </span>
            </li>
            <li className="flex space-x-2">
              <span role="img" aria-label="speech">💬</span>
              <span>Все вопросы по кешбэку — напрямую продавцу через Telegram.</span>
            </li>
            <li className="flex space-x-2">
              <span role="img" aria-label="no">🚫</span>
              <span>
                В случае мошенничества техподдержка может заблокировать продавца, но <strong>не возвращает средства</strong>.
              </span>
            </li>
          </ul>
        </section>
        <hr />

        {/* Deal Details */}
        <section className="space-y-3 text-sm">
          <h2 className="text-xl font-semibold flex items-center space-x-2 ">
            <span>Детали сделки по выкупу товара:</span>
          </h2>
          <p className="text-green-600">
  Кешбэк: { product.wb_price - product.price} ₽
</p>

<p className="text-[#5C2D91] font-semibold">
  Ваша цена: {product.price} ₽
</p>

          <p>Цена на WB: {product.wb_price} ₽</p>
<p>
  Согласование отзыва с продавцом{' '}
  {product.tg ? (
    <a
      href={`https://t.me/${product.tg.replace(/^@/, '')}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline"
    >
      {product.tg}
    </a>
  ) : '—'}
  : <strong>{product.requirements_agree ? 'Требуется' : 'Не требуется'}</strong>
</p>

          {product.review_requirements && (
  <p>Требования к отзыву: <em>{product.review_requirements}</em></p>
)}

        </section>

        {/* Confirmation Form */}
        {!preview && (
          <div className="space-y-4">
            <div className="flex items-start space-x-3 text-sm">
              <input
                type="checkbox"
                id="agreeRules"
                className="h-5 w-5 mt-1"
                checked={agreeRules}
                onChange={e => setAgreeRules(e.target.checked)}
              />
              <label htmlFor="agreeRules" className="text-gray-800">
                Я ознакомлен(а) с условиями и подтверждаю, что:
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>понимаю, что бот не выплачивает кешбэк;</li>
                  <li>не буду предъявлять претензии к сервису в случае споров с продавцом;</li>
                  <li>беру на себя ответственность за проверку продавца и соблюдение всех условий.</li>
                </ul>
              </label>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <input
                type="checkbox"
                id="agreeData"
                className="h-5 w-5"
                checked={agreeData}
                onChange={e => setAgreeData(e.target.checked)}
              />
              <label htmlFor="agreeData" className="text-gray-800">
                Я даю согласие на обработку персональных данных
              </label>
            </div>
            <div className="flex justify-between pt-4 border-t">
              <button
                onClick={handleBack}
                className="px-4 py-2 rounded-lg border border-gray-400 text-gray-700"
              >
                Отменить
              </button>
              <button
                onClick={handleContinue}
                disabled={!canContinue}
                className={`px-6 py-2 rounded-lg font-semibold text-white ${canContinue ? 'bg-blue-600' : 'bg-gray-300 cursor-not-allowed'}`}
              >
                Продолжить
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructionPage;

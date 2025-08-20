import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {getOrderBySellerId, updateOrderStatus} from '../services/api';
import {AxiosResponse} from 'axios';
import {OrderStatus, PayoutTime} from '../enums';
import {useUser} from "../contexts/user";
import GetUploadLink from "../components/GetUploadLink";

interface Product {
    id: string;
    name: string;
    brand: string;
    article: string;
    category: string;
    key_word: string;
    general_repurchases: number;
    // daily_repurchases: number;
    price: number;
    wb_price: number;
    tg: string;
    payment_time: PayoutTime;
    review_requirements: string;
    image_path?: string;
    seller_id: string;
    created_at: string;
    updated_at: string;
}

interface User {
    id: string;
    telegram_id?: number;
    nickname?: string;
    created_at: string;
    updated_at: string;
}

interface Order {
    id: string;
    user_id: string;
    product_id: string;
    step: number;
    search_screenshot_path?: string;
    cart_screenshot?: string;
    card_number?: string;
    phone_number?: string;
    name?: string;
    bank?: string;
    price?: number;
    wb_price?: number;
    order_date?: Date;
    final_cart_screenshot?: string;
    delivery_screenshot_path?: string;
    barcodes_screenshot_path?: string;
    review_screenshot_path?: string;
    receipt_screenshot_path?: string;
    receipt_number?: string;
    status: OrderStatus;
    product: Product;
    user: User;
}

const addDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};
const getPayoutDue = (order: Order) => {
  const base = order.order_date ? new Date(order.order_date as any) : null;
  if (!base || isNaN(base.getTime())) return <>не указана</>;

  let plusDays = 0;
  switch (order.product.payment_time) {
    case PayoutTime.AFTER_REVIEW:
    case PayoutTime.AFTER_DELIVERY:
      plusDays = 7;
      break;
    case PayoutTime.ON_15TH_DAY:
      plusDays = 15;
      break;
    default:
      return <>—</>;
  }

  const due = addDays(base, plusDays);
  const today = new Date();
  const daysLeft = Math.ceil(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  const daysText =
    daysLeft > 0
      ? `осталось ${daysLeft} ${pluralizeDays(daysLeft)}`
      : `просрочено на ${Math.abs(daysLeft)} ${pluralizeDays(Math.abs(daysLeft))}`;

  return (
    <>
      {due.toLocaleDateString('ru-RU')} <strong>{`(${daysText})`}</strong>
    </>
  );
};

const getDaysLeft = (order: Order): number | null => {
  const base = order.order_date ? new Date(order.order_date as any) : null;
  if (!base || isNaN(base.getTime())) return null;

  let plusDays = 0;
  switch (order.product.payment_time) {
    case PayoutTime.AFTER_REVIEW:
    case PayoutTime.AFTER_DELIVERY:
      plusDays = 7; // как у тебя сейчас в getPayoutDue
      break;
    case PayoutTime.ON_15TH_DAY:
      plusDays = 15;
      break;
    default:
      return null;
  }

  const due = addDays(base, plusDays);
  const today = new Date();
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};


// утилита для правильного склонения слова "день"
const pluralizeDays = (n: number) => {
  const lastDigit = n % 10;
  const lastTwo = n % 100;
  if (lastTwo >= 11 && lastTwo <= 14) return 'дней';
  if (lastDigit === 1) return 'день';
  if (lastDigit >= 2 && lastDigit <= 4) return 'дня';
  return 'дней';
};


function SellerReportsPage() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');


    const {user, loading: userLoading} = useUser();
    const sellerId = user?.id;

    type DeadlineFilter = 'Все сроки' | 'В срок' | 'Скоро дедлайн' | 'Просрочено';
    const [deadlineFilter, setDeadlineFilter] = useState<DeadlineFilter>('Все сроки');

    const {search} = useLocation();
    const params = new URLSearchParams(search);
    const initialTab = params.get('tab') === 'paid'
        ? OrderStatus.CASHBACK_PAID
        : OrderStatus.CASHBACK_NOT_PAID;
    const [activeTab, setActiveTab] = useState<OrderStatus>(initialTab);

    const STATUS_RU: Record<OrderStatus, string> = {
        [OrderStatus.CASHBACK_NOT_PAID]: 'Кешбэк не выплачен',
        [OrderStatus.CASHBACK_PAID]: 'Кешбэк выплачен',
        [OrderStatus.CANCELLED]: 'Отменён',
        [OrderStatus.PAYMENT_CONFIRMED]: 'Оплата подтверждена',
        [OrderStatus.CASHBACK_REJECTED]: 'Кешбэк отклонён',
    };

    const fetchReports = async () => {
        if (!sellerId) return;
        try {
            const response: AxiosResponse<Order[]> = await getOrderBySellerId(sellerId);
            console.log("sheesh");
            console.log(response.data[0]);
            setOrders(response.data);
        } catch (err) {
            console.error("Ошибка при загрузке отчетов:", err);
            setError("Не удалось загрузить отчеты по выкупам");
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (!sellerId) return;

        setLoading(true);

        async function loadReports() {
            if (!sellerId) return;

            try {
                const response = await getOrderBySellerId(sellerId);
                setOrders(response.data);
                setError('');
            } catch (err) {
                console.error('Ошибка при загрузке отчётов:', err);
                setError('Не удалось загрузить отчёты по выкупам');
            } finally {
                setLoading(false);
            }
        }

        loadReports();
    }, [sellerId]);


    const filteredOrders = orders
  .filter(o => o.status === activeTab)
  .filter(o => {
    if (activeTab !== OrderStatus.CASHBACK_NOT_PAID) return true;
    if (deadlineFilter === 'Все сроки') return true;

    const dl = getDaysLeft(o); // может быть null, если нет даты
    if (dl === null) return false; // без даты не учитываем в узких фильтрах

    // В срок: осталось > 4 дней
    if (deadlineFilter === 'В срок') return dl > 4;

    // Скоро дедлайн: осталось 0–3 дней
    if (deadlineFilter === 'Скоро дедлайн') return dl >= 0 && dl <= 3;

    // Просрочено: осталось < 0 дней
    if (deadlineFilter === 'Просрочено') return dl < 0;

    return true;
  });

    const resolveImage = (p?: string | null) => {
  if (!p) return null;
  return GetUploadLink(p);
};



    if (loading) {
        return <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-gray-600 always-spin"/>
            </div>;
    }
    if (error) {
        return (
            <div className="p-4 bg-brandlight border border-brand rounded text-center">
                <p className="text-sm text-brand">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-200">
            <div className="p-4 max-w-screen-md mx-auto">
                <div className="sticky top-0 z-10 bg-gray-200">

                    <h1 className="text-2xl font-bold mb-4 text-center">Отчеты по выкупам</h1>

                    <div className="flex mb-4 border-b">
                        <button
                            onClick={() => setActiveTab(OrderStatus.CASHBACK_NOT_PAID)}
                            className={`px-4 py-2 font-semibold ${activeTab === OrderStatus.CASHBACK_NOT_PAID ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}
                        >
                            Кешбэк не выплачен
                        </button>
                        <button
                            onClick={() => setActiveTab(OrderStatus.CASHBACK_PAID)}
                            className={`px-4 py-2 font-semibold ${activeTab === OrderStatus.CASHBACK_PAID ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-600'}`}
                        >
                            Кешбэк выплачен
                        </button>

                    </div>

{activeTab === OrderStatus.CASHBACK_NOT_PAID && (
  <div className="mb-4 max-w-xs">
    <div className="relative">
      <select
        value={deadlineFilter}
        onChange={(e) => setDeadlineFilter(e.target.value as DeadlineFilter)}
        className="w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand"
      >
        <option value="Все сроки">Все сроки</option>
        <option value="В срок">В срок</option>
        <option value="Скоро дедлайн">Скоро дедлайн</option>
        <option value="Просрочено">Просрочено</option>
      </select>

      {/* стрелка справа */}
      <svg
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
        viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
      >
        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.24 4.38a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
      </svg>
    </div>
  </div>
)}


                </div>

                <div className="flex flex-col gap-4">
                    {filteredOrders.length ? (
                        filteredOrders.map((order) => (

<div
  key={order.id}
  className="border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white p-2"
>
  {/* верхняя часть: фото + текст */}
  <div className="flex gap-3 p-2">
    {/* фото */}
    <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
      {order.product.image_path ? (
        <img
          src={order.product.image_path.startsWith('http')
            ? order.product.image_path
            : GetUploadLink(order.product.image_path)}
          alt={order.product.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400 text-xs">
          Нет фото
        </div>
      )}
    </div>

    {/* текст */}
    <div className="flex-1">
      <h2 className="text-lg font-semibold">{order.product.name}</h2>
      <p className="text-sm text-gray-600">Выплатить до: {getPayoutDue(order)}</p>
      <p className="text-sm text-gray-600">
        Сумма кешбэка: {(order?.product.wb_price ?? 0) - (order?.product.price ?? 0)}
      </p>
      <p className="text-sm text-gray-600">
        Покупатель: @{order.user.nickname || "Не указан"}
      </p>
    </div>
  </div>

  {/* кнопка на всю ширину */}
  {activeTab === OrderStatus.CASHBACK_NOT_PAID && (
    <button
      onClick={() => navigate(`/seller-cabinet/reports/${order.id}`)}
      className="mt-4 w-full py-2 rounded bg-brand text-white font-semibold text-base hover:opacity-90 transition"
    >
      Открыть отчёт
    </button>
  )}
</div>

                        ))
                    ) : (
                        <p className="text-center text-gray-600">Заказов не найдено</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SellerReportsPage;

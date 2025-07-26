import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrderStatus } from '../../enums';
import { getOrders } from '../../services/api';

interface Product {
  id: string;
  name: string;
  image_path?: string;
}

interface User {
  id: string;
  nickname: string;
}

interface Order {
  id: string;
  transaction_code: string;
  product: Product;
  user: User;
  seller: User;
  status: OrderStatus;
  step: number;
  created_at: string;
}

export const ModeratorOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getOrders()
      .then(res => {
        setOrders(res.data);
        setError('');
      })
      .catch(err => {
        console.error('Ошибка при получении сделок:', err);
        setError('Не удалось загрузить список сделок.');
      })
      .finally(() => setLoading(false));
  }, []);

  const activeDeals = orders.filter(o =>
    o.status !== OrderStatus.CASHBACK_PAID && o.status !== OrderStatus.CANCELLED
  );
  const completedDeals = orders.filter(o =>
    o.status === OrderStatus.CASHBACK_PAID || o.status === OrderStatus.CANCELLED
  );

  const displayList = (activeTab === 'active' ? activeDeals : completedDeals)
    .filter(o =>
      o.transaction_code
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase())
    );

  const getStatusLabel = (status: OrderStatus): string => {
    switch (status) {
      case OrderStatus.CASHBACK_NOT_PAID:
        return 'Кешбэк не выплачен';
      case OrderStatus.PAYMENT_CONFIRMED:
        return 'Оплата подтверждена';
      case OrderStatus.CASHBACK_PAID:
        return 'Кешбэк выплачен';
      case OrderStatus.CANCELLED:
        return 'Отменён';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Управление заказами</h1>

      {/* Tabs */}
      <div className="flex border-b border-darkGray mb-4">
        <button
          className={`px-4 py-2 font-semibold ${
            activeTab === 'active'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-500 hover:text-blue-500'
          }`}
          onClick={() => setActiveTab('active')}
        >
          Активные сделки
        </button>
        <button
          className={`px-4 py-2 font-semibold ${
            activeTab === 'completed'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-500 hover:text-blue-500'
          }`}
          onClick={() => setActiveTab('completed')}
        >
          Завершённые сделки
        </button>
      </div>

      {/* Search */}
      <div className="mb-4 flex justify-center">
        <input
          type="text"
          placeholder="Поиск по ID сделки"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-2/3 border border-darkGray rounded-md py-2 px-3 text-sm focus:outline-none"
        />
      </div>

      {/* Loading / Error */}
      {loading ? (
        <p className="text-center py-10">Загрузка...</p>
      ) : error ? (
        <div className="p-4 bg-brandlight border border-darkGray rounded text-center">
          <p className="text-sm text-gray-700">{error}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto bg-white rounded-lg shadow-sm">
            <thead className="bg-brand text-white text-sm">
              <tr>
                <th className="px-4 py-2">ID сделки</th>
                <th className="px-4 py-2">Дата</th>
                <th className="px-4 py-2">Покупатель</th>
                <th className="px-4 py-2">Продавец</th>
                <th className="px-4 py-2">Товар</th>
                <th className="px-4 py-2">Статус</th>
                <th className="px-4 py-2">Этап</th>
              </tr>
            </thead>
<tbody className="text-sm divide-y">
  {displayList.length > 0 ? (
    displayList.map(order => (
      <tr
        key={order.id}
        className="hover:bg-gray-100 cursor-pointer"
        onClick={() => navigate(`/moderator/orders/${order.id}`)}
      >
        <td className="px-4 py-2">{order.transaction_code}</td>
        <td className="px-4 py-2">
          {new Date(order.created_at).toLocaleString()}
        </td>
        {/* Покупатель */}
        <td className="px-4 py-2">
          <button
            onClick={e => {
              e.stopPropagation();                         // отменяем клик по строке
              navigate(`/moderator/users/${order.user.id}`); // переходим в профиль покупателя
            }}
            className="text-blue-500 hover:underline"
          >
            {order.user.nickname}
          </button>
        </td>
        {/* Продавец */}
        <td className="px-4 py-2">
          <button
            onClick={e => {
              e.stopPropagation();                         // отменяем клик по строке
              navigate(`/moderator/users/${order.seller.id}`); // переходим в профиль продавца
            }}
            className="text-blue-500 hover:underline"
          >
            {order.seller.nickname}
          </button>
        </td>
        <td className="px-4 py-2">{order.product.name}</td>
        <td className="px-4 py-2">{getStatusLabel(order.status)}</td>
        <td className="px-4 py-2">{order.step}</td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan={7} className="text-center py-6 text-gray-500">
        Сделки не найдены
      </td>
    </tr>
  )}
</tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ModeratorOrdersPage;

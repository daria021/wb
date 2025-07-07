import React, {useEffect, useState} from 'react';
import {useUser} from '../contexts/user';
import {useLocation} from "react-router-dom";
import {ProductStatus} from "../enums";
import {getProductsBySellerId} from "../services/api";

function SellerBalancePage() {
  const {user, loading: userLoading, refresh} = useUser();
  const location = useLocation();
  const [products, setProducts] = useState<{ status: ProductStatus; remaining_products: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1) Загрузка данных при заходе на страницу
  useEffect(() => {
    if (location.pathname === '/seller-cabinet/balance') {
      fetchData();
    }
  }, [location.pathname]);

  // 2) При возврате в фокус
  useEffect(() => {
    const onFocus = () => {
      if (location.pathname === '/seller-cabinet/balance') {
        fetchData();
      }
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [location.pathname]);

  // 3) Функция загрузки
  const fetchData = async () => {
    setLoading(true);
    try {
      await refresh(); // обновляем user.free_balance и user.unpaid_plan
      const res = await getProductsBySellerId();
      setProducts(res.data.products);
      setError('');
    } catch (e) {
      console.error(e);
      setError('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  };

  // 4) Считаем сумму НЕ ОПЛАЧЕННЫХ раздач
  const notPaidSum = products
    .filter(p => p.status === ProductStatus.NOT_PAID)
    .reduce((sum, p) => sum + p.remaining_products, 0);

  if (userLoading || loading) {
    return (
      <div className="p-4 flex justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-gray-600 always-spin" />
      </div>
    );
  }
  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }
  if (!user) {
    return <div className="p-4 text-red-600">Не авторизован</div>;
  }

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col gap-4 p-4">
      <div className="bg-white border border-darkGray rounded-md p-4 relative">
        {notPaidSum > 0 ? (
          <>
            <p>Доступно и не оплачено</p>
            <p className="text-2xl font-bold">{user.unpaid_plan} раздач</p>
            <hr className="my-2"/>
            <p>Баланс</p>
            <p className="text-2xl font-bold">{user.free_balance} раздач</p>
          </>
        ) : (
          <>
            <p>В каталоге доступно</p>
            <p className="text-2xl font-bold">{user.reserved_active} раздач</p>
            <hr className="my-2"/>
            <p>Баланс</p>
            <p className="text-2xl font-bold">{user.free_balance} раздач</p>
          </>
        )}
      </div>

      <p className="text-center text-gray-700">
        Чтобы пополнить кабинет, свяжитесь с администратором.
      </p>
      <button
        onClick={() => {
          if (window.Telegram?.WebApp?.close) window.Telegram.WebApp.close();
          window.open(process.env.REACT_APP_SUPPORT_URL, '_blank');
        }}
        className="p-2 rounded-lg text-white font-semibold bg-brand hover:bg-brand-dark mx-auto"
      >
        Написать администратору
      </button>
    </div>
  );
}

export default SellerBalancePage;

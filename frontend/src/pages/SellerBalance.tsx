import React, {useEffect, useState} from 'react';
import {useUser} from '../contexts/user';
import {useLocation} from "react-router-dom";
import {ProductStatus} from "../enums";
import {getProductsBySellerId} from "../services/api";

import { getUserBalanceHistory } from '../services/api';

type BalanceEvent = {
  sum: number;
  created_at: string; // ISO
};


function SellerBalancePage() {
  const {user, loading: userLoading, refresh} = useUser();
  const location = useLocation();
  const [products, setProducts] = useState<{ status: ProductStatus; remaining_products: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<BalanceEvent[]>([]);
const [historyLoading, setHistoryLoading] = useState(true);
const [historyError, setHistoryError] = useState('');
const [showHistory, setShowHistory] = useState(false); // по умолчанию свернуто
  const panelRef = React.useRef<HTMLDivElement>(null);
const [maxH, setMaxH] = useState<'0px' | string>('0px');


const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

type Row = {
  date: string;
  opText: 'Пополнение' | 'Списание';
  qty: number;        // абсолютное значение операции
  balance: number;    // остаток после операции
};

const rows: Row[] = (() => {
  let acc = 0;
  return history.map(h => {
    acc += h.sum;
    return {
      date: fmtDate(h.created_at),
      opText: h.sum >= 0 ? 'Пополнение' : 'Списание',
      qty: Math.abs(h.sum),
      balance: acc,
    };
  });
})();


useEffect(() => {
  if (!user?.id) return;
  (async () => {
    try {
      setHistoryLoading(true);
      const res = await getUserBalanceHistory(user.id);
      // на всякий: сортируем по дате по возрастанию
      const data: BalanceEvent[] = (res.data ?? []).slice().sort(
        (a: BalanceEvent, b: BalanceEvent) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      setHistory(data);
      setHistoryError('');
    } catch (e) {
      console.error(e);
      setHistoryError('Не удалось загрузить историю операций');
    } finally {
      setHistoryLoading(false);
    }
  })();
}, [user?.id]);

useEffect(() => {
  const el = panelRef.current;
  if (!el) return;
  if (showHistory) {
    // дать браузеру кадр на раскладку, потом взять точную высоту
    requestAnimationFrame(() => {
      setMaxH(`${el.scrollHeight}px`);
    });
  } else {
    setMaxH('0px');
  }
}, [showHistory, historyLoading, rows.length]);



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
                  <h1 className="relative text-2xl font-medium mb-2 text-center">
                    <strong>Пополнение баланса раздач</strong>
                </h1>
      <p className="text-center text-gray-700">
        Для внесения средств на счёт раздач по выкупам товаров обратитесь к администратору
      </p>
      <div className="bg-white border border-darkGray rounded-md p-4 relative">
          <>
            <p>Остаток баланса раздач</p>
            <p className="text-2xl font-bold">{user.free_balance} раздач</p>
            <hr className="my-2"/>
            <p>Активные раздачи</p>
            <p className="text-2xl font-bold">{user.reserved_active} раздач</p>
                        <hr className="my-2"/>
             <p>Требуется оплата раздач </p>
            <p className="text-2xl font-bold">{user.unpaid_plan} раздач</p>

          </>

      </div>

{/* История операций (collapsible) */}
<div className="bg-white border border-darkGray rounded-md">
  {/* header */}
  <button
    type="button"
    onClick={() => setShowHistory(v => !v)}
    className="w-full flex items-center justify-between px-4 py-3"
    aria-expanded={showHistory}
    aria-controls="history-panel"
  >
    <div className="flex items-baseline gap-2">
      <h2 className="text-lg font-semibold">История операций</h2>
      {rows.length > 0 && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
          {rows.length}
        </span>
      )}
    </div>

    {/* chevron */}
    <svg
      className={`h-5 w-5 transform transition-transform ${showHistory ? 'rotate-180' : 'rotate-0'}`}
      viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
    >
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.24 4.38a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  </button>

  {/* body */}
  <div
  id="history-panel"
  ref={panelRef}
  style={{ maxHeight: maxH }}
  className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${showHistory ? 'opacity-100' : 'opacity-0'}`}
>
    <div className="px-4 pb-3">
      {historyLoading ? (
        <div className="flex justify-center py-4">
          <div className="h-6 w-6 rounded-full border-4 border-gray-300 border-t-gray-600 always-spin" />
        </div>
      ) : historyError ? (
        <p className="text-red-600">{historyError}</p>
      ) : rows.length === 0 ? (
        <p className="text-gray-500">Пока нет операций</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.slice().reverse().map((r, i) => (
<li key={i} className="rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2">
  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
    {/* Дата — слева */}
    <div className="text-sm text-gray-800 font-medium">{r.date}</div>

    {/* Операция — тянется в центр, не переносится */}
    <div className={`ml-auto text-sm font-semibold whitespace-nowrap ${
      r.opText === 'Пополнение' ? 'text-green-700' : 'text-red-700'
    }`}>
      {r.opText}
    </div>

    {/* Второй ряд: Кол‑во и Остаток (без переносов) */}
    <div className="w-full sm:w-auto flex items-center gap-x-3 sm:ml-0">
      <span className="text-sm text-gray-700 whitespace-nowrap">
        {/* Кол‑во с неразрывным дефисом и пробелом */}
        {'Кол\u2011во:'}{'\u00A0'}
        <span className="font-semibold">{r.qty}</span>
      </span>

      {/* разделитель только на широких экранах */}
      <span className="hidden sm:inline text-gray-300">•</span>

      <span className="text-sm text-gray-700 whitespace-nowrap">
        {'Остаток:'}{'\u00A0'}
        <span className="font-extrabold tracking-tight">{r.balance}</span>
      </span>
    </div>
  </div>
</li>

          ))}
        </ul>
      )}
    </div>
  </div>
</div>


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

import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {
    banUser,
    demoteUser,
    getProductsBySellerId,
    getUser,
    getUserOrders,
    increaseReferralBonus,
    increaseSellerBalance,
    promoteUser,
    unbanUser,
    /** Переименовали импорт, чтобы не начинать с "use" */
        useDiscount as apiUseDiscount
} from '../../services/api';
import {OrderStatus, ProductStatus, UserRole} from '../../enums';

interface User {
    id: string;
    telegram_id: number;
    nickname: string;
    role: UserRole;
    is_banned: boolean;
    is_seller: boolean;
    balance: number;
    invited_by: string | null;
    has_discount: boolean;
    referrer_bonus: number;
    inviter: { id: string; nickname: string };
}

interface Order {
    id: string;
    transaction_code: string;
    product: { id: string; name: string; image_path?: string };
    user: { nickname: string };
    seller: { id: string; nickname: string };
    status: OrderStatus;
    step: number;
    created_at: string;
    search_screenshot_path?: string;
    cart_screenshot_path?: string;
    final_cart_screenshot_path?: string;
    delivery_screenshot_path?: string;
    barcodes_screenshot_path?: string;
    review_screenshot_path?: string;
    receipt_screenshot_path?: string;
    card_number?: string;
    phone_number?: string;
    name?: string;
    bank?: string;
    receipt_number?: string;
}

interface Product {
    id: string;
    name: string;
    article: string;
    price: number;
    remaining_products: number;
    status: ProductStatus;
    image_path?: string;
    general_repurchases: number;
    wb_price: number;
    category: string;
    brand: string;
}

export default function ModeratorUserDetailPage() {
    const {userId} = useParams<{ userId: string }>();
    const navigate = useNavigate();

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [ordersFilter, setOrdersFilter] = useState(''); // для поиска по коду

    const [products, setProducts] = useState<Product[]>([]);
    const [productsLoading, setProductsLoading] = useState(true);

    const [balanceInput, setBalanceInput] = useState('');
    const [bonusInput, setBonusInput] = useState('');
const totalPlan = products
  .filter(p =>
    p.status === ProductStatus.ACTIVE ||
    p.status === ProductStatus.NOT_PAID
  )
  .reduce((sum, p) => sum + p.general_repurchases, 0);
const availableInCatalog = products
  .filter(p => p.status === ProductStatus.ACTIVE)
  .reduce((sum, p) => sum + p.general_repurchases, 0);

const unpaidDistributions = products
  .filter(p => p.status === ProductStatus.NOT_PAID)
  .reduce((sum, p) => sum + p.general_repurchases, 0);

    // подсчёт завершённых/начатых покупок
    const completedCount = orders.filter(o => o.status === OrderStatus.CASHBACK_PAID).length;

    // управление скриншотами
    const [screenshotsVisible, setScreenshotsVisible] = useState<Record<string, boolean>>({});
    const toggleScreenshots = (orderId: string) => {
        setScreenshotsVisible(prev => ({
            ...prev,
            [orderId]: !prev[orderId]
        }));
    };

    const [purchaseFilter, setPurchaseFilter] = useState<'all' | 'completed' | 'started'>('all');

// отсортировать по дате создания (свежие первыми)
    const sortedOrders = [...orders].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

// затем применить фильтр completed/started
    const afterStatusFilter = sortedOrders.filter(o => {
        if (purchaseFilter === 'completed') return o.status === OrderStatus.CASHBACK_PAID;
        if (purchaseFilter === 'started') return o.status !== OrderStatus.CASHBACK_PAID;
        return true;
    });

// и только потом — поиск по коду
    const filteredOrders = afterStatusFilter.filter(o =>
        ordersFilter ? o.transaction_code.includes(ordersFilter) : true
    );

    // Загрузка профиля
    useEffect(() => {
        if (!userId) return;
        getUser(userId)
            .then(res => setUser(res.data))
            .finally(() => setLoading(false));
    }, [userId]);

    // Загрузка заказов пользователя
    useEffect(() => {
        setOrdersLoading(true);
        getUserOrders()
            .then(res => setOrders(res.data))
            .catch(console.error)
            .finally(() => setOrdersLoading(false));
    }, [userId]);

    // Загрузка товаров продавца
    useEffect(() => {
        if (!user?.is_seller) {
            setProducts([]);
            setProductsLoading(false);
            return;
        }
        setProductsLoading(true);
        getProductsBySellerId()
            .then(res => setProducts(res.data.products || res.data))
            .catch(console.error)
            .finally(() => setProductsLoading(false));
    }, [user]);

    if (loading || !user) return <div className="p-4">Загрузка...</div>;

    const toggleBan = async () => {
        try {
            if (user.is_banned) await unbanUser(user.id);
            else await banUser(user.id);
            setUser(u => u && {...u, is_banned: !u.is_banned});
        } catch (e) {
            console.error(e);
        }
    };

    const toggleRole = async () => {
        try {
            if (user.role === UserRole.MODERATOR) {
                await demoteUser(user.id);
                setUser(u => u && {...u, role: UserRole.USER});
            } else {
                await promoteUser(user.id);
                setUser(u => u && {...u, role: UserRole.MODERATOR});
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Изменение баланса на delta
    const changeBalance = async (delta: number) => {
        const fd = new FormData();
        fd.append('balance', delta.toString());
        await increaseSellerBalance(user.id, fd);
        setUser(u => u && {...u, balance: u.balance + delta});
    };
    const clearBalance = async () => {
        if (user.balance > 0) {
            await changeBalance(-user.balance);
        }
    };

    // Изменение реферального бонуса на delta
    const changeBonus = async (delta: number) => {
        await increaseReferralBonus(user.id, {bonus: delta});
        setUser(u => u && {...u, referrer_bonus: u.referrer_bonus + delta});
    };
    const clearBonus = async () => {
        if (user.referrer_bonus > 0) {
            await changeBonus(-user.referrer_bonus);
        }
    };

    // Отметить использование скидки
    const handleDiscountUsed = async () => {
        try {
            await apiUseDiscount(user.id);
            setUser(u => u && {...u, has_discount: false});
            alert('Скидка отмечена использованной!');
        } catch (e) {
            console.error(e);
            alert('Не удалось отметить использование скидки');
        }
    };

    const getStatusLabel = (s: OrderStatus) =>
        ({
            [OrderStatus.CASHBACK_NOT_PAID]: 'Кешбэк не выплачен',
            [OrderStatus.PAYMENT_CONFIRMED]: 'Оплата подтверждена',
            [OrderStatus.CASHBACK_PAID]: 'Кешбэк выплачен',
            [OrderStatus.CANCELLED]: 'Отменён',
        }[s] || s);

    const screenshotLabels: Record<string,string> = {
  search_screenshot_path: 'Поиск',
  cart_screenshot_path:   'Корзина',
  final_cart_screenshot_path: 'Итоговая корзина',
  delivery_screenshot_path:    'Доставка',
  barcodes_screenshot_path:    'Штрихкоды',
  review_screenshot_path:      'Отзыв',
  receipt_screenshot_path:     'Чек',
  card_number:                 'Номер карты',
  phone_number:                'Телефон',
  name:                        'Имя',
  bank:                        'Банк',
  receipt_number:              'Номер чека',
};


    return (
        <div className="p-4 bg-gray-100 min-h-screen space-y-6">
            <h1 className="text-2xl font-bold text-center text-brand">
                Профиль пользователя
            </h1>

            {/* Профиль */}
            <div className="bg-white rounded shadow p-4 space-y-2">
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Telegram ID:</strong> {user.telegram_id}</p>
                <p><strong>Никнейм:</strong> {user.nickname}</p>
                <p><strong>Роль:</strong> {user.role}</p>
                <p><strong>Забанен:</strong> {user.is_banned ? 'Да' : 'Нет'}</p>
                <p><strong>Продавец:</strong> {user.is_seller ? 'Да' : 'Нет'}</p>
                <p><strong>Баланс:</strong> {user.balance} раздач</p>
                {user.is_seller && (
                    <>
                        <p><strong>Доступно в каталоге:</strong> {availableInCatalog}</p>
                        <p><strong>Не оплачено раздач:</strong> {unpaidDistributions}</p>
                        <p><strong>Общий план раздач:</strong> {totalPlan}</p>
                    </>
                )}
                <p>
                    <strong>Пригласивший:</strong>{' '}
                    {user.inviter?.nickname ? (
                        <button
                            className="text-blue-600 hover:underline"
                            onClick={() =>
                                navigate(`/moderator/users/${user.inviter.id}`)
                            }
                        >
                            {user.inviter.nickname}
                        </button>
                    ) : '—'}
                </p>
                <p><strong>Реф. бонус:</strong> {user.referrer_bonus} руб</p>
                {user.has_discount && (
                    <p className="text-green-600">Есть скидка</p>
                )}
            </div>

            {/* Действия */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button onClick={toggleBan} className="bg-red-500 text-white p-2 rounded">
                    {user.is_banned ? 'Разбанить' : 'Забанить'}
                </button>
                <button onClick={toggleRole} className="bg-yellow-500 text-white p-2 rounded">
                    {user.role === UserRole.MODERATOR ? 'Разжаловать' : 'Назначить модератором'}
                </button>
            </div>


            {/* Баланс продавца */}
            {user.is_seller && (
                <div className="mb-4 p-4 bg-white rounded shadow">
                    <h2 className="text-lg font-bold mb-2 text-brand">Баланс продавца</h2>
                    <div className="flex flex-wrap gap-2 mb-2">
                        <input
                            type="number"
                            placeholder="Сумма"
                            value={balanceInput}
                            onChange={e => setBalanceInput(e.target.value)}
                            className="flex-1 min-w-0 border p-2 rounded"
                        />
                        <button
                            onClick={async () => {
                                const v = parseInt(balanceInput, 10);
                                if (v > 0) {
                                    await changeBalance(v);
                                    setBalanceInput('');
                                }
                            }}
                            className="bg-brand text-white px-3 rounded"
                        >
                            Пополнить
                        </button>
                        <button
                            onClick={async () => {
                                const v = parseInt(balanceInput, 10);
                                if (v > 0) {
                                    await changeBalance(-v);
                                    setBalanceInput('');
                                }
                            }}
                            className="bg-red-500 text-white px-3 rounded"
                        >
                            Списать
                        </button>
                    </div>
                    <button onClick={clearBalance} className="bg-gray-200 text-black w-full rounded p-2">
                        Обнулить баланс
                    </button>
                </div>
            )}

            {/* Реферальный бонус */}
            {user.invited_by && (
                <div className="bg-white rounded shadow p-4 space-y-2">
                    <h2 className="text-lg font-bold text-brand">Реферальный бонус</h2>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="Сумма"
                            value={bonusInput}
                            onChange={e => setBonusInput(e.target.value)}
                            className="flex-1 border p-2 rounded"
                        />
                        <button
                            onClick={async () => {
                                const v = parseInt(bonusInput, 10);
                                if (v > 0) {
                                    await changeBonus(v);
                                    setBonusInput('');
                                }
                            }}
                            className="bg-brand text-white px-3 rounded"
                        >
                            Начислить
                        </button>
                        <button
                            onClick={async () => {
                                const v = parseInt(bonusInput, 10);
                                if (v > 0) {
                                    await changeBonus(-v);
                                    setBonusInput('');
                                }
                            }}
                            className="bg-red-500 text-white px-3 rounded"
                        >
                            Списать
                        </button>
                    </div>
                    <button onClick={clearBonus} className="bg-gray-200 text-black w-full rounded p-2">
                        Обнулить бонус
                    </button>
                    {user.has_discount && (
                        <button onClick={handleDiscountUsed} className="bg-green-100 text-green-700 w-full rounded p-2">
                            Использовал скидку
                        </button>
                    )}
                </div>
            )}

           {/* …до этого был блок «Профиль», «Действия», «Баланс» и т.д.… */}

{/* Покупки пользователя */}
<div className="bg-white rounded-lg shadow p-4 space-y-2">
  <h2 className="text-xl font-bold">Покупки пользователя</h2>
  {/* Фильтры + поиск по коду */}
  <div className="flex gap-2 mb-3">
    <button
      onClick={() => setPurchaseFilter('all')}
      className={purchaseFilter === 'all' ? 'font-bold underline' : ''}
    >Все</button>
    <button
      onClick={() => setPurchaseFilter('completed')}
      className={purchaseFilter === 'completed' ? 'font-bold underline' : ''}
    >Завершённые</button>
    <button
      onClick={() => setPurchaseFilter('started')}
      className={purchaseFilter === 'started' ? 'font-bold underline' : ''}
    >Начатые</button>

  </div>
      <div className="mt-3/4">

<input
  type="text"
  placeholder="Поиск по коду"
  value={ordersFilter}
  maxLength={6}
  onChange={e => setOrdersFilter(e.target.value.slice(0, 6))}
  className="flex-1 border p-2 rounded"
/>

      </div>
  {ordersLoading ? (
    <p>Загрузка заказов…</p>
  ) : filteredOrders.length === 0 ? (
    <p>Нет заказов</p>
  ) : (
    <ul className="space-y-2">
      {filteredOrders.map(o => (
        <li key={o.id} className="border rounded-lg p-3 bg-gray-50">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">{o.transaction_code}</p>
              <p className="text-sm">Товар: {o.product.name}</p>
              <p className="text-sm">Продавец: {o.seller.nickname}</p>
              <p className="text-sm">Текущий шаг: {o.step}</p>
              <p className="text-xs text-gray-600">{getStatusLabel(o.status)}</p>
            </div>
            <button
              onClick={() => toggleScreenshots(o.id)}
              className="text-brand underline text-sm"
            >
              {screenshotsVisible[o.id] ? 'Скрыть скрины' : 'Показать скрины'}
            </button>
          </div>

          {/* Блок скриншотов */}
          {screenshotsVisible[o.id] && (
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-1 gap-2">
              {(Object.entries(o) as Array<[keyof Order, any]>)
                .filter(([key, src]) => screenshotLabels[key as string] && src)
                .map(([key, src]) => (
                  <figure key={key} className="flex flex-col items-center">
                    {/* если путь к файлу */}
                    {key.endsWith('_screenshot_path') ? (
                      <img
                        src={src}
                        alt={screenshotLabels[key as string]}
                        className="w-64 h-64 object-cover rounded border"
                      />
                    ) : (
                      <figcaption className="text-xs text-gray-800 text-center">
                        {screenshotLabels[key as string]}: {src}
                      </figcaption>
                    )}
                    {key.endsWith('_screenshot_path') && (
                      <figcaption className="mt-1 text-xs text-gray-600">
                        {screenshotLabels[key as string]}
                      </figcaption>
                    )}
                  </figure>
                ))}
            </div>
          )}
        </li>
      ))}
    </ul>
  )}
</div>

{/* Блок «Товары продавца» вынесен ЗА пределы списка покупок */}
{user.is_seller && (
  <div className="bg-white rounded-lg shadow p-4 space-y-2">
    <h2 className="text-xl font-bold mb-2">Товары продавца</h2>
    {productsLoading ? (
      <p>Загрузка товаров…</p>
    ) : products.length === 0 ? (
      <p>Нет товаров</p>
    ) : (
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full table-auto">
          <thead className="bg-gray-100 text-sm">
            <tr>
              <th className="px-3 py-2">Название</th>
              <th className="px-3 py-2">Артикул</th>
              <th className="px-3 py-2">Цена WB</th>
              <th className="px-3 py-2">Наша цена</th>
              <th className="px-3 py-2">Категория</th>
              <th className="px-3 py-2">Бренд</th>
              <th className="px-3 py-2">Остаток</th>
              <th className="px-3 py-2">Статус</th>
              <th className="px-3 py-2">Фото</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y">
            {products.map(p => (
              <tr key={p.id}>
                <td className="px-3 py-2">{p.name}</td>
                <td className="px-3 py-2">{p.article}</td>
                <td className="px-3 py-2">{p.wb_price}</td>
                <td className="px-3 py-2">{p.price}</td>
                <td className="px-3 py-2">{p.category}</td>
                <td className="px-3 py-2">{p.brand}</td>
                <td className="px-3 py-2">{p.remaining_products}</td>
                <td className="px-3 py-2">{p.status}</td>
                <td className="px-3 py-2">
                  {p.image_path && <img src={p.image_path} className="w-16 h-auto rounded" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
)}
  </div>
    )}

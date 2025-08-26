import React, {useEffect, useState} from 'react';
import {getProductsToReview} from '../../services/api';
import {useNavigate} from 'react-router-dom';
import {on} from "@telegram-apps/sdk";
import {ProductStatus} from "../../enums";

interface ModeratorReview {
    id: string;
    moderator_id: string;
    product_id: string;
    comment_to_seller?: string;
    comment_to_moderator?: string;
    status_before: ProductStatus;
    status_after: ProductStatus;
    created_at: string;
    updated_at: string;
}

interface Product {
    id: string;
    name: string;
    price: number;
    status: ProductStatus;
    moderator_reviews?: ModeratorReview[];
    created_at?: string;
    updated_at?: string;
}

function ModeratorProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'pending' | 'reviewed'>('pending');
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState<
    | 'все'
    | 'активные'
    | 'созданные'
    | 'необходимо отредактировать'
    | 'отклонённые'
    | 'архивные'
    | 'не оплаченные'
  >('все');

    // useEffect(() => {
    //   const unsub = on('back_button_pressed', () => {
    //     navigate(`/moderator`, { replace: true });
    //   });
    //   return unsub;
    // }, [navigate]);

    const getLastReviewedTs = (p: Product) => {
  const reviewDates = p.moderator_reviews?.map(r => r.updated_at || r.created_at).filter(Boolean) ?? [];
  const maxReviewTs = reviewDates.length ? Math.max(...reviewDates.map(d => new Date(d!).getTime())) : 0;
  const fallbackTs = p.updated_at ? new Date(p.updated_at).getTime() :
                     p.created_at ? new Date(p.created_at).getTime() : 0;
  return Math.max(maxReviewTs, fallbackTs);
};

    const pendingProducts   = products.filter(p => p.status === ProductStatus.CREATED);

// reviewed — сначала фильтруем, затем сортируем по последней проверке (свежие сверху)
const reviewedProductsRaw = products.filter(
  p =>
    p.status === ProductStatus.ACTIVE   ||
    p.status === ProductStatus.DISABLED ||
    p.status === ProductStatus.REJECTED ||
    p.status === ProductStatus.ARCHIVED ||
    p.status === ProductStatus.NOT_PAID
);
// важное: создаём копию перед sort, чтобы не портить исходный массив
const reviewedProducts = [...reviewedProductsRaw].sort(
  (a, b) => getLastReviewedTs(b) - getLastReviewedTs(a)
);

const filterByStatus = (list: Product[]) => {
  switch (statusFilter) {
    case 'все':                    return list;
    case 'созданные':              return list.filter(p => p.status === ProductStatus.CREATED);
    case 'активные':               return list.filter(p => p.status === ProductStatus.ACTIVE);
    case 'необходимо отредактировать': return list.filter(p => p.status === ProductStatus.DISABLED);
    case 'отклонённые':            return list.filter(p => p.status === ProductStatus.REJECTED);
    case 'архивные':               return list.filter(p => p.status === ProductStatus.ARCHIVED);
    case 'не оплаченные':          return list.filter(p => p.status === ProductStatus.NOT_PAID);
    default:                       return list;
  }
};

const filteredPending  = filterByStatus(pendingProducts);
const filteredReviewed = filterByStatus(reviewedProducts);


    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await getProductsToReview();
            setProducts(response.data);
            console.log(response.data);
        } catch (error) {
            console.error('Ошибка при получении продуктов:', error);
            setError('Не удалось загрузить продукты.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleReview = (productId: string) => { navigate(`/moderator/products/${productId}`); };


    return (
        <div className="min-h-screen bg-gray-200 p-6">
            <h1 className="text-2xl font-bold mb-6 text-center">Товары для проверки</h1>
            <div className="mb-4">

                            <div className="relative mx-auto w-60">
      <select
        value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as any)}
              className="h-10 w-60 pl-3 pr-10 rounded-md border border-gray-300 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand appearance-none"
        aria-label="Фильтр по статусу"
      >
        <option value="все">Все статусы</option>
          <option value="активные">Активные</option>
          <option value="созданные">Созданные</option>
          <option value="необходимо отредактировать">Необходимо отредактировать</option>
          <option value="отклонённые">Отклонённые</option>
          <option value="архивные">Архивные</option>
          <option value="не оплаченные">Не оплаченные</option>
        ))
      </select>

      {/* Стрелка (иконка) */}
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
        <svg
          className="h-4 w-4 text-brand"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M5.25 7.5l4.5 4.5 4.5-4.5h-9z" />
        </svg>
      </div>
    </div>
            </div>

            <div className="flex border-b border-darkGray mb-6">
                <button
                    className={`px-4 py-2 font-semibold ${activeTab === 'pending'
                        ? 'border-b-2 border-blue-500 text-blue-500'
                        : 'text-gray-500 hover:text-blue-500'
                    }`}
                    onClick={() => setActiveTab('pending')}
                >
                    Заявки для проверки
                </button>
                <button
                    className={`px-4 py-2 font-semibold ${activeTab === 'reviewed'
                        ? 'border-b-2 border-blue-500 text-blue-500'
                        : 'text-gray-500 hover:text-blue-500'
                    }`}
                    onClick={() => setActiveTab('reviewed')}
                >
                    Проверенные заявки
                </button>
            </div>

            {loading ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-gray-600 always-spin"/>
            </div>
            ) : error ? (
                <div className="p-4 bg-brandlight border border-darkGray rounded text-center">
                    <p className="text-sm text-gray-700">{error}</p>
                </div>
            ) : (
                <>
                    {activeTab === 'pending' && (
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">Заявки для проверки</h2>
                            {filteredPending.length === 0 ? (
                                <p className="text-center text-sm text-gray-500">Нет заявок для проверки</p>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {filteredPending.map(product => (
                                        <div
                                            key={product.id}
                                            onClick={() => handleReview(product.id)}
                                            className="relative border border-gray-200 rounded-md p-3 hover:shadow transition-shadow duration-300 cursor-pointer bg-white"
                                        >
                                            {product.moderator_reviews?.some(review => review.comment_to_moderator) && (
                                                <img
                                                    src="/icons/flag.png"
                                                    alt="Комментарий"
                                                    className="absolute top-2 right-2 w-6 h-6"
                                                />
                                            )}
                                            <h3 className="text-md font-semibold">{product.name}</h3>
                                            <p className="text-sm text-gray-600">
                                                Цена: {product.price} ₽
                                            </p>
                                                                  <p className="text-xs text-gray-400">
                        Статус: {' '}
                        {product.status === ProductStatus.ACTIVE
                          ? 'Активные'
                          : product.status === ProductStatus.REJECTED
                            ? 'Отклонённые'
                            : product.status === ProductStatus.ARCHIVED
                              ? 'Архивные'
                              : product.status === ProductStatus.CREATED
                                ? 'Созданные'
                                : product.status === ProductStatus.DISABLED
                                  ? 'Необходимо отредактировать'
                                  : product.status === ProductStatus.NOT_PAID
                                    ? 'Не оплаченные'
                                    : product.status}
                      </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === 'reviewed' && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Проверенные заявки</h2>
                            {filteredReviewed.length === 0 ? (
                                <p className="text-center text-sm text-gray-500">Нет проверенных заявок</p>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {filteredReviewed.map(product => (
                                        <div
                                            key={product.id}
                                            onClick={() => handleReview(product.id)}
                                            className={`
    relative border border-gray-200 rounded-md p-3
    hover:shadow transition-shadow duration-300 cursor-pointer
    ${
                                                product.status === ProductStatus.ACTIVE
                          ? 'bg-green-100'
                          : product.status === ProductStatus.ARCHIVED
                            ? 'bg-gray-300 text-black border-dashed'
                            : product.status === ProductStatus.REJECTED
                              ? 'bg-red-100 text-red-800'
                              : product.status === ProductStatus.CREATED
                                ? 'bg-white text-black'
                                : product.status === ProductStatus.DISABLED
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : product.status === ProductStatus.NOT_PAID
                                    ? 'bg-orange-100 text-orange-800'
                                    : 'bg-white'
                                            }
  `}
                                        >
                                            {product.moderator_reviews?.some(review => review.comment_to_moderator) && (
                                                <img
                                                    src="/icons/flag.png"
                                                    alt="Комментарий"
                                                    className="absolute top-2 right-2 w-6 h-6"
                                                />
                                            )}
                                            <h3 className="text-md font-semibold">{product.name}</h3>
                                            <p className="text-sm">
                                                Цена: {product.price} ₽
                                            </p>
                                            <p className="text-xs">
                                                Статус:{' '}
                                                {product.status === ProductStatus.ACTIVE
                          ? 'Активные'
                          : product.status === ProductStatus.REJECTED
                            ? 'Отклонённые'
                            : product.status === ProductStatus.ARCHIVED
                              ? 'Архивные'
                              : product.status === ProductStatus.CREATED
                                ? 'Созданные'
                                : product.status === ProductStatus.DISABLED
                                  ? 'Необходимо отредактировать'
                                  : product.status === ProductStatus.NOT_PAID
                                    ? 'Не оплаченные'
                                    : product.status}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            <div
                onClick={() => {
                    if (window.Telegram?.WebApp?.close) {
                        window.Telegram.WebApp.close();
                    }
                    window.open(process.env.REACT_APP_SUPPORT_URL, '_blank');
                }}
                className="bg-white border border-brand rounded-xl shadow-sm p-4 mt-4 text-sm font-semibold cursor-pointer flex items-center gap-3"
            >
                <img src="/icons/support.png" alt="Support" className="w-7 h-7"/>
                <div className="flex flex-col">
                    <span>Техподдержка</span>
                    <span className="text-xs text-gray-500">
                        Оперативно ответим на все вопросы
                    </span>
                </div>
                <img
                    src="/icons/small_arrow.png"
                    alt="arrow"
                    className="w-5 h-5 ml-auto"
                />
            </div>
        </div>
    );
}

export default ModeratorProductsPage;

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
}

function ModeratorProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'created' | 'rejected' | 'archived'>('all');
    const [activeTab, setActiveTab] = useState<'pending' | 'reviewed'>('pending');
    const navigate = useNavigate();

    useEffect(() => {
        const removeBackListener = on('back_button_pressed', () => {
            navigate('/moderator');
        });
        return () => {
            removeBackListener();
        };
    }, [navigate]);

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

    const pendingProducts = products.filter(product =>
        product.status.toLowerCase() === ProductStatus.CREATED.toLowerCase() ||
        product.status.toLowerCase() === ProductStatus.DISABLED.toLowerCase()
    );
    const reviewedProducts = products.filter(product =>
        product.status.toLowerCase() === ProductStatus.ACTIVE.toLowerCase() ||
        product.status.toLowerCase() === ProductStatus.REJECTED.toLowerCase() ||
        product.status.toLowerCase() === ProductStatus.ARCHIVED.toLowerCase()
    );

    const filterByStatus = (list: Product[]) => {
        if (statusFilter === 'all') {
            return list;
        }
        if (statusFilter === 'created') {
            return list.filter(product =>
                product.status.toLowerCase() === ProductStatus.CREATED.toLowerCase() ||
                product.status.toLowerCase() === ProductStatus.DISABLED.toLowerCase()
            );
        }
        return list.filter(product =>
            product.status.toLowerCase() === statusFilter.toLowerCase()
        );
    };

    const filteredPending = filterByStatus(pendingProducts);
    const filteredReviewed = filterByStatus(reviewedProducts);

    const handleReview = (productId: string) => {
        navigate(`/moderator/products/${productId}`);
    };

    return (
        <div className="min-h-screen bg-gradient-t-gray p-6">
            <h1 className="text-2xl font-bold mb-6 text-center">Товары для проверки</h1>
            <div className="mb-4 flex justify-end">
                <select
                    value={statusFilter}
                    onChange={(e) =>
                        setStatusFilter(e.target.value as 'all' | 'active' | 'created' | 'rejected' | 'archived')
                    }
                    className="border border-gradient-tr-darkGray rounded-md py-2 px-3 text-sm focus:outline-none"
                >
                    <option value="all">Все статусы</option>
                    <option value="active">Активный</option>
                    <option value="created">Создано / Отключено</option>
                    <option value="rejected">Отклонено</option>
                    <option value="archived">Архив</option>
                </select>
            </div>

            <div className="flex border-b border-gradient-tr-darkGray mb-6">
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
                <p className="text-center">Загрузка...</p>
            ) : error ? (
                <div className="p-4 bg-gradient-r-brandlight border border-gradient-tr-darkGray rounded text-center">
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
                                            className="relative border border-gradient-b-gray rounded-md p-3 hover:shadow transition-shadow duration-300 cursor-pointer bg-gradient-tr-white"
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
                                                Статус:{' '}
                                                {product.status === ProductStatus.ACTIVE
                                                    ? 'Активный'
                                                    : product.status === ProductStatus.REJECTED
                                                        ? 'Отклонено'
                                                        : product.status === ProductStatus.ARCHIVED
                                                            ? 'Архив'
                                                            : product.status === ProductStatus.CREATED ||
                                                            product.status === ProductStatus.DISABLED
                                                                ? 'Создано / Отключено'
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
                                            className={`relative border border-gradient-b-gray rounded-md p-3 hover:shadow transition-shadow duration-300 cursor-pointer ${
                                                product.status.toLowerCase() === 'archived'
                                                    ? 'border-gradient-tr-darkGray text-black border-dashed'
                                                    : 'bg-gradient-tr-white'
                                            }`}
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
                                                    ? 'Активный'
                                                    : product.status === ProductStatus.REJECTED
                                                        ? 'Отклонено'
                                                        : product.status === ProductStatus.ARCHIVED
                                                            ? 'Архив'
                                                            : product.status === ProductStatus.CREATED ||
                                                            product.status === ProductStatus.DISABLED
                                                                ? 'Создано / Отключено'
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
                className="bg-gradient-tr-white border border-gradient-r-brand rounded-xl shadow-sm p-4 mt-4 text-sm font-semibold cursor-pointer flex items-center gap-3"
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

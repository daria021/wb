import React, {FormEvent, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {getProductById, updateProductStatus} from '../services/api';
import {Category, PayoutTime, ProductStatus} from '../enums';
import GetUploadLink from "../components/GetUploadLink";
import {useUser} from '../contexts/user';


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
    article: string;
    status: ProductStatus;
    brand: string;
    category: Category;
    key_word: string;
    general_repurchases: number;
    // daily_repurchases: number;
    price: number;
    wb_price: number;
    tg: string;
    payment_time: PayoutTime;
    review_requirements: string;
    image_path?: string;
    last_moderator_review?: ModeratorReview;
}

interface MeResponse {
    id: string;
    telegram_id?: number;
    nickname?: string;
    role: "user" | "client" | "seller" | "moderator" | "admin";
    is_banned: boolean;
    balance?: number;
    created_at: string;
    updated_at: string;
}

function CreateProductInfo() {
    const navigate = useNavigate();
    const {productId} = useParams<{ productId: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const {user, loading: userLoading} = useUser()


    useEffect(() => {
        if (!productId) return;
        getProductById(productId)
            .then((res) => setProduct(res.data))
            .catch((err) => {
                console.error('Ошибка при загрузке товара:', err);
                setError('Не удалось загрузить товар');
            })
            .finally(() => setLoading(false));
    }, [productId]);


    const handleMyBalanceClick = () => {
        navigate(`/seller-cabinet/balance`);
    };
    const handleHomeClick = () => {
        navigate(`/`);
    };

    const handleEditClick = () => {
        if (product) {
            navigate(`/create-product/${product.id}`);
        }
    };

    const handlePublish = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const fd = new FormData();
            fd.append('status', ProductStatus.ACTIVE);
            await updateProductStatus(productId!, fd);
            if (product) {
                setProduct({...product, status: ProductStatus.ACTIVE});
            }
            alert('Товар отправлен на модерацию!');
        } catch (err) {
            console.error('Ошибка при сохранении товара:', err);
            alert('Не удалось сохранить товар');
        }
    };

    const handleStop = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const fd = new FormData();
            fd.append('status', ProductStatus.ARCHIVED);
            await updateProductStatus(productId!, fd);
            if (product) {
                setProduct({...product, status: ProductStatus.ARCHIVED});
            }
            alert('Товар заархивирован');
        } catch (err) {
            console.error('Ошибка при сохранении товара:', err);
            alert('Не удалось сохранить товар');
        }
    };

    if (loading) {
        return <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-gray-600 always-spin"/>
            </div>;
    }

    if (error || !product) {
        return <div className="p-4 text-red-600">{error || 'Товар не найден'}</div>;
    }

    const getReviewComment = (review: ModeratorReview): string | null => {
        return review.comment_to_seller || null;
        // if (currentUser?.role === 'seller') {
        //     return review.comment_to_seller || null;
        // } else if (currentUser?.role === 'moderator' || currentUser?.role === 'admin') {
        //     return review.comment_to_moderator || null;
        // }
        // return review.comment_to_seller || review.comment_to_moderator || null;
    };

    const lastReview = product.last_moderator_review;
    const reviewComment = lastReview ? getReviewComment(lastReview) : null;

    if (userLoading) {
        return <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-gray-600 always-spin"/>
            </div>;
    }
    if (!user) {
        return <div className="p-4 text-red-600">Не авторизован</div>;
    }

    return (
        <div className="p-4 min-h-screen bg-gray-200 mx-auto max-w-lg">
            {(product.status === ProductStatus.CREATED) && (
                <div className="mb-4 p-3 bg-brandlight border-l-4 border-brand text-brand rounded">
                    Новая карточка отправлена на модерацию. Проверьте всю информацию. Вы еще можете внести изменения.
                </div>
            )}
            {(lastReview && reviewComment && product.status === ProductStatus.DISABLED) && (
                <div className="mb-4 p-3 bg-brandlight border-l-4 border-brand text-brand rounded">
                    Модератор оставил комментарий. Исправьте его и отправьте карточку на повторную модерацию.
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-medium">Карточка товара</h1>
                <button onClick={handleEditClick} className="border border-brand text-brand px-2 py-1 text-sm rounded">
                    Редактировать
                </button>
            </div>

            <div className="flex flex-col gap-4 mb-4">
                <div className="w-full max-h-80 bg-gray-200-100 rounded-md overflow-hidden">
                    {product.image_path ? (
                        <img
                            src={
                                product.image_path.startsWith('http')
                                    ? product.image_path
                                    : GetUploadLink(product.image_path)
                            }
                            alt={product.name}
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-48 text-gray-400">
                            Нет фото
                        </div>
                    )}
                </div>

                <div className="bg-white border border-gray-200 rounded-md p-4">
                    <p className="text-lg font-bold mb-1">{product.article}</p>
                    <h3 className="text-xl font-semibold mb-3">{product.name}</h3>

                    <div className="space-y-2">
                        <div>
                            <span className="text-sm text-gray-600">Цена на сайте:</span>{' '}
                            <span className="text-sm font-semibold">{product.wb_price} руб</span>
                        </div>
                        <div>
                            <span className="text-sm text-gray-600">Цена для покупателя:</span>{' '}
                            <span className="text-sm font-semibold">{product.price} руб</span>
                        </div>
                        <div>
                            <span className="text-sm text-gray-600">Кол-во выкупов:</span>{' '}
                            <span className="text-sm font-semibold">{product.general_repurchases} шт</span>
                        </div>
                        {/*<div>*/}
                        {/*    <span className="text-sm text-gray-600">План выкупов на сутки:</span>{' '}*/}
                        {/*    <span className="text-sm font-semibold">{product.daily_repurchases} шт</span>*/}
                        {/*</div>*/}
                    </div>
                </div>
            </div>


            <div className="mb-4">
                {lastReview && reviewComment && (
                    <div key={lastReview.id} className="mb-3 p-4 bg-white border border-gray-200 rounded">
                        <h3 className="text-lg font-semibold">
                            Комментарий модератора:
                        </h3>
                        <p className="text-sm text-gray-800">
                            {reviewComment}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Дата: {new Date(lastReview.created_at).toLocaleDateString()}
                        </p>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-2">
                {product.status === ProductStatus.NOT_PAID && (
                    <button
                        onClick={handleMyBalanceClick}
                        className="flex-1 bg-brand text-white p-2 rounded"
                    >
                        Пополнить кабинет
                    </button>
                )}
                {product.status === ProductStatus.ARCHIVED ? (
                    <button
                        onClick={handlePublish}
                        className="flex-1 border border-brand text-brand p-2 rounded"
                    >
                        Опубликовать
                    </button>
                ) : (
                    <button
                        onClick={handleStop}
                        className="flex-1 border border-brand text-brand p-2 rounded"
                    >
                        Снять с публикации
                    </button>
                )}
                                    <button
                        onClick={handleHomeClick}
                        className="flex-1 border border-brand text-brand p-2 rounded"
                    >
                        На главную
                    </button>
            </div>
        </div>
    );
}

export default CreateProductInfo;

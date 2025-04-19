import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {getModeratorProductById, reviewProduct} from '../../services/api';
import {ProductStatus} from '../../enums';
import {on} from "@telegram-apps/sdk";
import GetUploadLink from "../../components/GetUploadLink";

function ModeratorProductReviewPage() {
    const {productId} = useParams<{ productId: string }>();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [commentModerator, setCommentModerator] = useState('');
    const [commentSeller, setCommentSeller] = useState('');
    const navigate = useNavigate();

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const response = await getModeratorProductById(productId!);
            setProduct(response.data);
            setStatus(response.data.status);
        } catch (error) {
            console.error('Ошибка при получении продукта:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const removeBackListener = on('back_button_pressed', () => {
            navigate('/moderator/products');
        });
        return () => {
            removeBackListener();
        };
    }, [navigate]);

    useEffect(() => {
        fetchProduct();
    }, [productId]);

    const handleSubmit = async () => {
        try {
            const payload = {
                    status,
                    commentModerator,
                    commentSeller
            };
            await reviewProduct(productId!, payload);
            alert('Проверка продукта обновлена!');
            navigate('/moderator/products');
        } catch (error) {
            console.error('Ошибка при обновлении проверки продукта:', error);
        }
    };

    if (loading || !product) return <p>Загрузка...</p>;

    return (
        <div className="min-h-screen bg-gray-200 p-6">
            <h1 className="text-2xl font-bold mb-6 text-center">
                Проверка продукта: {product.name}
            </h1>

            <div className="bg-white shadow rounded p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Информация о продукте</h2>
                {product.image_path && (
                    <img
                        src={GetUploadLink(product.image_path)}
                        alt={product.name}
                        className="w-40 h-40 object-cover mb-6"
                    />
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <p><strong>ID:</strong> {product.id}</p>
                    <p><strong>Название:</strong> {product.name}</p>
                    <p><strong>Бренд:</strong> {product.brand}</p>
                    <p><strong>Артикул:</strong> {product.article}</p>
                    <p><strong>Категория:</strong> {product.category}</p>
                    <p><strong>Ключевое слово:</strong> {product.key_word}</p>
                    <p><strong>Общее количество выкупов:</strong> {product.general_repurchases}</p>
                    <p><strong>Ежедневные выкупы:</strong> {product.daily_repurchases}</p>
                    <p><strong>Цена:</strong> {product.price}</p>
                    <p><strong>Цена WB:</strong> {product.wb_price}</p>
                    <p><strong>Телеграм:</strong> {product.tg}</p>
                    <p><strong>Время оплаты:</strong> {product.payment_time}</p>
                    <p><strong>Требования к отзыву:</strong> {product.review_requirements}</p>
                    <p><strong>ID продавца:</strong> {product.seller_id}</p>
                    <p><strong>Статус:</strong> {product.status}</p>
                    <p><strong>Создано:</strong> {new Date(product.created_at).toLocaleString()}</p>
                    <p><strong>Обновлено:</strong> {new Date(product.updated_at).toLocaleString()}</p>
                </div>
            </div>

            {product.moderator_reviews && product.moderator_reviews.length > 0 && (
                <div className="bg-white shadow rounded p-6 mb-6">
                    <h3 className="text-xl font-bold mb-4">Комментарии модераторов</h3>
                    {product.moderator_reviews.map((review: any) => (
                        <div key={review.id} className="border p-4 mb-4 rounded">
                            {review.comment_to_moderator && (
                                <div className="bg-brandlight p-2 rounded mb-2">
                                    <p>
                                        <strong>Комментарий для модераторов:</strong> {review.comment_to_moderator}
                                    </p>
                                </div>
                            )}
                            {review.comment_to_seller && (
                                <div className="bg-brandlight p-2 rounded mb-2">
                                    <p>
                                        <strong>Комментарий для продавца:</strong> {review.comment_to_seller}
                                    </p>
                                </div>
                            )}
                            <p className="text-xs text-gray-500">
                                Дата: {new Date(review.created_at).toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>
            )}


            <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-lg font-semibold mb-4">Детали проверки</h3>
                <div className="mb-4">
                    <label className="block mb-2">Статус:</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="border p-2 rounded w-full"
                    >
                        {Object.values(ProductStatus).map((value) => (
                            <option key={value} value={value}>
                                {value.charAt(0).toUpperCase() + value.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block mb-2">Комментарий (между модераторами):</label>
                    <textarea
                        value={commentModerator}
                        onChange={(e) => setCommentModerator(e.target.value)}
                        className="border p-2 rounded w-full"
                        rows={3}
                    ></textarea>
                </div>

                <div className="mb-4">
                    <label className="block mb-2">Комментарий для продавца:</label>
                    <textarea
                        value={commentSeller}
                        onChange={(e) => setCommentSeller(e.target.value)}
                        className="border p-2 rounded w-full"
                        rows={3}
                    ></textarea>
                </div>

                <button
                    onClick={handleSubmit}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                >
                    Отправить
                </button>
            </div>¬
        </div>
    );
}

export default ModeratorProductReviewPage;

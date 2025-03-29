import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getModeratorProductById, reviewProduct } from '../../services/api';
import { ProductStatus } from '../../enums';
import { on } from "@telegram-apps/sdk";

function ModeratorProductReviewPage() {
    const { productId } = useParams<{ productId: string }>();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [comment, setComment] = useState('');
    const navigate = useNavigate();

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const response = await getModeratorProductById(productId!);
            setProduct(response.data);
            setStatus(response.data.status);
        } catch (error) {
            console.error('Error fetching product:', error);
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
            // Create a JSON payload instead of FormData
            const payload = {
                status,
                comment
            };
            await reviewProduct(productId!, payload);
            alert('Product review updated!');
            navigate('/moderator/products');
        } catch (error) {
            console.error('Error updating product review:', error);
        }
    };

    if (loading || !product) return <p>Loading...</p>;

    return (
        <div className="min-h-screen bg-gray-200 p-6">
            <h1 className="text-xl font-bold mb-4">
                Review Product: {product.name}
            </h1>

            {/* Full Product Information */}
            <div className="bg-white shadow rounded p-4 mb-6">
                <h2 className="text-lg font-semibold mb-2">Product Information</h2>
                {product.image_path && (
                    <img
                        src={product.image_path}
                        alt={product.name}
                        className="w-32 h-32 object-cover mb-4"
                    />
                )}
                <p><strong>ID:</strong> {product.id}</p>
                <p><strong>Name:</strong> {product.name}</p>
                <p><strong>Brand:</strong> {product.brand}</p>
                <p><strong>Article:</strong> {product.article}</p>
                <p><strong>Category:</strong> {product.category}</p>
                <p><strong>Key Word:</strong> {product.key_word}</p>
                <p><strong>General Repurchases:</strong> {product.general_repurchases}</p>
                <p><strong>Daily Repurchases:</strong> {product.daily_repurchases}</p>
                <p><strong>Price:</strong> ${product.price}</p>
                <p><strong>WB Price:</strong> ${product.wb_price}</p>
                <p><strong>Telegram:</strong> {product.tg}</p>
                <p><strong>Payment Time:</strong> {product.payment_time}</p>
                <p><strong>Review Requirements:</strong> {product.review_requirements}</p>
                <p><strong>Seller ID:</strong> {product.seller_id}</p>
                <p><strong>Status:</strong> {product.status}</p>
                <p>
                    <strong>Created At:</strong> {new Date(product.created_at).toLocaleString()}
                </p>
                <p>
                    <strong>Updated At:</strong> {new Date(product.updated_at).toLocaleString()}
                </p>
            </div>

            {/* Visually indented review posting block */}
            <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-lg font-semibold mb-2">Review Details</h3>
                <div className="mb-4">
                    <label className="block mb-2">Status:</label>
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
                    <label className="block mb-2">Comment:</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="border p-2 rounded w-full"
                        rows={4}
                    ></textarea>
                </div>
                <button
                    onClick={handleSubmit}
                    className="bg-blue-500 text-white px-4 py-2"
                >
                    Submit Review
                </button>
            </div>
        </div>
    );
}

export default ModeratorProductReviewPage;

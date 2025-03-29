import React, { useEffect, useState } from 'react';
import { getProductsToReview } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { on } from "@telegram-apps/sdk";

interface Product {
    id: string;
    name: string;
    status: string;
}

function ModeratorProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
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
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleReview = (productId: string) => {
        navigate(`/moderator/products/${productId}`);
    };

    return (
        <div className="min-h-screen bg-gray-200 p-6">
            <h1 className="text-xl font-bold mb-4">Products To Review</h1>
            {loading ? <p>Loading...</p> : (
                <table className="min-w-full bg-white">
                    <thead>
                    <tr>
                        <th className="py-2 border">ID</th>
                        <th className="py-2 border">Name</th>
                        <th className="py-2 border">Status</th>
                        <th className="py-2 border">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {products.map(product => (
                        <tr key={product.id}>
                            <td className="border px-4 py-2">{product.id}</td>
                            <td className="border px-4 py-2">{product.name}</td>
                            <td className="border px-4 py-2">{product.status}</td>
                            <td className="border px-4 py-2">
                                <button
                                    onClick={() => handleReview(product.id)}
                                    className="bg-blue-500 text-white px-2 py-1"
                                >
                                    Review
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default ModeratorProductsPage;

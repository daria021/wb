import React, { useEffect, useState } from 'react';
import { getProductsToReview } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { on } from "@telegram-apps/sdk";
import CopyableUuid from "../../components/CopyableUuid";

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
            console.error('Ошибка при получении продуктов:', error);
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
            <h1 className="text-2xl font-bold mb-6 text-center">Продукты для проверки</h1>
            {loading ? (
                <p className="text-center">Загрузка...</p>
            ) : (
                // Контейнер без overflow-x-auto – таблица будет масштабироваться под ширину
                <div className="w-full overflow-hidden">
                    <table className="w-full table-auto divide-y divide-gray-200">
                        <thead className="bg-brand text-white text-center">
                        <tr>
                            <th className="py-2 px-3">ID</th>
                            <th className="py-2 px-3">Название</th>
                            <th className="py-2 px-3">Статус</th>
                            <th className="py-2 px-3">Действия</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-center">
                        {products.map(product => (
                            <tr key={product.id} className="hover:bg-gray-50">
                                <td className="px-1 py-1 text-[5px]">
                                    <CopyableUuid uuid={product.id} />
                                </td>
                                <td className="py-2 px-3">{product.name}</td>
                                <td className="py-2 px-3">{product.status}</td>
                                <td className="py-2 px-3">
                                    <button
                                        onClick={() => handleReview(product.id)}
                                        className="bg-blue-500 text-white px-1 py-1 rounded-full text-xs hover:opacity-90 transition duration-150"
                                    >
                                        Проверить
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default ModeratorProductsPage;

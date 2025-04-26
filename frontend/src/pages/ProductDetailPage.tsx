import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {getProductById} from '../services/api';
import {AxiosResponse} from "axios";
import {on} from "@telegram-apps/sdk";
import GetUploadLink from "../components/GetUploadLink";

interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    article: string;
    image_path?: string;
    wb_price: number;
    payment_time: string;
    shortDescription?: string;
    seller_id: string;
}

function ProductDetailPage() {
    const {productId} = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const navigate = useNavigate();

    const handleOpenInstructionClick = () => {
        if (product) {
            navigate(`/product/${product.id}/instruction`);
        }
    };

    const handleOpenSellerProducts = () => {
        if (!product) return;
        navigate(`/catalog?seller=${product.seller_id}`);
    };

    useEffect(() => {
        const removeBackListener = on('back_button_pressed', () => {
            navigate('/catalog');
        });

        return () => {
            removeBackListener();
        };
    }, [navigate]);

    useEffect(() => {
        if (!productId) return;
        getProductById(productId)
            .then((response: AxiosResponse<Product>) => {
                setProduct(response.data);
            })
            .catch((error: unknown) => {
                console.error('Ошибка загрузки товара:', error);
            });
    }, [productId]);

    if (!product) {
        return <div className="p-4">Загрузка...</div>;
    }

    const discountPercent = product.wb_price
        ? (((product.wb_price - product.price) / product.wb_price) * 100).toFixed(2)
        : '0';

    const getLink = (path: string) => {
        if (path.startsWith('http')) {
            return path;
        }

        let url = GetUploadLink(path)
        console.log(`url for photo is ${url}`)
        return url;
    }

    const savedAmount = product.wb_price - product.price;


    return (
        <div className="p-4 max-w-screen-md bg-gradient-t-gray mx-auto">
            <div className="relative w-full h-64 mb-4 mt-12 rounded-lg overflow-hidden">
                {product.image_path ? (
                    <img
                        src={
                            getLink(product.image_path)
                        }
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-t-gray flex items-center justify-center text-gray-500">
                        Нет фото
                    </div>
                )}
            </div>

            <h1 className="text-2xl font-bold mb-2 text-left">{product.name}</h1>
            {product.shortDescription && (
                <p className="text-gray-600 mb-4 text-center">{product.shortDescription}</p>
            )}

            <div className="bg-gradient-tr-white rounded-lg shadow p-4 mb-4">
                <p className="text-xl font-bold mb-1 text-brand">
                    {product.price} ₽
                </p>
                {product.description && (
                    <p className="text-sm text-gray-700 mb-2">{product.description}</p>
                )}
                {product.article && (
                    <p className="text-xs text-gray-500">Арт. {product.article}</p>
                )}
            </div>

            <div className="flex gap-2 mb-4">
                <button
                    onClick={() => window.open('https://t.me/bigblacklist_bot', '_blank')}
                    className="flex-1 bg-gradient-tr-white text-gray-700 py-2 rounded-lg border border-gradient-r-brand text-center"
                >
                    Проверить продавца
                </button>

                <button
                    onClick={handleOpenInstructionClick}
                    className="flex-1 bg-gradient-r-brand text-white py-2 rounded-lg border  text-center"
                >
                    Открыть инструкцию
                </button>
            </div>

            <div className="bg-gradient-tr-white rounded-lg shadow p-4 mb-4">
                <h2 className="font-semibold mb-2">Условия сделки</h2>
                <p className="text-sm text-gray-700 mb-1">
                    Цена на сайте WB: {product.wb_price} руб
                </p>
                <p className="text-sm text-gray-700 mb-1">
                    Цена для вас: {product.price} руб
                </p>
                <p className="text-sm text-gray-700 mb-1">
                    Скидка: {discountPercent}% <span className="text-gray-600">(сэкономите {savedAmount} ₽)</span>
                </p>
                <p className="text-sm text-gray-700 mb-1">
                    Условия оплаты: {product.payment_time}
                </p>
            </div>

            <button
                onClick={handleOpenSellerProducts}
                className="block w-full bg-gradient-tr-white text-gray-700 py-2 rounded-lg border border-gradient-r-brand text-center"
            >
                Перейти к товарам продавца
            </button>


        </div>
    );
}

export default ProductDetailPage;

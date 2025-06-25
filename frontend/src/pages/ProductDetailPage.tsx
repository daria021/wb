import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {getProductById, getBlackListUser} from '../services/api';
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
    const [sellerNickname, setSellerNickname] = useState('');

    const handleOpenInstructionClick = () => {
        if (product) {
            navigate(`/product/${product.id}/instruction`);
        }
    };

    useEffect(() => {
    if (!product?.seller_id) return;
    getBlackListUser(product.seller_id)
      .then(res => setSellerNickname(res.data.nickname))
      .catch(err => console.error('Ошибка загрузки данных продавца:', err));
  }, [product]);

    const handleOpenSellerProducts = () => {
        if (!product) return;
        navigate(`/catalog?seller=${product.seller_id}`);
    };

    useEffect(() => {
      const unsub = on('back_button_pressed', () => {
        navigate('/catalog', { replace: true });
      });
      return unsub;
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
        <div className="p-4 max-w-screen-md bg-gray-200 mx-auto">
            <div className="relative w-full h-[60vh] overflow-hidden">
                {product.image_path ? (
                    <img
                        src={getLink(product.image_path)}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                        Нет фото
                    </div>
                )}
            </div>


            <h1 className="text-2xl font-bold mb-2 text-left">{product.name}</h1>
            {product.shortDescription && (
                <p className="text-gray-600 mb-4 text-center">{product.shortDescription}</p>
            )}

            <div className="bg-white rounded-lg shadow p-4 mb-4">
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
                    onClick={() => navigate(`/black-list/${sellerNickname}`)}
                    className="flex-1 bg-white text-gray-700 py-2 rounded-lg border border-brand text-center"
                >
                    Проверить продавца
                </button>

                <button
                    onClick={handleOpenInstructionClick}
                    className="flex-1 bg-brand text-white py-2 rounded-lg border  text-center"
                >
                    Выкупить товар
                </button>
            </div>


            <div
                onClick={() =>
                    navigate(`/product/${product.id}/instruction?preview=1`)
                }
                className="flex items-center justify-start mt-2 mb-2 cursor-pointer select-none"
            >
                <img
                    src="/icons/question.png"
                    alt="Question"
                    className="w-7 h-7 mr-2"
                />
                <span className="block text-sm text-gray-600 hover:underline">
                Хотите узнать, как выкупить товар?
              </span>
            </div>


            <div className="bg-white rounded-lg shadow p-4 mb-4">
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
                <p className="text-sm text-gray-700 mb-1">
                    Продавец: {sellerNickname}
                </p>
            </div>

            <button
                onClick={handleOpenSellerProducts}
                className="block w-full bg-white text-gray-700 py-2 rounded-lg border border-brand text-center"
            >
                Перейти к товарам продавца
            </button>


        </div>
    );
}

export default ProductDetailPage;

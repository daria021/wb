import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductById, getBlackListUser, getSellerReviewSummary } from '../services/api';
import SellerReviewsModal from '../components/SellerReviewsModal';
import { AxiosResponse } from 'axios';
import GetUploadLink from '../components/GetUploadLink';

interface Product {
  id: string;
  name: string;
  shortDescription?: string;
  description?: string;
  image_path?: string;
  wb_price: number;
  price: number;
  tg: string;
  payment_time: string;
  seller_id: string;
  remaining_products?: number;
  always_show?: boolean;
}

const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [sellerNickname, setSellerNickname] = useState<string>('');
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [reviewsCount, setReviewsCount] = useState<number>(0);
  const [showReviews, setShowReviews] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [showOutOfStock, setShowOutOfStock] = useState<boolean>(false);

  useEffect(() => {
    if (!productId) return;
    getProductById(productId)
      .then((res: AxiosResponse<Product>) => setProduct(res.data))
      .catch(err => console.error('Ошибка загрузки товара:', err));
  }, [productId]);


  useEffect(() => {
    if (!sellerNickname) return;
    getSellerReviewSummary(sellerNickname.replace(/^@+/, ''))
      .then(res => {
        setAvgRating(res.data.avg_rating);
        setReviewsCount(res.data.reviews_count);
      })
      .catch(() => {
        setAvgRating(null);
        setReviewsCount(0);
      });
  }, [sellerNickname]);

  if (!product) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-gray-600 animate-spin" />
      </div>
    );
  }

  const discountPercent = product.wb_price
    ? Math.round(((product.wb_price - product.price) / product.wb_price) * 100)
    : 0;
  const savedAmount = product.wb_price - product.price;
  const imgUrl = product.image_path?.startsWith('http')
    ? product.image_path
    : GetUploadLink(product.image_path || '');

  const openInstruction = () => {
    const outOfStock = (product.remaining_products ?? 0) <= 0;
    if (outOfStock) {
      setShowOutOfStock(true);
      return;
    }
    navigate(`/product/${product.id}/instruction`);
  };
  const openInstructionPreview = () => navigate(`/instruction`);
  const openSellerChat = () => navigate(`/black-list/${sellerNickname}`);
  const openSellerProducts = () => navigate(`/catalog?seller=${product.seller_id}`, { state: { fromProductDetail: true } });

  return (
    <div className="p-4 pb-12 max-w-screen-md mx-auto bg-gray-200 space-y-6">
      {/* Image */}
      <div className="relative w-full h-60 overflow-hidden rounded-lg">
        {product.image_path ? (
          <img src={imgUrl} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-500">
            Нет фото
          </div>
        )}
      </div>

      {/* Title Panel */}
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
            </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowReviews(true)}
          className="flex-1 bg-white border border-brand py-3 px-4 rounded-lg text-sm"
        >
          Отзывы
        </button>
        <button
          onClick={openInstruction}
          className={`flex-1 py-3 px-4 rounded-lg text-sm ${
            (product.remaining_products ?? 0) <= 0
              ? 'bg-gray-300 text-gray-600 cursor-pointer'
              : 'bg-brand text-white'
          }`}
        >
          Выкупить
        </button>
      </div>

      {/* Instruction Link */}
      <div
        onClick={openInstructionPreview}
        className="flex items-center cursor-pointer"
      >
        <span className="mr-2 text-lg">❓</span>
        <span className="text-blue-600 hover:underline">
          Узнать, как выкупить товар
        </span>
      </div>

      {/* Deal Summary */}
      <div className="bg-white p-4 rounded-lg shadow space-y-1 text-sm">
        <p>📦 Цена на WB: {product.wb_price} ₽</p>
        <p>
          <span className="text-green-600 ">💰 Скидка: <strong>{discountPercent}%</strong></span>{' '}
          <span className="text-gray-800">(экономите {savedAmount} ₽)</span>
        </p>        <p>💳 Условия выплаты кешбэка: {product.payment_time}</p>
        <p className="flex items-center gap-2">
          <span>👤 Продавец:</span>
          <button onClick={openSellerChat} className="text-blue-600 hover:underline">
            {product.tg}
          </button>
          {avgRating != null && (
            <span className="text-sm text-yellow-600">★ {avgRating.toFixed(2)} ({reviewsCount})</span>
          )}
        </p>
      </div>

      {/* Warning */}
      <p className="text-gray-800 text-sm">
        <strong>Важно!</strong> Бот — это инструкция, мы не гарантируем выплату кешбэка. Перед участием в выкупе товара, убедитесь в надежности продавца.
      </p>

      {/* Guide */}
       <div className="bg-white p-4 rounded-lg shadow text-sm">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setShowGuide(!showGuide)}
        >
          <div className="flex items-center">
            <span className="mr-2 text-xl">🛠</span>
            <span className="font-semibold">Руководство</span>
          </div>
          <span className="text-xl">{showGuide ? '▲' : '▼'}</span>
        </div>
        {showGuide && (
          <ol className="list-decimal list-inside mt-2 space-y-1 text-gray-800">
            <li>Найти товар для выкупа в каталоге</li>
            <li>Нажать на кнопку "Выкупить товар"</li>
            <li>Внимательно ознакомиться с правилами и условиями сделки по выкупу товара</li>
            <li>Выполнить все шаги инструкции, загрузить необходимые скриншоты и отправить отчёт продавцу на проверку в боте</li>
            <li>После проверки отчёта дождаться выплаты кешбэка продавцом в срок, установленный условиями сделки по выкупу товара</li>
          </ol>
        )}
      </div>

      {/* Other products */}
      <div className="flex gap-2">
        <button
          onClick={openSellerProducts}
          className="flex-1 bg-white border border-brand py-2 px-3 rounded-md text-xs"
        >
          Другие товары
        </button>
        <button
          onClick={openSellerChat}
          className="flex-1 bg-white border border-brand py-2 px-3 rounded-md text-xs"
        >
          Проверить продавца
        </button>
      </div>

      {showReviews && (
        <SellerReviewsModal nickname={`@${sellerNickname}`} onClose={() => setShowReviews(false)} />
      )}

      {showOutOfStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow p-4 w-80 text-center">
            <div className="text-lg font-semibold mb-2">Товар недоступен</div>
            <div className="text-sm text-gray-700 mb-4">Раздачи закончились. Выберите другой товар из каталога.</div>
            <div className="flex gap-2">
              <button
                className="flex-1 bg-brand text-white py-2 rounded-md"
                onClick={() => navigate('/catalog')}
              >
                В каталог
              </button>
              <button
                className="flex-1 border border-darkGray py-2 rounded-md"
                onClick={() => setShowOutOfStock(false)}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;

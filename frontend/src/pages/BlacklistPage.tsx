// src/pages/BlacklistPage.tsx
import React, { useEffect, useState } from 'react';
import { createSellerReview, getSellerReviews, getUser } from '../services/api';
import { on } from '@telegram-apps/sdk';
import { useNavigate } from 'react-router-dom';

interface ReviewItemRaw {
  id: string;
  seller_id: string;
  sender_id: string;
  review?: string;
  created_at: string;
}
interface ReviewItem extends ReviewItemRaw {
  sender_nickname: string;
}

const BlacklistPage: React.FC = () => {
  const [sellerNickname, setSellerNickname] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const navigate = useNavigate();

  const handleCheck = async () => {
    // Не очищаем error в начале, чтобы сохранить сообщение об ошибке до следующей попытки проверки
    setReviews([]);
    setIsAdding(false);
    setHasChecked(true);
    setError(null);
    setReviews([]);
    setIsAdding(false);
    setHasChecked(true);
    try {
      const res = await getSellerReviews(sellerNickname);
      const data: ReviewItemRaw[] = res.data || [];
      if (data.length === 0) {
        // продавец найден, но отзывов нет
        return;
      }
      const enriched = await Promise.all(
          data.map(async (rev) => {
            const userRes = await getUser(rev.sender_id);
            return { ...rev, sender_nickname: userRes.data.nickname };
          })
      );
      setReviews(enriched);
    } catch (e: any) {
      const status = e.response?.status;
      if (status === 404) {
        // setError('Продавец не найден');
        return; // не продолжаем и не устанавливаем общий текст
      }
      setError('Не удалось получить отзывы');
    }
  };

  const handleAdd = async () => {
    setError(null);
    try {
      await createSellerReview(sellerNickname, reviewText);
      alert('Продавец добавлен в чёрный список. Ваш отзыв принят.');
      setIsAdding(false);
      setReviewText('');
      await handleCheck();
    } catch (e: any) {
      const detail = e.response?.data?.detail;
      let message = 'Ошибка при добавлении отзыва';
      if (Array.isArray(detail)) message = detail.map((err: any) => err.msg).join('; ');
      else if (typeof detail === 'string') message = detail;
      setError(message);
    }
  };

  useEffect(() => {
    const remove = on('back_button_pressed', () => navigate(-1));
    return () => remove();
  }, [navigate]);

  return (
      <div className="min-h-screen bg-brandlight p-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-semibold text-brand mb-4">Чёрный список продавцов</h1>

          <input
              type="text"
              placeholder="Никнейм продавца"
              value={sellerNickname}
              onChange={(e) => setSellerNickname(e.target.value)}
              className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
          />

          <div className="flex space-x-4 mb-6">
            <button
                onClick={handleCheck}
                className="flex-1 py-3 text-base font-semibold rounded-lg bg-brand text-white hover:bg-brand-light transition"
            >
              Проверить продавца
            </button>
            <button
                onClick={() => { setIsAdding(true); setError(null); }}
                className="flex-1 py-3 text-base font-semibold rounded-lg bg-brand text-white hover:bg-brand-light transition"
            >
              Добавить отзыв
            </button>
          </div>

          {isAdding && (
              <div className="relative mb-4">
            <textarea
                placeholder="Ваш отзыв о продавце"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                rows={4}
            />
                <button
                    onClick={handleAdd}
                    className="absolute right-2 bottom-4 py-1 px-3 text-sm font-semibold rounded bg-brand text-white hover:bg-brand-light transition"
                >
                  Сохранить
                </button>
              </div>
          )}

          {hasChecked && !isAdding && reviews.length === 0 && !error && (
              <p className="text-center text-gray-600 mt-4">Этого продавца нет в черном списке</p>
          )}

          {error && <p className="mt-2 text-center text-gray-600 text-sm">{error}</p>}

          {reviews.length > 0 && (
              <div className="space-y-4">
                {reviews.map((rev) => (
                    <div key={rev.id} className="p-4 bg-white rounded-lg shadow-sm">
                      <p className="text-gray-800 font-medium">{rev.sender_nickname}</p>
                      <p className="text-gray-700 mt-1">{rev.review}</p>
                      <p className="text-gray-500 text-xs mt-2">
                        Добавлен: {new Date(rev.created_at).toLocaleDateString()}
                      </p>
                    </div>
                ))}
              </div>
          )}
        </div>
      </div>
  );
};

export default BlacklistPage;

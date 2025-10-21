import React, {useEffect, useState} from 'react';
import Modal from './Modal';
import {getSellerReviews, getSellerReviewSummary} from '../services/api';

interface ReviewItem {
  id: string;
  sender_id: string;
  sender_nickname?: string;
  review?: string;
  rating: number;
  created_at: string;
}

export const SellerReviewsModal: React.FC<{
  nickname: string;
  onClose: () => void;
}> = ({nickname, onClose}) => {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avg, setAvg] = useState<number | null>(null);
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    setLoading(true);
    getSellerReviews(nickname.replace(/^@+/, ''))
      .then(res => setItems(res.data || []))
      .catch(() => setError('Не удалось загрузить отзывы'))
      .finally(() => setLoading(false));
  }, [nickname]);

  useEffect(() => {
    getSellerReviewSummary(nickname.replace(/^@+/, ''))
      .then(res => {
        setAvg(res.data?.avg_rating ?? null);
        setCount(res.data?.reviews_count ?? 0);
      })
      .catch(() => {
        setAvg(null);
        setCount(0);
      });
  }, [nickname]);

  return (
    <Modal onClose={onClose} maxWidthClass="max-w-xl">
      <div className="w-[92vw] max-w-lg bg-white rounded-2xl">
        {/* Верхняя часть: заголовок и ник по центру */}
        <div className="px-6 pt-6 pb-3 text-center">
          <h3 className="text-xl font-semibold text-gray-900 tracking-tight">
            Отзывы о продавце
          </h3>

          <div className="mt-2 inline-flex items-center justify-center gap-2 text-gray-800">
            <span className="font-medium">{nickname}</span>
            {avg != null && count > 0 && (
              <span className="inline-flex items-center gap-1">
                <img src="/icons/star.png" alt="" className="w-4 h-4 opacity-90" />
                <span className="font-semibold text-yellow-700">{avg.toFixed(2)}</span>
              </span>
            )}
          </div>
        </div>

        {/* Разделитель */}
        <div className="h-px bg-gray-200 mx-6" />

        {/* Контент */}
        <div className="px-6 py-4">
          {loading ? (
            <div className="py-10 text-center text-gray-500">Загрузка…</div>
          ) : error ? (
            <div className="py-10 text-center text-red-600">{error}</div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-gray-600">Пока нет отзывов</div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {items.map(item => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-2xl p-4 bg-white shadow-sm"
                >
                  {/* Автор + дата */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-sm text-gray-900 font-medium">
                      <span className="text-gray-500">@</span>
                      <span>{item.sender_nickname || 'покупатель'}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Рейтинг */}
                  <div className="mb-2 text-yellow-700">
                    {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                  </div>

                  {/* Текст отзыва */}
                  {item.review && (
                    <div className="text-base text-gray-900 whitespace-pre-wrap leading-6">
                      {item.review}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SellerReviewsModal;

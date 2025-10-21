import React, {useEffect, useRef, useState} from 'react';
import {createSellerReview, getBlackListUser, getSellerReviews, getSellersForBlackList, getSellerReviewSummary} from '../services/api';
import {on} from '@telegram-apps/sdk';
import {useNavigate, useParams} from 'react-router-dom';
import Modal from '../components/Modal';

interface ReviewItemRaw {
    id: string;
    seller_id: string;
    sender_id: string;
    rating: number;
    review?: string;
    created_at: string;
}

interface ReviewItem extends ReviewItemRaw {
    sender_nickname: string;
}

function normalizeNickname(nick: string): string {
    return nick.trim().replace(/^@+/, '');
}

const BlacklistPage: React.FC = () => {
    const [sellerNickname, setSellerNickname] = useState('');
    const [reviewText, setReviewText] = useState('');
    const [rating, setRating] = useState<number>(5);
    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [hasChecked, setHasChecked] = useState(false);
    const [avgRating, setAvgRating] = useState<number | null>(null);
    const [reviewsCount, setReviewsCount] = useState<number>(0);
    const [filteredSellers, setFilteredSellers] = useState<string[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [allSellers, setAllSellers] = useState<string[]>([]);
    const navigate = useNavigate();
    const {sellerNickname: rawParam} = useParams<{ sellerNickname: string }>();

    useEffect(() => {
        if (rawParam) {
            const nick = normalizeNickname(rawParam);
            const withAt = `@${nick}`;
            setSellerNickname(withAt);
            handleCheck();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rawParam]);

    useEffect(() => {
        getSellersForBlackList()
            .then(res => {
                const nicks = res.data.map((u: any) => `@${u.nickname}`);
                setAllSellers(nicks);
            })
            .catch(() => {
            });
    }, []);


    useEffect(() => {
        if (!showDropdown) return;
        const term = normalizeNickname(sellerNickname).toLowerCase();
        const filtered = allSellers.filter(s =>
            normalizeNickname(s).toLowerCase().startsWith(term)
        );
        setFilteredSellers(filtered.slice(0, 5));
    }, [sellerNickname, allSellers, showDropdown]);

    const wrapperRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);


    const handleCheck = async () => {
        const nick = normalizeNickname(sellerNickname);
        setReviews([]);
        setIsAdding(false);
        setError(null);
        setReviews([]);
        setIsAdding(false);
        setError(null);
        setIsAdding(false);
        setReviews([]);
        try {
            const res = await getSellerReviews(nick);
            const data: ReviewItemRaw[] = res.data || [];
            if (data.length === 0) {
                setHasChecked(true);
                setShowReviewModal(false);
                // сводка: нет отзывов
                try {
                    const s = await getSellerReviewSummary(nick);
                    setAvgRating(s.data?.avg_rating ?? null);
                    setReviewsCount(s.data?.reviews_count ?? 0);
                } catch {
                    setAvgRating(null);
                    setReviewsCount(0);
                }
                return;
            }
            const enriched = await Promise.all(
                data.map(async (rev) => {
                    const userRes = await getBlackListUser(rev.sender_id);
                    return {...rev, sender_nickname: userRes.data.nickname};
                })
            );
            setReviews(enriched);
            setHasChecked(true);
            setShowReviewModal(false);
            // подтянем сводку рейтинга
            try {
                const s = await getSellerReviewSummary(nick);
                setAvgRating(s.data?.avg_rating ?? null);
                setReviewsCount(s.data?.reviews_count ?? 0);
            } catch {
                setAvgRating(null);
                setReviewsCount(0);
            }
        } catch (e: any) {
            const status = e.response?.status;
            if (status === 404) {
                // setError('Продавец не найден');
                setHasChecked(true);
                setShowReviewModal(false);
                setAvgRating(null);
                setReviewsCount(0);
                return; // не продолжаем и не устанавливаем общий текст
            }
            setError('Не удалось получить отзывы');
            setHasChecked(true);
            setShowReviewModal(false);
            setAvgRating(null);
            setReviewsCount(0);
        }
    };

    const handleAdd = async () => {
        setError(null);
        try {
            await createSellerReview(normalizeNickname(sellerNickname), rating, reviewText);
            alert('Продавец добавлен в чёрный список. Ваш отзыв принят.');
            setIsAdding(false);
            setShowReviewModal(false);
            setReviewText('');
            setRating(5);
            await handleCheck();
        } catch (e: any) {
            const detail = e.response?.data?.detail;
            let message = 'Ошибка при добавлении отзыва';
            if (Array.isArray(detail)) message = detail.map((err: any) => err.msg).join('; ');
            else if (typeof detail === 'string') message = detail;
            setError(message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-200 flex items-start justify-center p-4 pt-8 text-sm">
            <div className="max-w-screen-lg w-full bg-white border border-brand rounded-lg shadow-lg p-6">
                {/* Заголовок */}
                <h1 className="relative text-2xl font-medium mb-4 text-center"><strong>Чёрный список продавцов</strong></h1>

                {/* Поиск продавца */}
                <section className="mb-6">
                    <div ref={wrapperRef} className="relative">
                        <input
                            type="text"
                            placeholder="Никнейм продавца"
                            value={sellerNickname}
                            onFocus={() => setShowDropdown(true)}
                            onChange={e => {
                                setSellerNickname(e.target.value);
                                setShowDropdown(true);
                                setHasChecked(false);
                                setError(null);
                                setReviews([]);
                            }}
                            className="w-full p-3 border border-darkGray rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                        />
                        {showDropdown && filteredSellers.length > 0 && (
                            <ul className="absolute top-full left-0 w-full mt-1 bg-white border border-darkGray rounded-lg shadow z-10">
                                {filteredSellers.map(s => (
                                    <li
                                        key={s}
                                        onClick={() => {
                                            setSellerNickname(s);
                                            setShowDropdown(false);
                                            setHasChecked(false);
                                            setError(null);
                                            setReviews([]);
                                            handleCheck();
                                        }}
                                        className="px-4 py-2 hover:bg-brandlight cursor-pointer"
                                    >
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                        <button
                            onClick={handleCheck}
                            className="py-2 px-4 rounded-lg font-semibold border border-brand text-brand bg-transparent"
                        >
                            Проверить продавца
                        </button>
                        <button
                            onClick={() => { setIsAdding(true); setShowReviewModal(true); setError(null); }}
                            className="py-2 px-4 rounded-lg font-semibold border border-brand text-brand bg-transparent"
                        >
                            Добавить в ЧС
                        </button>
                    </div>
                    {error && <p className="mt-2 text-center text-gray-600 text-sm">{error}</p>}
                </section>

                {/* Попап добавления отзыва */}
                {showReviewModal && (
  <Modal onClose={() => setShowReviewModal(false)} maxWidthClass="max-w-xl">
    <div className="w-[92vw] max-w-lg bg-white rounded-2xl">
      {/* Header */}
      <div className="px-6 pt-6 pb-3 text-center">
        <h3 className="text-xl font-semibold text-gray-900 tracking-tight">
          Отзыв о продавце
        </h3>
        <div className="mt-2 inline-flex items-center justify-center gap-2 text-gray-800">
          <img src="/icons/star.png" alt="" className="w-4 h-4 opacity-90" />
          <span className="font-medium">@{normalizeNickname(sellerNickname)}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200 mx-6" />

      {/* Content */}
      <div className="px-6 py-5">
        {/* Rating */}
        <div className="flex items-center justify-center gap-1.5 mb-2">
          {[1,2,3,4,5].map(star => (
            <button
              key={star}
              onClick={() => setRating(star)}
              aria-pressed={star <= rating}
              className={
                "text-3xl leading-none transition-transform duration-150 select-none " +
                (star <= rating ? "text-yellow-500" : "text-gray-300") +
                " hover:scale-110 active:scale-95"
              }
            >
              ★
            </button>
          ))}
        </div>
        <div className="text-center text-sm text-gray-600 mb-4">
          {rating} из 5
        </div>

        {/* Textarea */}
        <textarea
          placeholder="Опишите проблему: задержка выплат, обман, невыход на связь…"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows={5}
          className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50
                     focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/60
                     focus:border-brand/60 p-4 text-[15px] leading-6 placeholder:text-gray-400
                     mb-4"
        />

        {/* Footer */}
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShowReviewModal(false)}
            className="px-4 py-2 rounded-xl border border-gray-300 text-gray-800
                       hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleAdd}
            className="px-4 py-2 rounded-xl bg-brand text-white border border-brand
                       shadow-sm hover:opacity-90 active:opacity-80 transition"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  </Modal>
)}


                {/* Результаты проверки */}
                {hasChecked && (
                    <div className="mb-4 flex items-center justify-center gap-2 text-gray-800">
                        <span className="font-medium">{sellerNickname || ''}</span>
                        {avgRating != null && reviewsCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-yellow-600">
                                <img src="/icons/star.png" alt="" className="w-4 h-4 opacity-90"/>
                                <span className="font-semibold">{avgRating.toFixed(2)}</span>
                            </span>
                        )}
                    </div>
                )}

                {!isAdding && hasChecked && reviews.length === 0 && !error && (
                    <p className="text-center text-gray-600 mt-2">Этого продавца нет в чёрном списке</p>
                )}

                {reviews.length > 0 && (
                    <section className="space-y-4">
                        <h2 className="text-lg font-semibold">Отзывы</h2>
                        {reviews.map((rev) => (
                            <div key={rev.id} className="p-4 bg-white border border-darkGray rounded-lg shadow-sm">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-gray-800 font-medium">{rev.sender_nickname}</p>
                                    <span className="inline-flex items-center gap-1 text-yellow-600 text-sm">
                                        <img src="/icons/star.png" alt="" className="w-4 h-4 opacity-90"/>
                                        <span className="font-semibold">{Number(rev.rating).toFixed(2)}</span>
                                    </span>
                                </div>
                                <p className="text-gray-700 mt-1 whitespace-pre-wrap">{rev.review}</p>
                                <p className="text-gray-500 text-xs mt-2">Добавлен: {new Date(rev.created_at).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </section>
                )}
            </div>
        </div>
    );
};

export default BlacklistPage;

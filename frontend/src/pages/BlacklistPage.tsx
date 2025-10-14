import React, {useEffect, useRef, useState} from 'react';
import {createSellerReview, getBlackListUser, getSellerReviews, getSellersForBlackList} from '../services/api';
import {on} from '@telegram-apps/sdk';
import {useNavigate, useParams} from 'react-router-dom';

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

function normalizeNickname(nick: string): string {
    return nick.trim().replace(/^@+/, '');
}

const BlacklistPage: React.FC = () => {
    const [sellerNickname, setSellerNickname] = useState('');
    const [reviewText, setReviewText] = useState('');
    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [hasChecked, setHasChecked] = useState(false);
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
                return;
            }
            const enriched = await Promise.all(
                data.map(async (rev) => {
                    const userRes = await getBlackListUser(rev.sender_id);
                    return {...rev, sender_nickname: userRes.data.nickname};
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
                            onClick={() => { setIsAdding(true); setError(null); }}
                            className="py-2 px-4 rounded-lg font-semibold border border-brand text-brand bg-transparent"
                        >
                            Добавить в ЧС
                        </button>
                    </div>
                    {error && <p className="mt-2 text-center text-gray-600 text-sm">{error}</p>}
                </section>

                {/* Добавить отзыв */}
                {isAdding && (
                    <section className="mb-6">
                        <label className="block text-sm font-medium mb-2">Ваш отзыв о продавце</label>
                        <div className="relative">
                            <textarea
                                placeholder="Опишите проблему: задержка выплат, обман, невыход на связь…"
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                className="w-full p-3 border border-darkGray rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
                                rows={4}
                            />
                            <button
                                onClick={handleAdd}
                                className="absolute right-2 bottom-3 py-1 px-3 text-sm font-semibold rounded border border-brand text-brand bg-white hover:bg-brandlight transition"
                            >
                                Сохранить
                            </button>
                        </div>
                    </section>
                )}

                {/* Результаты проверки */}
                {!isAdding && hasChecked && reviews.length === 0 && !error && (
                    <p className="text-center text-gray-600 mt-2">Этого продавца нет в чёрном списке</p>
                )}

                {reviews.length > 0 && (
                    <section className="space-y-4">
                        <h2 className="text-lg font-semibold">Отзывы</h2>
                        {reviews.map((rev) => (
                            <div key={rev.id} className="p-4 bg-white border border-darkGray rounded-lg shadow-sm">
                                <p className="text-gray-800 font-medium">{rev.sender_nickname}</p>
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

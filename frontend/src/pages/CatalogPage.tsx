import React, {useEffect, useState} from 'react';
import {Link, useLocation, useNavigate, useSearchParams} from 'react-router-dom';
import {getProducts, getUser} from '../services/api';
import {on} from '@telegram-apps/sdk';
import GetUploadLink from "../components/GetUploadLink";

interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    article: string;
    category: string;
    seller_id: string;
    image_path?: string;
}

interface Seller {
    id: string;
    nickname: string;
}

function CatalogPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [searchQuery, setSearchQuery] = useState('');
    const [filterPrice, setFilterPrice] = useState<number | ''>('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterSeller, setFilterSeller] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const [sellerOptions, setSellerOptions] = useState<Seller[]>([]);

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const location = useLocation();
    const isOnCatalog = location.pathname === ('/catalog');

    const hasActiveFilters =
        searchQuery.trim() !== '' ||
        filterPrice !== '' ||
        filterCategory !== '' ||
        filterSeller !== '';

    useEffect(() => {
        const sellerParam = searchParams.get('seller');
        if (sellerParam) {
            setFilterSeller(sellerParam);
        }
    }, [searchParams]);

    useEffect(() => {
        // const removeBackListener = on('back_button_pressed', () => navigate('/'));
        // // return () => removeBackListener();
    }, [navigate]);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const response = await getProducts();
                const uniqueProducts = Object.values(
                    (response.data as Product[]).reduce((acc, p) => {
                        if (!acc[p.id] || (!acc[p.id].image_path && p.image_path)) {
                            acc[p.id] = p;
                        }
                        return acc;
                    }, {} as Record<string, Product>)
                );
                setProducts(uniqueProducts);
            } catch (err) {
                console.error('Ошибка при загрузке товаров:', err);
                setError('Не удалось загрузить каталог товаров.');
            } finally {
                setLoading(false);
            }
        }

        fetchProducts();
    }, []);

    useEffect(() => {
        if (!products.length) return;
        const uniqueIds = Array.from(new Set(products.map(p => p.seller_id)));
        (async () => {
            try {
                const sellers = await Promise.all(
                    uniqueIds.map(async id => {
                        const res = await getUser(id);
                        return {id, nickname: res.data.nickname!};
                    })
                );
                setSellerOptions(sellers);
            } catch (err) {
                console.error('Ошибка при загрузке продавцов:', err);
            }
        })();
    }, [products]);

    if (loading) return <div className="p-4">Загрузка каталога...</div>;
    if (error) return (
        <div className="w-full max-w-sm mx-auto p-4 bg-gradient-r-brandlight border border-gradient-r-brand rounded text-center mt-4">
            <p className="text-sm text-brand">{error}</p>
        </div>
    );

    const filtered = products
        .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.article.toLowerCase().includes(searchQuery.toLowerCase()))
        .filter(p => (filterPrice === '' || p.price <= filterPrice))
        .filter(p => (filterCategory === '' || p.category === filterCategory))
        .filter(p => (filterSeller === '' || p.seller_id === filterSeller));

    const categories = Array.from(new Set(products.map(p => p.category)));

    return (
        <div className="min-h-screen bg-gradient-t-gray">
            <div className="flex w-max mx-auto mt-2 bg-gradient-t-gray p-1 rounded-full">
                <Link
                    to="/catalog"
                    className={`
            px-4 py-2 rounded-full
            ${isOnCatalog
                        ? 'bg-gradient-tr-white text-black'
                        : 'text-gray-500 hover:text-black'}
          `}
                >
                    Каталог
                </Link>

                <Link
                    to="/user/orders"
                    className={`
            px-4 py-2 rounded-full
            ${!isOnCatalog
                        ? 'bg-gradient-tr-white text-black'
                        : 'text-gray-500 hover:text-black'}
          `}
                >
                    Мои покупки
                </Link>
            </div>
            <div className="p-4 mx-auto max-w-screen-sm relative">
                {/* Search + filter toggle */}
                <div className="sticky top-0 z-10 bg-gradient-t-gray mb-4 flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Поиск по названию или артикулу"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="flex-1 border border-gradient-tr-darkGray rounded-md p-2"
                    />
                    <button
                        onClick={() => setShowFilters(prev => !prev)}
                        className="relative"
                    >
                        <img
                            src="/icons/filter.png"
                            alt="Фильтр"
                            className="w-6 h-6"
                        />

                        {hasActiveFilters && (
                            <span
                                className={`
                                    absolute
                                    top-0 right-0
                                    inline-flex items-center justify-center
                                    w-3 h-3
                                    bg-red-600
                                    border-2 border-gradient-tr-white
                                    rounded-full
                                  `}
                            />
                        )}
                    </button>

                </div>

                {/* Inline filters panel */}
                {showFilters && (
                    <div className="bg-gradient-tr-white rounded-lg shadow p-4 mb-4 space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Максимальная цена</label>
                            <input
                                type="number"
                                min={0}
                                value={filterPrice}
                                onChange={e => setFilterPrice(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full border border-gradient-tr-darkGray rounded p-2 focus:outline-none focus:ring"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Категория</label>
                            <select
                                value={filterCategory}
                                onChange={e => setFilterCategory(e.target.value)}
                                className="w-full border border-gradient-tr-darkGray rounded p-2 focus:outline-none focus:ring"
                            >
                                <option value="">Все категории</option>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Продавец</label>
                            <select
                                value={filterSeller}
                                onChange={e => setFilterSeller(e.target.value)}
                                className="w-full border border-gradient-tr-darkGray rounded p-2 focus:outline-none focus:ring"
                            >
                                <option value="">Все продавцы</option>
                                {sellerOptions.map(sel => <option key={sel.id} value={sel.id}>{sel.nickname}</option>)}
                            </select>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => {
                                    setFilterPrice('');
                                    setFilterCategory('');
                                    setFilterSeller('');
                                    setShowFilters(false);
                                }}
                                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                            >
                                Сбросить
                            </button>
                            <button
                                onClick={() => setShowFilters(false)}
                                className="px-4 py-2 bg-gradient-r-brand text-white rounded-md hover:bg-gradient-r-brand-dark"
                            >
                                Применить
                            </button>
                        </div>
                    </div>
                )}

                {/* Products grid */}
                <div className="grid grid-cols-2 gap-4">
                    {filtered.map(product => (
                        <div
                            key={product.id}
                            onClick={() => navigate(`/product/${product.id}`)}
                            className="border border-gradient-b-gray rounded-md shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 cursor-pointer"
                        >
                            <div className="w-full aspect-[3/4] bg-gray-100 overflow-hidden">
                                {product.image_path
                                    ? <img
                                        src={product.image_path.startsWith('http') ? product.image_path : GetUploadLink(product.image_path)}
                                        alt={product.name} className="w-full h-full object-cover"/>
                                    : <div className="flex items-center justify-center h-full text-gray-400">Нет
                                        фото</div>
                                }
                            </div>
                            <div className="p-3 bg-gradient-tr-white flex flex-col">
                                <h3
                                    className="
                                        text-sm font-semibold mb-1
                                        h-10            /* высота = 2 строки (2 × 1.25rem line-height) */
                                        overflow-hidden /* обрезаем выступающий текст */
                                        line-clamp-2    /* ограничиваем двумя строками и добавляем ... */
  "
                                >
                                    {product.name}
                                </h3>
                                <p className="text-md font-bold mb-1 text-brand">{product.price} ₽</p>
                                <p className="text-xs text-gray-500 mt-auto">Арт. {product.article}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default CatalogPage;

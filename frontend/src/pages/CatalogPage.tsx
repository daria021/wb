import React, {useContext, useEffect, useRef, useState} from 'react';
import {Link, useLocation, useNavigate, useSearchParams} from 'react-router-dom';
import {getBlackListUser} from '../services/api';
import GetUploadLink from "../components/GetUploadLink";
import {Combobox} from '@headlessui/react';
import {useAuth} from "../contexts/auth";
import { BootstrapContext } from '../contexts/bootstrap';

interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    wb_price: number;
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
    const { products } = useContext(BootstrapContext)!;

    const [searchQuery, setSearchQuery] = useState('');
    const [filterPrice, setFilterPrice] = useState<number | ''>('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterSeller, setFilterSeller] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const [searchIsActive, setSearchIsActive] = useState(false);

    const [sellerOptions, setSellerOptions] = useState<Seller[]>([]);

    const [sellerQuery, setSellerQuery] = useState('');
    // const {loading: authLoading} = useAuth();
    // const retryCnt = useRef(0);

    const abortRef = useRef<AbortController | null>(null);
    // отфильтрованный список продавцов под комбо
    const filteredSellers = sellerQuery === ''
        ? sellerOptions
        : sellerOptions.filter(s =>
            s.nickname.toLowerCase().includes(sellerQuery.toLowerCase())
        );

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const location = useLocation();
    const isOnCatalog = location.pathname === ('/catalog');
    const searchRef = useRef<HTMLInputElement>(null);
    const [filterCashback, setFilterCashback] = useState<number | ''>('');

    const handleOpenSellerProducts = (sellerId: string) => {
        navigate(`/catalog?seller=${sellerId}`, {state: {fromProductDetail: true}});
    };


    const hasActiveFilters =
        searchQuery.trim() !== '' ||
        filterPrice !== '' ||
        filterCategory !== '' ||
        filterSeller !== '' ||
        filterCashback !== '';


    useEffect(() => {
        const sellerParam = searchParams.get('seller');
        if (sellerParam) {
            setFilterSeller(sellerParam);
        }
    }, [searchParams]);

    useEffect(() => {
        if (!products.length) return;
        const uniqueIds = Array.from(new Set(products.map(p => p.seller_id)));
        (async () => {
            try {
                const sellers = await Promise.all(
                    uniqueIds.map(async id => {
                        const res = await getBlackListUser(id);
                        return {id, nickname: res.data.nickname!};
                    })
                );
                setSellerOptions(sellers);
            } catch (err) {
                console.error('Ошибка при загрузке продавцов:', err);
            }
        })();
    }, [products]);

    useEffect(() => {
        if (searchIsActive) {
            searchRef.current?.focus()
        }
    })


    const filtered = products
  .filter(p => (filterPrice === '' || p.price <= filterPrice))
  .filter(p =>
    filterCashback === '' ||
    (p.wb_price - p.price) <= filterCashback
  )
  .filter(p => (filterCategory === '' || p.category === filterCategory))
  .filter(p => (filterSeller === '' || p.seller_id === filterSeller));


    const categories = Array.from(new Set(products.map(p => p.category)));


    return (
        <div className="min-h-screen bg-gray-200">
            <div className="flex w-max mx-auto mt-2 bg-gray-200 p-1 rounded-full">
                <Link
                    to="/catalog"
                    className={`
            px-4 py-2 rounded-full
            ${isOnCatalog
                        ? 'bg-white text-black'
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
                        ? 'bg-white text-black'
                        : 'text-gray-500 hover:text-black'}
          `}
                >
                    Мои покупки
                </Link>
            </div>
            <div className="p-4 mx-auto max-w-screen-sm relative">
                {/* Search  filter toggle */}
                <div className="sticky top-0 z-10 mb-4 flex items-center gap-2">
                    <input
                        ref={searchRef}
                        type="text"
                        placeholder="Поиск по названию"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onFocus={() => setSearchIsActive(true)}
                        className="flex-1 border border-darkGray rounded-md p-2"
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
                                    border-2 border-white
                                    rounded-full
                                  `}
                            />
                        )}
                    </button>
                </div>

            {/* Inline filters panel */}
            {showFilters && (
                <div className="bg-white rounded-lg shadow p-4 mb-2 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Цена до</label>
                        <input
                            type="number"
                            min={0}
                            value={filterPrice}
                            onChange={e => setFilterPrice(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full border border-darkGray rounded p-2 focus:outline-none focus:ring"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Кешбэк до</label>
                        <input
                            type="number"
                            min={0}
                            value={filterCashback}
                            onChange={e =>
                                setFilterCashback(
                                    e.target.value === '' ? '' : Number(e.target.value)
                                )
                            }
                            className="w-full border border-darkGray rounded p-2 focus:outline-none focus:ring"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Категория</label>
                        <select
                            value={filterCategory}
                            onChange={e => setFilterCategory(e.target.value)}
                            className="w-full border border-darkGray rounded p-2 focus:outline-none focus:ring"
                        >
                            <option value="">Все категории</option>
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Продавец</label>
                        <Combobox value={filterSeller} onChange={setFilterSeller} as="div" className="relative">
                            <Combobox.Input
                                className="w-full border border-darkGray rounded p-2 focus:outline-none focus:ring"
                                placeholder="Поиск продавца"
                                onChange={e => setSellerQuery(e.target.value)}
                                displayValue={(id: string) => {
                                    const sel = sellerOptions.find(s => s.id === id);
                                    return sel ? sel.nickname : '';
                                }}
                            />
                            <Combobox.Button
                                className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                <span className="text-gray-400 select-none">▾</span>
                            </Combobox.Button>

                            {/** render-props: получаем флаг open */}
                            <Combobox.Options
                                className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 overflow-auto rounded">
                                <Combobox.Option
                                    key="all"
                                    value=""
                                    className={({active}) =>
                                        `cursor-pointer select-none p-2 ${active ? 'bg-brandlight text-white' : 'text-gray-700'}`
                                    }
                                >
                                    Все продавцы
                                </Combobox.Option>

                                {filteredSellers.length === 0 ? (
                                    <div className="p-2 text-sm text-gray-500">Ничего не найдено</div>
                                ) : (
                                    filteredSellers.map(sel => (
                                        <Combobox.Option
                                            key={sel.id}
                                            value={sel.id}
                                            className={({active}) =>
                                                `cursor-pointer select-none p-2 ${active ? 'bg-brandlight text-white' : 'text-gray-700'}`
                                            }
                                        >
                                            {sel.nickname}
                                        </Combobox.Option>
                                    ))
                                )}
                            </Combobox.Options>
                        </Combobox>

                    </div>


                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={() => {
                                setFilterPrice('');
                                setFilterCategory('');
                                setFilterSeller('');
                                setShowFilters(false);
                            }}
                            className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-200-100"
                        >
                            Сбросить
                        </button>
                        <button
                            onClick={() => setShowFilters(false)}
                            className="px-4 py-2 bg-brand text-white rounded-md hover:bg-brand-dark"
                        >
                            Применить
                        </button>
                    </div>
                </div>
            )}

            {/* Products grid */}
            <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                    {filtered.map(product => {
                        const seller = sellerOptions.find(s => s.id === product.seller_id);

                        return (
                            <div
                                key={product.id}
                                onClick={() => navigate(`/product/${product.id}`)}
                                className="border border-gray-200 rounded-md shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 cursor-pointer"
                            >
                                <div className="w-full aspect-square bg-gray-200-100 overflow-hidden">
                                    {product.image_path ? (
                                        <img
                                            src={
                                                product.image_path.startsWith('http')
                                                    ? product.image_path
                                                    : GetUploadLink(product.image_path)
                                            }
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            Нет фото
                                        </div>
                                    )}
                                </div>

                                <div className="p-3 bg-white flex flex-col">
                                    <h3 className="text-sm font-semibold mb-1 overflow-hidden line-clamp-2">
                                        {product.name}
                                    </h3>

                                    {seller && (
                                        <p
                                            onClick={e => {
                                                e.stopPropagation();
                                                handleOpenSellerProducts(product.seller_id);
                                            }}
                                            className="text-sm text-blue-600 hover:underline cursor-pointer mt-1"
                                        >
                                            {seller.nickname}
                                        </p>
                                    )}

                                    <p className="text-md font-bold mb-1 text-brand">
                                        {product.price} ₽
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
        </div>
    )}

export default CatalogPage;
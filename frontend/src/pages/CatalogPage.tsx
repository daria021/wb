import React, {useEffect, useRef, useState} from 'react';
import {Link, useLocation, useNavigate, useSearchParams} from 'react-router-dom';
import {getProducts, getUser} from '../services/api';
import {on} from '@telegram-apps/sdk';
import GetUploadLink from "../components/GetUploadLink";
import {useDebounce} from "../hooks/useDebounce";
import {Combobox} from '@headlessui/react';

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

    const [searchIsActive, setSearchIsActive] = useState(false);

    const [sellerOptions, setSellerOptions] = useState<Seller[]>([]);

    const [sellerQuery, setSellerQuery] = useState('');

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
        const removeBackListener = on('back_button_pressed', () => navigate('/'));
        return () => removeBackListener();
    }, [navigate]);

    const debouncedSearch = useDebounce(searchQuery, 600);

    useEffect(() => {
        setLoading(true);
        getProducts({search: debouncedSearch /* можно добавить: , limit, offset */})
            .then(res => setProducts(res.data))
            .catch(() => setError('Не удалось загрузить каталог товаров.'))
            .finally(() => setLoading(false));
    }, [debouncedSearch /*, limit, offset если нужно */]);


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


    useEffect(() => {
        if (searchIsActive) {
            searchRef.current?.focus()
        }
    })


    const filtered = products
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
                {/* Search  filter toggle */}
                <div className="sticky top-0 z-10 mb-4 flex items-center gap-2">
                    <input
                        ref={searchRef}
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
                {/* Показываем загрузку и ошибку под шапкой, но инпут не размонтируем */}
                {loading && (
                    <div className="p-4 text-center text-gray-600">Загрузка каталога…</div>
                )}
                {error && (
                    <div className="p-4 text-center text-red-600">{error}</div>
                )}

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
                            <Combobox value={filterSeller} onChange={setFilterSeller} as="div" className="relative">
                                <Combobox.Input
                                    className="w-full border border-gradient-tr-darkGray rounded p-2 focus:outline-none focus:ring"
                                    placeholder="Поиск продавца"
                                    onChange={e => setSellerQuery(e.target.value)}
                                    displayValue={(id: string) => {
                                        const sel = sellerOptions.find(s => s.id === id);
                                        return sel ? sel.nickname : '';
                                    }}
                                />
                                <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                    <span className="text-gray-400 select-none">▾</span>
                                </Combobox.Button>

                                {/** render-props: получаем флаг open */}
                                <Combobox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 overflow-auto rounded">
                                    <Combobox.Option
                                        key="all"
                                        value=""
                                        className={({ active }) =>
                                            `cursor-pointer select-none p-2 ${active ? 'bg-gradient-r-brandlight text-white' : 'text-gray-700'}`
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
                                                className={({ active }) =>
                                                    `cursor-pointer select-none p-2 ${active ? 'bg-gradient-r-brandlight text-white' : 'text-gray-700'}`
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
                                        h-10
                                        overflow-hidden
                                        line-clamp-2"
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

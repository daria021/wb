import React, {ChangeEvent, FormEvent, useEffect, useState, useRef} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {createProduct, getProductById, updateProduct} from '../services/api'; // Ваши функции API
import {Category, PayoutTime} from '../enums';
import {on} from "@telegram-apps/sdk";
import GetUploadLink from "../components/GetUploadLink"; // Ваши enum'ы

interface ProductFormData {
    id?: string;
    name: string;
    article: string;
    brand: string;
    category: Category;
    key_word: string;
    general_repurchases: number;
    daily_repurchases: number;
    price: number;
    wb_price: number;
    tg: string;
    payment_time: PayoutTime;
    review_requirements: string;
    image_path?: string; // путь к уже загруженному файлу (при редактировании)
}

function ProductForm() {
    const navigate = useNavigate();
    const {productId} = useParams(); // берём из URL, если есть
    const isEditMode = Boolean(productId);
    const [originalFormData, setOriginalFormData] = useState<ProductFormData | null>(null);
    const [changedFields, setChangedFields] = useState<Record<string, { old: any, new: any }>>({});
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [priceError, setPriceError] = useState('');
    const [repurchasesError, setRepurchasesError] = useState('');


    const inputRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null)
    ];

    const reviewRequirementsRef = useRef<HTMLTextAreaElement>(null);

    const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            // Если есть следующий элемент, переводим фокус
            // Например, если у вас есть массив рефов для остальных полей, можно использовать его
        }
    };

    // Состояния для полей
    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        article: '',
        brand: '',
        category: Category.WOMEN, // пример значения по умолчанию
        key_word: '',
        general_repurchases: 0,
        daily_repurchases: 0,
        price: 0,
        wb_price: 0,
        tg: '',
        payment_time: PayoutTime.AFTER_REVIEW, // пример значения по умолчанию
        review_requirements: '',
        image_path: '', // если при редактировании есть уже загруженное фото
    });

    const handleKeyDown = (index: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (index === 8) {
                // для последнего текстового поля (Телеграм) переводим фокус в textarea
                reviewRequirementsRef.current?.focus();
            } else {
                inputRefs[index + 1]?.current?.focus();
            }
        }
    };


    // Состояние для файла (новое фото)
    const [imageFile, setImageFile] = useState<File | null>(null);

    // Предпросмотр (preview) для выбранного файла
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Ошибки / Загрузка
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');



    // При монтировании, если есть productId — подгружаем данные с бэка
    useEffect(() => {
        if (!isEditMode) {
            setLoading(false);
            return;
        }

        // Режим редактирования: грузим данные товара
        (async () => {
            try {
                const response = await getProductById(productId!);
                const data = response.data;

                // Заполняем поля
                const loadedData: ProductFormData = {
                    id: data.id,
                    name: data.name,
                    article: data.article,
                    brand: data.brand,
                    category: data.category,
                    key_word: data.key_word,
                    general_repurchases: data.general_repurchases,
                    daily_repurchases: data.daily_repurchases,
                    price: data.price,
                    wb_price: data.wb_price,
                    tg: data.tg,
                    payment_time: data.payment_time,
                    review_requirements: data.review_requirements,
                    image_path: data.image_path || '', // если есть
                };
                setFormData(loadedData);
                setOriginalFormData(loadedData);

                setLoading(false);
            } catch (err) {
                console.error('Ошибка при загрузке товара:', err);
                setError('Не удалось загрузить товар');
                setLoading(false);
            }
        })();
    }, [isEditMode, productId]);

    // Когда пользователь выбирает новый файл
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setImageFile(file);

        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        } else {
            setPreviewUrl(null);
        }
    };

    const validateField = (name: string, value: any, newFormData: ProductFormData) => {
        if (name === 'price') {
            // Цена для покупателя должна быть меньше или равна цене на сайте
            if (Number(value) > newFormData.wb_price) {
                setPriceError('Цена для покупателя не должна быть больше цены на сайте');
            } else {
                setPriceError('');
            }
        }
        if (name === 'daily_repurchases') {
            // Ежедневные выкупы не могут превышать общий план
            if (Number(value) > newFormData.general_repurchases) {
                setRepurchasesError('Ежедневные выкупы не могут превышать общий план');
            } else {
                setRepurchasesError('');
            }
        }
    };



    // Изменение простых полей (string, number, т.д.)
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        let newValue: any = value;
        if (['general_repurchases', 'daily_repurchases', 'price', 'wb_price'].includes(name)) {
            newValue = Number(value);
        }
        setFormData((prev) => {
            const updated = {...prev, [name]: newValue};
            // Вызываем валидацию для соответствующих полей
            validateField(name, newValue, updated);
            return updated;
        });
    };

    const handleFocus = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (value === '0') {
            setFormData((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    useEffect(() => {
        const removeBackListener = on('back_button_pressed', () => {
            navigate('/my-products');
        });

        return () => {
            removeBackListener();
        };
    }, [navigate]);

    // Обработка отправки формы
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (isEditMode && originalFormData) {
            const changes: Record<string, { old: any, new: any }> = {};
            Object.keys(formData).forEach((key) => {
                // Можно добавить дополнительные проверки для сравнения сложных типов, если нужно
                if (formData[key as keyof ProductFormData] !== originalFormData[key as keyof ProductFormData]) {
                    changes[key] = {
                        old: originalFormData[key as keyof ProductFormData],
                        new: formData[key as keyof ProductFormData],
                    };
                }
            });
            // Если есть изменения, показываем подтверждение
            if (Object.keys(changes).length > 0) {
                setChangedFields(changes);
                setShowConfirmation(true);
                return;
            }
        }
        // Если изменений нет или это режим создания, можно сразу отправлять запрос
        await submitData();
    };

    const submitData = async () => {

        try {
            // Собираем FormData
            const fd = new FormData();
            fd.append('name', formData.name);
            fd.append('article', formData.article);
            fd.append('brand', formData.brand);
            fd.append('category', formData.category);
            fd.append('key_word', formData.key_word);
            fd.append('general_repurchases', String(formData.general_repurchases));
            fd.append('daily_repurchases', String(formData.daily_repurchases));
            fd.append('price', String(formData.price));
            fd.append('wb_price', String(formData.wb_price));
            fd.append('tg', formData.tg);
            fd.append('payment_time', formData.payment_time);
            fd.append('review_requirements', formData.review_requirements);

            // Если пользователь выбрал новый файл — прикладываем
            if (imageFile) {
                fd.append('image', imageFile);
            }

            if (isEditMode) {
                // PATCH-запрос (редактирование)
                await updateProduct(productId!, fd);
                // После успеха — можно вернуться на страницу просмотра
                navigate(`/product/${productId}/seller`);
            } else {
                // POST-запрос (создание)
                const newId = await createProduct(fd);
                // После успеха — переход на страницу товара
                navigate(`/product/${newId}/seller`);
            }
        } catch (err) {
            console.error('Ошибка при сохранении товара:', err);
            alert('Не удалось сохранить товар');
        }
    };


    if (loading) {
        return <div className="p-4">Загрузка...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-600">{error}</div>;
    }


    return (
        <div className="p-4 max-w-screen-sm bg-gray-200 mx-auto">
            <div className="sticky top-0 z-10 bg-gray-200">
                {/* Первый ряд: кнопки */}
                <div className="flex justify-between items-center px-2 py-1">
                    <button
                        onClick={() => navigate('/')}
                        type="button"
                        className="inline-flex items-center justify-center whitespace-nowrap py-1 px-1 text-xs font-semibold border border-brand text-brand bg-transparent rounded appearance-none focus:outline-none"
                    >
                        Отменить
                    </button>
                    <button
                        type="submit"
                        form="product-form"
                        className="inline-flex items-center justify-center whitespace-nowrap py-1 px-1 text-xs font-semibold border border-brand text-brand bg-transparent rounded appearance-none focus:outline-none"
                    >
                        Отправить заявку
                    </button>
                </div>
                {/* Второй ряд: заголовок */}
                <div className="px-2">
                    <h1 className="text-center text-base font-bold -mt-1">
                        {isEditMode ? 'Редактировать товар' : 'Добавить товар'}
                    </h1>
                </div>
            </div>


            <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
                {/* Название */}
                <div>
                    <label className="block text-sm font-medium mb-1">Название товара</label>
                    <input
                        type="text"
                        ref={inputRefs[0]}
                        onKeyDown={handleKeyDown(0)}
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                        placeholder="Название товара"
                    />
                </div>

                {/* Артикул */}
                <div>
                    <label className="block text-sm font-medium mb-1">Артикул</label>
                    <input
                        type="text"
                        ref={inputRefs[1]}
                        onKeyDown={handleKeyDown(1)}
                        name="article"
                        value={formData.article}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                        placeholder="Артикул"
                    />
                </div>

                {/* Фото (показать превью, если есть старое или выбран файл) */}
                <div>
                    <p className="uppercase text-xs text-gray-500">Фото товара</p>
                    <label
                        className="bg-brandlight text-brand py-2 px-4 rounded cursor-pointer hover:shadow-lg transition-shadow duration-200 text-sm inline-flex items-center gap-2">
                        {previewUrl ? (
                            <img
                                src={previewUrl}
                                alt="preview"
                                className="w-32 h-32 object-cover mb-2"
                            />
                        ) : formData.image_path ? (
                            // Если в режиме редактирования есть старое фото
                            <img
                                src={GetUploadLink(formData.image_path)}
                                alt="existing"
                                className="w-32 h-32 object-cover mb-2"
                            />
                        ) : (
                            <div className="text-brand text-sm mb-2">Выбрать файл</div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </label>

                </div>


                {/* Бренд */}
                <div>
                    <label className="block text-sm font-medium mb-1">Бренд</label>
                    <input
                        type="text"
                        ref={inputRefs[2]}
                        onKeyDown={handleKeyDown(2)}
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    />
                </div>

                {/* Категория */}
                <div>
                    <label className="block text-sm font-medium mb-1">Категория</label>
                    <select

                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    >
                        {Object.values(Category).map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Ключевое слово */}
                <div>
                    <label className="block text-sm font-medium mb-1">Ключевое слово</label>
                    <input
                        type="text"
                        ref={inputRefs[3]}
                        onKeyDown={handleKeyDown(3)}
                        name="key_word"
                        value={formData.key_word}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                        placeholder="Например, 'рубашка в клетку'"
                    />
                </div>

                {/* Общий план по выкупам */}
                <div>
                    <label className="block text-sm font-medium mb-1">Общий план выкупов</label>
                    <input
                        type="number"
                        ref={inputRefs[4]}
                        onKeyDown={handleKeyDown(4)}
                        name="general_repurchases"
                        value={formData.general_repurchases}
                        onChange={handleInputChange}
                        onFocus={handleFocus}
                        required
                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    />
                </div>

                {/* Выкупы на сутки */}
                <div>
                    <label className="block text-sm font-medium mb-1">План выкупов на сутки</label>
                    <input
                        type="number"
                        ref={inputRefs[5]}
                        onKeyDown={handleKeyDown(5)}
                        name="daily_repurchases"
                        value={formData.daily_repurchases}
                        onChange={handleInputChange}
                        onFocus={handleFocus}
                        required
                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    />
                    {repurchasesError && <p className="text-red-500 text-xs mt-1">{repurchasesError}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Цена на сайте WB (руб.)</label>
                    <input
                        type="number"
                        ref={inputRefs[6]}
                        onKeyDown={handleKeyDown(6)}
                        name="wb_price"
                        value={formData.wb_price}
                        onChange={handleInputChange}
                        onFocus={handleFocus}
                        required
                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    />
                </div>

                {/* Цена */}
                <div>
                    <label className="block text-sm font-medium mb-1">Цена для покупателя</label>
                    <input
                        type="number"
                        ref={inputRefs[7]}
                        onKeyDown={handleKeyDown(7)}
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        onFocus={handleFocus}
                        required
                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    />
                    {priceError && <p className="text-red-500 text-xs mt-1">{priceError}</p>}

                </div>



                {/* Telegram */}
                <div>
                    <label className="block text-sm font-medium mb-1">Телеграм для связи</label>
                    <input
                        type="text"
                        ref={inputRefs[8]}
                        onKeyDown={handleKeyDown(8)}
                        name="tg"
                        value={formData.tg}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                        placeholder="@username"
                    />
                </div>

                {/* Время выплаты */}
                <div>
                    <label className="block text-sm font-medium mb-1">Когда выплата </label>
                    <select
                        name="payment_time"
                        value={formData.payment_time}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    >
                        {Object.values(PayoutTime).map((pt) => (
                            <option key={pt} value={pt}>
                                {pt}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Требования к отзыву */}
                <div>
                    <label className="block text-sm font-medium mb-1">Требования к отзыву</label>
                    <textarea
                        name="review_requirements"
                        ref={reviewRequirementsRef}
                        onKeyDown={handleTextareaKeyDown}
                        value={formData.review_requirements}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                        placeholder="Опишите требования к отзыву..."
                    />
                </div>
            </form>
            {showConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Вы изменили:</h2>
                        <div className="bg-brandlight rounded p-4">
                            <ul className="text-sm mb-4">
                                {Object.entries(changedFields).map(([field, values]) => (
                                    <li key={field}>
                                        <strong>{field}</strong>: {String(values.old)} → {String(values.new)}
                                    </li>
                                ))}
                            </ul>
                            <div className="flex justify-end gap-3">
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={() => setShowConfirmation(false)}
                                className="px-4 py-2 bg-white border border-brand rounded text-brand hover:bg-gray-100"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={async () => {
                                    setShowConfirmation(false);
                                    await submitData();
                                }}
                                className="px-4 py-2 bg-white text-brand rounded border border-brand"
                            >
                                Все верно. Применить
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    )
        ;
}

export default ProductForm;

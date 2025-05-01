import React, {ChangeEvent, FormEvent, useEffect, useRef, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {createProduct, getProductById, updateProduct} from '../services/api';
import {Category, PayoutTime} from '../enums';
import {on} from "@telegram-apps/sdk";
import FileUploader from "../components/FileUploader";
import {NumericInput} from "../components/NumericInput";

interface ProductFormData {
    id?: string;
    name: string;
    article: string;
    brand: string;
    category: Category;
    key_word: string;
    general_repurchases: string;
    daily_repurchases: string;
    price: string;
    wb_price: string;
    tg: string;
    payment_time: PayoutTime;
    review_requirements: string;
    requirements_agree: boolean;
    image_path?: string;
}


function ProductForm() {
    const navigate = useNavigate();
    const {productId} = useParams();
    const isEditMode = Boolean(productId);
    const [originalFormData, setOriginalFormData] = useState<ProductFormData | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [priceError, setPriceError] = useState('');
    const [repurchasesError, setRepurchasesError] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [changedFields, setChangedFields] = useState<Record<string, { old: any, new: any }>>({});


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
    const agreeRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!file) {
            setPreview(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    };


    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        article: '',
        brand: '',
        category: Category.WOMEN,
        key_word: '',
        general_repurchases: '',
        daily_repurchases: '',
        price: '',
        wb_price: '',
        tg: '',
        payment_time: PayoutTime.AFTER_REVIEW,
        review_requirements: '',
        requirements_agree: false,
        image_path: '',
    });

    const handleKeyDown = (index: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (index === 8) {
                reviewRequirementsRef.current?.focus();
            } else {
                inputRefs[index + 1]?.current?.focus();
            }
        }
    };


    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');


    useEffect(() => {
        if (!isEditMode) {
            setLoading(false);
            return;
        }

        (async () => {
            try {
                const response = await getProductById(productId!);
                const data = response.data;

                const loadedData: ProductFormData = {
                    id: data.id,
                    name: data.name,
                    article: data.article,
                    brand: data.brand,
                    category: data.category,
                    key_word: data.key_word,
                    general_repurchases: String(data.general_repurchases),
                    daily_repurchases: String(data.daily_repurchases),
                    price: String(data.price),
                    wb_price: String(data.wb_price),
                    tg: data.tg,
                    payment_time: data.payment_time,
                    review_requirements: data.review_requirements,
                    requirements_agree: data.requirements_agree ?? false,
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

    // Обработчик для всех NumericInput
    const handleNumericFieldChange = (field: string, val: string) => {
        setFormData(prev => ({...prev, [field]: val}));
    };


    const validateField = (name: string, value: any, newFormData: ProductFormData) => {
        // Проверяем оба поля цены, если поменяли или цену покупателя, или цену на сайте
        if (['price', 'wb_price'].includes(name)) {
            const numPrice = Number(newFormData.price);
            const numWbPrice = Number(newFormData.wb_price);
            if (numPrice > numWbPrice) {
                setPriceError('Цена для покупателя не должна быть больше цены на сайте');
            } else {
                setPriceError('');
            }
        }

        // Аналогично — оба поля выкупа
        if (['daily_repurchases', 'general_repurchases'].includes(name)) {
            if (newFormData.daily_repurchases > newFormData.general_repurchases) {
                setRepurchasesError('Ежедневные выкупы не могут превышать общий план');
            } else {
                setRepurchasesError('');
            }
        }
    };


    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const {name, value, type, checked} = e.target as HTMLInputElement;
        const newValue = type === 'checkbox'
            ? checked
            : value;
        setFormData(prev => {
            const updated = {...prev, [name]: newValue};
            validateField(name, newValue, updated);
            return updated;
        });
    }


    useEffect(() => {
        const removeBackListener = on('back_button_pressed', () => {
            navigate(-1);
        });

        return () => {
            removeBackListener();
        };
    }, [navigate]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (isEditMode && originalFormData) {
            const changes: Record<string, { old: any, new: any }> = {};
            Object.keys(formData).forEach((key) => {
                if (formData[key as keyof ProductFormData] !== originalFormData[key as keyof ProductFormData]) {
                    changes[key] = {
                        old: originalFormData[key as keyof ProductFormData],
                        new: formData[key as keyof ProductFormData],
                    };
                }
            });
            if (Object.keys(changes).length > 0) {
                setChangedFields(changes);
                setShowConfirmation(true);
                return;
            }
        }
        await submitData();
    };

    const submitData = async () => {

        try {
            const fd = new FormData();
            fd.append('name', formData.name);
            fd.append('article', formData.article);
            fd.append('brand', formData.brand);
            fd.append('category', formData.category);
            fd.append('key_word', formData.key_word);
            fd.append('general_repurchases', String(formData.general_repurchases));
            fd.append('daily_repurchases', String(formData.daily_repurchases));
            fd.append('price', String(Number(formData.price)));
            fd.append('wb_price', String(formData.wb_price));
            fd.append('tg', formData.tg);
            fd.append('payment_time', formData.payment_time);
            fd.append('review_requirements', formData.review_requirements);
            fd.append('requirements_agree', String(formData.requirements_agree));

            if (file) {
                fd.append('image', file);
            }

            if (isEditMode) {
                await updateProduct(productId!, fd);
                navigate(`/product/${productId}/seller`);
            } else {
                const newId = await createProduct(fd);
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
        <div className="p-4 max-w-screen-sm bg-gradient-t-gray mx-auto">
            <div className="sticky top-0 z-10 bg-gradient-t-gray">
                <div className="flex justify-between items-center px-2 py-1">
                    <button
                        onClick={() => navigate('/')}
                        type="button"
                        className="inline-flex items-center justify-center whitespace-nowrap py-1 px-1 text-xs font-semibold border border-gradient-r-brand text-brand bg-transparent rounded appearance-none focus:outline-none"
                    >
                        Отменить
                    </button>
                </div>
                <div className="px-2">
                    <h1 className="text-center text-base font-bold -mt-1">
                        {isEditMode ? 'Редактировать товар' : 'Добавить товар'}
                    </h1>
                </div>
            </div>


            <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
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
                        className="w-full border border-gradient-tr-darkGray rounded-md p-2 text-sm"
                        placeholder="Название товара"
                    />
                </div>

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
                        className="w-full border border-gradient-tr-darkGray rounded-md p-2 text-sm"
                        placeholder="Артикул"
                    />
                </div>

                <FileUploader
                    label="Фото товара"
                    file={file}
                    preview={preview}
                    onFileChange={setFile}
                />


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
                        className="w-full border border-gradient-tr-darkGray rounded-md p-2 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Категория</label>
                    <select

                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full border border-gradient-tr-darkGray rounded-md p-2 text-sm"
                    >
                        {Object.values(Category).map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>

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
                        className="w-full border border-gradient-tr-darkGray rounded-md p-2 text-sm"
                        placeholder="Например, 'рубашка в клетку'"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Общий план выкупов</label>
                    <NumericInput
                        name="general_repurchases"
                        value={formData.general_repurchases}
                        onValueChange={handleNumericFieldChange}
                        onKeyDown={handleKeyDown(4)}
                        className="w-full border border-gradient-tr-darkGray rounded-md p-2 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">План выкупов на сутки</label>
                    <NumericInput
                        name="daily_repurchases"
                        value={formData.daily_repurchases}
                        onValueChange={handleNumericFieldChange}
                        onKeyDown={handleKeyDown(5)}
                        className="w-full border border-gradient-tr-darkGray rounded-md p-2 text-sm"
                    />
                    {repurchasesError && (
                        <p className="text-red-500 text-xs mt-1">{repurchasesError}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Цена на сайте WB (₽)</label>
                    <NumericInput
                        name="wb_price"
                        value={formData.wb_price}
                        onValueChange={handleNumericFieldChange}
                        onKeyDown={handleKeyDown(6)}
                        className="w-full border border-gradient-tr-darkGray rounded-md p-2 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Цена для покупателя (₽)</label>
                    <NumericInput
                        name="price"
                        value={formData.price}
                        onValueChange={handleNumericFieldChange}
                        onKeyDown={handleKeyDown(7)}
                        className="w-full border border-gradient-tr-darkGray rounded-md p-2 text-sm"
                    />
                    {priceError && (
                        <p className="text-red-500 text-xs mt-1">{priceError}</p>
                    )}
                </div>


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
                        className="w-full border border-gradient-tr-darkGray rounded-md p-2 text-sm"
                        placeholder="@username"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Когда выплата </label>
                    <select
                        name="payment_time"
                        value={formData.payment_time}
                        onChange={handleInputChange}
                        className="w-full border border-gradient-tr-darkGray rounded-md p-2 text-sm"
                    >
                        {Object.values(PayoutTime).map((pt) => (
                            <option key={pt} value={pt}>
                                {pt}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Требования к отзыву</label>
                    <textarea
                        name="review_requirements"
                        ref={reviewRequirementsRef}
                        onKeyDown={handleTextareaKeyDown}
                        value={formData.review_requirements}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full border border-gradient-tr-darkGray rounded-md p-2 text-sm"
                        placeholder="Опишите требования к отзыву..."
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        name="requirements_agree"
                        id="requirements_agree"
                        checked={formData.requirements_agree}
                        onChange={handleInputChange}
                        ref={agreeRef}
                        className="h-4 w-4 text-brand border-gradient-tr-darkGray rounded"
                    />
                    <label htmlFor="requirements_agree" className="text-sm">
                        Согласовать отзыв
                    </label>
                </div>
                <button
                    type="submit"
                    className="w-full py-3 bg-gradient-r-brand text-white rounded-md text-sm font-semibold hover:bg-gradient-r-brand-dark transition-colors"
                >
                    Отправить заявку
                </button>
            </form>
            {showConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-gradient-tr-white p-6 rounded shadow-lg max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Вы изменили:</h2>
                        <div className="bg-gradient-r-brandlight rounded p-4">
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
                                className="px-4 py-2 bg-gradient-tr-white border border-gradient-r-brand rounded text-brand hover:bg-gray-100"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={async () => {
                                    setShowConfirmation(false);
                                    await submitData();
                                }}
                                className="px-4 py-2 bg-gradient-tr-white text-brand rounded border border-gradient-r-brand"
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

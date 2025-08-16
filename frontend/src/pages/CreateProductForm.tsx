import React, {ChangeEvent, FormEvent, useEffect, useRef, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {createProduct, getProductById, updateProduct} from '../services/api';
import {Category, PayoutTime} from '../enums';
import FileUploader from "../components/FileUploader";
import {NumericInput} from "../components/NumericInput";

interface ProductFormData {
    id?: string;
    name: string;
    article: string;
    brand: string;
    category: Category | '';
    key_word: string;
    general_repurchases: string;
    // daily_repurchases: string;
    price: string;
    wb_price: string;
    tg: string;
    payment_time: PayoutTime;
    review_requirements: string;
    requirements_agree: boolean;
    image_path?: string;
}

//todo: написать паттерны в инпуты
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

    const fieldLabels: Record<keyof ProductFormData, string> = {
        id: 'ID товара',
        name: 'Название товара',
        article: 'Артикул',
        brand: 'Бренд',
        category: 'Категория',
        key_word: 'Ключевое слово',
        general_repurchases: 'Кол-во сделок по выкупу товара',
        // daily_repurchases: 'План выкупов на сутки',
        price: 'Цена для покупателя',
        wb_price: 'Цена на сайте WB',
        tg: 'Телеграм для связи',
        payment_time: 'Время выплаты',
        review_requirements: 'Требования к отзыву',
        requirements_agree: 'Согласование отзыва',
        image_path: 'Фото товара',
    };

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
        category: '',
        key_word: '',
        general_repurchases: '',
        // daily_repurchases: '',
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
            if (index === inputRefs.length - 1) {
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
                    // daily_repurchases: String(data.daily_repurchases),
                    price: String(data.price),
                    wb_price: String(data.wb_price),
                    tg: data.tg,
                    payment_time: data.payment_time,
                    review_requirements: data.review_requirements,
                    requirements_agree: data.requirements_agree ?? false,
                    image_path: data.image_path || '',
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
        // if (['daily_repurchases', 'general_repurchases'].includes(name)) {
        //     if (newFormData.daily_repurchases > newFormData.general_repurchases) {
        //         setRepurchasesError('Ежедневные выкупы не могут превышать общий план');
        //     } else {
        //         setRepurchasesError('');
        //     }
        // }
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

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

          if (formData.category === '') {
    alert('Пожалуйста, выберите категорию');
    return;
  }

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
            // fd.append('daily_repurchases', String(formData.daily_repurchases));
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
                navigate(`/create-product/${newId}/instruction`);
            }
        } catch (err) {
            console.error('Ошибка при сохранении товара:', err);
            alert('Не удалось сохранить товар');
        }
    };


    if (loading) {
        return <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-gray-600 always-spin"/>
            </div>;
    }

    if (error) {
        return <div className="p-4 text-red-600">{error}</div>;
    }


    return (
        <div className="p-4 max-w-screen-sm bg-gray-200 mx-auto">
            <div className="sticky top-0 z-10 bg-gray-200">
                <div className="flex justify-between items-center px-2 py-1">
                    <button
                        onClick={() => navigate('/seller-cabinet')}
                        type="button"
                        className="inline-flex items-center justify-center whitespace-nowrap py-1 px-1 text-xs font-semibold border border-brand text-brand bg-transparent rounded appearance-none focus:outline-none"
                    >
                        Отменить
                    </button>
                </div>
                <div className="px-2">
                    <h1 className="text-center text-lg font-bold -mt-1">
                        {isEditMode ? 'Редактировать товар' : 'Создание карточки товара'}
                    </h1>
                    <div className="text-sm mb-2">
                    Заполните информацию о товаре раздачи:
                </div>
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
                        className="w-full border border-darkGray rounded-md p-2 text-sm"
                        placeholder="Например, 'Рубашка'"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Артикул на WB</label>
                    <input
                        type="text"
                        ref={inputRefs[1]}
                        onKeyDown={handleKeyDown(1)}
                        name="article"
                        value={formData.article}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-darkGray rounded-md p-2 text-sm"
                        placeholder="123456789"
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
                        className="w-full border border-darkGray rounded-md p-2 text-sm"
                        placeholder="Avocado.ceo"
                    />
                </div>

<div>
  <label className="block text-sm font-medium mb-1">Категория</label>
  <select
    name="category"
    value={formData.category}
    onChange={handleInputChange}
    required
    className={`w-full border border-darkGray rounded-md p-2 text-sm ${formData.category === '' ? 'text-gray-400' : ''}`}
  >
    <option value="" disabled hidden>Выбрать категорию</option>
    {Object.values(Category).map((cat) => (
      <option key={cat} value={cat}>{cat}</option>
    ))}
  </select>
</div>


                <div>
                    <label className="block text-sm font-medium mb-1">Ключевое слово для поиска</label>
                    <input
                        type="text"
                        ref={inputRefs[3]}
                        onKeyDown={handleKeyDown(3)}
                        name="key_word"
                        value={formData.key_word}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-darkGray rounded-md p-2 text-sm"
                        placeholder="Например, 'Рубашка в клетку'"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Кол-во сделок по выкупу товара</label>
                    <NumericInput
                        name="general_repurchases"
                        ref={inputRefs[4]}
                        onKeyDown={handleKeyDown(4)}
                        value={formData.general_repurchases}
                        onValueChange={handleNumericFieldChange}
                        className="w-full border border-darkGray rounded-md p-2 text-sm"
                        placeholder="100"
                    />
                </div>

                {/*<div>*/}
                {/*    <label className="block text-sm font-medium mb-1">План выкупов на сутки</label>*/}
                {/*    <NumericInput*/}
                {/*        name="daily_repurchases"*/}
                {/*        ref={inputRefs[5]}*/}
                {/*        onKeyDown={handleKeyDown(5)}*/}
                {/*        value={formData.daily_repurchases}*/}
                {/*        onValueChange={handleNumericFieldChange}*/}
                {/*        className="w-full border border-darkGray rounded-md p-2 text-sm"*/}
                {/*    />*/}
                {/*    {repurchasesError && (*/}
                {/*        <p className="text-red-500 text-xs mt-1">{repurchasesError}</p>*/}
                {/*    )}*/}
                {/*</div>*/}

                <div>
                    <label className="block text-sm font-medium mb-1">Цена на WB</label>
                    <NumericInput
                        name="wb_price"
                        ref={inputRefs[6]}
                        onKeyDown={handleKeyDown(6)}
                        value={formData.wb_price}
                        onValueChange={handleNumericFieldChange}
                        className="w-full border border-darkGray rounded-md p-2 text-sm"
                        placeholder="₽"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Цена для покупателя</label>
                    <NumericInput
                        name="price"
                        ref={inputRefs[7]}
                        onKeyDown={handleKeyDown(7)}
                        value={formData.price}
                        onValueChange={handleNumericFieldChange}
                        className="w-full border border-darkGray rounded-md p-2 text-sm"
                        placeholder="₽"
                    />
                    {priceError && (
                        <p className="text-red-500 text-xs mt-1">{priceError}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Выплата кешбэка покупателю</label>
                    <select
                        name="payment_time"
                        value={formData.payment_time}
                        onChange={handleInputChange}
                        className="w-full border border-darkGray rounded-md p-2 text-sm"
                    >
                        {Object.values(PayoutTime).map((pt) => (
                            <option key={pt} value={pt}>
                                {pt}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Telegram продавца для вопросов покупателя по товару</label>
                    <input
                        type="text"
                        ref={inputRefs[8]}
                        onKeyDown={handleKeyDown(8)}
                        name="tg"
                        value={formData.tg}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-darkGray rounded-md p-2 text-sm"
                        placeholder="@username"
                    />
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
                        className="w-full border border-darkGray rounded-md p-2 text-sm"
                        placeholder="Например, 'Отзыв должен содержать фото/видео товара без упаковки, подробности опыта использования товара от 2–3 предложений, оценку 5 звёзд и т.д.'"
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
                        className="text-brand border-darkGray rounded h-8 w-8"
                    />
                    <label htmlFor="requirements_agree" className="text-sm">
                        Отзыв покупателя должен быть согласован с продавцом
                    </label>
                </div>
                <button
                    type="submit"
                    className="w-full py-3 bg-brand text-white rounded-md text-sm font-semibold hover:bg-brand-dark transition-colors"
                >
                    Отправить заявку
                </button>
            </form>
            {showConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Вы изменили:</h2>
                        <div className="bg-brandlight rounded p-4">
                            <ul className="text-sm mb-4">
                                {Object.entries(changedFields).map(([field, vals]) => (
                                    <li key={field}>
                                        <strong>{fieldLabels[field as keyof ProductFormData] || field}</strong>:&nbsp;
                                        {String(vals.old)} → {String(vals.new)}
                                    </li>
                                ))}
                            </ul>
                            <div className="flex justify-end gap-3">
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={() => setShowConfirmation(false)}
                                className="px-4 py-2 bg-white border border-brand rounded text-brand hover:bg-gray-200-100"
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
);
            }

export default ProductForm;

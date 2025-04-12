import React, {ChangeEvent, FormEvent, useEffect, useState} from 'react';
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
                setFormData({
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
                });

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

    // Изменение простых полей (string, number, т.д.)
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        // Если поле числовое, нужно парсить (general_repurchases, daily_repurchases, price, wb_price)
        if (['general_repurchases', 'daily_repurchases', 'price', 'wb_price'].includes(name)) {
            setFormData((prev) => ({
                ...prev,
                [name]: Number(value),
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
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
        return (
            <div className="p-4 bg-brandlight border border-brand rounded text-center">
                <p className="text-sm text-brand">{error}</p>
            </div>
        );
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
                        name="general_repurchases"
                        value={formData.general_repurchases}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    />
                </div>

                {/* Выкупы на сутки */}
                <div>
                    <label className="block text-sm font-medium mb-1">План выкупов на сутки</label>
                    <input
                        type="number"
                        name="daily_repurchases"
                        value={formData.daily_repurchases}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    />
                </div>

                {/* Цена */}
                <div>
                    <label className="block text-sm font-medium mb-1">Цена для покупателя</label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    />
                </div>

                {/* Цена на ВБ */}
                <div>
                    <label className="block text-sm font-medium mb-1">Цена на сайте WB (руб.)</label>
                    <input
                        type="number"
                        name="wb_price"
                        value={formData.wb_price}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    />
                </div>

                {/* Telegram */}
                <div>
                    <label className="block text-sm font-medium mb-1">Телеграм для связи</label>
                    <input
                        type="text"
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
                        value={formData.review_requirements}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full border border-gray-300 rounded-md p-2 text-sm"
                        placeholder="Опишите требования к отзыву..."
                    />
                </div>
            </form>
        </div>
    );
}

export default ProductForm;

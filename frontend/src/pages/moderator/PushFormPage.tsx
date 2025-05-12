import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPush, updatePush, getPush } from '../../services/api';
import { on } from "@telegram-apps/sdk";

interface Push {
    id: string;
    title: string;
    text: string;
}

const PushFormPage: React.FC = () => {
    const { pushId } = useParams<{ pushId?: string }>();
    const isEditMode = Boolean(pushId);
    const navigate = useNavigate();

    const [title, setTitle] = useState<string>('');
    const [text, setText] = useState<string>('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [buttonText, setButtonText] = useState<string>('');
    const [buttonLink, setButtonLink] = useState<string>('');

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const removeBackListener = on('back_button_pressed', () => {
            if (isEditMode && pushId) {
                navigate(`/moderator/pushes/${pushId}`);
            } else {
                navigate(`/moderator/pushes`);
            }
        });
        return () => {
            removeBackListener();
        };
    }, [navigate, isEditMode, pushId]);

    useEffect(() => {
        if (isEditMode && pushId) {
            setLoading(true);
            getPush(pushId)
                .then((response) => {
                    const pushData = response.data as Push;
                    setTitle(pushData.title);
                    setText(pushData.text);

                    if ((response.data as any).button_text) {
                        setButtonText((response.data as any).button_text);
                    }
                    if ((response.data as any).button_link) {
                        setButtonLink((response.data as any).button_link);
                    }
                })
                .catch((err) => {
                    console.error('Ошибка получения рассылки:', err);
                    setError('Не удалось загрузить данные рассылки');
                })
                .finally(() => setLoading(false));
        }
    }, [isEditMode, pushId]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !text.trim()) {
            alert('Пожалуйста, заполните все обязательные поля.');
            return;
        }
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('text', text);
            if (imageFile) {
                formData.append('image', imageFile);
            }
            formData.append('button_text', buttonText);
            formData.append('button_link', buttonLink);

            if (isEditMode && pushId) {
                await updatePush(pushId, formData);
                alert('Рассылка успешно обновлена!');
                navigate(`/moderator/pushes/${pushId}`);
            } else {
                await createPush(formData);
                alert('Рассылка успешно создана!');
                navigate('/moderator/pushes');
            }
        } catch (err) {
            console.error('Ошибка отправки формы:', err);
            setError('Ошибка сохранения данных. Попробуйте еще раз.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 max-w-lg mx-auto bg-gray-200-100 rounded shadow">
            <h1 className="text-2xl font-bold mb-4">
                {isEditMode ? 'Редактировать рассылку' : 'Создать новую рассылку'}
            </h1>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            {loading ? (
                <div>Загрузка...</div>
            ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium mb-1">
                            Название
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-2 border border-darkGray rounded"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="text" className="block text-sm font-medium mb-1">
                            Текст рассылки
                        </label>
                        <textarea
                            id="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full p-2 border border-darkGray rounded"
                            rows={4}
                            required
                        ></textarea>
                    </div>
                    <div>
                        <label htmlFor="image" className="block text-sm font-medium mb-1">
                            Изображение (опционально)
                        </label>
                        <input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label htmlFor="buttonText" className="block text-sm font-medium mb-1">
                            Текст кнопки (опционально)
                        </label>
                        <input
                            id="buttonText"
                            type="text"
                            value={buttonText}
                            onChange={(e) => setButtonText(e.target.value)}
                            placeholder="Введите текст кнопки"
                            className="w-full p-2 border border-darkGray rounded"
                        />
                    </div>
                    <div>
                        <label htmlFor="buttonLink" className="block text-sm font-medium mb-1">
                            Ссылка для кнопки (опционально)
                        </label>
                        <input
                            id="buttonLink"
                            type="text"
                            value={buttonLink}
                            onChange={(e) => setButtonLink(e.target.value)}
                            placeholder="Введите URL для кнопки"
                            className="w-full p-2 border border-darkGray rounded"
                        />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={() => navigate(isEditMode && pushId ? `/moderator/pushes/${pushId}` : '/moderator/pushes')}
                            className="px-4 py-2 border border-darkGray rounded"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            {isEditMode ? 'Сохранить изменения' : 'Создать рассылку'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default PushFormPage;

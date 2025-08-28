import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductById } from '../services/api';
import { AxiosResponse } from 'axios';
import { useUser } from '../contexts/user';

interface Product {
    id: string;
    name: string;
    seller_id: string;
    brand: string;
    article: string;
    price: number;
    wb_price: number;
    tg: string;
    payment_time: string;
    review_requirements: string;
}

export default function InstructionSellerPage() {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const { user } = useUser();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [agreeRules, setAgreeRules] = useState(false);

    const preview = new URLSearchParams(window.location.search).get('preview') === '1';

    useEffect(() => {
        if (!productId) return;
        getProductById(productId)
            .then((response: AxiosResponse<Product>) => setProduct(response.data))
            .catch((err) => {
                console.error('Ошибка при загрузке товара:', err);
                setError('Не удалось загрузить данные о товаре');
            })
            .finally(() => setLoading(false));
    }, [productId]);

    const canContinue = agreeRules;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!canContinue || !productId) return;
        navigate(`/product/${productId}/seller`);
    };


    if (loading || error || !product) {
        return <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-gray-600 always-spin"/>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4 text-sm">
            <form onSubmit={handleSubmit} className="max-w-screen-md w-full bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-center">Ваша заявка на размещение товара принята!</h2>

                <section className="mb-6">
                    <h3 className="text-xl font-semibold mb-2">🔍 Что дальше:</h3>
                    <ul className="list-disc list-inside text-gray-800 space-y-1">
                        <li>Ваша заявка передана на модерацию.</li>
                        <li>Проверка займет до <strong>24 часов</strong> (обычно быстрее).</li>
                        <li>После одобрения товар появится в списке доступных для выкупа.</li>
                    </ul>
                </section>


                <hr className="border-t border-gray-300 my-6" />

                <section className="mb-6">
                    <h3 className="text-xl font-semibold mb-2">⚠️ Рекомендуем ознакомиться с правилами сервиса и раздачи товара:</h3>
                    <p>Перед размещением товара убедитесь, что вы:</p>
                <section className="mb-6 space-y-2">
                        <p>✅<strong> Готовы выплатить кешбэк</strong> за каждый выкуп, если покупатель выполнил условия.</p>
                        <p>✅ Указали <strong>точные условия</strong>: артикул, цену на сайте WB и для покупателя, срок выплаты кешбэка, требования к отзыву.</p>
                        <p>✅ Указали <strong>контакт для связи</strong> (Telegram).</p>
                        <p>✅ Знаете, что <strong>выплаты вы делаете сами</strong>, бот не участвует в переводах.</p>
                        <p>✅ Готовы проверять отчёты и платить кешбэк в заявленный срок.</p>
                </section>
                                    </section>


                <section className="mb-6 space-y-2">
                    <p>📌 Мошеннические действия приведут к <strong>блокировке кабинета без возврата средств</strong>.</p>
                    <p>📥 Карточки с обманными или запутанными условиями <strong>не пройдут модерацию</strong>.</p>
                    <p>🧾 Напоминаем, что все отчёты от покупателей будут доступны в разделе <strong>«Отчёты по выкупам»</strong>.</p>
                </section>
                                <hr className="border-t border-gray-300 my-6" />


                <p className="mt-2">
                    Если у вас остались вопросы — напишите в <a href="https://t.me/wbcashmoney" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">техподдержку</a>.
                </p>
                                <hr className="border-t border-gray-300 my-6" />


                {!preview && (
                    <>
                        <div className="mt-6 mb-4 flex items-center">
                            <input
                                type="checkbox"
                                id="agreeRules"
                                className="mr-3"
                                checked={agreeRules}
                                onChange={(e) => setAgreeRules(e.target.checked)}
                            />
                            <label htmlFor="agreeRules" className="text-gray-800">
                                Я ознакомлен(а) с правилами и подтверждаю, что при размещении товара обязуюсь выплатить кешбэк при получении корректного отчёта.
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={!canContinue}
                            className={`w-full py-2 rounded-lg text-base font-semibold mb-2 ${
                                canContinue
                                    ? 'bg-brand text-white hover:bg-brand-dark'
                                    : 'bg-white border border-brand text-brand cursor-not-allowed'
                            }`}
                        >
                            Отправить заявку
                        </button>
                    </>
                )}
            </form>
        </div>
    );
}

import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {getBlackListUser, getOrderById, getOrderReport, getProductById, updateOrder} from '../../services/api';
import {on} from "@telegram-apps/sdk";
import {AxiosResponse} from "axios";
import GetUploadLink from "../../components/GetUploadLink";


interface OrderReport {
    step: number;
    search_screenshot_path?: string;
    cart_screenshot_path?: string;
    card_number?: string;
    phone_number?: string;
    name?: string;
    bank?: string;
    final_cart_screenshot_path?: string;
    delivery_screenshot_path?: string;
    barcodes_screenshot_path?: string;
    review_screenshot_path?: string;
    receipt_screenshot_path?: string;
    receipt_number?: string;
    article: string;
}

interface Order {
    id: string;
    product: Product;
    seller: User
}

interface User {
    nickname: string
}

interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    article: string;
    image_path?: string;
    wb_price: number;
    payment_time: string;
    shortDescription?: string;
    seller_id: string;
}

function PaymentDetailsPage() {
    const navigate = useNavigate();
    const {orderId} = useParams<{ orderId: string }>();

    const [cardNumber, setCardNumber] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [fullName, setFullName] = useState('');
    const [selectedBank, setSelectedBank] = useState('');
    const [reportData, setReportData] = useState<OrderReport | null>(null);
    const [showReport, setShowReport] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [otherBank, setOtherBank] = useState('');
    const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const location = useLocation();
    const cameFromOrders = Boolean(location.state?.fromOrders);

    const toggleStep = (step: number) => {
        setExpandedSteps(prev => ({...prev, [step]: !prev[step]}));
    };
    const handleChange = (e: any) => {
        setSelectedBank(e.target.value);
        if (e.target.value !== 'Другое') {
            setOtherBank('');
        }
    };
    const canContinue =
        cardNumber.trim() !== '' &&
        phoneNumber.trim() !== '' &&
        fullName.trim() !== '' &&
        selectedBank !== '' &&
        agreed;


useEffect(() => {
  if (!orderId) return;
  Promise.all([
    getOrderById(orderId).then(res => setOrder(res.data)),
    getOrderReport(orderId).then(res => setReportData(res.data))
  ])
  .catch(err => setError('Не удалось загрузить данные'))
  .finally(() => setLoading(false));
}, [orderId]);


    const handleContinueClick = async () => {
        if (!canContinue || !orderId) return;
        try {
            await updateOrder(orderId, {
                step: 4,
                card_number: cardNumber,
                phone_number: phoneNumber,
                name: fullName,
                bank: selectedBank,
            });
            navigate(`/order/${orderId}/step-5`);
        } catch (err) {
            console.error('Ошибка при обновлении заказа:', err);
        }
    };

    const handleChannelClick = () => {
        window.open('https://t.me/Premiumcash1', '_blank'); //todo
    };
    const handleSupportClick = () => {
        if (window.Telegram?.WebApp?.close) {
            window.Telegram.WebApp.close();
        }
        window.open(process.env.REACT_APP_SUPPORT_URL, '_blank');
    };

    if (loading) return <div className="p-4">Загрузка...</div>;
    if (error || !order) return <div className="p-4 text-red-600">{error || 'Заказ не найден'}</div>;


    return (
        <div className="p-4 max-w-screen-md bg-gray-200 mx-auto">
            {cameFromOrders && (
                <div className="bg-green-50 border-l-4 border-green-500 text-green-800 p-4 mb-6 rounded">
                    <p className="font-semibold">
                        Вы остановились на четвертом шаге.
                    </p>
                    <p>Можете продолжить выкуп.</p>
                </div>
            )}

            <div className="bg-white border border-brand rounded-lg shadow p-4 space-y-4 mb-4">
<p className="text-xs text-gray-500">ВЫ ВСЕГДА МОЖЕТЕ ВЕРНУТЬСЯ К ЭТОМУ ШАГУ В РАЗДЕЛЕ "МОИ
                    ПОКУПКИ"</p>
                <h1 className="text-lg font-bold mb-2 text-brand">Шаг 4. Реквизиты для перевода кешбэка</h1>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Номер карты
                    </label>
                    <input
                        type="text"
                        placeholder="Введите номер карты"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full border border-darkGray rounded p-2 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Номер телефона
                    </label>
                    <input
                        type="text"
                        placeholder="Введите номер телефона"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full border border-darkGray rounded p-2 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Фамилия и имя
                    </label>
                    <input
                        type="text"
                        placeholder="Введите фамилию и имя"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full border border-darkGray rounded p-2 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Выберите банк
                    </label>
                    <select
                        value={selectedBank}
                        onChange={handleChange}
                        className="w-full border border-darkGray rounded p-2 text-sm"
                    >
                        <option value="">Выберите...</option>
                        <option value="Сбербанк">Сбербанк</option>
                        <option value="Тинькофф">Тинькофф</option>
                        <option value="Альфа-банк">Альфа-банк</option>
                        <option value="ВТБ">ВТБ</option>
                        <option value="Рнкб">Рнкб</option>
                        <option value="Газпромбанк">Газпромбанк</option>
                        <option value="Открытие">Открытие</option>
                        <option value="Райффайзен банк">Райффайзен банк</option>
                        <option value="Озон банк">Озон банк</option>
                        <option value="УБРиР">УБРиР</option>
                        <option value="Хоум кредит">Хоум кредит</option>
                        <option value="Яндекс">Яндекс</option>
                        <option value="Другое">Другое</option>
                    </select>
                    {selectedBank === 'Другое' && (
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-700">Введите банк</label>
                            <input
                                type="text"
                                value={otherBank}
                                onChange={(e) => setOtherBank(e.target.value)}
                                className="w-full border border-darkGray rounded p-2 text-sm"
                                placeholder="Введите название банка"
                            />
                        </div>
                    )}
                </div>

                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="agreeCorrectness"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="w-4 h-4"
                    />
                    <label htmlFor="agreeCorrectness" className="text-sm text-gray-700">
                        Подтверждаю правильность
                    </label>
                </div>
            </div>

            <button
                onClick={handleContinueClick}
                disabled={!canContinue}
                className={`w-full py-2 rounded text-brand mb-4 ${
                    canContinue
                        ? 'bg-brand text-white'
                        : 'bg-gray-200-400 border border-brand text-brand cursor-not-allowed'
                }`}
            >
                Продолжить
            </button>

            <button
                onClick={() => navigate(`/black-list/${order.seller.nickname}`)}
                className="w-full flex-1 bg-white text-gray-700 py-2 rounded-lg border border-brand text-center"
            >
                Проверить продавца
            </button>

            <div className="bg-white rounded-lg shadow p-4 mt-4">
                <p className="text-base font-medium mb-2">Заполняем реквизиты.<br />
Если вдруг указали не те реквизиты.<br />
Как связаться с тех поддержкой.
</p>
                <div className="bg-black" style={{ aspectRatio: '16/9' }}>
        <video
                        title="Инструкция"
                        src="https://storage.googleapis.com/images_avocado/VideoCashback/8%20Buyer%20Step%204%20Fill%20in%20the%20details%20If%20you%20have%20entered%20the%20wrong%20details%2C%20how%20to%20contact%20technical%20support%20Step%205.MP4"
                        controls
                        className="w-full h-full"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-3 mt-4">
                <button
                    onClick={() => setShowReport(prev => !prev)}
                className="bg-white border border-darkGray rounded-lg p-3 text-sm font-semibold flex items-center justify-center"
                >
                    {showReport ? 'Скрыть отчет' : 'Открыть отчет'}
                </button>


                {showReport && (
                    <div className="bg-white rounded-lg shadow p-4 mb-4">
                        <h3 className="text-lg font-bold mb-2">Отчет</h3>
                        {reportData ? (
                            <div className="space-y-2">
                                {/* Шаг 1 */}
                                <div className="bg-white rounded-lg shadow">
                                    <button
                                        onClick={() => toggleStep(1)}
                                        className="w-full flex justify-between items-center p-4 text-left"
                                    >
                                        <span className="font-semibold">Шаг 1. Скрины корзины</span>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className={`w-5 h-5 transform transition-transform ${
                                                expandedSteps[1] ? 'rotate-180' : ''
                                            }`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M19 9l-7 7-7-7"/>
                                        </svg>
                                    </button>
                                    {expandedSteps[1] && (
                                        <div className="border-t p-4 space-y-3">
                                            {reportData.search_screenshot_path && (
                                                <div>
                                                    <p className="text-sm font-semibold">Скрин поискового запроса</p>
                                                    <img
                                                        src={GetUploadLink(reportData.search_screenshot_path)}
                                                        alt="Скрин поискового запроса"
                                                        className="mt-1 w-full rounded"
                                                    />
                                                </div>
                                            )}
                                            {reportData.cart_screenshot_path && (
                                                <div>
                                                    <p className="text-sm font-semibold">Скрин корзины</p>
                                                    <img
                                                        src={GetUploadLink(reportData.cart_screenshot_path)}
                                                        alt="Скрин корзины"
                                                        className="mt-1 w-full rounded"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Шаг 2 */}
                                <div className="bg-white rounded-lg shadow">
                                    <button
                                        onClick={() => toggleStep(2)}
                                        className="w-full flex justify-between items-center p-4 text-left"
                                    >
                                        <span className="font-semibold">Шаг 2. Артикул товара</span>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className={`w-5 h-5 transform transition-transform ${
                                                expandedSteps[2] ? 'rotate-180' : ''
                                            }`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M19 9l-7 7-7-7"/>
                                        </svg>
                                    </button>
                                    {expandedSteps[2] && (
                                        <div className="border-t p-4">
                                            <p className="text-sm">{reportData.article}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Шаг 3 */}
                                <div className="bg-white rounded-lg shadow">
                                    <button
                                        onClick={() => toggleStep(3)}
                                        className="w-full flex justify-between items-center p-4 text-left"
                                    >
                                        <span className="font-semibold">Шаг 3. Товар и бренд в избранное</span>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className={`w-5 h-5 transform transition-transform ${
                                                expandedSteps[3] ? 'rotate-180' : ''
                                            }`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M19 9l-7 7-7-7"/>
                                        </svg>
                                    </button>
                                    {expandedSteps[3] && (
                                        <div className="border-t p-4">
                                            <p className="text-sm">Ваш товар и бренд успешно добавлены в избранное.</p>
                                        </div>
                                    )}
                                </div>
                                <div className="bg-white rounded-lg shadow p-4 mt-4 space-y-2 text-sm">
                                    <div className="font-semibold text-black">Шаг 4. Реквизиты для перевода кешбэка
                                    </div>
                                    <div className="font-semibold text-gray-400">Шаг 5. Оформление заказа</div>
                                    <div className="font-semibold text-gray-400">Шаг 6. Получение товара</div>
                                    <div className="font-semibold text-gray-400">Шаг 7. Отзыв</div>
                                </div>


                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">Отчет пока пуст.</p>
                        )}
                    </div>
                )}

                <button
                    onClick={handleSupportClick}
                    className="bg-white border border-darkGray rounded-lg p-3 text-sm font-semibold flex items-center justify-center"
                >
                    Нужна помощь с выполнением шага
                </button>

                 <button
                    onClick={handleChannelClick}
                    className="bg-white border border-darkGray rounded-lg p-3 text-sm font-semibold flex items-center justify-center"
                >
                    <img src="/icons/telegram.png" alt="Telegram" className="w-6 h-6" />
                    <span>Подписаться на канал</span>
                </button>
            </div>


        </div>
)}

export default PaymentDetailsPage;

import React, {useEffect, useRef, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {getOrderById, getOrderReport, updateOrder} from '../../services/api';
import {AxiosResponse} from 'axios';
import GetUploadLink from "../../components/GetUploadLink";
import FileUploader from "../../components/FileUploader";
import {VideoOverlay} from "../../App";
import OrderHeader from "../../components/OrderHeader";

interface Product {
    id: string;
    name: string;
    brand: string;
    article: string;
    price: number;
    wb_price: number;
    tg: string;
    seller_id: string;
    review_requirements: string;
    requirements_agree: boolean;
}

interface Order {
    id: string;
    product: Product;
    seller: User
    transaction_code: string;
}

interface User {
    nickname: string
}

interface OrderReport {
    step: number;
    search_screenshot_path?: string;
    cart_screenshot_path?: string;
    card_number?: string;
    phone_number?: string;
    name?: string;
    bank?: string;
    final_cart_screenshot?: string;
    delivery_screenshot_path?: string;
    barcodes_screenshot_path?: string;
    review_screenshot_path?: string;
    receipt_screenshot_path?: string;
    receipt_number?: string;
    article?: string;
}

type ModalContent = { src: string; isVideo: boolean };

function StepReviewReportPage() {
    const {orderId} = useParams<{ orderId: string }>();
    const navigate = useNavigate();

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reportData, setReportData] = useState<OrderReport | null>(null);

    const [leftReview, setLeftReview] = useState(false);

    const [checkNumber, setCheckNumber] = useState('');
    const [showReport, setShowReport] = useState(false);
    const [file1, setFile1] = useState<File | null>(null);
    const [preview1, setPreview1] = useState<string | null>(null);
    const handleHomeClick = () => navigate('/');

    const [file2, setFile2] = useState<File | null>(null);
    const [preview2, setPreview2] = useState<string | null>(null);
    const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});
    const [modalContent, setModalContent] = useState<ModalContent | null>(null);
    const [openSrc, setOpenSrc] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const feedbackImgPath = '/images/feedback.jpg';

    const [agreedWithSeller, setAgreedWithSeller] = useState(false);
    const [wroteInWB, setWroteInWB] = useState(false);


    const location = useLocation();
    const cameFromOrders = Boolean(location.state?.fromOrders);
    const isReviewDone = order?.product.requirements_agree
        ? wroteInWB    // если договорились с продавцом — смотрим на wroteInWB
        : leftReview;

    const openModal = (src: string) => {
        setModalContent({
            src,
            isVideo: src.toLowerCase().endsWith('.mp4')
        });
    };

    const closeModal = () => setModalContent(null);


    const toggleStep = (step: number) => {
        setExpandedSteps(prev => ({...prev, [step]: !prev[step]}));
    };


    useEffect(() => {
        if (!file1) {
            setPreview1(null);
            return;
        }
        const url = URL.createObjectURL(file1);
        setPreview1(url);
        return () => URL.revokeObjectURL(url);
    }, [file1]);

    useEffect(() => {
        if (!file2) {
            setPreview2(null);
            return;
        }
        const url = URL.createObjectURL(file2);
        setPreview2(url);
        return () => URL.revokeObjectURL(url);
    }, [file2]);

    const canContinue =
        isReviewDone &&
        file1 !== null &&
        file2 !== null &&
        checkNumber.trim() !== '';


    useEffect(() => {
        if (!orderId) return;
        getOrderReport(orderId)
            .then((response: AxiosResponse<OrderReport>) => {
                setReportData(response.data);
            })
            .catch((err) => {
                console.error('Ошибка при загрузке отчета:', err);
            });
    }, [orderId]);

    useEffect(() => {
        if (!orderId) {
            setError('Не указан orderId');
            setLoading(false);
            return;
        }
        getOrderById(orderId)
            .then((res: AxiosResponse<Order>) => {
                setOrder(res.data);
            })
            .catch((err) => {
                console.error('Ошибка при загрузке заказа:', err);
                setError('Не удалось загрузить данные о заказе');
            })
            .finally(() => setLoading(false));
    }, [orderId]);


    const handleLeftReviewChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setLeftReview(checked);
        if (!checked) {
            setFile1(null);
            setFile2(null);
            setCheckNumber('');
        }
    };

    const handleCheckSeller = () => {
        if (order && order.seller && order.seller.nickname) {
            window.open(`https://t.me/${order.seller.nickname}`, '_blank');
        } else {
            alert("Информация о продавце недоступна");
        }
    };


    const handleContinue = async () => {
        if (!canContinue || !orderId) return;
        try {
            await updateOrder(orderId, {
                step: 7,
                review_screenshot: file1,
                receipt_screenshot: file2,
                receipt_number: checkNumber,
            });
            navigate(`/order/${orderId}/order-info`);
        } catch (err) {
            console.error('Ошибка при обновлении заказа:', err);
        }
    };

    const handleSupportClick = () => {
        if (window.Telegram?.WebApp?.close) {
            window.Telegram.WebApp.close();
        }
        window.open(process.env.REACT_APP_SUPPORT_URL, '_blank');
    };


    if (loading) return <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="h-10 w-10 rounded-full border-4 border-gray-300 border-t-gray-600 always-spin"/>
            </div>;
    if (error || !order) return <div className="p-4 text-red-600">{error || 'Заказ не найден'}</div>;

    const videos = [
        {
            id: 1,
            title: '🎥 Пояснение, что нужно сделать на данном этапе ',
            src: 'https://storage.googleapis.com/images_avocado/VideoCashback/12%20Buyer%20Step%207%20What%20conditions%20must%20be%20met%20How%20to%20contact%20the%20buyer.MP4',
        },
        {
            id: 2,
            title: '🎥 Пояснение про сроки отправки отчета и как его оформить ',
            src: 'https://storage.googleapis.com/images_avocado/VideoCashback/13%20Buyer%20Step%207%20Review%20approval%20with%20the%20seller%20What%20to%20do%20if%20the%20seller%20does%20not%20respond%20Possible%20option%20without%20review%20approval.MP4',
        },
        {
            id: 3,
            title: '🎥 Пояснение, что нужно сделать на данном этапе ',
            src: 'https://storage.googleapis.com/images_avocado/VideoCashback/14%20Buyer%20Step%207%20Screenshot%20of%20the%20review%20publication%20Photo%20requirements%20Text%20requirements.MP4',
        },
        {
            id: 4,
            title: '🎥 Пояснение про сроки отправки отчета и как его оформить ',
            src: 'https://storage.googleapis.com/images_avocado/VideoCashback/15%20Buyer%20Step%207%20After%20the%20screenshot%20of%20the%20review%2C%20how%20to%20find%20the%20email.receipt%20Copying%20the%20receipt%20and%20screenshot.MP4',
        },
        {
            id: 5,
            title: '🎥 Пояснение про сроки отправки отчета и как его оформить ',
            src: 'https://storage.googleapis.com/images_avocado/VideoCashback/16%20Buyer%20Step%207%20Uploading%20screenshots%20and%20inserting%20the%20receipt%20number.MP4',
        },

    ];

    return (
        <div className="p-4 max-w-screen-md bg-gray-200 mx-auto">
            {cameFromOrders && (
                <div className="bg-green-50 border-l-4 border-green-500 text-green-800 p-4 mb-6 rounded">
                    <p className="font-semibold">
                        Вы остановились на седьмом шаге.
                    </p>
                    <p>Можете продолжить выкуп.</p>
                </div>
            )}
            <div className="flex items-center justify-between mb-4">

                <button
                    onClick={handleCheckSeller}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 240 240"
                        className="w-5 h-5"
                        fill="currentColor"
                    >
                        <path
                            d="M120 0C53.73 0 0 53.73 0 120s53.73 120 120 120 120-53.73 120-120S186.27 0 120 0zm57.07 84.27l-18.96 89.38c-1.44 6.48-5.27 8.08-10.7 5.03l-29.51-21.76-14.23 13.7c-1.57 1.57-2.87 2.87-5.83 2.87l2.09-29.63 53.95-48.66c2.35-2.09-.51-3.25-3.64-1.16l-66.55 41.91-28.68-9.0c-6.25-2.0-6.38-6.25 1.31-9.25l112.3-43.38c5.25-2.0 9.87 1.31 8.91 9.06z"
                        />
                    </svg>
                    <span>Написать продавцу</span>
                </button>

            </div>

            <div className="bg-white border border-brand p-3 rounded-md text-sm text-gray-700">
                <p className="text-xs text-gray-500"><strong>ВАЖНО!</strong> ВЫ ВСЕГДА МОЖЕТЕ ВЕРНУТЬСЯ К ЭТОМУ ШАГУ В
                    РАЗДЕЛЕ "МОИ
                    ПОКУПКИ"</p>
                {order && <OrderHeader transactionCode={order.transaction_code} />}
                <div className="space-y-2">

                <h1 className="text-lg font-bold">Шаг 7. Написание и публикация отзыва</h1>
                <p>📝 Напиши отзыв и согласуй с продавцом в Telegram перед публикацией (если нужно)
                </p>
                <p><strong>Важно!</strong> Не публикуй согласованный отзыв без предварительного одобрения
                    продавца, даже если он не отвечает более 5 дней, напомни ему о себе.
                </p>
                <p>⭐ Состав отзыва: 5 звёзд, фото/видео, подробности опыта использования товара</p>
                <p>📸 Прикрепи{' '}
      <span
        onClick={() => openModal(feedbackImgPath)}
        className="underline text-blue-600 cursor-pointer"
      >
        скриншот отзыва
      </span>{' '}
                    на WB</p>

                <p>🧾 Добавь электронный чек заказа из раздела "Финансы" (номер + скрин)
                </p>
                    {order.product.review_requirements && (
      <p>Требования к отзыву: {order.product.review_requirements}</p>
    )}

    <p>
      Согласование отзыва с продавцом{' '}
      <span
        onClick={handleCheckSeller}
        className="underline text-blue-600 cursor-pointer"
      >
        {order.seller.nickname}
      </span>
      : {order.product.requirements_agree ? 'Требуется' : 'Не требуется'}
    </p>


            </div>
            </div>

            {order.product.requirements_agree ? (
                <>
                    <div className="flex items-center mb-4 mt-2">
                        <input
                            type="checkbox"
                            id="agreedWithSeller"
                            className="mr-2 h-8 w-8"
                            checked={agreedWithSeller}
                            onChange={e => setAgreedWithSeller(e.target.checked)}
                        />
                        <label htmlFor="agreedWithSeller" className="text-sm text-gray-700">
                            Согласовал(а) отзыв товара с продавцом
                        </label>
                    </div>

                    <div className="flex items-center mb-4">
                        <input
                            type="checkbox"
                            id="wroteInWB"
                            className="mr-2 h-8 w-8"
                            checked={wroteInWB}
                            onChange={e => setWroteInWB(e.target.checked)}
                        />
                        <label htmlFor="wroteInWB" className="text-sm text-gray-700 mt-2">
                            Написал(а) отзыв товара в WB
                        </label>
                    </div>


                </>
            ) : (
                <div className="flex items-center mb-4">
                    <input
                        type="checkbox"
                        id="leftReview"
                        className="mr-2 h-8 w-8"
                        checked={leftReview}
                        onChange={handleLeftReviewChange}
                    />
                    <label htmlFor="leftReview" className="text-sm text-gray-700 mt-2">
                        Написал(а) отзыв товара в WB

                    </label>
                </div>
            )}

            {isReviewDone && (
                <>
                    <FileUploader
                        label="Скриншот отзыва товара в WB"
                        file={file1}
                        preview={preview1}
                        onFileChange={setFile1}
                    />
                    <FileUploader
                        label="Скриншот электронного чека заказа в WB"
                        file={file2}
                        preview={preview2}
                        onFileChange={setFile2}
                    />
                </>
            )}

            <div>
                <label className="block text-sm font-medium mb-1 mt-2">
                    Номер чека
                </label>
                <input
                    type="text"
                    value={checkNumber}
                    onChange={(e) => setCheckNumber(e.target.value)}
                    placeholder="Введите номер чека"
                    className="w-full border border-darkGray rounded-md p-2 text-sm"
                />
            </div>

            <section className="flex flex-col gap-2 mt-2 mb-2">

                    <button
                    onClick={handleContinue}
                    disabled={!canContinue}
                    className={`w-full py-2 rounded text-brand mb-4 ${canContinue ? 'bg-brand text-white' : 'bg-gray-200-400 border border-brand cursor-not-allowed'}`}
                >
                    Продолжить
                </button>
                </section>

            <div className="space-y-4">

                {videos.map(({id, title, src}) => (
                    <div key={id} className="bg-white rounded-lg shadow p-4">
                        <button
                            className="text-base font-medium mb-2 block text-blue-600 hover:underline"
                            onClick={() => setOpenSrc(src)}
                        >
                            {title}
                        </button>
                    </div>
                ))}

                <div className="flex flex-col gap-3 mt-4">
                    <button
                        onClick={() => setShowReport(prev => !prev)}
                        className="bg-white border border-darkGray rounded-lg p-3 text-sm font-semibold flex items-center justify-center"
                    >
                        {showReport ? 'Скрыть отчет' : 'Открыть отчет'}
                    </button>
                    {showReport && (
                        <div className="bg-white rounded-lg shadow p-4 mb-4">
                            <h3 className="text-lg font-bold mb-2">Отчёт по сделке выкупа товара</h3>
                            {reportData ? (
                                    <div className="space-y-2">
                                        {/* Шаг 1 */}
                                        <div className="bg-white rounded-lg shadow">
                                            <button
                                                onClick={() => toggleStep(1)}
                                                className="w-full flex justify-between items-center p-4 text-left"
                                            >
                                                <span className="font-semibold">Шаг 1. Скриншоты поиска и корзины</span>
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
                                                            <p className="text-sm font-semibold">Скриншот поискового запроса в WB
                                                            </p>
                                                            <img
                                                                src={GetUploadLink(reportData.search_screenshot_path)}
                                                                alt="Скриншот поискового запроса в WB"
                                                                className="mt-1 w-full rounded"
                                                            />
                                                        </div>
                                                    )}
                                                    {reportData.cart_screenshot_path && (
                                                        <div>
                                                            <p className="text-sm font-semibold">Скриншот корзины в WB</p>
                                                            <img
                                                                src={GetUploadLink(reportData.cart_screenshot_path)}
                                                                alt="Скриншот корзины в WB"
                                                                className="mt-1 w-full rounded"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Шаг 2 */}
                                        <div className="bg-white rounded-lg shadow">
                                            <button
                                                onClick={() => toggleStep(2)}
                                                className="w-full flex justify-between items-center p-4 text-left"
                                            >
                                                <span className="font-semibold"> Шаг 2. Артикул товара продавца</span>
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

                                        {/* Шаг 3 */}
                                        <div className="bg-white rounded-lg shadow">
                                            <button
                                                onClick={() => toggleStep(3)}
                                                className="w-full flex justify-between items-center p-4 text-left"
                                            >
                                                <span className="font-semibold">Шаг 3. Товар и бренд в избранное</span>
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
                                                    <p className="text-sm">Добавлены</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Шаг 4 */}
                                        <div className="bg-white rounded-lg shadow">
                                            <button
                                                onClick={() => toggleStep(4)}
                                                className="w-full flex justify-between items-center p-4 text-left"
                                            >
                                                <span className="font-semibold">Шаг 4. Реквизиты для перевода
                                            кешбэка</span>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className={`w-5 h-5 transform transition-transform ${
                                                        expandedSteps[4] ? 'rotate-180' : ''
                                                    }`}
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                          d="M19 9l-7 7-7-7"/>
                                                </svg>
                                            </button>
                                            {expandedSteps[4] && (
                                                <div className="border-t p-4 space-y-1">
                                                    {reportData.card_number &&
                                                        <p className="text-sm">Номер карты: {reportData.card_number}</p>}
                                                    {reportData.phone_number &&
                                                        <p className="text-sm">Номер телефона: {reportData.phone_number}</p>}
                                                    {reportData.name && <p className="text-sm">Получатель: {reportData.name}</p>}
                                                    {reportData.bank && <p className="text-sm">Банк: {reportData.bank}</p>}
                                                </div>
                                            )}
                                        </div>

                                        {/* Шаг 5 */}
                                        <div className="bg-white rounded-lg shadow">
                                            <button
                                                onClick={() => toggleStep(5)}
                                                className="w-full flex justify-between items-center p-4 text-left"
                                            >
                                                <span className="font-semibold">Шаг 5. Скриншот оформления заказа</span>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className={`w-5 h-5 transform transition-transform ${
                                                        expandedSteps[5] ? 'rotate-180' : ''
                                                    }`}
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                          d="M19 9l-7 7-7-7"/>
                                                </svg>
                                            </button>
                                            {expandedSteps[5] && reportData.final_cart_screenshot && (
                                                <div className="border-t p-4">
                                                    <p className="text-sm font-semibold">Скриншот заказа на WB</p>
                                                    <img
                                                        src={GetUploadLink(reportData.final_cart_screenshot)}
                                                        alt="Финальный Скриншот корзины в WB"
                                                        className="w-full rounded"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Шаг 6 */}
                                        <div className="bg-white rounded-lg shadow">
                                            <button
                                                onClick={() => toggleStep(6)}
                                                className="w-full flex justify-between items-center p-4 text-left"
                                            >
                                                <span className="font-semibold">Шаг 6. Скриншоты доставки и штрихкода</span>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className={`w-5 h-5 transform transition-transform ${
                                                        expandedSteps[6] ? 'rotate-180' : ''
                                                    }`}
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                          d="M19 9l-7 7-7-7"/>
                                                </svg>
                                            </button>
                                            {expandedSteps[6] && (
                                                <div className="border-t p-4 space-y-3">
                                                    {reportData.delivery_screenshot_path && (
                                                        <div>
                                                            <p className="text-sm font-semibold">1. Скриншот статуса заказа в разделе "Доставки" на WB</p>
                                                            <img
                                                                src={GetUploadLink(reportData.delivery_screenshot_path)}
                                                                alt="Скрин доставки"
                                                                className="mt-1 w-full rounded"
                                                            />
                                                        </div>
                                                    )}
                                                    {reportData.barcodes_screenshot_path && (
                                                        <div>
                                                            <p className="text-sm font-semibold">2. Фотография разрезанного штрихкода на фоне товара</p>
                                                            <img
                                                                src={GetUploadLink(reportData.barcodes_screenshot_path)}
                                                                alt="Скрин штрихкодов"
                                                                className="mt-1 w-full rounded"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-white rounded-lg shadow p-4 mt-4 space-y-2 text-sm">
                                            <div className="font-semibold text-black">Шаг 7. Скриншот отзыва и эл.чека</div>
                                        </div>
                                    </div>

                                ) :
                                <p className="text-sm text-gray-500">Отчет пока пуст.</p>
                            }
                        </div>
                    )}
                    <button
                        onClick={() => navigate('/instruction')}
                        className="bg-white border border-darkGray rounded-lg p-3 text-sm font-semibold">
                        <span>Полная инструкция по выкупу товара</span>
                    </button>

                    <button
                        onClick={handleSupportClick}
                        className="bg-white border border-darkGray rounded-lg p-3 text-sm font-semibold flex items-center justify-center"
                    >
                        Нужна помощь с выполнением шага
                    </button>

                    <button
                        onClick={handleHomeClick}
                        className="bg-white border border-darkGray rounded-lg p-3 text-sm font-semibold flex items-center justify-center"
                    >
                        На главную
                    </button>

                </div>

                {modalContent && (
                    <>
                        {/* 1. Overlay */}
                        <div
                            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity duration-300 ease-out z-40"
                            onClick={closeModal}
                        />

                        {/* 2. Окно модалки */}
                        <div
                            className="fixed inset-0 flex justify-center items-center z-50"
                            onClick={closeModal}
                        >
                            <div
                                className="relative bg-white p-4 rounded-xl w-[90vw] h-[90vh] flex items-center justify-center"
                                onClick={e => e.stopPropagation()}
                            >
                                {/* Кнопка «×» */}
                                <button
                                    onClick={closeModal}
                                    className="absolute top-3 right-3 text-2xl leading-none"
                                >
                                    &times;
                                </button>

                                {modalContent.isVideo ? (
                                    <video
                                        src={modalContent.src}
                                        controls
                                        className="w-[95%] h-[95%] object-contain"
                                    />
                                ) : (
                                    <img
                                        src={modalContent.src}
                                        alt="Пример"
                                        className="w-[95%] h-[95%] object-contain"
                                    />
                                )}
                            </div>
                        </div>
                    </>
                )}

                {openSrc && (
                    <VideoOverlay onClose={() => setOpenSrc(null)}>
                        <div
                            className="relative bg-black p-4 max-h-[100vh] max-w-[92vw] overflow-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Close */}
                            <button
                                className="absolute top-2 right-2 z-20 text-white text-2xl"
                                onClick={() => setOpenSrc(null)}
                                aria-label="Close"
                            >
                                &times;
                            </button>

                            <video
                                ref={videoRef}
                                src={openSrc}
                                controls
                                muted
                                playsInline
                                className="block mx-auto max-h-[88vh] max-w-[88vw] object-contain"
                            />
                        </div>
                    </VideoOverlay>
                )}


            </div>


        </div>

    );
}


export default StepReviewReportPage;

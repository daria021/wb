import React from 'react';

function SellerBalancePage() {
    const handleContactAdmin = () => {
        window.open('https://t.me/snow_irbis20', '_blank');
    };

    return (
        <div className="min-h-screen bg-gray-200 flex flex-col justify-start items-center gap-4">
            <p className="text-center text-gray-700 mt-4 mx-4">
                Чтобы пополнить кабинет, свяжитесь с админом.
            </p>
            <button
                onClick={handleContactAdmin}
                className="p-2 rounded-lg text-white font-semibold bg-brand hover:bg-brand justify-center"
            >
                Написать администратору
            </button>
        </div>
    );
}

export default SellerBalancePage;
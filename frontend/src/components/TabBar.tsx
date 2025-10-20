import React from 'react';
import {useLocation, useNavigate} from 'react-router-dom';

interface TabItem {
    label: string;
    icon: string;
    path: string;
}

const tabs: TabItem[] = [
    { label: 'Каталог', icon: '/icons/about.png', path: '/' },
    { label: 'Мои товары', icon: '/icons/instruction.png', path: '/my-products' },
    { label: 'Кабинет продавца', icon: '/icons/book.png', path: '/seller-cabinet' },
    { label: 'Поддержка', icon: '/icons/support.png', path: '/support' },
];

function TabBar() {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => {
        if (path === '/') {
            return location.pathname === '/' || location.pathname.startsWith('/catalog');
        }
        return location.pathname.startsWith(path);
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
            <div className="grid grid-cols-4">
                {tabs.map((tab) => {
                    const active = isActive(tab.path);
                    return (
                        <button
                            key={tab.path}
                            onClick={() => navigate(tab.path)}
                            className={`flex flex-col items-center justify-center py-2 text-xs ${active ? 'text-brand font-semibold' : 'text-gray-600'}`}
                        >
                            <img src={tab.icon} alt={tab.label} className="w-5 h-5 mb-1"/>
                            <span className="font-body text-[10px] leading-tight text-center px-1">{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}

export default TabBar;



declare global {
    interface Window {
        Telegram: {
            WebApp: {
                initData?: string;
                initDataUnsafe?: {
                    query_id?: string;
                    user?: {
                        id: number;
                        first_name?: string;
                        last_name?: string;
                        username?: string;
                        photo_url?: string;
                        language_code?: string;
                    };
                    auth_date?: number;
                    hash?: string;
                };
                expand: () => void;
                close: () => void;
            };
        };
    }
}

export {};

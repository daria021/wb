import { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "../services/apiClient";
import {getMe} from "../services/api";

interface AuthContextType {
    userId: string | null;
    isModerator: boolean | null;
    isAdmin: boolean | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModerator, setIsModerator] = useState<boolean | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

    useEffect(() => {
        const authenticateUser = async () => {
            if (window.Telegram && window.Telegram.WebApp) {
                const tg = window.Telegram.WebApp;
                const initData = tg.initData;

                if (!initData) {
                    console.error("No initData found");
                    setLoading(false);
                    return;
                }

                try {
                    const response = await apiClient.post("/auth/telegram", { initData });
                    localStorage.setItem("authToken", response.data.access_token);
                    localStorage.setItem("refreshToken", response.data.refresh_token);
                    const me = await getMe();
                    setUserId(me.id);
                    setIsModerator(me.role === "moderator" || me.role === "admin");
                    setIsAdmin(me.role === "admin");
                } catch (error) {
                    console.error("Authentication failed", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        authenticateUser();
    }, []);

    return (
        <AuthContext.Provider value={{ userId, loading, isModerator, isAdmin }}>
    {children}
    </AuthContext.Provider>
);
};

// Hook for consuming authentication context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};

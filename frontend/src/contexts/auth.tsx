import React, { createContext, useContext, useEffect, useState } from "react";
import { getMe } from "../services/api";

interface AuthContextType {
    userId: string | null;
    isModerator: boolean;
    isAdmin: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isModerator, setIsModerator] = useState<boolean>(false);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    useEffect(() => {
        const authenticateUser = async () => {
            // Hardcoded tokens for browser startup
            localStorage.setItem(
                "authToken",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMjg1Y2Y1ZS01Mjk5LTQ1MDQtOWIxNi1hODA4ZmExMDI4ZTgiLCJleHAiOjE3NDYwNDU4MTEsImlzcyI6IndiLWJhY2siLCJhdWQiOiJ3Yi1mcm9udCJ9.pz6uAR8gBywD6YfLEmnpR-rK1uRL6rcxqRca1OUjTjk"
            );
            localStorage.setItem(
                "refreshToken",
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMjg1Y2Y1ZS01Mjk5LTQ1MDQtOWIxNi1hODA4ZmExMDI4ZTgiLCJleHAiOjE3NDYwMzM4MTEsImlzcyI6IndiLWJhY2siLCJhdWQiOiJ3Yi1mcm9udCJ9.NYpGFhNvAgQRJY4AGULxCyh3L143Tq5375u5kbscCZA"
            );

            try {
                const me = await getMe();
                setUserId(me.id);
                setIsModerator(me.role === "moderator" || me.role === "admin");
                setIsAdmin(me.role === "admin");
            } catch (error) {
                console.error("Failed to fetch user data", error);
            } finally {
                setLoading(false);
            }
        };

        authenticateUser();
    }, []);

    return (
        <AuthContext.Provider value={{ userId, isModerator, isAdmin, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
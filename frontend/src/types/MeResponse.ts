import { UserRole } from "../enums";

export interface MeResponse {
    id: string;
    telegram_id?: number;
    nickname?: string;
    role: "user" | "client" | "seller" | "moderator" | "admin";
    is_banned: boolean;
    balance?: number;
    created_at: string;
    updated_at: string;
}

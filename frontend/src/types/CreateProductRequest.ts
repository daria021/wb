import {Category, PayoutTime} from "../enums";

export interface CreateProductRequest {
    name: string;
    article: string;
    brand: string;
    category: Category;
    key_word: string;
    general_repurchases: number;
    // daily_repurchases: number;
    price: number;
    wb_price: number;
    tg: string;
    payment_time: PayoutTime;
    review_requirements: string;
    image_path?: string;
}

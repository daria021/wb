import {apiClient} from "./apiClient";
import {MeResponse} from "../types/MeResponse";

// Базовый URL вашего бэкенда (напр. http://localhost:9090, http://localhost:8000, ...)
// Можно вынести в .env => process.env.REACT_APP_API_URL
// const API_URL = 'http://localhost:9090';
//
// // Создаём экземпляр axios
// export const apiClient = axios.create({
//     baseURL: API_URL,
// });

// Получить список продуктов
export async function getProducts() {
    // Предполагается, что на бэкенде есть GET /products
    return await apiClient.get('/products');
}

// Получить продукт по его ID (UUID)
export async function getProductById(productId: string) {
    return apiClient.get(`/products/${productId}`);
}

export async function getUserOrders() {
    return apiClient.get(`/users/orders`);
}

export async function getOrderById(orderId: string) {
    return apiClient.get(`/orders/${orderId}`);
}

// Пример: получить продукт по артикулу
export async function getProductByArticle(article: string) {
    return apiClient.get(`/products/article?acticle=${article}`);
}

export async function getProductsBySellerId() {
    return apiClient.get(`/products/seller`);
}


export async function createProduct(formData: FormData):Promise<string> {
    const response = await apiClient.post('/products', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
}

export async function updateProduct(productId: string, formData: FormData):Promise<string> {
    const response = await apiClient.patch(`/products/${productId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    console.log(response.request.formData);
    return response.data;
}
export async function updateProductStatus(productId: string, formData: FormData):Promise<string> {
    const response = await apiClient.patch(`/products/status/${productId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    console.log(response.request.formData);
    return response.data;
}

export async function getMe():Promise<MeResponse>{
    return (await apiClient.get<MeResponse>(`users/me`)).data;
}

export async function createOrder(formData: FormData) {
    return apiClient.post('/orders', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
}

export async function getOrderReport(orderId: string){
    return apiClient.get(`/users/orders/report/${orderId}`);
}

export async function getOrderBySellerId(sellerId: string){
    return apiClient.get(`/users/orders/reports/${sellerId}`);
}

export async function increaseSellerBalance(sellerId: string, formData: FormData){
    return apiClient.patch(`/users/balance/${sellerId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
}
export async function getSellerBalance(sellerId: string){
    return apiClient.get(`/users/balance/${sellerId}`);
}

export async function updateOrderStatus(orderId: string, formData: FormData){
    return apiClient.patch(`/orders/status/${orderId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
}

// Обновление заказа (шаг 2..7)
export async function updateOrder(
    orderId: string,
    data: {
        step?: number;
        search_screenshot_path?: File; // если требуется обновление, например, для шага 1 (не всегда используется)
        cart_screenshot_path?: File;     // если требуется обновление, например, для шага 1 (не всегда используется)
        card_number?: string;
        phone_number?: string;
        name?: string;
        bank?: string;
        final_cart_screenshot?: File;
        delivery_screenshot?: File;
        barcodes_screenshot?: File;
        review_screenshot?: File;
        receipt_screenshot?: File;
        receipt_number?: string;
        status?: string;
    }
) {
    const formData = new FormData();

    // Добавляем числовые и текстовые поля
    if (data.step !== undefined) {
        formData.append('step', data.step.toString());
    }
    if (data.card_number) {
        formData.append('card_number', data.card_number);
    }
    if (data.phone_number) {
        formData.append('phone_number', data.phone_number);
    }
    if (data.name) {
        formData.append('name', data.name);
    }
    if (data.bank) {
        formData.append('bank', data.bank);
    }
    if (data.receipt_number) {
        formData.append('receipt_number', data.receipt_number);
    }
    if (data.status) {
        formData.append('status', data.status);
    }

    // Добавляем файлы (если переданы)
    if (data.search_screenshot_path) {
        formData.append('search_screenshot_path', data.search_screenshot_path);
    }
    if (data.cart_screenshot_path) {
        formData.append('cart_screenshot_path', data.cart_screenshot_path);
    }
    if (data.final_cart_screenshot) {
        formData.append('final_cart_screenshot', data.final_cart_screenshot);
    }
    if (data.delivery_screenshot) {
        formData.append('delivery_screenshot', data.delivery_screenshot);
    }
    if (data.barcodes_screenshot) {
        formData.append('barcodes_screenshot', data.barcodes_screenshot);
    }
    if (data.review_screenshot) {
        formData.append('review_screenshot', data.review_screenshot);
    }
    if (data.receipt_screenshot) {
        formData.append('receipt_screenshot', data.receipt_screenshot);
    }

    // Отправляем PATCH-запрос
    const response = await apiClient.patch(`/orders/${orderId}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
}


export async function getUsers() {
    return apiClient.get('/moderator/users');
}

export async function getModerators() {
    return apiClient.get('/moderator/users/moderators');
}

export async function getSellers() {
    return apiClient.get('/moderator/users/sellers');
}

export async function getBannedUsers() {
    return apiClient.get('/moderator/users/banned');
}

export async function getUser(userId: string) {
    return apiClient.get(`/moderator/users/${userId}`);
}

export async function banUser(userId: string) {
    return apiClient.post(`/moderator/users/${userId}/ban`);
}

export async function unbanUser(userId: string) {
    return apiClient.post(`/moderator/users/${userId}/unban`);
}

export async function promoteUser(userId: string) {
    return apiClient.post(`/moderator/users/${userId}/promote`);
}

export async function demoteUser(userId: string) {
    return apiClient.post(`/moderator/users/${userId}/demote`);
}

export async function getModeratorProducts() {
    return apiClient.get('/moderator/products');
}

export async function getProductsToReview() {
    return apiClient.get('/moderator/products/to-review');
}

export async function getModeratorProductById(productId: string) {
    return apiClient.get(`/moderator/products/${productId}`);
}

export async function reviewProduct(productId: string, data: { status: string; comment: string }) {
    return apiClient.patch(`/moderator/products/${productId}`, data, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

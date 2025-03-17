// src/api/index.ts
import axios from 'axios';
import {apiClient} from "./apiClient";

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
    return apiClient.get('/products');
}

// Получить продукт по его ID (UUID)
export async function getProductById(productId: string) {
    return apiClient.get(`/products/${productId}`);
}

export async function getUserOrders() {
    return apiClient.get(`/users/orders`);
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

export async function getMe() {
    return await apiClient.get(`users/me`);
}



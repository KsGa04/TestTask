import axios from 'axios';
import { Filters, ImportResponse } from '../types';

const API_BASE_URL = 'http://localhost:5006';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8'
    }
});
// Добавляем перехватчик для обработки ошибки 423
// Добавляем перехватчик для обработки ошибки 423
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 423) {
            // Перенаправляем на страницу занятости
            window.location.href = "/busy";
            throw new Error("Извините, в данный момент автомат занят");
        }
        return Promise.reject(error);
    }
);
export const apiService = {
    getProducts: (filters: Partial<Filters>) => {
        const params: Record<string, string | number> = {};

        if (filters.brand && filters.brand !== 'Все бренды') {
            params.brand = filters.brand;
        }
        if (filters.minPrice) {
            params.minPrice = filters.minPrice;
        }
        if (filters.maxPrice) {
            params.maxPrice = filters.maxPrice;
        }

        return api.get('/api/products', { params });
    },

    createOrder: (items: Record<number, number>) => {
        return api.post('/api/orders', items);
    },

    processPayment: (orderId: number, coins: Record<number, number>) => {
        return api.post(`/api/payment/${orderId}`, coins);
    },


    importProducts: (formData: FormData): Promise<{ data: ImportResponse }> => {
        return axios.post(`${API_BASE_URL}/api/products/import`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }).catch(error => {
            // Проверяем, есть ли response в ошибке
            if (error.response) {
                // Если сервер вернул ошибку, пробрасываем её дальше
                return Promise.reject(error);
            } else {
                // Если ошибка сети или другая ошибка
                return Promise.reject(new Error('Network error or other error'));
            }
        });
    },
};

export default apiService;
import axios from 'axios';
import { Filters } from '../types';

const API_BASE_URL = 'http://localhost:5006';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8'
    }
});

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
};

export default apiService;
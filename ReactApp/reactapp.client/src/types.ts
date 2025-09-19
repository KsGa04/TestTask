export interface Brand {
    id: number;
    name: string;
}

export interface Product {
    id: number;
    name: string;
    price: number;
    quantity: number;
    brand: Brand;
}

export interface Order {
    id: number;
    orderDate: string;
    totalAmount: number;
    orderItems: OrderItem[];
}

export interface OrderItem {
    id: number;
    productId: number;
    productName: string;
    brandName: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
}

export interface Coin {
    id: number;
    value: number;
    quantity: number;
}

export interface CartItem extends Product {
    quantity: number;
}

export interface Filters {
    brand: string;
    minPrice: number;
    maxPrice: number;
}

export interface PaymentState {
    coins: Array<{ value: number; count: number }>;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    change: Record<number, number> | null;
    message: string;
}

export interface ProductsState {
    items: Product[];
    brands: string[];
    filters: {
        brand: string;
        maxPrice: number;
    };
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    importStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    message: string | null;
}

export interface ImportResponse {
    message: string;
    count: number;
}
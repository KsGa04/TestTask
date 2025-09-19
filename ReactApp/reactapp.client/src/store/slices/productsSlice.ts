import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../api/api';
import { Product, Filters, ImportResponse } from '../../types';

interface ProductsState {
    items: Product[];
    brands: string[];
    filters: Filters;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    importStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    message: string | null;
}

const initialState: ProductsState = {
    items: [],
    brands: [],
    filters: {
        brand: 'Все бренды',
        minPrice: 0,
        maxPrice: 100,
    },
    status: 'idle',
    importStatus: 'idle',
    error: null,
    message: null,
};

export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async (filters: Partial<Filters>) => {
        const response = await apiService.getProducts(filters);
        return response.data;
    }
);

export const importProducts = createAsyncThunk(
    'products/importProducts',
    async (file: File, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await apiService.importProducts(formData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || 'Ошибка импорта');
        }
    }
);

const productsSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        setFilters: (state, action: PayloadAction<Partial<Filters>>) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearImportStatus: (state) => {
            state.importStatus = 'idle';
            state.message = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;

                // Исправление ошибки TypeScript
                const brandNames = action.payload.map((item: Product) => item.brand.name);
                const uniqueBrandsSet = new Set(brandNames);
                const uniqueBrands = Array.from(uniqueBrandsSet) as string[];

                state.brands = [ ...uniqueBrands];
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Ошибка загрузки продуктов';
            })
            .addCase(importProducts.pending, (state) => {
                state.importStatus = 'loading';
                state.message = null;
            })
            .addCase(importProducts.fulfilled, (state, action) => {
                state.importStatus = 'succeeded';
                state.message = action.payload.message; // action.payload.message - это строка
            })
            .addCase(importProducts.rejected, (state, action) => {
                state.importStatus = 'failed';
                const payload = action.payload;
                let errorMessage = 'Ошибка импорта';

                if (typeof payload === 'string') {
                    errorMessage = payload;
                } else if (payload && typeof payload === 'object') {
                    // Проверяем, есть ли в объекте поле 'message'
                    if ('message' in payload) {
                        errorMessage = (payload as any).message;
                        // Если есть детали, добавим их
                        if ('details' in payload) {
                            errorMessage += `: ${(payload as any).details}`;
                        }
                    } else {
                        errorMessage = JSON.stringify(payload);
                    }
                }
                state.message = errorMessage;
            });
    },
});

export const { setFilters, clearImportStatus } = productsSlice.actions;
export default productsSlice.reducer;
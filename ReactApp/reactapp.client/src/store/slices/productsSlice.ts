import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../api/api';
import { Product, Filters } from '../../types';

interface ProductsState {
    items: Product[];
    brands: string[];
    filters: Filters;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
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
    error: null,
};

export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async (filters: Partial<Filters>) => {
        const response = await apiService.getProducts(filters);
        return response.data;
    }
);

const productsSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        setFilters: (state, action: PayloadAction<Partial<Filters>>) => {
            state.filters = { ...state.filters, ...action.payload };
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

                const uniqueBrands = [...new Set(action.payload.map(item => item.brand.name))];
                state.brands = ['Все бренды', ...uniqueBrands];
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Ошибка загрузки продуктов';
            });
    },
});

export const { setFilters } = productsSlice.actions;
export default productsSlice.reducer;
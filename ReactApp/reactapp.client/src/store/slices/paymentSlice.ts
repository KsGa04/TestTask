import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../api/api';
import { PaymentState } from '../../types';

const initialState: PaymentState = {
    coins: [
        { value: 1, count: 0 },
        { value: 2, count: 0 },
        { value: 5, count: 0 },
        { value: 10, count: 0 },
    ],
    status: 'idle',
    error: null,
    change: null,
    message: '',
};


export const processPayment = createAsyncThunk(
    'payment/processPayment',
    async ({ orderId, coins }: { orderId: number; coins: Record<number, number> }) => {
        const response = await apiService.processPayment(orderId, coins);
        return response.data;
    }
);

const paymentSlice = createSlice({
    name: 'payment',
    initialState,
    reducers: {
        updateCoinCount: (state, action: PayloadAction<{ value: number; count: number }>) => {
            const { value, count } = action.payload;
            const coin = state.coins.find(coin => coin.value === value);
            if (coin) {
                coin.count = count;
            }
        },
        resetPayment: (state) => {
            state.coins = state.coins.map(coin => ({ ...coin, count: 0 }));
            state.change = null;
            state.message = '';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(processPayment.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.change = action.payload.change;
                state.message = action.payload.message;
            })
            .addCase(processPayment.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Ошибка оплаты';
            });
    },
});

export const { updateCoinCount, resetPayment } = paymentSlice.actions;
export default paymentSlice.reducer;
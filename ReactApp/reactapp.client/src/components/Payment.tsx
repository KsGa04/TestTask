import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateCoinCount, processPayment, resetPayment } from '../store/slices/paymentSlice';
import { clearCart } from '../store/slices/cartSlice';
import { RootState, AppDispatch } from '../store/store';
import { CartItem } from '../types';

const Payment: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { coins, status, change, message, error } = useSelector((state: RootState) => state.payment);
    const cart = useSelector((state: RootState) => state.cart);
    const [localCoins, setLocalCoins] = useState(coins);

    const totalAmount = cart.items.reduce((total: number, item: CartItem) =>
        total + (item.price * item.quantity), 0);

    const paidAmount = localCoins.reduce((total, coin) =>
        total + (coin.value * coin.count), 0);

    const remainingAmount = totalAmount - paidAmount;
    const isPaid = remainingAmount <= 0;

    useEffect(() => {
        setLocalCoins(coins);
    }, [coins]);

    const handleCoinChange = (value: number, count: number) => {
        const updatedCoins = localCoins.map(coin =>
            coin.value === value ? { ...coin, count: Math.max(0, count) } : coin
        );

        setLocalCoins(updatedCoins);
        dispatch(updateCoinCount({ value, count }));
    };

    const handlePayment = () => {
        if (!orderId) {
            alert('Некорректный идентификатор заказа');
            return;
        }

        const coinsObject: Record<number, number> = {};
        localCoins.forEach(coin => {
            coinsObject[coin.value] = coin.count;
        });

        dispatch(processPayment({ orderId: parseInt(orderId), coins: coinsObject }));
    };

    const handleBackToCatalog = () => {
        dispatch(resetPayment());
        dispatch(clearCart());
        navigate('/');
    };

    if (status === 'succeeded') {
        return (
            <div className="payment-container">
                <h1>Оплата</h1>
                <div className="payment-success">
                    <p className="success-message">{message}</p>
                    {change && Object.keys(change).length > 0 && (
                        <div className="change-info">
                            <h3>Ваша сдача:</h3>
                            <div className="change-coins">
                                {Object.entries(change).map(([value, count]) => (
                                    <div key={value} className="change-coin">
                                        <span className="coin-value">{value} руб.</span>
                                        <span className="coin-count">× {count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleBackToCatalog}
                        className="back-to-catalog-btn"
                    >
                        Каталог напитков
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-container">
            <h1>Оплата</h1>

            <div className="payment-info">
                <h2>Общая сумма: {totalAmount} руб.</h2>
                <h3 className={isPaid ? 'paid-enough' : 'paid-not-enough'}>
                    Внесено: {paidAmount} руб.
                    {!isPaid && ` (Осталось внести: ${remainingAmount} руб.)`}
                </h3>
            </div>

            <div className="coin-inputs">
                <h3>Внесите монеты:</h3>
                {localCoins.map(coin => (
                    <div key={coin.value} className="coin-input">
                        <span className="coin-label">Монета {coin.value} руб.:</span>
                        <div className="coin-controls">
                            <button
                                onClick={() => handleCoinChange(coin.value, coin.count - 1)}
                                disabled={coin.count <= 0}
                            >
                                -
                            </button>
                            <input
                                type="number"
                                value={coin.count}
                                onChange={(e) => handleCoinChange(coin.value, parseInt(e.target.value) || 0)}
                                min="0"
                            />
                            <button
                                onClick={() => handleCoinChange(coin.value, coin.count + 1)}
                            >
                                +
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {error && (
                <div className="error-message">
                    <p>Извините, в данный момент мы не можем продать вам товар по причине того, что автомат не может выдать вам нужную сдачу</p>
                </div>
            )}

            <div className="payment-actions">
                <button
                    onClick={() => navigate('/cart')}
                    className="back-btn"
                >
                    Вернуться
                </button>
                <button
                    onClick={handlePayment}
                    disabled={!isPaid || status === 'loading'}
                    className="pay-btn"
                >
                    {status === 'loading' ? 'Обработка...' : 'Оплатить'}
                </button>
            </div>
        </div>
    );
};

export default Payment;
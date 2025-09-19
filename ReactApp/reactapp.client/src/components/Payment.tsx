import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateCoinCount, processPayment, resetPayment } from '../store/slices/paymentSlice';
import { clearCart } from '../store/slices/cartSlice';
import { RootState, AppDispatch } from '../store/store';
import { CartItem } from '../types';
import './Payment.css';

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
        // Сбрасываем состояние платежа только при монтировании компонента
        dispatch(resetPayment());
    }, [dispatch, orderId]); // Добавлен dispatch в зависимости

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

    // Вычисляем общую сумму сдачи
    const changeAmount = change ? Object.entries(change).reduce((total, [value, count]) =>
        total + (parseInt(value) * count), 0) : 0;

    if (status === 'succeeded') {
        // Получаем монеты с ненулевым количеством и сортируем по номиналу
        const changeEntries = change ? Object.entries(change)
            .filter(([_, count]) => count > 0)
            .sort(([a], [b]) => parseInt(a) - parseInt(b)) : [];

        return (
            <div className="payment-page-container">
                <h1 className="payment-title">Оплата</h1>
                <div className="payments-success">
                    <p className="success-title">Спасибо за покупку!</p>
                    <p className="change-message">Пожалуйста, возьмите вашу сдачу: {changeAmount} руб.</p>

                    {changeEntries.length > 0 && (
                        <div className="change-info">
                            <p className="coins-title">Ваши монеты:</p>
                            <div className="change-coins-list">
                                {changeEntries.map(([value, count], index) => (
                                    <div key={value} className="change-coin-item">
                                        <img
                                            src={`/${value}rub.png`}
                                            alt={`Монета ${value} руб.`}
                                            className="change-coin-image"
                                        />
                                        <span className="coin-count">{count} шт.</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleBackToCatalog}
                        className="backs-to-catalog-btn"
                    >
                        Каталог напитков
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-page-container">
            <h1 className="payment-title">Оплата</h1>

            <div className="coins-table">
                <div className="table-header">
                    <span>Номинал</span>
                    <span>Количество</span>
                    <span>Сумма</span>
                </div>

                {localCoins.map(coin => {
                    const coinAmount = coin.value * coin.count;
                    return (
                        <div key={coin.value} className="coin-row">
                            <div className="coin-info">
                                <img
                                    src={`/${coin.value}rub.png`}
                                    alt={`Монета ${coin.value} руб.`}
                                    className="coin-image"
                                />
                                <span className="coin-value">{coin.value} руб.</span>
                            </div>
                            <div className="coin-controls">
                                <button
                                    onClick={() => handleCoinChange(coin.value, coin.count - 1)}
                                    disabled={coin.count <= 0}
                                    className="coin-btn minus"
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    value={coin.count}
                                    onChange={(e) => handleCoinChange(coin.value, parseInt(e.target.value) || 0)}
                                    min="0"
                                    className="coin-input"
                                />
                                <button
                                    onClick={() => handleCoinChange(coin.value, coin.count + 1)}
                                    className="coin-btn plus"
                                >
                                    +
                                </button>
                            </div>
                            <div className="coin-amount">
                                {coinAmount} руб.
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="payment-summary">
                <div className="total-amount">
                    <span>Итоговая сумма</span>
                    <span>{totalAmount} руб.</span>
                </div>

                <div className={`paid-amount ${isPaid ? 'paid-enough' : 'paid-not-enough'}`}>
                    <span>Вы внесли</span>
                    <span>{paidAmount} руб.</span>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    <p>Извините, в данный момент мы не можем продать вам товар по причине того, что автомат не может выдать вам нужную сдачу</p>
                </div>
            )}

            <div className="payments-actions">
                <button
                    onClick={() => navigate('/cart')}
                    className="backs-btn"
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
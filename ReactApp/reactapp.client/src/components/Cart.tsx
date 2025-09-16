import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeFromCart, updateQuantity, clearCart } from '../store/slices/cartSlice';
import { apiService } from '../api/api';
import { RootState, AppDispatch } from '../store/store';
import { CartItem } from '../types';

const Cart: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { items } = useSelector((state: RootState) => state.cart);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);

    const handleQuantityChange = (id: number, quantity: number) => {
        if (quantity < 1) return;

        // Проверяем, не превышает ли количество доступный запас
        const product = items.find(item => item.id === id);
        if (product && quantity > product.quantity) {
            setError(`Нельзя выбрать больше ${product.quantity} единиц товара "${product.name}"`);
            return;
        }

        setError(null);
        dispatch(updateQuantity({ id, quantity }));
    };

    const handleCheckout = async () => {
        setIsCheckingOut(true);
        setError(null);


        try {
            const orderItems: Record<number, number> = {};
            items.forEach((item: CartItem) => {
                orderItems[item.id] = item.quantity;
            });

            const response = await apiService.createOrder(orderItems);
            navigate(`/payment/${response.data.id}`);
        } catch (error: any) {
            console.error('Ошибка при создании заказа:', error);
            setError(error.response?.data || 'Не удалось создать заказ. Попробуйте снова.');
        } finally {
            setIsCheckingOut(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="cart-container">
                <h1>Корзина</h1>
                <div className="empty-cart">
                    <p>У вас нет ни одного товара, вернитесь на страницу каталога</p>
                    <button onClick={() => navigate('/')}>Вернуться в каталог</button>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-container">
            <h1>Корзина</h1>

            {error && <div className="error-message">{error}</div>}

            <div className="cart-items">
                {items.map((item: CartItem) => (
                    <div key={item.id} className="cart-item">
                        <div className="item-info">
                            <h3>{item.name}</h3>
                            <p className="brand">Бренд: {item.brand.name}</p>
                            <p className="price">Цена: {item.price} руб.</p>
                        </div>

                        <div className="quantity-controls">
                            <button
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                            >
                                -
                            </button>
                            <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                                min="1"
                                max={item.quantity}
                            />
                            <button
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                disabled={item.quantity >= item.quantity}
                            >
                                +
                            </button>
                        </div>

                        <div className="item-total">
                            <p>Итого: {item.price * item.quantity} руб.</p>
                        </div>

                        <button
                            className="remove-btn"
                            onClick={() => dispatch(removeFromCart(item.id))}
                        >
                            Удалить
                        </button>
                    </div>
                ))}
            </div>

            <div className="cart-summary">
                <h2>Общая сумма: {totalAmount} руб.</h2>
                <div className="cart-actions">
                    <button
                        onClick={handleCheckout}
                        disabled={isCheckingOut}
                        className="checkout-btn"
                    >
                        {isCheckingOut ? 'Обработка...' : 'Перейти к оплате'}
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="back-btn"
                    >
                        Вернуться в каталог
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
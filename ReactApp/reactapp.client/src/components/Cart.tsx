import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { removeFromCart, updateQuantity, clearCart } from '../store/slices/cartSlice';
import { resetPayment } from '../store/slices/paymentSlice';
import { apiService } from '../api/api';
import { RootState, AppDispatch } from '../store/store';
import { CartItem } from '../types';
import './Cart.css';

const Cart: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { items } = useSelector((state: RootState) => state.cart);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);

    const handleQuantityChange = (id: number, quantity: number) => {
        if (quantity < 1) return;
        setError(null);
        dispatch(updateQuantity({ id, quantity }));
    };

    const handleCheckout = async () => {
        setIsCheckingOut(true);
        setError(null);

        try {
            // Сбрасываем состояние платежа перед созданием нового заказа
            dispatch(resetPayment());

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

    // Функция для получения изображения бренда
    const getBrandImage = (brandName: string): string => {
        const brandImages: Record<string, string> = {
            'Coca-Cola': '/coca-cola.png',
            'Pepsi': '/pepsi.png',
            'Fanta': '/fanta.png',
            'Sprite': '/sprite.png',
            'Dr. Pepper': '/dr-pepper.png'
        };

        return brandImages[brandName] || '/default.png';
    };

    if (items.length === 0) {
        return (
            <div className="cart-page-container">
                <h1 className="cart-title">Оформление заказа</h1>
                <div className="empty-cart">
                    <p>У вас нет ни одного товара, вернитесь на страницу каталога</p>
                    <button
                        className="catalog-btn"
                        onClick={() => navigate('/')}
                    >
                        Вернуться в каталог
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page-container">
            <h1 className="cart-title">Оформление заказа</h1>

            {error && <div className="error-message">{error}</div>}

            <div className="cart-items-container">
                <div className="cart-items-header">
                    <span className="header-product">Товар</span>
                    <span className="header-quantity">Количество</span>
                    <span className="header-price">Цена</span>
                    <span></span>
                </div>

                {items.map((item: CartItem) => (
                    <div key={item.id} className="cart-item">
                        <div className="item-info">
                            <div className="item-image">
                                <img
                                    src={getBrandImage(item.brand.name)}
                                    alt={item.brand.name}
                                    className="brand-image"
                                />
                            </div>
                            <h3 className="product-name">Напиток газированный {item.name}</h3>
                        </div>

                        <div className="quantitys-controls">
                            <button
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="quantity-btn minus"
                            >
                                -
                            </button>
                            <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                                min="1"
                                className="quantity-input"
                            />
                            <button
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="quantity-btn plus"
                            >
                                +
                            </button>
                        </div>

                        <div className="item-price">
                            <p>{item.price * item.quantity} руб.</p>
                        </div>

                        <button
                            className="removes-btn"
                            onClick={() => dispatch(removeFromCart(item.id))}
                            aria-label="Удалить товар"
                        >
                            🗑️
                        </button>
                    </div>
                ))}
            </div>

            <div className="cart-summary">
                <div className="total-amount">
                    <span>Итоговая сумма</span>
                    <span>{totalAmount} руб.</span>
                </div>

                <div className="carts-actions">
                    <button
                        onClick={() => navigate('/')}
                        className="backs-btn"
                    >
                        Вернуться
                    </button>
                    <button
                        onClick={handleCheckout}
                        disabled={isCheckingOut}
                        className="checkout-btn"
                    >
                        {isCheckingOut ? 'Обработка...' : 'Оплата'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
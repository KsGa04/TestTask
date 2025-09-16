import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, setFilters } from '../store/slices/productsSlice';
import { addToCart } from '../store/slices/cartSlice';
import { RootState, AppDispatch } from '../store/store';
import './ProductList.css'; // Импортируем CSS файл

const ProductList: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { items, brands, filters, status } = useSelector((state: RootState) => state.products);
    const cart = useSelector((state: RootState) => state.cart);

    useEffect(() => {
        dispatch(fetchProducts(filters));
    }, [dispatch, filters]);

    const handleFilterChange = (filterType: keyof typeof filters, value: string | number) => {
        dispatch(setFilters({ [filterType]: value }));
    };

    // Функция для получения пути к изображению по названию бренда
    const getBrandImage = (brandName: string): string => {
        const brandImages: Record<string, string> = {
            'Coca-Cola': '../public/coca-cola.png',
            'Pepsi': '../public/pepsi.png',
            'Fanta': '../public/fanta.png',
            'Sprite': '../public/sprite.png'
        };

        return brandImages[brandName] || '../public/default.png';
    };

    if (status === 'loading') return <div className="loading">Загрузка...</div>;

    return (
        <div className="product-list-container">
            <h1 className="main-title">Газированные напитки</h1>

            {/* Фильтры */}
            <div className="filters">
                <select
                    value={filters.brand}
                    onChange={(e) => handleFilterChange('brand', e.target.value)}
                    className="brand-select"
                >
                    {brands.map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                    ))}
                </select>

                <div className="price-filter">
                    <span className="price-label">Макс.цена: {filters.maxPrice} руб.</span>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value))}
                        className="price-slider"
                    />
                </div>
            </div>

            {/* Каталог товаров */}
            <div className="products-grid">
                {items.map(product => (
                    <div key={product.id} className="product-card">
                        <div className="product-image-container">
                            <img
                                src={getBrandImage(product.brand.name)}
                                alt={product.brand.name}
                                className="product-image"
                            />
                        </div>
                        <h3 className="product-name">{product.name}</h3>
                        <p className="product-brand">Бренд: {product.brand.name}</p>
                        <p className="product-price">Цена: {product.price} руб.</p>
                        <p className="product-quantity">В наличии: {product.quantity} шт.</p>
                        <button
                            onClick={() => dispatch(addToCart(product))}
                            disabled={product.quantity === 0}
                            className={`add-to-cart-btn ${product.quantity === 0 ? 'disabled' : ''}`}
                        >
                            {product.quantity === 0 ? 'Закончился' : 'Выбрать'}
                        </button>
                    </div>
                ))}
            </div>

            {/* Кнопка корзины */}
            <div className="cart-button-container">
                <button
                    onClick={() => window.location.href = '/cart'}
                    className="cart-button"
                >
                    Выбрано: {cart.totalCount}
                </button>
            </div>
        </div>
    );
};

export default ProductList;
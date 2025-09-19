import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    fetchProducts, setFilters, importProducts,
    clearImportStatus
} from '../store/slices/productsSlice';
import { addToCart } from '../store/slices/cartSlice';
import { RootState, AppDispatch } from '../store/store';
import './ProductList.css';
import * as XLSX from 'xlsx';

const ProductList: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [localImportMessage, setLocalImportMessage] = useState('');
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const {
        items,
        brands,
        filters,
        status,
        importStatus,
        message
    } = useSelector((state: RootState) => state.products);

    const cart = useSelector((state: RootState) => state.cart);

    useEffect(() => {
        dispatch(fetchProducts(filters));
    }, [dispatch, filters]);

    useEffect(() => {
        if (importStatus === 'succeeded' || importStatus === 'failed') {
            // message теперь всегда строка
            setLocalImportMessage(message || '');

            const timer = setTimeout(() => {
                setLocalImportMessage('');
                dispatch(clearImportStatus());
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [importStatus, message, dispatch]);

    const handleFilterChange = (filterType: keyof typeof filters, value: string | number) => {
        dispatch(setFilters({ [filterType]: value }));
    };

    const handleNavigateToCart = () => {
        navigate('/cart');
    };

    const handleImportClick = () => {
        setIsImportModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsImportModalOpen(false);
    };

    const handleFileSelect = () => {
        fileInputRef.current?.click();
        setIsImportModalOpen(false);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const extension = file.name.split('.').pop()?.toLowerCase();
            if (extension !== 'xlsx' && extension !== 'xls') {
                setLocalImportMessage('Неверный формат файла. Поддерживаются только файлы Excel (.xlsx, .xls)');
                return;
            }

            dispatch(importProducts(file))
                .then(() => {
                    dispatch(fetchProducts(filters));
                });

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const downloadTemplate = () => {
        // Создаем данные для шаблона
        const data = [
            ["Название товара", "Цена", "Количество", "ID бренда"],
            ["Coca-Cola 0.5л", 80, 10, 1],
            ["Pepsi 0.5л", 75, 15, 2],
            ["Fanta 0.5л", 70, 20, 3],
            ["Sprite 0.5л", 65, 25, 4],
            ["Dr. Pepper 0.5л", 85, 8, 5]
        ];

        // Создаем книгу и лист
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Товары");

        // Устанавливаем ширину столбцов для лучшего отображения
        const colWidths = [
            { wch: 20 }, // Название товара
            { wch: 10 }, // Цена
            { wch: 12 }, // Количество
            { wch: 10 }  // ID бренда
        ];
        ws['!cols'] = colWidths;

        // Генерируем файл
        XLSX.writeFile(wb, "шаблон_импорта_товаров.xlsx");
    };

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

    if (status === 'loading') return <div className="loading">Загрузка...</div>;

    const isSelected = (productId: string | number) => {
        if (!cart || !Array.isArray(cart.items)) return false;
        return cart.items.some((ci: any) => ci.id === productId && (ci.quantity ?? 0) > 0);
    };

    return (
        <div className="product-list-container">
            {/* Модальное окно импорта */}
            {isImportModalOpen && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Инструкция по импорту товаров</h2>
                            <button className="modal-close" onClick={handleCloseModal}>×</button>
                        </div>
                        <div className="modal-body">
                            <p>Для импорта товаров подготовьте Excel-файл со следующими колонками:</p>
                            <table className="import-instructions">
                                <thead>
                                    <tr>
                                        <th>Название колонки</th>
                                        <th>Тип данных</th>
                                        <th>Описание</th>
                                        <th>Пример</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Название товара</td>
                                        <td>Текст</td>
                                        <td>Наименование товара</td>
                                        <td>Coca-Cola 0.5л</td>
                                    </tr>
                                    <tr>
                                        <td>Цена</td>
                                        <td>Число</td>
                                        <td>Стоимость товара в рублях</td>
                                        <td>80.00</td>
                                    </tr>
                                    <tr>
                                        <td>Количество</td>
                                        <td>Целое число</td>
                                        <td>Доступное количество товара</td>
                                        <td>10</td>
                                    </tr>
                                    <tr>
                                        <td>ID бренда</td>
                                        <td>Целое число</td>
                                        <td>Идентификатор бренда из системы</td>
                                        <td>1</td>
                                    </tr>
                                </tbody>
                            </table>
                            <div className="brands-reference">
                                <h4>Справочник брендов:</h4>
                                <ul>
                                    <li><strong>1</strong> - Coca-Cola</li>
                                    <li><strong>2</strong> - Pepsi</li>
                                    <li><strong>3</strong> - Fanta</li>
                                    <li><strong>4</strong> - Sprite</li>
                                    <li><strong>5</strong> - Dr. Pepper</li>
                                </ul>
                            </div>
                            <p className="import-note">
                                Примечание: Файл должен быть в формате Excel (.xlsx или .xls).
                                Первая строка должна содержать заголовки колонок.
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button className="modal-download" onClick={downloadTemplate}>
                                Скачать шаблон
                            </button>
                            <div className="modal-actions">
                                <button className="modal-cancel" onClick={handleCloseModal}>
                                    Отмена
                                </button>
                                <button className="modal-confirm" onClick={handleFileSelect}>
                                    Выбрать файл
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".xlsx,.xls"
                style={{ display: 'none' }}
            />

            {/* Заголовок страницы */}
            <div className="page-header">
                <h1 className="main-title">Газированные напитки</h1>
            </div>

            {/* Панель фильтров */}
            <div className="filter-row">
                <div>
                    <div className="filter-group">
                        <label className="filter-label" htmlFor="brand-select">Выберите бренд</label>
                        <select
                            id="brand-select"
                            value={filters.brand}
                            onChange={(e) => handleFilterChange('brand', e.target.value)}
                            className="brand-select"
                        >
                            <option value="Все бренды">Все бренды</option>
                            {brands.map((brand: string) => (
                                <option key={brand} value={brand}>{brand}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <div className="filter-group">
                        <label className="filter-label">Стоимость</label>
                        <div className="price-range">
                            <span className="price-min">0 руб.</span>
                            <input
                                type="range"
                                min="0"
                                max="110"
                                value={filters.maxPrice}
                                onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value))}
                                className="price-slider"
                                aria-label="Максимальная цена"
                            />
                            <span className="price-max">110 руб.</span>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="filter-actions">
                        <button
                            className="import-button"
                            onClick={handleImportClick}
                            disabled={importStatus === 'loading'}
                        >
                            {importStatus === 'loading' ? 'Импорт...' : 'Импорт'}
                        </button>
                        <button
                            className="selection-counter"
                            onClick={handleNavigateToCart}
                            disabled={!cart?.totalCount || cart.totalCount === 0}
                            aria-label="Перейти в корзину"
                        >
                            Выбрано: {cart?.totalCount ?? 0}
                        </button>
                    </div>
                </div>
            </div>

            {/* Сообщение об импорте */}
            {localImportMessage && (
                <div className={`import-message ${importStatus === 'succeeded' ? 'success' : 'error'}`}>
                    {localImportMessage}
                </div>
            )}

            {/* Сетка товаров */}
            <div className="products-grid">
                {items.map((product: any) => {
                    const outOfStock = (product.quantity ?? 0) === 0;
                    const selected = isSelected(product.id);

                    const btnClass = outOfStock ? 'out-of-stock' : (selected ? 'selected' : 'default');
                    const btnText = outOfStock ? 'Закончился' : (selected ? 'Выбрано' : 'Выбрать');

                    return (
                        <div key={product.id} className="product-card" aria-labelledby={`product-${product.id}-name`}>
                            <div className="product-image-container">
                                <img
                                    src={getBrandImage(product.brand.name)}
                                    alt={product.brand.name}
                                    className="product-image"
                                />
                            </div>

                            <h3 id={`product-${product.id}-name`} className="product-name-cart">Напиток газированный {product.name}</h3>
                            <p className="product-price">{product.price} руб.</p>

                            <button
                                onClick={() => {
                                    if (outOfStock) return;
                                    dispatch(addToCart(product));
                                }}
                                disabled={outOfStock}
                                className={`select-button ${btnClass}`}
                                aria-pressed={selected}
                            >
                                {btnText}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProductList;
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Payment from './components/Payment';
import RussianTest from './components/RussianTest';

const App: React.FC = () => {
    return (
        <Provider store={store}>
            <Router>
                <Routes>
                    <Route path="/" element={<ProductList />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/payment/:orderId" element={<Payment />} />
                </Routes>
            </Router>
        </Provider>
        //<div>
        //    <RussianTest />
        //    {/* Остальные компоненты вашего приложения */}
        //</div>
    );
};

export default App;
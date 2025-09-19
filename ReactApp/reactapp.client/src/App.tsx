import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Payment from './components/Payment';
import BusyPage from './components/BusyPage';


const App: React.FC = () => {
    return (
        <Provider store={store}>
            <Router>
                <Routes>
                    <Route path="/" element={<ProductList />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/payment/:orderId" element={<Payment />} />
                    <Route path="/busy" element={<BusyPage />} /> { }
                </Routes>
            </Router>
        </Provider>
    );
};

export default App;
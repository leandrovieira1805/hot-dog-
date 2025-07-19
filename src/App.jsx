import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MenuProvider } from './context/MenuContext';
import { CartProvider } from './context/CartContext';
import CustomerView from './components/CustomerView';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import './App.css';

function App() {
  return (
    <MenuProvider>
      <CartProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<CustomerView />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/panel" element={<AdminPanel />} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </MenuProvider>
  );
}

export default App;
import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Header = () => {
  const { setIsCartOpen, getTotalItems } = useCart();

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <h1>🍔 Arretado Burger</h1>
          <p>O melhor burger da cidade!</p>
        </div>
        
        <button 
          className="cart-button"
          onClick={() => setIsCartOpen(true)}
        >
          <ShoppingCart size={24} />
          {getTotalItems() > 0 && (
            <span className="cart-badge">{getTotalItems()}</span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
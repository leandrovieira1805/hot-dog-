import React, { useState, useEffect } from 'react';
import { useMenu } from '../context/MenuContext';
import { useCart } from '../context/CartContext';
import ProductCard from './ProductCard';
import Cart from './Cart';
import DailyOfferModal from './DailyOfferModal';
import { ShoppingCart, Search, MapPin, Clock, Star } from 'lucide-react';

const CustomerView = () => {
  const { products, dailyOffer } = useMenu();
  const { isCartOpen, setIsCartOpen, getTotalItems } = useCart();
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  useEffect(() => {
    if (dailyOffer) {
      const hasSeenOffer = sessionStorage.getItem('hotdog_seen_offer');
      if (!hasSeenOffer) {
        setShowOfferModal(true);
        sessionStorage.setItem('hotdog_seen_offer', 'true');
      }
    }
  }, [dailyOffer]);

  const categories = ['Todos', 'Lanches', 'Cuscuz', 'Bebidas', 'Combo de Salgados', 'Doces'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || 
      (selectedCategory === 'Lanches' && product.category === 'Lanches') ||
      (selectedCategory === 'Cuscuz' && product.category === 'Cuscuz') ||
      (selectedCategory === 'Bebidas' && product.category === 'Bebidas') ||
      (selectedCategory === 'Combo de Salgados' && product.category === 'Combo de Salgados') ||
      (selectedCategory === 'Doces' && product.category === 'Doces');
    const isAvailable = product.available !== false;
    return matchesSearch && matchesCategory && isAvailable;
  });

  return (
    <div className="customer-view">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <img src="/logo-arretado.png" alt="Logo Arretado Burger" className="hero-logo" style={{ maxWidth: '320px', width: '100%', height: 'auto', margin: '0 auto', display: 'block' }} />
          <p className="hero-subtitle">Sabores autênticos que conquistam corações</p>
          
          <div className="restaurant-info">
            <div className="info-item">
              <MapPin size={16} />
              <span>Terezinha Nunes</span>
            </div>
            <div className="info-item">
              <Clock size={16} />
              <span>15:00 - 23:00</span>
            </div>
          </div>

          <button 
            className="cart-floating-btn"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart size={20} />
            {getTotalItems() > 0 && (
              <span className="cart-floating-count">{getTotalItems()}</span>
            )}
          </button>
        </div>
      </section>

      {/* Search and Categories */}
      <section className="search-categories-section">
        <div className="container">
          <div className="search-bar">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar no cardápio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="categories-tabs">
            {categories.map(category => (
              <button
                key={category}
                className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Oferta do Dia - botão/aba */}
      {dailyOffer && (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
          <button
            className="offer-tab-btn"
            onClick={() => setShowOfferModal(true)}
            style={{
              background: '#ff6b6b',
              color: '#fff',
              border: 'none',
              borderRadius: '24px',
              padding: '0.75rem 2rem',
              fontWeight: 700,
              fontSize: '1.1rem',
              boxShadow: '0 4px 16px rgba(255,107,107,0.15)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              transition: 'background 0.2s',
            }}
          >
            <span role="img" aria-label="oferta">🔥</span> Oferta do Dia
          </button>
        </div>
      )}

      {/* Menu Section */}
      <section className="menu-section">
        <div className="container">
          <div className="section-header">
            <h2>Nosso Cardápio</h2>
            <p>Escolha seus favoritos e monte seu pedido</p>
          </div>

          <div className="products-grid">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="no-products">
              <p>Nenhum produto encontrado</p>
            </div>
          )}
        </div>
      </section>

      {isCartOpen && <Cart />}
      
      {showOfferModal && dailyOffer && (
        <DailyOfferModal 
          offer={dailyOffer} 
          onClose={() => setShowOfferModal(false)} 
        />
      )}
    </div>
  );
};

export default CustomerView;
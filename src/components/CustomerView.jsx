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

  const categories = ['Todos', 'Hot Dogs', 'Lanches', 'Bebidas', 'Acompanhamentos'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || 
      (selectedCategory === 'Hot Dogs' && product.name.toLowerCase().includes('hot dog')) ||
      (selectedCategory === 'Lanches' && (product.name.toLowerCase().includes('x-') || product.name.toLowerCase().includes('burguer'))) ||
      (selectedCategory === 'Bebidas' && product.name.toLowerCase().includes('refrigerante')) ||
      (selectedCategory === 'Acompanhamentos' && product.name.toLowerCase().includes('batata'));
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="customer-view">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="restaurant-badge">
            <Star className="star-icon" size={16} />
            <span>Melhor da Região</span>
          </div>
          <h1 className="hero-title">Hot Dog da Praça</h1>
          <p className="hero-subtitle">Sabores autênticos que conquistam corações</p>
          
          <div className="restaurant-info">
            <div className="info-item">
              <MapPin size={16} />
              <span>Praça Central, 123</span>
            </div>
            <div className="info-item">
              <Clock size={16} />
              <span>Seg-Dom: 18h-23h</span>
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
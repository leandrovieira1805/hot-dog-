import React, { useState } from 'react';
import { Plus, Star, Heart, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <div className="product-card-modern">
      <div className="product-image-container">
        <img src={product.image} alt={product.name} className="product-image" />
        <button className="favorite-btn">
          <Heart size={18} />
        </button>
        <div className="product-badge-new">
          <Star size={12} fill="currentColor" />
          <span>4.8</span>
        </div>
      </div>
      <div className="product-content">
        <h3 className="product-title">{product.name}</h3>
        <p className="product-description">
          Delicioso e preparado com ingredientes frescos
        </p>
        {/* Exibir sabores e complementos se existirem */}
        {product.sabores && product.sabores.length > 0 && (
          <p><strong>Sabores:</strong> {product.sabores.join(', ')}</p>
        )}
        {product.complementos && product.complementos.length > 0 && (
          <p><strong>Complementos:</strong> {product.complementos.join(', ')}</p>
        )}
        <div className="product-footer">
          <div className="price-container">
            <span className="price-label">A partir de</span>
            <span className="product-price">R$ {product.price.toFixed(2)}</span>
          </div>
          <button 
            className="add-btn-modern"
            onClick={handleAddToCart}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
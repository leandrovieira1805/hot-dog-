import React from 'react';
import { X, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';

// DailyOfferModal (componente)
const DailyOfferModal = ({ offer, onClose }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(offer);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>🔥 Oferta do Dia!</h2>
          <button className="close-modal-btn offer-close-black" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-content">
          <div className="offer-image">
            <img src={offer.image} alt={offer.name} />
          </div>

          <div className="offer-info">
            <h3>{offer.name}</h3>
            {offer.description && offer.description.trim() ? (
              <p className="offer-description">{offer.description}</p>
            ) : null}
            <p className="offer-price">R$ {offer.price.toFixed(2)}</p>
          </div>

          <button 
            className="add-offer-btn"
            onClick={handleAddToCart}
          >
            <Plus size={20} />
            Adicionar ao Carrinho
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyOfferModal;
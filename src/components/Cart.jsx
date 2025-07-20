import React from 'react';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { 
    cartItems, 
    setIsCartOpen, 
    updateQuantity, 
    removeFromCart, 
    getTotalPrice,
    clearCart 
  } = useCart();

  const handleFinishOrder = () => {
    if (cartItems.length === 0) return;
    
    alert(`Pedido finalizado!\nTotal: R$ ${getTotalPrice().toFixed(2)}\n\nObrigado pela preferência!`);
    clearCart();
    setIsCartOpen(false);
  };

  return (
    <div className="cart-overlay">
      <div className="cart">
        <div className="cart-header">
          <h2>Seu Pedido</h2>
          <button 
            className="close-cart-btn"
            onClick={() => setIsCartOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <div className="cart-content">
          {cartItems.length === 0 ? (
            <p className="empty-cart">Seu carrinho está vazio</p>
          ) : (
            <>
              <div className="cart-items">
                {cartItems.map(item => (
                  <div key={item.id} className="cart-item">
                    <img src={item.image} alt={item.name} className="cart-item-image" />
                    
                    <div className="cart-item-info">
                      <h4>{item.name}</h4>
                      <p>R$ {item.price.toFixed(2)}</p>
                    </div>

                    <div className="cart-item-controls">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="quantity-btn"
                      >
                        <Minus size={16} />
                      </button>
                      
                      <span className="quantity">{item.quantity}</span>
                      
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="quantity-btn"
                      >
                        <Plus size={16} />
                      </button>

                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="remove-btn"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-footer">
                <div className="cart-total">
                  <strong>Total: R$ {getTotalPrice().toFixed(2)}</strong>
                </div>
                
                <button 
                  className="finish-order-btn"
                  onClick={handleFinishOrder}
                >
                  Finalizar Pedido
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
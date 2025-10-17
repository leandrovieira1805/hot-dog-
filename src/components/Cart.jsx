import React, { useState } from 'react';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useMenu } from '../context/MenuContext';

const Cart = () => {
  const { 
    cartItems, 
    setIsCartOpen, 
    updateQuantity, 
    removeFromCart, 
    getTotalPrice,
    clearCart 
  } = useCart();
  const { pixKey: contextPixKey, pixName: contextPixName, whatsappNumber, deliveryFees } = useMenu();

  // Estados para o fluxo de finalização
  const [showCheckout, setShowCheckout] = useState(false);
  const [clientName, setClientName] = useState('');
  const [deliveryType, setDeliveryType] = useState('retirada');
  const [address, setAddress] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [addressReference, setAddressReference] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [changeValue, setChangeValue] = useState('');

  // Chave Pix e recebedor vindos do painel (MenuContext/Firebase), com fallback
  const pixKey = contextPixKey || localStorage.getItem('pixKey') || '';
  const pixName = contextPixName || localStorage.getItem('pixName') || '';

  const total = getTotalPrice() + Number(deliveryFee);

  const handleFinishOrder = () => {
    setShowCheckout(true);
  };

  const handleSendWhatsApp = () => {
    if (!clientName.trim()) return alert('Informe o nome do cliente.');
    if (deliveryType === 'entrega') {
      if (!address.trim()) return alert('Informe o endereço.');
      if (!addressNumber.trim()) return alert('Informe o número da casa.');
      if (!deliveryFee || Number(deliveryFee) <= 0) return alert('Selecione a taxa de entrega.');
    }
    let msg = `*Novo Pedido*\n`;
    msg += `Nome: ${clientName}\n`;
    msg += `Tipo: ${deliveryType === 'entrega' ? 'Entrega' : 'Retirada'}\n`;
    if (deliveryType === 'entrega') {
      msg += `Endereço: ${address}, Nº ${addressNumber}\n`;
      if (addressReference.trim()) {
        msg += `Referência: ${addressReference}\n`;
      }
      msg += `Localidade: ${deliveryLocation}\n`;
      msg += `Taxa de entrega: R$ ${deliveryFee}\n`;
    }
    msg += `\n*Itens:*\n`;
    cartItems.forEach(item => {
      msg += `- ${item.name} x${item.quantity} (R$ ${(item.price * item.quantity).toFixed(2)})\n`;
    });
    msg += `\n*Total: R$ ${total.toFixed(2)}*\n`;
    msg += `Pagamento: ${paymentMethod}\n`;
    if (paymentMethod === 'dinheiro' && changeValue) {
      msg += `Troco para: R$ ${Number(changeValue).toFixed(2)}\n`;
    }
    if (paymentMethod === 'pix') {
      msg += `Chave Pix: ${pixKey}\nRecebedor: ${pixName}\n`;
    }
    const phone = (whatsappNumber && whatsappNumber.trim()) || '5587996175314';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    clearCart();
    setIsCartOpen(false);
    setShowCheckout(false);
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

              {showCheckout && (
                <div className="checkout-modal-overlay">
                  <div className="checkout-modal-box">
                    <div className="checkout-modal-header">
                      <h3>Finalizar Pedido</h3>
                      <button className="close-modal-btn" onClick={() => setShowCheckout(false)}>
                        <X size={24} />
                      </button>
                    </div>
                    <div className="checkout-modal-content">
                      <div className="form-group">
                        <label>Nome do Cliente:</label>
                        <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label>Entrega ou Retirada?</label>
                        <select value={deliveryType} onChange={e => setDeliveryType(e.target.value)}>
                          <option value="retirada">Retirada</option>
                          <option value="entrega">Entrega</option>
                        </select>
                      </div>
                      {deliveryType === 'entrega' && (
                        <>
                          <div className="form-group">
                            <label>Endereço:</label>
                            <input type="text" value={address} onChange={e => setAddress(e.target.value)} required />
                          </div>
                          <div className="form-group">
                            <label>Número:</label>
                            <input type="text" value={addressNumber} onChange={e => setAddressNumber(e.target.value)} required />
                          </div>
                          <div className="form-group">
                            <label>Referência:</label>
                            <input type="text" value={addressReference} onChange={e => setAddressReference(e.target.value)} />
                          </div>
                          <div className="form-group">
                            <label>Localidade:</label>
                            <select 
                              value={deliveryLocation}
                              onChange={e => {
                                const name = e.target.value;
                                setDeliveryLocation(name);
                                const found = (deliveryFees || []).find(f => f.name === name);
                                setDeliveryFee(found ? Number(found.fee) : 0);
                              }}
                            >
                              <option value="">Selecione</option>
                              {(deliveryFees || []).map((f) => (
                                <option key={f.name} value={f.name}>
                                  {f.name} - R$ {Number(f.fee || 0).toFixed(2)}
                                </option>
                              ))}
                            </select>
                          </div>
                        </>
                      )}
                      <div className="form-group">
                        <label>Meio de Pagamento:</label>
                        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                          <option value="pix">Pix</option>
                          <option value="dinheiro">Dinheiro</option>
                          <option value="cartao">Cartão</option>
                        </select>
                      </div>
                      {paymentMethod === 'dinheiro' && (
                        <div className="form-group">
                          <label>Troco para quanto?</label>
                          <input type="number" value={changeValue} onChange={e => setChangeValue(e.target.value)} />
                        </div>
                      )}
                      {paymentMethod === 'pix' && (
                        <div className="form-group">
                          <label>Chave Pix:</label>
                          <input type="text" value={pixKey} readOnly />
                          <label>Recebedor:</label>
                          <input type="text" value={pixName} readOnly />
                        </div>
                      )}
                      <div style={{margin: '12px 0', textAlign: 'center'}}>
                        <strong>Total com taxa: R$ {total.toFixed(2)}</strong>
                      </div>
                      <button className="finish-order-btn" onClick={handleSendWhatsApp} style={{width: '100%'}}>Enviar Pedido para WhatsApp</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
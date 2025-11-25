import React, { useState } from 'react';
import { Plus, Star, Heart, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useMenu } from '../context/MenuContext';

// Dentro do componente: ProductCard
// Dentro do componente ProductCard: exibir a descrição no card
const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { addOns } = useMenu();
  const [showCustomization, setShowCustomization] = useState(false);
  const [selectedFlavors, setSelectedFlavors] = useState([]);
  const [selectedComplements, setSelectedComplements] = useState([]);
  const [selectedAddOns, setSelectedAddOns] = useState([]);

  const flavors = ['Bacon', 'Carne moída', 'Carne seca', 'Frango', 'Presunto', 'Queijo'];
  const complements = ['Azeitona', 'Catupiry', 'Cheddar', 'Cebola', 'Tomate', 'Milho'];

  const handleAddToCart = () => {
    if (product.name.toLowerCase().includes('pastel g')) {
      setShowCustomization(true);
    } else if (product.name.toLowerCase().includes('enroladinho')) {
      setShowCustomization(true);
    } else if (product.category === 'Hambúrgueres' && product.subcategory === 'Artesanal') {
      setShowCustomization(true);
    } else {
    addToCart(product);
    }
  };

  const handleFlavorToggle = (flavor) => {
    if (selectedFlavors.includes(flavor)) {
      setSelectedFlavors(selectedFlavors.filter(f => f !== flavor));
    } else if (selectedFlavors.length < 2) {
      setSelectedFlavors([...selectedFlavors, flavor]);
    }
  };

  const handleComplementToggle = (complement) => {
    if (selectedComplements.includes(complement)) {
      setSelectedComplements(selectedComplements.filter(c => c !== complement));
    } else if (selectedComplements.length < 3) {
      setSelectedComplements([...selectedComplements, complement]);
    }
  };

  const handleAddOnToggle = (addOn) => {
    if (selectedAddOns.find(item => item.name === addOn.name)) {
      setSelectedAddOns(selectedAddOns.filter(item => item.name !== addOn.name));
    } else {
      setSelectedAddOns([...selectedAddOns, addOn]);
    }
  };

  const handleAddCustomizedToCart = () => {
    let customizedName = product.name;
    let totalPrice = product.price;
    
    if (product.name.toLowerCase().includes('pastel g')) {
      customizedName = `${product.name} - ${selectedFlavors.join(', ')}${selectedComplements.length > 0 ? ` + ${selectedComplements.join(', ')}` : ''}`;
    } else if (product.name.toLowerCase().includes('enroladinho')) {
      customizedName = `${product.name} - ${selectedFlavors.join(', ')}`;
    } else if (product.category === 'Hambúrgueres' && product.subcategory === 'Artesanal') {
      const addOnNames = selectedAddOns.map(addOn => addOn.name);
      const addOnPrice = selectedAddOns.reduce((total, addOn) => total + addOn.price, 0);
      totalPrice = product.price + addOnPrice;
      customizedName = `${product.name}${addOnNames.length > 0 ? ` + ${addOnNames.join(', ')}` : ''}`;
    }
    
    const customizedProduct = {
      ...product,
      name: customizedName,
      price: totalPrice,
      customizations: {
        flavors: selectedFlavors,
        complements: selectedComplements,
        addOns: selectedAddOns
      }
    };
    addToCart(customizedProduct);
    setShowCustomization(false);
    setSelectedFlavors([]);
    setSelectedComplements([]);
    setSelectedAddOns([]);
  };

  return (
    <>
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
          {product.description && product.description.trim() ? (
            <p className="product-description" title={product.description}>
              {product.description}
            </p>
          ) : null}
          <div className="product-footer">
            <div className="price-container">
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

      {showCustomization && (
        <div className="customization-modal-overlay">
          <div className="customization-modal">
            <div className="customization-header">
              <h3>Personalizar {product.name}</h3>
              <button className="close-modal-btn" onClick={() => setShowCustomization(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="customization-content">
              {product.category === 'Hambúrgueres' && product.subcategory === 'Artesanal' ? (
                <>
                  <div className="flavors-section">
                    <h4>Adicionais disponíveis:</h4>
                    <div className="options-grid">
                      {(addOns || []).map(addOn => (
                        <button
                          key={addOn.name}
                          className={`option-btn ${selectedAddOns.find(item => item.name === addOn.name) ? 'selected' : ''}`}
                          onClick={() => handleAddOnToggle(addOn)}
                        >
                          {addOn.name} (+R$ {addOn.price.toFixed(2)})
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="customization-summary">
                    <p><strong>Hambúrguer Artesanal:</strong> R$ {product.price.toFixed(2)}</p>
                    {selectedAddOns.length > 0 && (
                      <>
                        <p><strong>Adicionais selecionados:</strong></p>
                        {selectedAddOns.map((addOn, index) => (
                          <p key={index}>• {addOn.name} (+R$ {addOn.price.toFixed(2)})</p>
                        ))}
                        <p><strong>Total: R$ {(product.price + selectedAddOns.reduce((total, addOn) => total + addOn.price, 0)).toFixed(2)}</strong></p>
                      </>
                    )}
                  </div>
                </>
              ) : product.name.toLowerCase().includes('pastel g') ? (
                <>
                  <div className="flavors-section">
                    <h4>Escolha até 2 sabores:</h4>
                    <div className="options-grid">
                      {flavors.map(flavor => (
                        <button
                          key={flavor}
                          className={`option-btn ${selectedFlavors.includes(flavor) ? 'selected' : ''}`}
                          onClick={() => handleFlavorToggle(flavor)}
                        >
                          {flavor}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="complements-section">
                    <h4>Escolha até 3 complementos:</h4>
                    <div className="options-grid">
                      {complements.map(complement => (
                        <button
                          key={complement}
                          className={`option-btn ${selectedComplements.includes(complement) ? 'selected' : ''}`}
                          onClick={() => handleComplementToggle(complement)}
                        >
                          {complement}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="customization-summary">
                    <p><strong>Selecionados:</strong></p>
                    <p>Sabores: {selectedFlavors.length > 0 ? selectedFlavors.join(', ') : 'Nenhum'}</p>
                    <p>Complementos: {selectedComplements.length > 0 ? selectedComplements.join(', ') : 'Nenhum'}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flavors-section">
                    <h4>Escolha o sabor:</h4>
                    <div className="options-grid">
                      {['Misto', 'Salsicha'].map(flavor => (
                        <button
                          key={flavor}
                          className={`option-btn ${selectedFlavors.includes(flavor) ? 'selected' : ''}`}
                          onClick={() => handleFlavorToggle(flavor)}
                        >
                          {flavor}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="customization-summary">
                    <p><strong>Selecionado:</strong></p>
                    <p>Sabor: {selectedFlavors.length > 0 ? selectedFlavors.join(', ') : 'Nenhum'}</p>
                  </div>
                </>
              )}

              <button 
                className="add-customized-btn"
                onClick={handleAddCustomizedToCart}
                disabled={
                  (product.name.toLowerCase().includes('pastel g') && selectedFlavors.length === 0) ||
                  (product.name.toLowerCase().includes('enroladinho') && selectedFlavors.length === 0)
                }
              >
                Adicionar ao Carrinho
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
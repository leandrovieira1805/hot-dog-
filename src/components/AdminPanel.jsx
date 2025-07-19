import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMenu } from '../context/MenuContext';
import { LogOut, Plus, Edit, Trash2, Save, X } from 'lucide-react';

const AdminPanel = () => {
  const { 
    products, 
    dailyOffer, 
    isAuthenticated, 
    pixKey,
    pixName,
    lastUpdate,
    addProduct, 
    updateProduct, 
    deleteProduct, 
    setOffer, 
    updatePixConfig,
    forceRefresh,
    clearData,
    logout 
  } = useMenu();
  
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);

  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    image: '',
    category: 'Lanches',
    available: true
  });

  const [offerForm, setOfferForm] = useState({
    name: '',
    description: '',
    price: '',
    image: ''
  });

  // Estados locais para Pix (serão sincronizados com o contexto)
  const [localPixKey, setLocalPixKey] = useState(pixKey || '');
  const [localPixName, setLocalPixName] = useState(pixName || '');

  // Sincronizar com o contexto
  useEffect(() => {
    setLocalPixKey(pixKey || '');
    setLocalPixName(pixName || '');
  }, [pixKey, pixName]);

  // Salvar Pix no contexto ao alterar
  const handlePixChange = (key, name) => {
    setLocalPixKey(key);
    setLocalPixName(name);
    updatePixConfig(key, name);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleProductSubmit = (e) => {
    e.preventDefault();
    
    const productData = {
      name: productForm.name,
      price: parseFloat(productForm.price),
      image: productForm.image,
      category: productForm.category,
      available: productForm.available
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
      setEditingProduct(null);
    } else {
      addProduct(productData);
    }

    setProductForm({ name: '', price: '', image: '', category: 'Lanches', available: true });
    setShowProductForm(false);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      image: product.image,
      category: product.category || 'Lanches',
      available: product.available !== false
    });
    setShowProductForm(true);
  };

  const handleOfferSubmit = (e) => {
    e.preventDefault();
    
    const offerData = {
      id: Date.now(),
      name: offerForm.name,
      description: offerForm.description,
      price: parseFloat(offerForm.price),
      image: offerForm.image
    };

    setOffer(offerData);
    setOfferForm({ name: '', description: '', price: '', image: '' });
    setShowOfferForm(false);
  };

  const handleRemoveOffer = () => {
    setOffer(null);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>🌭 Painel Administrativo</h1>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          Sair
        </button>
      </div>

      {/* Cadastro Pix */}
      <div className="pix-config" style={{background:'#232323',padding:'1.5rem',borderRadius:'12px',margin:'1.5rem 0',maxWidth:420}}>
        <h3 style={{color:'#fff',marginBottom:'1rem'}}>Configurar Pix</h3>
        <div className="form-group">
          <label style={{color:'#fff'}}>Chave Pix:</label>
          <input type="text" value={localPixKey} onChange={e => handlePixChange(e.target.value, localPixName)} style={{width:'100%'}} />
        </div>
        <div className="form-group">
          <label style={{color:'#fff'}}>Nome do Recebedor:</label>
          <input type="text" value={localPixName} onChange={e => handlePixChange(localPixKey, e.target.value)} style={{width:'100%'}} />
        </div>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Produtos
        </button>
        <button 
          className={`tab-btn ${activeTab === 'offers' ? 'active' : ''}`}
          onClick={() => setActiveTab('offers')}
        >
          Oferta do Dia
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'products' && (
          <div className="products-section">
            <div className="section-header">
              <h2>Gerenciar Produtos</h2>
              <button 
                className="add-btn"
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({ name: '', price: '', image: '', category: 'Lanches', available: true });
                  setShowProductForm(true);
                }}
              >
                <Plus size={20} />
                Adicionar Produto
              </button>
            </div>

            <div className="products-list">
              {products.map(product => (
                <div key={product.id} className={`admin-product-card ${!product.available ? 'unavailable' : ''}`}>
                  <img src={product.image} alt={product.name} />
                  <div className="product-details">
                    <h3>{product.name}</h3>
                    <p>R$ {product.price.toFixed(2)}</p>
                    {!product.available && (
                      <span style={{color: '#ff6b6b', fontSize: '0.8rem', fontWeight: 'bold'}}>INDISPONÍVEL</span>
                    )}
                  </div>
                  <div className="product-actions">
                    <button 
                      className="edit-btn"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => deleteProduct(product.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {showProductForm && (
              <div className="modal-overlay">
                <div className="modal">
                  <div className="modal-header">
                    <h3>{editingProduct ? 'Editar Produto' : 'Adicionar Produto'}</h3>
                    <button 
                      className="close-modal-btn"
                      onClick={() => setShowProductForm(false)}
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <form onSubmit={handleProductSubmit} className="product-form">
                    <div className="form-group">
                      <label>Imagem do Produto:</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setProductForm({ ...productForm, image: reader.result });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      {productForm.image && (
                        <img src={productForm.image} alt="Preview" style={{ maxWidth: '120px', marginTop: '8px', borderRadius: '8px' }} />
                      )}
                    </div>
                    <div className="form-group">
                      <label>Nome do Produto:</label>
                      <input
                        type="text"
                        value={productForm.name}
                        onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Categoria:</label>
                      <select
                        value={productForm.category}
                        onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                        required
                      >
                        <option value="Lanches">Lanches</option>
                        <option value="Cuscuz">Cuscuz</option>
                        <option value="Bebidas">Bebidas</option>
                        <option value="Combo de Salgados">Combo de Salgados</option>
                        <option value="Doces">Doces</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Status:</label>
                      <select
                        value={productForm.available ? 'available' : 'unavailable'}
                        onChange={(e) => setProductForm({...productForm, available: e.target.value === 'available'})}
                        required
                      >
                        <option value="available">Disponível</option>
                        <option value="unavailable">Indisponível</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Preço (R$):</label>
                      <input
                        type="number"
                        step="0.01"
                        value={productForm.price}
                        onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                        required
                      />
                    </div>

                    <button type="submit" className="save-btn">
                      <Save size={20} />
                      {editingProduct ? 'Atualizar' : 'Adicionar'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'offers' && (
          <div className="offers-section">
            <div className="section-header">
              <h2>Oferta do Dia</h2>
              {!dailyOffer && (
                <button 
                  className="add-btn"
                  onClick={() => setShowOfferForm(true)}
                >
                  <Plus size={20} />
                  Criar Oferta
                </button>
              )}
            </div>

            {dailyOffer ? (
              <div className="current-offer">
                <div className="offer-card">
                  <img src={dailyOffer.image} alt={dailyOffer.name} />
                  <div className="offer-details">
                    <h3>{dailyOffer.name}</h3>
                    <p>{dailyOffer.description}</p>
                    <p className="offer-price">R$ {dailyOffer.price.toFixed(2)}</p>
                  </div>
                  <button 
                    className="remove-offer-btn"
                    onClick={handleRemoveOffer}
                  >
                    <Trash2 size={16} />
                    Remover Oferta
                  </button>
                </div>
              </div>
            ) : (
              <p className="no-offer">Nenhuma oferta do dia cadastrada</p>
            )}

            {showOfferForm && (
              <div className="modal-overlay">
                <div className="modal">
                  <div className="modal-header">
                    <h3>Criar Oferta do Dia</h3>
                    <button 
                      className="close-modal-btn"
                      onClick={() => setShowOfferForm(false)}
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <form onSubmit={handleOfferSubmit} className="offer-form">
                    <div className="form-group">
                      <label>Nome da Oferta:</label>
                      <input
                        type="text"
                        value={offerForm.name}
                        onChange={(e) => setOfferForm({...offerForm, name: e.target.value})}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Descrição:</label>
                      <textarea
                        value={offerForm.description}
                        onChange={(e) => setOfferForm({...offerForm, description: e.target.value})}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Preço (R$):</label>
                      <input
                        type="number"
                        step="0.01"
                        value={offerForm.price}
                        onChange={(e) => setOfferForm({...offerForm, price: e.target.value})}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Imagem da Oferta:</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setOfferForm({ ...offerForm, image: reader.result });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      {offerForm.image && (
                        <img src={offerForm.image} alt="Preview" style={{ maxWidth: '120px', marginTop: '8px', borderRadius: '8px' }} />
                      )}
                    </div>

                    <button type="submit" className="save-btn">
                      <Save size={20} />
                      Criar Oferta
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Botão de Sincronização */}
      <div style={{marginTop:'2rem', padding:'1rem', background:'#232323', borderRadius:'12px', textAlign:'center'}}>
        <div style={{display:'flex', gap:'10px', justifyContent:'center', flexWrap:'wrap'}}>
          <button 
            onClick={forceRefresh} 
            style={{
              background:'#4CAF50', 
              color:'white', 
              border:'none', 
              padding:'12px 24px', 
              borderRadius:'8px', 
              cursor:'pointer',
              fontSize:'16px',
              fontWeight:'bold'
            }}
          >
            🔄 Sincronizar
          </button>
          
          <button 
            onClick={clearData} 
            style={{
              background:'#f44336', 
              color:'white', 
              border:'none', 
              padding:'12px 24px', 
              borderRadius:'8px', 
              cursor:'pointer',
              fontSize:'16px',
              fontWeight:'bold'
            }}
          >
            🗑️ Limpar Dados
          </button>
        </div>
        
        {lastUpdate && (
          <div style={{marginTop:'10px', fontSize:'14px', color:'#ccc'}}>
            Última atualização: {new Date(lastUpdate).toLocaleString('pt-BR')}
          </div>
        )}
        
        <div style={{marginTop:'10px', fontSize:'12px', color:'#888'}}>
          💡 Mudanças são salvas automaticamente no localStorage
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
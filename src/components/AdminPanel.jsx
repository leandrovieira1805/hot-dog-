import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMenu } from '../context/MenuContext';
import { LogOut, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { storage } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const AdminPanel = () => {
  const { 
    products, 
    dailyOffer, 
    isAuthenticated, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    setOffer, 
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
    imageFile: null,
    tipo: '',
    sabores: [], // novo campo para sabores do pastel
    complementos: [] // novo campo para complementos do pastel
  });

  const [offerForm, setOfferForm] = useState({
    name: '',
    description: '',
    price: '',
    image: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleProductImageChange = (e) => {
    const file = e.target.files[0];
    setProductForm((prev) => ({ ...prev, imageFile: file }));
  };

  // Handler para seleção múltipla de sabores (corrigido)
  const handleSaboresChange = (e) => {
    const options = Array.from(e.target.options);
    const selected = options.filter(o => o.selected).map(o => o.value);
    if (selected.length <= 2) {
      setProductForm(prev => ({ ...prev, sabores: selected }));
    }
  };
  // Handler para seleção múltipla de complementos (corrigido)
  const handleComplementosChange = (e) => {
    const options = Array.from(e.target.options);
    const selected = options.filter(o => o.selected).map(o => o.value);
    if (selected.length <= 3) {
      setProductForm(prev => ({ ...prev, complementos: selected }));
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    let imageUrl = productForm.image;
    if (productForm.imageFile) {
      const imageRef = ref(storage, `products/${Date.now()}_${productForm.imageFile.name}`);
      await uploadBytes(imageRef, productForm.imageFile);
      imageUrl = await getDownloadURL(imageRef);
    }
    const productData = {
      name: productForm.name,
      price: parseFloat(productForm.price),
      image: imageUrl,
      ...(productForm.tipo && { tipo: productForm.tipo }),
      ...(productForm.sabores && productForm.sabores.length > 0 && { sabores: productForm.sabores }),
      ...(productForm.complementos && productForm.complementos.length > 0 && { complementos: productForm.complementos })
    };
    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
      setEditingProduct(null);
    } else {
      addProduct(productData);
    }
    setProductForm({ name: '', price: '', image: '', imageFile: null, tipo: '', sabores: [], complementos: [] });
    setShowProductForm(false);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      image: product.image,
      tipo: product.tipo || '', // Adiciona o tipo ao estado do formulário
      sabores: product.sabores || [], // Adiciona os sabores ao estado do formulário
      complementos: product.complementos || [] // Adiciona os complementos ao estado do formulário
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
                  setProductForm({ name: '', price: '', image: '', imageFile: null, tipo: '', sabores: [], complementos: [] });
                  setShowProductForm(true);
                }}
              >
                <Plus size={20} />
                Adicionar Produto
              </button>
            </div>

            <div className="products-list">
              {products.filter(product => product.id).map(product => (
                <div key={product.id} className="admin-product-card">
                  <img src={product.image} alt={product.name} />
                  <div className="product-details">
                    <h3>{product.name}</h3>
                    <p>R$ {product.price.toFixed(2)}</p>
                    {product.tipo && (
                      <p>Tipo: {product.tipo === 'misto' ? 'Misto' : 'Salsicha'}</p>
                    )}
                    {product.sabores && product.sabores.length > 0 && (
                      <p>Sabores: {product.sabores.join(', ')}</p>
                    )}
                    {product.complementos && product.complementos.length > 0 && (
                      <p>Complementos: {product.complementos.join(', ')}</p>
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
                      <label>Nome do Produto:</label>
                      <input
                        type="text"
                        value={productForm.name}
                        onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                        required
                      />
                    </div>
                    {productForm.name.toLowerCase().includes('enroladinho') && (
                      <div className="form-group">
                        <label>Tipo do Enroladinho:</label>
                        <select
                          value={productForm.tipo}
                          onChange={e => setProductForm({...productForm, tipo: e.target.value})}
                          required
                        >
                          <option value="">Selecione</option>
                          <option value="misto">Misto</option>
                          <option value="salsicha">Salsicha</option>
                        </select>
                      </div>
                    )}
                    {/* Exibe campos de sabores/complementos para qualquer variação de 'pastel g' no nome */}
                    {productForm.name.toLowerCase().replace(/\s+/g, ' ').includes('pastel g') && (
                      <>
                        <div className="form-group">
                          <label>Sabores (até 2):</label>
                          <select
                            multiple
                            value={productForm.sabores}
                            onChange={handleSaboresChange}
                          >
                            <option value="bacon">Bacon</option>
                            <option value="carne moida">Carne Moída</option>
                            <option value="frango">Frango</option>
                            <option value="presunto">Presunto</option>
                            <option value="queijo">Queijo</option>
                          </select>
                          <small>Segure Ctrl (Windows) ou Cmd (Mac) para selecionar mais de um.</small>
                          {productForm.sabores.length > 2 && <div style={{color:'red'}}>Selecione no máximo 2 sabores.</div>}
                        </div>
                        <div className="form-group">
                          <label>Complementos (até 3):</label>
                          <select
                            multiple
                            value={productForm.complementos}
                            onChange={handleComplementosChange}
                          >
                            <option value="azeitona">Azeitona</option>
                            <option value="catupiry">Catupiry</option>
                            <option value="cheddar">Cheddar</option>
                            <option value="cebola">Cebola</option>
                            <option value="tomate">Tomate</option>
                            <option value="milho">Milho</option>
                          </select>
                          <small>Segure Ctrl (Windows) ou Cmd (Mac) para selecionar mais de um.</small>
                          {productForm.complementos.length > 3 && <div style={{color:'red'}}>Selecione no máximo 3 complementos.</div>}
                        </div>
                      </>
                    )}

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

                    <div className="form-group">
                      <label>URL da Imagem:</label>
                      <input
                        type="url"
                        value={productForm.image}
                        onChange={(e) => setProductForm({...productForm, image: e.target.value})}
                        placeholder="Ou cole uma URL de imagem"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProductImageChange}
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
                      <label>URL da Imagem:</label>
                      <input
                        type="url"
                        value={offerForm.image}
                        onChange={(e) => setOfferForm({...offerForm, image: e.target.value})}
                        required
                      />
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
    </div>
  );
};

export default AdminPanel;
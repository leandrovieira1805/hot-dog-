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
    imageFile: null // novo campo para o arquivo
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

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    let imageUrl = productForm.image;
    if (productForm.imageFile) {
      // Upload da imagem para o Firebase Storage
      const imageRef = ref(storage, `products/${Date.now()}_${productForm.imageFile.name}`);
      await uploadBytes(imageRef, productForm.imageFile);
      imageUrl = await getDownloadURL(imageRef);
    }
    const productData = {
      name: productForm.name,
      price: parseFloat(productForm.price),
      image: imageUrl
    };
    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
      setEditingProduct(null);
    } else {
      addProduct(productData);
    }
    setProductForm({ name: '', price: '', image: '', imageFile: null });
    setShowProductForm(false);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      image: product.image
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
                  setProductForm({ name: '', price: '', image: '', imageFile: null });
                  setShowProductForm(true);
                }}
              >
                <Plus size={20} />
                Adicionar Produto
              </button>
            </div>

            <div className="products-list">
              {products.map(product => (
                <div key={product.id} className="admin-product-card">
                  <img src={product.image} alt={product.name} />
                  <div className="product-details">
                    <h3>{product.name}</h3>
                    <p>R$ {product.price.toFixed(2)}</p>
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
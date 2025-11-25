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
    whatsappNumber,
    deliveryFees,
    addOns,
    espetinhoCombos,
    categories,
    lastUpdate,
    isSaving,
    addProduct, 
    updateProduct, 
    deleteProduct, 
    setOffer, 
    updatePixConfig,
    updateWhatsapp,
    updateFees,
    updateAddOns,
    updateEspetinhoCombos,
    updateCategories,
    forceRefresh,
    clearData,
    restoreDefaults,
    logout,
    removeOffer 
  } = useMenu();
  
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: 'Hambúrgueres',
    subcategory: 'Tradicional',
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
  const [localWhatsapp, setLocalWhatsapp] = useState(whatsappNumber || '');
  const [localFees, setLocalFees] = useState(deliveryFees || []);
  const [localAddOns, setLocalAddOns] = useState(addOns || []);
  const [localCategories, setLocalCategories] = useState(categories || []);
  const [localEspetinhoCombos, setLocalEspetinhoCombos] = useState(espetinhoCombos || []);

  // Sincronizar com o contexto
  useEffect(() => {
    setLocalPixKey(pixKey || '');
    setLocalPixName(pixName || '');
  }, [pixKey, pixName]);

  useEffect(() => {
    setLocalWhatsapp(whatsappNumber || '');
  }, [whatsappNumber]);

  useEffect(() => {
    setLocalFees(deliveryFees || []);
  }, [deliveryFees]);

  useEffect(() => {
    setLocalAddOns(addOns || []);
  }, [addOns]);

  useEffect(() => {
    // Fallback para categorias padrão se não houver categorias
    const defaultCategories = [
      { name: 'Hambúrgueres', icon: '🍔', enabled: true },
      { name: 'Petiscos', icon: '🍟', enabled: true },
      { name: 'Bebidas', icon: '🥤', enabled: true },
      { name: 'Hot Dog', icon: '🌭', enabled: true },
      { name: 'Bolos', icon: '🍰', enabled: true },
      { name: 'Batata', icon: '🥔', enabled: true },
      { name: 'Cuscuz', icon: '🌽', enabled: true }
    ];
    setLocalCategories(categories && categories.length > 0 ? categories : defaultCategories);
  }, [categories]);

  useEffect(() => {
    setLocalEspetinhoCombos(espetinhoCombos || []);
  }, [espetinhoCombos]);

  // Salvar Pix no contexto ao alterar
  const handlePixChange = (key, name) => {
    setLocalPixKey(key);
    setLocalPixName(name);
    
    // Debounce para evitar múltiplas atualizações
    if (window.pixTimeout) {
      clearTimeout(window.pixTimeout);
    }
    
    window.pixTimeout = setTimeout(() => {
      updatePixConfig(key, name);
    }, 500); // 500ms de debounce
  };

  const handleWhatsappChange = (value) => {
    setLocalWhatsapp(value);
    if (window.whatsTimeout) {
      clearTimeout(window.whatsTimeout);
    }
    window.whatsTimeout = setTimeout(() => {
      updateWhatsapp(value);
    }, 500);
  };

  const saveFeesDebounced = (feesArray) => {
    if (window.feesTimeout) clearTimeout(window.feesTimeout);
    window.feesTimeout = setTimeout(() => {
      // Salvar como array no backend
      updateFees(feesArray);
    }, 400);
  };

  const handleAddLocation = () => {
    const newFees = [...(localFees || []), { name: '', fee: 0 }];
    setLocalFees(newFees);
    saveFeesDebounced(newFees);
  };

  const handleChangeLocation = (index, field, value) => {
    const newFees = (localFees || []).map((item, i) =>
      i === index ? { ...item, [field]: field === 'fee' ? Number(value || 0) : value } : item
    );
    setLocalFees(newFees);
    saveFeesDebounced(newFees);
  };

  const handleRemoveLocation = (index) => {
    const newFees = (localFees || []).filter((_, i) => i !== index);
    setLocalFees(newFees);
    saveFeesDebounced(newFees);
  };

  const saveAddOnsDebounced = (addOnsArray) => {
    if (window.addOnsTimeout) clearTimeout(window.addOnsTimeout);
    window.addOnsTimeout = setTimeout(() => {
      updateAddOns(addOnsArray);
    }, 400);
  };

  const handleAddAddOn = () => {
    const newAddOns = [...(localAddOns || []), { name: '', price: 0 }];
    setLocalAddOns(newAddOns);
    saveAddOnsDebounced(newAddOns);
  };

  const handleChangeAddOn = (index, field, value) => {
    const newAddOns = (localAddOns || []).map((item, i) =>
      i === index ? { ...item, [field]: field === 'price' ? Number(value || 0) : value } : item
    );
    setLocalAddOns(newAddOns);
    saveAddOnsDebounced(newAddOns);
  };

  const handleRemoveAddOn = (index) => {
    const newAddOns = (localAddOns || []).filter((_, i) => i !== index);
    setLocalAddOns(newAddOns);
    saveAddOnsDebounced(newAddOns);
  };

  // Funções para gerenciar categorias
  const saveCategoriesDebounced = (categoriesArray) => {
    if (window.categoriesTimeout) clearTimeout(window.categoriesTimeout);
    window.categoriesTimeout = setTimeout(() => {
      updateCategories(categoriesArray);
    }, 400);
  };

  const handleToggleCategory = (index) => {
    const newCategories = (localCategories || []).map((cat, i) =>
      i === index ? { ...cat, enabled: !cat.enabled } : cat
    );
    setLocalCategories(newCategories);
    saveCategoriesDebounced(newCategories);
  };

  const handleAddCategory = () => {
    const newCategories = [...(localCategories || []), { name: '', icon: '🍽️', enabled: true }];
    setLocalCategories(newCategories);
    saveCategoriesDebounced(newCategories);
  };

  const handleChangeCategory = (index, field, value) => {
    const newCategories = (localCategories || []).map((cat, i) =>
      i === index ? { ...cat, [field]: value } : cat
    );
    setLocalCategories(newCategories);
    saveCategoriesDebounced(newCategories);
  };

  const handleRemoveCategory = (index) => {
    const newCategories = (localCategories || []).filter((_, i) => i !== index);
    setLocalCategories(newCategories);
    saveCategoriesDebounced(newCategories);
  };

  // Funções para gerenciar combos espetinho
  const saveEspetinhoCombosDebounced = (combosArray) => {
    if (window.espetinhoCombosTimeout) clearTimeout(window.espetinhoCombosTimeout);
    window.espetinhoCombosTimeout = setTimeout(() => {
      updateEspetinhoCombos(combosArray);
    }, 400);
  };

  const handleAddEspetinhoCombo = () => {
    const newCombos = [...(localEspetinhoCombos || []), {
      id: Date.now(),
      name: '',
      price: 0,
      image: '',
      description: '',
      items: [],
      available: true
    }];
    setLocalEspetinhoCombos(newCombos);
    saveEspetinhoCombosDebounced(newCombos);
  };

  const handleChangeEspetinhoCombo = (index, field, value) => {
    const newCombos = (localEspetinhoCombos || []).map((combo, i) =>
      i === index ? { ...combo, [field]: field === 'price' ? Number(value || 0) : value } : combo
    );
    setLocalEspetinhoCombos(newCombos);
    saveEspetinhoCombosDebounced(newCombos);
  };

  const handleChangeEspetinhoComboItem = (comboIndex, itemIndex, value) => {
    const newCombos = (localEspetinhoCombos || []).map((combo, i) =>
      i === comboIndex ? {
        ...combo,
        items: combo.items.map((item, j) => j === itemIndex ? value : item)
      } : combo
    );
    setLocalEspetinhoCombos(newCombos);
    saveEspetinhoCombosDebounced(newCombos);
  };

  const handleAddEspetinhoComboItem = (comboIndex) => {
    const newCombos = (localEspetinhoCombos || []).map((combo, i) =>
      i === comboIndex ? { ...combo, items: [...combo.items, ''] } : combo
    );
    setLocalEspetinhoCombos(newCombos);
    saveEspetinhoCombosDebounced(newCombos);
  };

  const handleRemoveEspetinhoComboItem = (comboIndex, itemIndex) => {
    const newCombos = (localEspetinhoCombos || []).map((combo, i) =>
      i === comboIndex ? {
        ...combo,
        items: combo.items.filter((_, j) => j !== itemIndex)
      } : combo
    );
    setLocalEspetinhoCombos(newCombos);
    saveEspetinhoCombosDebounced(newCombos);
  };

  const handleRemoveEspetinhoCombo = (index) => {
    const newCombos = (localEspetinhoCombos || []).filter((_, i) => i !== index);
    setLocalEspetinhoCombos(newCombos);
    saveEspetinhoCombosDebounced(newCombos);
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
    
    // Validação: hambúrgueres devem ter subcategoria
    if (productForm.category === 'Hambúrgueres' && !productForm.subcategory) {
      alert('Por favor, selecione uma subcategoria para o hambúrguer (Tradicional ou Artesanal)');
      return;
    }
    
    const productData = {
      name: productForm.name,
      description: productForm.description || '', // Garantir que sempre tenha descrição (mesmo que vazia)
      price: parseFloat(productForm.price),
      image: productForm.image,
      category: productForm.category,
      ...(productForm.category === 'Hambúrgueres' ? { subcategory: productForm.subcategory } : {}),
      available: productForm.available
    };
    
    // Log para debug
    console.log('Salvando produto:', {
      name: productData.name,
      description: productData.description,
      hasDescription: !!productData.description && productData.description.trim().length > 0
    });

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
      setEditingProduct(null);
    } else {
      addProduct(productData);
    }

    setProductForm({ name: '', description: '', price: '', image: '', category: 'Hambúrgueres', subcategory: 'Tradicional', available: true });
    setShowProductForm(false);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      image: product.image,
      category: product.category || 'Lanches',
      subcategory: product.subcategory || 'Tradicional',
      available: product.available !== false
    });
    setShowProductForm(true);
  };

  const handleOfferSubmit = (e) => {
    e.preventDefault();
    
    const offerData = {
      id: dailyOffer ? dailyOffer.id : Date.now(), // Mantém ID ao editar
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
    removeOffer();
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>🌭 Painel Administrativo</h1>
        <div className="admin-actions">
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginRight: '15px',
            fontSize: '12px',
            color: lastUpdate ? '#4CAF50' : '#ff6b6b'
          }}>
            {lastUpdate ? (
              <>
                <span style={{ marginRight: '5px' }}>🟢</span>
                Sincronizado
              </>
            ) : (
              <>
                <span style={{ marginRight: '5px' }}>🔴</span>
                Não sincronizado
              </>
            )}
          </div>
          <button 
            className="sync-btn" 
            onClick={forceRefresh}
            disabled={isSaving}
            style={{
              background: isSaving ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              marginRight: '10px',
              fontSize: '14px'
            }}
          >
            {isSaving ? '⏳ Salvando...' : '🔄 Sincronizar'}
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            Sair
          </button>
        </div>
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
        <div className="form-group">
          <label style={{color:'#fff'}}>WhatsApp (apenas números, com DDI):</label>
          <input type="text" value={localWhatsapp} placeholder="5587999999999" onChange={e => handleWhatsappChange(e.target.value)} style={{width:'100%'}} />
        </div>
        <div className="form-group" style={{marginTop:'1rem'}}>
          <label style={{color:'#fff', display:'block', marginBottom:'0.5rem'}}>Localidades e Taxas de Entrega</label>
          {(localFees || []).map((loc, idx) => (
            <div key={idx} style={{display:'flex', gap:'8px', alignItems:'center', marginBottom:'8px'}}>
              <input 
                type="text" 
                placeholder="Localidade"
                value={loc.name}
                onChange={e => handleChangeLocation(idx, 'name', e.target.value)}
                style={{flex:2}}
              />
              <input 
                type="number" step="0.01"
                placeholder="Taxa (R$)"
                value={loc.fee}
                onChange={e => handleChangeLocation(idx, 'fee', e.target.value)}
                style={{flex:1}}
              />
              <button 
                type="button"
                onClick={() => handleRemoveLocation(idx)}
                style={{background:'#dc2626', color:'#fff', border:'none', padding:'0.6rem 0.8rem', borderRadius:'8px', cursor:'pointer'}}
              >Remover</button>
            </div>
          ))}
          <button 
            type="button"
            onClick={handleAddLocation}
            style={{marginTop:'6px', background:'#10b981', color:'#fff', border:'none', padding:'0.6rem 0.8rem', borderRadius:'8px', cursor:'pointer'}}
          >Adicionar Localidade</button>
        </div>
        
        <div className="form-group" style={{marginTop:'1.5rem'}}>
          <label style={{color:'#fff', display:'block', marginBottom:'0.5rem'}}>Adicionais para Hambúrgueres Artesanais</label>
          {(localAddOns || []).map((addOn, idx) => (
            <div key={idx} style={{display:'flex', gap:'8px', alignItems:'center', marginBottom:'8px'}}>
              <input 
                type="text" 
                placeholder="Nome do adicional"
                value={addOn.name}
                onChange={e => handleChangeAddOn(idx, 'name', e.target.value)}
                style={{flex:2}}
              />
              <input 
                type="number" step="0.01"
                placeholder="Preço (R$)"
                value={addOn.price}
                onChange={e => handleChangeAddOn(idx, 'price', e.target.value)}
                style={{flex:1}}
              />
              <button 
                type="button"
                onClick={() => handleRemoveAddOn(idx)}
                style={{background:'#dc2626', color:'#fff', border:'none', padding:'0.6rem 0.8rem', borderRadius:'8px', cursor:'pointer'}}
              >Remover</button>
            </div>
          ))}
          <button 
            type="button"
            onClick={handleAddAddOn}
            style={{marginTop:'6px', background:'#3b82f6', color:'#fff', border:'none', padding:'0.6rem 0.8rem', borderRadius:'8px', cursor:'pointer'}}
          >Adicionar Adicional</button>
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
          className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Categorias
        </button>
        <button 
          className={`tab-btn ${activeTab === 'combos' ? 'active' : ''}`}
          onClick={() => setActiveTab('combos')}
        >
          Combos Espetinho
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
              <h2>Gerenciar Produtos ({products.length} produtos)</h2>
              <button 
                className="add-btn"
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({ name: '', description: '', price: '', image: '', category: 'Hambúrgueres', subcategory: 'Tradicional', available: true });
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
                      onClick={async () => {
                        if (window.confirm(`Tem certeza que deseja excluir o produto "${product.name}"?`)) {
                          try {
                            console.log('Tentando deletar produto:', product.id, product.name);
                            const result = await deleteProduct(product.id);
                            if (result) {
                              console.log('Produto deletado com sucesso!');
                              alert('Produto excluído com sucesso!');
                            } else {
                              console.log('Produto não foi encontrado');
                              alert('Produto não foi encontrado');
                            }
                          } catch (error) {
                            console.error('Erro ao deletar produto:', error);
                            alert(`Erro ao excluir produto: ${error.message}`);
                          }
                        }
                      }}
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
                      <label>Nome do Produto: <span style={{color: '#ff6b6b'}}>*</span></label>
                      <input
                        type="text"
                        value={productForm.name}
                        onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                        required
                        placeholder="Ex: Hot Dog Especial"
                      />
                    </div>
                    
                    <div className="form-group" style={{ marginTop: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '12px', border: '2px solid #e9ecef' }}>
                      <label style={{ color: '#1a1a1a', fontWeight: '700', fontSize: '1.05rem' }}>
                        📝 Descrição do Produto:
                      </label>
                      <textarea
                        placeholder="Ex.: pão, salsicha, milho, ervilha, batata palha, queijo ralado, molho especial..."
                        value={productForm.description || ''}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        rows={4}
                        style={{ 
                          resize: 'vertical',
                          minHeight: '100px',
                          border: '2px solid #dee2e6',
                          fontSize: '0.95rem'
                        }}
                      />
                      <small style={{ color: '#28a745', fontSize: '0.85rem', marginTop: '6px', display: 'block', fontWeight: '500' }}>
                        ✓ A descrição aparecerá no card do produto para os clientes visualizarem
                      </small>
                    </div>

                    <div className="form-group">
                      <label>Categoria:</label>
                      <select
                        value={productForm.category}
                        onChange={(e) => {
                          const newCategory = e.target.value;
                          setProductForm({
                            ...productForm, 
                            category: newCategory,
                            // Reset subcategory when changing category
                            subcategory: newCategory === 'Hambúrgueres' ? 'Tradicional' : undefined
                          });
                        }}
                        required
                      >
                        {(localCategories || []).map((category, index) => (
                          <option key={index} value={category.name}>{category.name}</option>
                        ))}
                      </select>
                    </div>
                    {productForm.category === 'Hambúrgueres' && (
                      <div className="form-group">
                        <label>Subcategoria (obrigatório para hambúrgueres):</label>
                        <select
                          value={productForm.subcategory || 'Tradicional'}
                          onChange={(e) => setProductForm({...productForm, subcategory: e.target.value})}
                          required
                        >
                          <option value="">Selecione uma subcategoria</option>
                          <option value="Tradicional">Tradicional</option>
                          <option value="Artesanal">Artesanal</option>
                        </select>
                      </div>
                    )}

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

        {activeTab === 'categories' && (
          <div className="categories-section">
            <div className="section-header">
              <h2>Gerenciar Categorias</h2>
              <p style={{color: '#666', fontSize: '14px'}}>
                Ative/desative categorias que aparecem na seleção principal do cardápio
              </p>
            </div>

            <div className="categories-list">
              {(localCategories || []).map((category, index) => (
                <div key={index} className="category-card" style={{
                  background: '#f8f9fa',
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px'
                }}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '10px', flex: 1}}>
                    <input
                      type="text"
                      placeholder="Ícone (emoji)"
                      value={category.icon}
                      onChange={e => handleChangeCategory(index, 'icon', e.target.value)}
                      style={{width: '60px', textAlign: 'center', fontSize: '16px'}}
                    />
                    <input
                      type="text"
                      placeholder="Nome da categoria"
                      value={category.name}
                      onChange={e => handleChangeCategory(index, 'name', e.target.value)}
                      style={{flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
                    />
                  </div>
                  
                  <label style={{display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer'}}>
                    <input
                      type="checkbox"
                      checked={category.enabled}
                      onChange={() => handleToggleCategory(index)}
                    />
                    <span style={{color: category.enabled ? '#28a745' : '#dc3545', fontWeight: 'bold'}}>
                      {category.enabled ? 'Ativa' : 'Inativa'}
                    </span>
                  </label>
                  
                  <button
                    onClick={() => handleRemoveCategory(index)}
                    style={{
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Remover
                  </button>
                </div>
              ))}
              
              <button
                onClick={handleAddCategory}
                style={{
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginTop: '10px'
                }}
              >
                + Adicionar Categoria
              </button>
            </div>
          </div>
        )}

        {activeTab === 'combos' && (
          <div className="combos-section">
            <div className="section-header">
              <h2>Gerenciar Combos Espetinho</h2>
              <p style={{color: '#666', fontSize: '14px'}}>
                Configure os combos de espetinho disponíveis no cardápio
              </p>
            </div>

            <div className="combos-list">
              {(localEspetinhoCombos || []).map((combo, index) => (
                <div key={index} className="combo-card" style={{
                  background: '#f8f9fa',
                  border: '1px solid #dee2e6',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '20px'
                }}>
                  <div style={{display: 'flex', gap: '15px', marginBottom: '15px'}}>
                    <div style={{flex: 1}}>
                      <input
                        type="text"
                        placeholder="Nome do combo"
                        value={combo.name}
                        onChange={e => handleChangeEspetinhoCombo(index, 'name', e.target.value)}
                        style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '8px'}}
                      />
                      <input
                        type="text"
                        placeholder="Descrição"
                        value={combo.description}
                        onChange={e => handleChangeEspetinhoCombo(index, 'description', e.target.value)}
                        style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '8px'}}
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Preço (R$)"
                        value={combo.price}
                        onChange={e => handleChangeEspetinhoCombo(index, 'price', e.target.value)}
                        style={{width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px'}}
                      />
                    </div>
                    <div style={{width: '120px'}}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              handleChangeEspetinhoCombo(index, 'image', reader.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        style={{width: '100%', marginBottom: '8px'}}
                      />
                      {combo.image && (
                        <img src={combo.image} alt="Preview" style={{width: '100%', borderRadius: '4px'}} />
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 style={{marginBottom: '10px'}}>Itens do Combo:</h4>
                    {combo.items.map((item, itemIndex) => (
                      <div key={itemIndex} style={{display: 'flex', gap: '8px', marginBottom: '8px'}}>
                        <input
                          type="text"
                          placeholder="Item do combo"
                          value={item}
                          onChange={e => handleChangeEspetinhoComboItem(index, itemIndex, e.target.value)}
                          style={{flex: 1, padding: '6px', border: '1px solid #ddd', borderRadius: '4px'}}
                        />
                        <button
                          onClick={() => handleRemoveEspetinhoComboItem(index, itemIndex)}
                          style={{
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => handleAddEspetinhoComboItem(index)}
                      style={{
                        background: '#17a2b8',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      + Adicionar Item
                    </button>
                  </div>
                  
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px'}}>
                    <label style={{display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer'}}>
                      <input
                        type="checkbox"
                        checked={combo.available}
                        onChange={() => handleChangeEspetinhoCombo(index, 'available', !combo.available)}
                      />
                      <span style={{color: combo.available ? '#28a745' : '#dc3545', fontWeight: 'bold'}}>
                        {combo.available ? 'Disponível' : 'Indisponível'}
                      </span>
                    </label>
                    
                    <button
                      onClick={() => handleRemoveEspetinhoCombo(index)}
                      style={{
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Remover Combo
                    </button>
                  </div>
                </div>
              ))}
              
              <button
                onClick={handleAddEspetinhoCombo}
                style={{
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginTop: '10px'
                }}
              >
                + Adicionar Combo Espetinho
              </button>
            </div>
          </div>
        )}

        {activeTab === 'offers' && (
          <div className="offers-section">
            <div className="section-header">
              <h2>Oferta do Dia</h2>
              {!showOfferForm && (
                <button 
                  className="add-btn"
                  onClick={() => {
                    if (dailyOffer) {
                      setOfferForm({
                        name: dailyOffer.name,
                        description: dailyOffer.description,
                        price: dailyOffer.price.toString(),
                        image: dailyOffer.image
                      });
                    }
                    setShowOfferForm(true);
                  }}
                >
                  <Plus size={20} />
                  {dailyOffer ? 'Editar Oferta' : 'Criar Oferta'}
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
                    <h3>{dailyOffer ? 'Editar Oferta do Dia' : 'Criar Oferta do Dia'}</h3>
                    <button 
                      className="close-modal-btn"
                      onClick={() => {
                        setShowOfferForm(false);
                        // Limpar formulário ao fechar
                        setOfferForm({ name: '', description: '', price: '', image: '' });
                      }}
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
                        <img src={offerForm.image} alt="Preview" style={{ maxWidth: '120px', marginTop: '809px', borderRadius: '804px' }} />
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button 
                        type="button" 
                        className="cancel-btn"
                        onClick={() => {
                          setShowOfferForm(false);
                          setOfferForm({ name: '', description: '', price: '', image: '' });
                        }}
                        style={{
                          background: '#6c757d',
                          color: 'white',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Cancelar
                      </button>
                      <button type="submit" className="save-btn">
                        <Save size={20} />
                        {dailyOffer ? 'Atualizar Oferta' : 'Criar Oferta'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Status e Botões */}
      <div style={{marginTop:'2rem', padding:'1rem', background:'#232323', borderRadius:'12px', textAlign:'center'}}>
        {isSaving && (
          <div style={{marginBottom:'15px', padding:'10px', background:'#2196F3', color:'white', borderRadius:'8px', fontSize:'14px'}}>
            💾 Salvando mudanças no servidor...
          </div>
        )}
        
        <div style={{display:'flex', gap:'10px', justifyContent:'center', flexWrap:'wrap'}}>
          <button 
            onClick={forceRefresh} 
            disabled={isSaving}
            style={{
              background: isSaving ? '#666' : '#4CAF50', 
              color:'white', 
              border:'none', 
              padding:'12px 24px', 
              borderRadius:'8px', 
              cursor: isSaving ? 'not-allowed' : 'pointer',
              fontSize:'16px',
              fontWeight:'bold'
            }}
          >
            🔄 Sincronizar
          </button>
          
          <button 
            onClick={() => {
              if (window.confirm('⚠️ ATENÇÃO: Isso vai apagar TODOS os produtos e configurações!\n\nTem certeza que deseja continuar?')) {
                clearData();
              }
            }} 
            disabled={isSaving}
            style={{
              background: isSaving ? '#666' : '#f44336', 
              color:'white', 
              border:'none', 
              padding:'12px 24px', 
              borderRadius:'8px', 
              cursor: isSaving ? 'not-allowed' : 'pointer',
              fontSize:'16px',
              fontWeight:'bold'
            }}
          >
            🗑️ Limpar TUDO
          </button>
          
          <button 
            onClick={() => {
              if (window.confirm('🔄 Restaurar produtos padrão?\n\nIsso vai substituir todos os produtos atuais pelos padrão.')) {
                restoreDefaults();
              }
            }} 
            disabled={isSaving}
            style={{
              background: isSaving ? '#666' : '#2196F3', 
              color:'white', 
              border:'none', 
              padding:'12px 24px', 
              borderRadius:'8px', 
              cursor: isSaving ? 'not-allowed' : 'pointer',
              fontSize:'16px',
              fontWeight:'bold'
            }}
          >
            🔄 Restaurar Padrão
          </button>
        </div>
        
        {lastUpdate && (
          <div style={{marginTop:'10px', fontSize:'14px', color:'#ccc'}}>
            Última atualização: {new Date(lastUpdate).toLocaleString('pt-BR')}
          </div>
        )}
        
        <div style={{marginTop:'10px', fontSize:'12px', color:'#888'}}>
          💡 Mudanças são salvas automaticamente no servidor para todos os usuários
        </div>
        
        <div style={{marginTop:'10px', fontSize:'11px', color:'#666'}}>
          🔄 Clique em "Sincronizar" para forçar atualização em todos os dispositivos
        </div>
        
        <div style={{marginTop:'5px', fontSize:'10px', color:'#555'}}>
          🗑️ "Limpar TUDO" apaga todos os produtos e configurações permanentemente
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
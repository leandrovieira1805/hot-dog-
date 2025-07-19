import React, { createContext, useContext, useState, useEffect } from 'react';

const MenuContext = createContext();

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};

const defaultProducts = [
  {
    id: 1,
    name: 'Hot Dog Tradicional',
    price: 8.50,
    image: 'https://images.pexels.com/photos/4676401/pexels-photo-4676401.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Lanches',
    available: true
  },
  {
    id: 2,
    name: 'Hot Dog Especial',
    price: 12.00,
    image: 'https://images.pexels.com/photos/1633525/pexels-photo-1633525.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Lanches',
    available: true
  },
  {
    id: 3,
    name: 'X-Burguer',
    price: 15.00,
    image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Lanches',
    available: true
  },
  {
    id: 4,
    name: 'Batata Frita',
    price: 6.00,
    image: 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Lanches',
    available: true
  },
  {
    id: 5,
    name: 'Refrigerante',
    price: 4.00,
    image: 'https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=400',
    category: 'Bebidas',
    available: true
  }
];

// Função para salvar dados no servidor via API
const saveToServer = async (data) => {
  try {
    const response = await fetch('/api/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Dados salvos no servidor:', result);
      return true;
    } else {
      console.error('Erro ao salvar no servidor:', response.status);
      return false;
    }
  } catch (error) {
    console.error('Erro ao salvar no servidor:', error);
    return false;
  }
};

// Função para carregar dados do servidor
const loadFromServer = async () => {
  try {
    const response = await fetch('/api/data');
    if (response.ok) {
      const data = await response.json();
      console.log('Dados carregados do servidor:', data);
      return data;
    }
  } catch (error) {
    console.log('Erro ao carregar do servidor:', error);
  }
  return null;
};

export const MenuProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [dailyOffer, setDailyOffer] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pixKey, setPixKey] = useState('');
  const [pixName, setPixName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Carregar dados na inicialização
  useEffect(() => {
    console.log('MenuContext: Inicializando...');
    
    const loadData = async () => {
      setIsLoading(true);
      
      // SEMPRE carregar do servidor primeiro
      const serverData = await loadFromServer();
      
      if (serverData && serverData.products) {
        console.log('MenuContext: Dados carregados do servidor');
        setProducts(serverData.products);
        setDailyOffer(serverData.dailyOffer || null);
        setPixKey(serverData.pixKey || '');
        setPixName(serverData.pixName || '');
        
        // Atualizar localStorage com dados do servidor
        localStorage.setItem('hotdog_products', JSON.stringify(serverData.products));
        if (serverData.dailyOffer) {
          localStorage.setItem('hotdog_daily_offer', JSON.stringify(serverData.dailyOffer));
        } else {
          localStorage.removeItem('hotdog_daily_offer');
        }
        localStorage.setItem('pixKey', serverData.pixKey || '');
        localStorage.setItem('pixName', serverData.pixName || '');
      } else {
        console.log('MenuContext: Servidor não disponível, usando dados padrão');
        setProducts(defaultProducts);
        setDailyOffer(null);
        setPixKey('');
        setPixName('');
        
        // Salvar dados padrão no servidor
        const defaultData = {
          products: defaultProducts,
          dailyOffer: null,
          pixKey: '',
          pixName: ''
        };
        
        try {
          await saveToServer(defaultData);
          console.log('MenuContext: Dados padrão salvos no servidor');
        } catch (error) {
          console.log('MenuContext: Erro ao salvar dados padrão no servidor');
        }
      }

      // Verificar autenticação
      const authStatus = localStorage.getItem('hotdog_admin_auth');
      if (authStatus === 'true') {
        setIsAuthenticated(true);
      }

      setLastUpdate(new Date().getTime());
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Função para salvar produtos
  const saveProducts = async (newProducts) => {
    console.log('MenuContext: Salvando produtos:', newProducts.length);
    setProducts(newProducts);
    
    // Salvar no localStorage
    localStorage.setItem('hotdog_products', JSON.stringify(newProducts));
    
    // Salvar no servidor
    setIsSaving(true);
    const dataToSave = {
      products: newProducts,
      dailyOffer,
      pixKey,
      pixName
    };
    
    const success = await saveToServer(dataToSave);
    if (success) {
      console.log('MenuContext: Produtos salvos no servidor com sucesso');
      setLastUpdate(new Date().getTime());
    } else {
      console.log('MenuContext: Erro ao salvar no servidor, mantendo apenas local');
    }
    setIsSaving(false);
  };

  // Função para adicionar produto
  const addProduct = async (product) => {
    console.log('MenuContext: Adicionando produto:', product.name);
    const newProduct = {
      ...product,
      id: Date.now(),
      category: product.category || 'Lanches',
      available: product.available !== false
    };
    const updatedProducts = [...products, newProduct];
    await saveProducts(updatedProducts);
  };

  // Função para atualizar produto
  const updateProduct = async (id, updatedProduct) => {
    console.log('MenuContext: Atualizando produto ID:', id);
    const updatedProducts = products.map(product =>
      product.id === id ? { 
        ...updatedProduct, 
        id,
        category: updatedProduct.category || product.category || 'Lanches',
        available: updatedProduct.available !== false
      } : product
    );
    await saveProducts(updatedProducts);
  };

  // Função para deletar produto
  const deleteProduct = async (id) => {
    console.log('MenuContext: Deletando produto ID:', id);
    const updatedProducts = products.filter(product => product.id !== id);
    await saveProducts(updatedProducts);
  };

  // Função para definir oferta do dia
  const setOffer = async (offer) => {
    setDailyOffer(offer);
    if (offer) {
      localStorage.setItem('hotdog_daily_offer', JSON.stringify(offer));
    } else {
      localStorage.removeItem('hotdog_daily_offer');
    }
    
    // Salvar no servidor
    setIsSaving(true);
    const dataToSave = {
      products,
      dailyOffer: offer,
      pixKey,
      pixName
    };
    
    const success = await saveToServer(dataToSave);
    if (success) {
      console.log('MenuContext: Oferta salva no servidor com sucesso');
      setLastUpdate(new Date().getTime());
    }
    setIsSaving(false);
  };

  // Função para atualizar configuração Pix
  const updatePixConfig = async (key, name) => {
    setPixKey(key);
    setPixName(name);
    localStorage.setItem('pixKey', key);
    localStorage.setItem('pixName', name);
    
    // Salvar no servidor
    setIsSaving(true);
    const dataToSave = {
      products,
      dailyOffer,
      pixKey: key,
      pixName: name
    };
    
    const success = await saveToServer(dataToSave);
    if (success) {
      console.log('MenuContext: Configuração Pix salva no servidor com sucesso');
      setLastUpdate(new Date().getTime());
    }
    setIsSaving(false);
  };

  // Função de login
  const login = (username, password) => {
    if (username === 'admin' && password === 'hotdog123') {
      setIsAuthenticated(true);
      localStorage.setItem('hotdog_admin_auth', 'true');
      return true;
    }
    return false;
  };

  // Função de logout
  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('hotdog_admin_auth');
  };

  // Função para forçar sincronização
  const forceRefresh = async () => {
    console.log('MenuContext: Forçando sincronização...');
    setIsLoading(true);
    
    // Forçar recarregamento completo do servidor
    const serverData = await loadFromServer();
    if (serverData) {
      setProducts(serverData.products || []);
      setDailyOffer(serverData.dailyOffer || null);
      setPixKey(serverData.pixKey || '');
      setPixName(serverData.pixName || '');
      
      // Atualizar localStorage com dados do servidor
      localStorage.setItem('hotdog_products', JSON.stringify(serverData.products || []));
      if (serverData.dailyOffer) {
        localStorage.setItem('hotdog_daily_offer', JSON.stringify(serverData.dailyOffer));
      } else {
        localStorage.removeItem('hotdog_daily_offer');
      }
      localStorage.setItem('pixKey', serverData.pixKey || '');
      localStorage.setItem('pixName', serverData.pixName || '');
      
      setLastUpdate(new Date().getTime());
      console.log('MenuContext: Sincronização concluída');
    } else {
      console.log('MenuContext: Nenhuma atualização encontrada');
    }
    
    setIsLoading(false);
  };

  // Função para limpar dados
  const clearData = async () => {
    console.log('MenuContext: Limpando todos os dados...');
    
    // Limpar localStorage
    localStorage.removeItem('hotdog_products');
    localStorage.removeItem('hotdog_daily_offer');
    localStorage.removeItem('pixKey');
    localStorage.removeItem('pixName');
    localStorage.removeItem('hotdog_last_update');
    
    // Limpar estado local
    setProducts([]);
    setDailyOffer(null);
    setPixKey('');
    setPixName('');
    setLastUpdate(new Date().getTime());
    
    // Salvar dados vazios no servidor
    const emptyData = {
      products: [],
      dailyOffer: null,
      pixKey: '',
      pixName: ''
    };
    
    try {
      await saveToServer(emptyData);
      console.log('MenuContext: Dados limpos no servidor');
    } catch (error) {
      console.error('MenuContext: Erro ao limpar dados no servidor:', error);
    }
    
    console.log('MenuContext: Todos os dados foram limpos');
  };

  // Função para restaurar produtos padrão
  const restoreDefaults = async () => {
    console.log('MenuContext: Restaurando produtos padrão...');
    
    const defaultData = {
      products: defaultProducts,
      dailyOffer: null,
      pixKey: '',
      pixName: ''
    };
    
    setProducts(defaultProducts);
    setDailyOffer(null);
    setPixKey('');
    setPixName('');
    
    // Salvar no localStorage
    localStorage.setItem('hotdog_products', JSON.stringify(defaultProducts));
    localStorage.removeItem('hotdog_daily_offer');
    localStorage.setItem('pixKey', '');
    localStorage.setItem('pixName', '');
    
    // Salvar no servidor
    try {
      await saveToServer(defaultData);
      console.log('MenuContext: Produtos padrão restaurados no servidor');
    } catch (error) {
      console.error('MenuContext: Erro ao restaurar produtos padrão:', error);
    }
    
    setLastUpdate(new Date().getTime());
  };

  return (
    <MenuContext.Provider value={{
      products,
      dailyOffer,
      isAuthenticated,
      pixKey,
      pixName,
      isLoading,
      isSaving,
      lastUpdate,
      addProduct,
      updateProduct,
      deleteProduct,
      setOffer,
      updatePixConfig,
      login,
      logout,
      forceRefresh,
      clearData,
      restoreDefaults
    }}>
      {children}
    </MenuContext.Provider>
  );
};
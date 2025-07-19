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

export const MenuProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [dailyOffer, setDailyOffer] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pixKey, setPixKey] = useState('');
  const [pixName, setPixName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    console.log('MenuContext: Inicializando...');
    
    // Carregar produtos do localStorage ou usar padrão
    const savedProducts = localStorage.getItem('hotdog_products');
    if (savedProducts) {
      try {
        const parsedProducts = JSON.parse(savedProducts);
        console.log('MenuContext: Produtos carregados do localStorage:', parsedProducts.length);
        setProducts(parsedProducts);
      } catch (error) {
        console.error('MenuContext: Erro ao carregar produtos:', error);
        setProducts(defaultProducts);
        localStorage.setItem('hotdog_products', JSON.stringify(defaultProducts));
      }
    } else {
      console.log('MenuContext: Nenhum produto salvo, usando padrão');
      setProducts(defaultProducts);
      localStorage.setItem('hotdog_products', JSON.stringify(defaultProducts));
    }

    // Carregar oferta do dia
    const savedOffer = localStorage.getItem('hotdog_daily_offer');
    if (savedOffer) {
      try {
        setDailyOffer(JSON.parse(savedOffer));
      } catch (error) {
        setDailyOffer(null);
      }
    }

    // Carregar configurações Pix
    setPixKey(localStorage.getItem('pixKey') || '');
    setPixName(localStorage.getItem('pixName') || '');

    // Verificar autenticação
    const authStatus = localStorage.getItem('hotdog_admin_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }

    setLastUpdate(new Date().getTime());
    setIsLoading(false);
  }, []);

  // Função para salvar produtos no localStorage
  const saveProducts = (newProducts) => {
    console.log('MenuContext: Salvando produtos:', newProducts.length);
    setProducts(newProducts);
    localStorage.setItem('hotdog_products', JSON.stringify(newProducts));
    setLastUpdate(new Date().getTime());
    console.log('MenuContext: Produtos salvos com sucesso');
  };

  // Função para adicionar produto
  const addProduct = (product) => {
    console.log('MenuContext: Adicionando produto:', product.name);
    const newProduct = {
      ...product,
      id: Date.now(),
      category: product.category || 'Lanches',
      available: product.available !== false
    };
    const updatedProducts = [...products, newProduct];
    saveProducts(updatedProducts);
  };

  // Função para atualizar produto
  const updateProduct = (id, updatedProduct) => {
    console.log('MenuContext: Atualizando produto ID:', id);
    const updatedProducts = products.map(product =>
      product.id === id ? { 
        ...updatedProduct, 
        id,
        category: updatedProduct.category || product.category || 'Lanches',
        available: updatedProduct.available !== false
      } : product
    );
    saveProducts(updatedProducts);
  };

  // Função para deletar produto
  const deleteProduct = (id) => {
    console.log('MenuContext: Deletando produto ID:', id);
    const updatedProducts = products.filter(product => product.id !== id);
    saveProducts(updatedProducts);
  };

  // Função para definir oferta do dia
  const setOffer = (offer) => {
    setDailyOffer(offer);
    if (offer) {
      localStorage.setItem('hotdog_daily_offer', JSON.stringify(offer));
    } else {
      localStorage.removeItem('hotdog_daily_offer');
    }
    setLastUpdate(new Date().getTime());
  };

  // Função para atualizar configuração Pix
  const updatePixConfig = (key, name) => {
    setPixKey(key);
    setPixName(name);
    localStorage.setItem('pixKey', key);
    localStorage.setItem('pixName', name);
    setLastUpdate(new Date().getTime());
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

  // Função para forçar sincronização (simulada)
  const forceRefresh = () => {
    console.log('MenuContext: Forçando sincronização...');
    const timestamp = new Date().getTime();
    setLastUpdate(timestamp);
    localStorage.setItem('hotdog_last_update', timestamp.toString());
    console.log('MenuContext: Sincronização forçada concluída');
  };

  // Função para limpar dados
  const clearData = () => {
    localStorage.removeItem('hotdog_products');
    localStorage.removeItem('hotdog_daily_offer');
    localStorage.removeItem('pixKey');
    localStorage.removeItem('pixName');
    localStorage.removeItem('hotdog_last_update');
    setProducts(defaultProducts);
    setDailyOffer(null);
    setPixKey('');
    setPixName('');
    setLastUpdate(new Date().getTime());
    console.log('MenuContext: Dados limpos, voltando ao padrão');
  };

  return (
    <MenuContext.Provider value={{
      products,
      dailyOffer,
      isAuthenticated,
      pixKey,
      pixName,
      isLoading,
      lastUpdate,
      addProduct,
      updateProduct,
      deleteProduct,
      setOffer,
      updatePixConfig,
      login,
      logout,
      forceRefresh,
      clearData
    }}>
      {children}
    </MenuContext.Provider>
  );
};
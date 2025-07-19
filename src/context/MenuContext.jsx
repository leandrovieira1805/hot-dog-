import React, { createContext, useContext, useState, useEffect } from 'react';
import syncManager from '../utils/syncManager';

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

// Função para carregar dados do arquivo JSON com cache busting
const loadDataFromFile = async () => {
  try {
    // Adicionar timestamp para evitar cache
    const timestamp = new Date().getTime();
    const response = await fetch(`/data/products.json?t=${timestamp}`);
    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.log('Arquivo de dados não encontrado, usando localStorage');
  }
  return null;
};

// Função para salvar dados no arquivo JSON via GitHub API
const saveDataToGitHub = async (data) => {
  try {
    // Salvar no localStorage como backup
    localStorage.setItem('hotdog_products', JSON.stringify(data.products));
    localStorage.setItem('hotdog_daily_offer', JSON.stringify(data.dailyOffer));
    localStorage.setItem('pixKey', data.pixKey || '');
    localStorage.setItem('pixName', data.pixName || '');
    
    // Marcar que houve mudança para forçar recarregamento
    localStorage.setItem('hotdog_last_update', new Date().getTime().toString());
    
    console.log('Dados salvos localmente e marcados para sincronização');
    
    // Em produção, aqui seria uma chamada para API do GitHub
    // Por enquanto, vamos usar uma abordagem diferente
    return true;
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
    return false;
  }
};

// Função para verificar se há atualizações
const checkForUpdates = async () => {
  try {
    const lastUpdate = localStorage.getItem('hotdog_last_update');
    const timestamp = new Date().getTime();
    const response = await fetch(`/data/products.json?t=${timestamp}`);
    
    if (response.ok) {
      const data = await response.json();
      const fileLastModified = response.headers.get('last-modified');
      
      if (lastUpdate && fileLastModified) {
        const lastUpdateTime = new Date(parseInt(lastUpdate));
        const fileTime = new Date(fileLastModified);
        
        if (fileTime > lastUpdateTime) {
          console.log('Atualização detectada!');
          return data;
        }
      }
    }
  } catch (error) {
    console.log('Erro ao verificar atualizações:', error);
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
  const [hasLocalChanges, setHasLocalChanges] = useState(false);

  useEffect(() => {
    console.log('MenuContext: Carregando dados...');
    
    const loadData = async () => {
      setIsLoading(true);
      
      // Verificar se há mudanças locais pendentes
      const localLastUpdate = localStorage.getItem('hotdog_last_update');
      const hasLocal = localStorage.getItem('hotdog_has_local_changes') === 'true';
      
      if (hasLocal && localLastUpdate) {
        console.log('MenuContext: Mudanças locais detectadas, carregando do localStorage');
        setHasLocalChanges(true);
        
        // Carregar dados locais
        const savedProducts = localStorage.getItem('hotdog_products');
        if (savedProducts) {
          try {
            const parsedProducts = JSON.parse(savedProducts);
            setProducts(parsedProducts);
          } catch (error) {
            setProducts(defaultProducts);
          }
        } else {
          setProducts(defaultProducts);
        }

        const savedOffer = localStorage.getItem('hotdog_daily_offer');
        if (savedOffer) {
          try {
            setDailyOffer(JSON.parse(savedOffer));
          } catch (error) {
            setDailyOffer(null);
          }
        }

        setPixKey(localStorage.getItem('pixKey') || '');
        setPixName(localStorage.getItem('pixName') || '');
        setLastUpdate(parseInt(localLastUpdate));
        setIsLoading(false);
        return;
      }
      
      // Se não há mudanças locais, verificar arquivo
      const updates = await checkForUpdates();
      if (updates) {
        console.log('MenuContext: Atualizações encontradas:', updates);
        setProducts(updates.products || defaultProducts);
        setDailyOffer(updates.dailyOffer || null);
        setPixKey(updates.pixKey || '');
        setPixName(updates.pixName || '');
        setLastUpdate(new Date().getTime());
        setIsLoading(false);
        return;
      }
      
      // Tentar carregar do arquivo
      const fileData = await loadDataFromFile();
      
      if (fileData) {
        console.log('MenuContext: Dados carregados do arquivo:', fileData);
        setProducts(fileData.products || defaultProducts);
        setDailyOffer(fileData.dailyOffer || null);
        setPixKey(fileData.pixKey || '');
        setPixName(fileData.pixName || '');
      } else {
        // Fallback para localStorage
        const savedProducts = localStorage.getItem('hotdog_products');
        console.log('MenuContext: Produtos salvos encontrados:', savedProducts);
        
        if (savedProducts) {
          try {
            const parsedProducts = JSON.parse(savedProducts);
            console.log('MenuContext: Produtos carregados:', parsedProducts);
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
            console.error('MenuContext: Erro ao carregar oferta:', error);
          }
        }

        // Carregar configurações Pix
        setPixKey(localStorage.getItem('pixKey') || '');
        setPixName(localStorage.getItem('pixName') || '');
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
    
    // Iniciar sincronização automática
    syncManager.startAutoSync();
    
    // Escutar eventos de atualização
    const handleProductsUpdated = (event) => {
      // Só atualizar se não há mudanças locais pendentes
      if (!hasLocalChanges) {
        const data = event.detail;
        console.log('MenuContext: Evento de atualização recebido:', data);
        setProducts(data.products || products);
        setDailyOffer(data.dailyOffer || dailyOffer);
        setPixKey(data.pixKey || pixKey);
        setPixName(data.pixName || pixName);
        setLastUpdate(new Date().getTime());
      } else {
        console.log('MenuContext: Ignorando atualização - há mudanças locais pendentes');
      }
    };
    
    window.addEventListener('productsUpdated', handleProductsUpdated);

    return () => {
      syncManager.stopAutoSync();
      window.removeEventListener('productsUpdated', handleProductsUpdated);
    };
  }, [hasLocalChanges]);

  const saveProducts = async (newProducts) => {
    console.log('MenuContext: Salvando produtos:', newProducts);
    setProducts(newProducts);
    
    try {
      // Salvar no arquivo (simulado)
      const dataToSave = {
        products: newProducts,
        dailyOffer,
        pixKey,
        pixName
      };
      
      await saveDataToGitHub(dataToSave);
      console.log('MenuContext: Produtos salvos com sucesso');
      
      // Marcar mudança para sincronização
      syncManager.markLocalChange();
      setHasLocalChanges(true);
      localStorage.setItem('hotdog_has_local_changes', 'true');
      setLastUpdate(new Date().getTime());
      
      // Verificar se foi salvo
      const saved = localStorage.getItem('hotdog_products');
      console.log('MenuContext: Verificação - produtos no localStorage:', saved);
    } catch (error) {
      console.error('MenuContext: Erro ao salvar produtos:', error);
    }
  };

  const addProduct = async (product) => {
    console.log('MenuContext: Adicionando produto:', product);
    const newProduct = {
      ...product,
      id: Date.now(),
      category: product.category || 'Lanches',
      available: product.available !== false
    };
    const updatedProducts = [...products, newProduct];
    console.log('MenuContext: Lista atualizada:', updatedProducts);
    await saveProducts(updatedProducts);
  };

  const updateProduct = async (id, updatedProduct) => {
    console.log('MenuContext: Atualizando produto ID:', id, 'Dados:', updatedProduct);
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

  const deleteProduct = async (id) => {
    console.log('MenuContext: Deletando produto ID:', id);
    const updatedProducts = products.filter(product => product.id !== id);
    await saveProducts(updatedProducts);
  };

  const setOffer = async (offer) => {
    setDailyOffer(offer);
    
    try {
      if (offer) {
        localStorage.setItem('hotdog_daily_offer', JSON.stringify(offer));
      } else {
        localStorage.removeItem('hotdog_daily_offer');
      }
      
      // Salvar no arquivo também
      const dataToSave = {
        products,
        dailyOffer: offer,
        pixKey,
        pixName
      };
      
      await saveDataToGitHub(dataToSave);
      setHasLocalChanges(true);
      localStorage.setItem('hotdog_has_local_changes', 'true');
      setLastUpdate(new Date().getTime());
    } catch (error) {
      console.error('MenuContext: Erro ao salvar oferta:', error);
    }
  };

  const updatePixConfig = async (key, name) => {
    setPixKey(key);
    setPixName(name);
    
    try {
      localStorage.setItem('pixKey', key);
      localStorage.setItem('pixName', name);
      
      // Salvar no arquivo também
      const dataToSave = {
        products,
        dailyOffer,
        pixKey: key,
        pixName: name
      };
      
      await saveDataToGitHub(dataToSave);
      setHasLocalChanges(true);
      localStorage.setItem('hotdog_has_local_changes', 'true');
      setLastUpdate(new Date().getTime());
    } catch (error) {
      console.error('MenuContext: Erro ao salvar configuração Pix:', error);
    }
  };

  const login = (username, password) => {
    if (username === 'admin' && password === 'hotdog123') {
      setIsAuthenticated(true);
      localStorage.setItem('hotdog_admin_auth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('hotdog_admin_auth');
  };

  const forceRefresh = async () => {
    console.log('MenuContext: Forçando sincronização...');
    
    // Se há mudanças locais, limpar flag e permitir sincronização
    if (hasLocalChanges) {
      console.log('MenuContext: Limpando mudanças locais para sincronizar');
      setHasLocalChanges(false);
      localStorage.removeItem('hotdog_has_local_changes');
    }
    
    const data = await syncManager.forceSync();
    if (data) {
      setProducts(data.products || products);
      setDailyOffer(data.dailyOffer || dailyOffer);
      setPixKey(data.pixKey || pixKey);
      setPixName(data.pixName || pixName);
      setLastUpdate(new Date().getTime());
      console.log('MenuContext: Sincronização forçada concluída');
    } else {
      console.log('MenuContext: Nenhuma atualização encontrada');
    }
  };

  const clearLocalChanges = () => {
    setHasLocalChanges(false);
    localStorage.removeItem('hotdog_has_local_changes');
    console.log('MenuContext: Mudanças locais limpas');
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
      hasLocalChanges,
      addProduct,
      updateProduct,
      deleteProduct,
      setOffer,
      updatePixConfig,
      login,
      logout,
      forceRefresh,
      clearLocalChanges
    }}>
      {children}
    </MenuContext.Provider>
  );
};
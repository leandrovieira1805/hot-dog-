import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getMenuData, 
  saveMenuData, 
  addProduct as firebaseAddProduct,
  updateProduct as firebaseUpdateProduct,
  deleteProduct as firebaseDeleteProduct,
  setDailyOffer as firebaseSetDailyOffer,
  updatePixConfig as firebaseUpdatePixConfig,
  clearAllData as firebaseClearAllData,
  restoreDefaultData as firebaseRestoreDefaultData,
  subscribeToMenuChanges
} from '../firebase/menuService';

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

// Função para salvar dados no Firebase
const saveToFirebase = async (data) => {
  try {
    await saveMenuData(data);
    console.log('Dados salvos no Firebase');
    return true;
  } catch (error) {
    console.error('Erro ao salvar no Firebase:', error);
    return false;
  }
};

// Função para carregar dados do Firebase
const loadFromFirebase = async () => {
  try {
    const data = await getMenuData();
    console.log('Dados carregados do Firebase:', data);
    return data;
  } catch (error) {
    console.log('Erro ao carregar do Firebase:', error);
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
  const [syncTimeout, setSyncTimeout] = useState(null);

  // Carregar dados na inicialização e sincronizar em tempo real
  useEffect(() => {
    console.log('MenuContext: Inicializando com Firebase...');
    
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // Carregar dados do Firebase
        const firebaseData = await loadFromFirebase();
        
        if (firebaseData && firebaseData.products) {
          console.log('MenuContext: Dados carregados do Firebase');
          setProducts(firebaseData.products);
          setDailyOffer(firebaseData.dailyOffer || null);
          setPixKey(firebaseData.pixKey || '');
          setPixName(firebaseData.pixName || '');
          setLastUpdate(new Date(firebaseData.lastUpdate).getTime());
        } else {
          console.log('MenuContext: Firebase não disponível, usando dados padrão');
          setProducts(defaultProducts);
          setDailyOffer(null);
          setPixKey('');
          setPixName('');
          
          // Salvar dados padrão no Firebase
          const defaultData = {
            products: defaultProducts,
            dailyOffer: null,
            pixKey: '',
            pixName: ''
          };
          
          try {
            await saveToFirebase(defaultData);
            console.log('MenuContext: Dados padrão salvos no Firebase');
          } catch (error) {
            console.log('MenuContext: Erro ao salvar dados padrão no Firebase');
          }
        }
      } catch (error) {
        console.error('MenuContext: Erro ao carregar dados:', error);
        // Fallback para dados padrão
        setProducts(defaultProducts);
        setDailyOffer(null);
        setPixKey('');
        setPixName('');
      }

      // Verificar autenticação
      const authStatus = localStorage.getItem('hotdog_admin_auth');
      if (authStatus === 'true') {
        setIsAuthenticated(true);
      }

      setIsLoading(false);
    };

    // Carregar dados iniciais
    loadData();
    
    // Sincronização em tempo real com Firebase
    const unsubscribe = subscribeToMenuChanges((data) => {
      if (data) {
        console.log('MenuContext: Mudança detectada no Firebase, atualizando...');
        console.log(`📦 Produtos recebidos: ${data.products?.length || 0}`);
        
        // Debounce para evitar múltiplas atualizações
        if (syncTimeout) {
          clearTimeout(syncTimeout);
        }
        
        const timeout = setTimeout(() => {
          // Sempre atualizar com os dados mais recentes do Firebase
          // Isso garante que não perdemos sincronização
          setProducts(data.products || []);
          setDailyOffer(data.dailyOffer || null);
          setPixKey(data.pixKey || '');
          setPixName(data.pixName || '');
          setLastUpdate(new Date(data.lastUpdate).getTime());
          
          console.log('✅ Dados atualizados com sucesso');
        }, 100); // 100ms de debounce
        
        setSyncTimeout(timeout);
      }
    });
    
    // Cleanup
    return () => {
      unsubscribe();
      if (syncTimeout) {
        clearTimeout(syncTimeout);
      }
    };
  }, []);

  // Função para salvar produtos
  const saveProducts = async (newProducts) => {
    console.log('MenuContext: Salvando produtos:', newProducts.length);
    setProducts(newProducts);
    
    // Salvar no Firebase
    setIsSaving(true);
    const dataToSave = {
      products: newProducts,
      dailyOffer,
      pixKey,
      pixName
    };
    
    const success = await saveToFirebase(dataToSave);
    if (success) {
      console.log('MenuContext: Produtos salvos no Firebase com sucesso');
      setLastUpdate(new Date().getTime());
    } else {
      console.log('MenuContext: Erro ao salvar no Firebase');
    }
    setIsSaving(false);
  };

  // Função para adicionar produto
  const addProduct = async (product) => {
    console.log('MenuContext: Adicionando produto:', product.name);
    try {
      const newProduct = await firebaseAddProduct(product);
      console.log('MenuContext: Produto adicionado com sucesso');
      
      // A sincronização em tempo real vai atualizar automaticamente
      // Não precisamos forçar atualização manual
      
      return newProduct;
    } catch (error) {
      console.error('MenuContext: Erro ao adicionar produto:', error);
      throw error;
    }
  };

  // Função para atualizar produto
  const updateProduct = async (id, updatedProduct) => {
    console.log('MenuContext: Atualizando produto ID:', id);
    try {
      await firebaseUpdateProduct(id, updatedProduct);
      console.log('MenuContext: Produto atualizado com sucesso');
      
      // A sincronização em tempo real vai atualizar automaticamente
    } catch (error) {
      console.error('MenuContext: Erro ao atualizar produto:', error);
      throw error;
    }
  };

  // Função para deletar produto
  const deleteProduct = async (id) => {
    console.log('MenuContext: Deletando produto ID:', id);
    try {
      await firebaseDeleteProduct(id);
      console.log('MenuContext: Produto deletado com sucesso');
      
      // A sincronização em tempo real vai atualizar automaticamente
    } catch (error) {
      console.error('MenuContext: Erro ao deletar produto:', error);
      throw error;
    }
  };

  // Função para definir oferta do dia
  const setOffer = async (offer) => {
    try {
      await firebaseSetDailyOffer(offer);
      console.log('MenuContext: Oferta salva no Firebase com sucesso');
    } catch (error) {
      console.error('MenuContext: Erro ao salvar oferta:', error);
      throw error;
    }
  };

  // Função para atualizar configuração Pix
  const updatePixConfig = async (key, name) => {
    try {
      await firebaseUpdatePixConfig(key, name);
      console.log('MenuContext: Configuração Pix salva no Firebase com sucesso');
    } catch (error) {
      console.error('MenuContext: Erro ao salvar configuração Pix:', error);
      throw error;
    }
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
    
    try {
      // Recarregar dados do Firebase
      const firebaseData = await loadFromFirebase();
      if (firebaseData) {
        setProducts(firebaseData.products || []);
        setDailyOffer(firebaseData.dailyOffer || null);
        setPixKey(firebaseData.pixKey || '');
        setPixName(firebaseData.pixName || '');
        setLastUpdate(new Date(firebaseData.lastUpdate).getTime());
        console.log('MenuContext: Sincronização concluída');
      } else {
        console.log('MenuContext: Nenhuma atualização encontrada');
      }
    } catch (error) {
      console.error('MenuContext: Erro na sincronização:', error);
    }
    
    setIsLoading(false);
  };

  // Função para limpar dados
  const clearData = async () => {
    console.log('MenuContext: Limpando todos os dados...');
    
    try {
      await firebaseClearAllData();
      console.log('MenuContext: Dados limpos no Firebase');
    } catch (error) {
      console.error('MenuContext: Erro ao limpar dados no Firebase:', error);
    }
  };

  // Função para restaurar produtos padrão
  const restoreDefaults = async () => {
    console.log('MenuContext: Restaurando produtos padrão...');
    
    try {
      await firebaseRestoreDefaultData();
      console.log('MenuContext: Produtos padrão restaurados no Firebase');
    } catch (error) {
      console.error('MenuContext: Erro ao restaurar produtos padrão:', error);
    }
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
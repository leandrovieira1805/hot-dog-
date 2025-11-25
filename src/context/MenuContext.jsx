import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getMenuData, 
  saveMenuData, 
  addProduct as firebaseAddProduct,
  updateProduct as firebaseUpdateProduct,
  deleteProduct as firebaseDeleteProduct,
  setDailyOffer as firebaseSetDailyOffer,
  updatePixConfig as firebaseUpdatePixConfig,
  updateWhatsAppNumber as firebaseUpdateWhatsAppNumber,
  updateDeliveryFees as firebaseUpdateDeliveryFees,
  updateAddOns as firebaseUpdateAddOns,
  updateCategories as firebaseUpdateCategories,
  updateSiteConfig as firebaseUpdateSiteConfig,
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

// Normaliza taxas de entrega vindas do Firebase
// Aceita objeto (chaves fixas) ou array [{ name, fee }]
const normalizeDeliveryFees = (fees) => {
  if (!fees) {
    return [
      { name: 'Lagoa Grande', fee: 4 },
      { name: 'Izacolândia', fee: 5 }
    ];
  }
  if (Array.isArray(fees)) {
    return fees
      .filter(item => item && typeof item.name === 'string')
      .map(item => ({ name: item.name, fee: Number(item.fee || 0) }));
  }
  // Caso seja objeto antigo { chave: valor }
  return Object.entries(fees).map(([key, value]) => ({ name: key, fee: Number(value || 0) }));
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
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [logoImage, setLogoImage] = useState('/logo-arretado.png');
  const [backgroundImage, setBackgroundImage] = useState('/hero-arretado.jpg');
  const [address, setAddress] = useState('Terezinha Nunes');
  const [openingHours, setOpeningHours] = useState('15:00 - 23:00');
  const [deliveryFees, setDeliveryFees] = useState([
    { name: 'Lagoa Grande', fee: 4 },
    { name: 'Izacolândia', fee: 5 }
  ]);
  const [addOns, setAddOns] = useState([
    { name: 'Bacon', price: 3.50 },
    { name: 'Queijo Extra', price: 2.00 },
    { name: 'Cebola Caramelizada', price: 1.50 },
    { name: 'Cogumelos', price: 2.50 }
  ]);
  const [espetinhoCombos, setEspetinhoCombos] = useState([
    {
      id: 1,
      name: 'Combo 3x Espetinho Tradicional',
      price: 25.00,
      image: 'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: '3 espetinhos de frango + 1 refrigerante',
      items: ['3x Espetinho de Frango', '1x Refrigerante'],
      available: true
    },
    {
      id: 2,
      name: 'Combo 3x Espetinho Especial',
      price: 35.00,
      image: 'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: '3 espetinhos mistos + 1 refrigerante + batata frita',
      items: ['2x Espetinho de Frango', '1x Espetinho de Carne', '1x Refrigerante', '1x Batata Frita'],
      available: true
    }
  ]);
  const [categories, setCategories] = useState([
    { name: 'Hambúrgueres', icon: '🍔', enabled: true },
    { name: 'Petiscos', icon: '🍟', enabled: true },
    { name: 'Bebidas', icon: '🥤', enabled: true },
    { name: 'Hot Dog', icon: '🌭', enabled: true },
    { name: 'Bolos', icon: '🍰', enabled: true },
    { name: 'Batata', icon: '🥔', enabled: true },
    { name: 'Cuscuz', icon: '🌽', enabled: true }
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [syncTimeout, setSyncTimeout] = useState(null);

  // Carregar dados na inicialização e sincronizar em tempo real
  useEffect(() => {
    console.log('MenuContext: Inicializando com Firebase...');
    console.log('MenuContext: Ambiente:', process.env.NODE_ENV);
    console.log('MenuContext: URL atual:', window.location.href);
    
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
          setWhatsappNumber(firebaseData.whatsappNumber || '');
          setLogoImage(firebaseData.logoImage || '/logo-arretado.png');
          setBackgroundImage(firebaseData.backgroundImage || '/hero-arretado.jpg');
          setAddress(firebaseData.address || 'Terezinha Nunes');
          setOpeningHours(firebaseData.openingHours || '15:00 - 23:00');
          setDeliveryFees(normalizeDeliveryFees(firebaseData.deliveryFees));
          setAddOns(firebaseData.addOns || [
            { name: 'Bacon', price: 3.50 },
            { name: 'Queijo Extra', price: 2.00 },
            { name: 'Cebola Caramelizada', price: 1.50 },
            { name: 'Cogumelos', price: 2.50 }
          ]);
          setEspetinhoCombos(firebaseData.espetinhoCombos || [
            {
              id: 1,
              name: 'Combo 3x Espetinho Tradicional',
              price: 25.00,
              image: 'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=400',
              description: '3 espetinhos de frango + 1 refrigerante',
              items: ['3x Espetinho de Frango', '1x Refrigerante'],
              available: true
            },
            {
              id: 2,
              name: 'Combo 3x Espetinho Especial',
              price: 35.00,
              image: 'https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=400',
              description: '3 espetinhos mistos + 1 refrigerante + batata frita',
              items: ['2x Espetinho de Frango', '1x Espetinho de Carne', '1x Refrigerante', '1x Batata Frita'],
              available: true
            }
          ]);
          setCategories(firebaseData.categories || [
            { name: 'Hambúrgueres', icon: '🍔', enabled: true },
            { name: 'Petiscos', icon: '🍟', enabled: true },
            { name: 'Bebidas', icon: '🥤', enabled: true },
            { name: 'Hot Dog', icon: '🌭', enabled: true },
            { name: 'Bolos', icon: '🍰', enabled: true },
            { name: 'Batata', icon: '🥔', enabled: true },
            { name: 'Cuscuz', icon: '🌽', enabled: true }
          ]);
          setLastUpdate(new Date(firebaseData.lastUpdate).getTime());
        } else {
          console.log('MenuContext: Firebase não disponível, usando dados padrão');
          setProducts(defaultProducts);
          setDailyOffer(null);
          setPixKey('');
          setPixName('');
          setWhatsappNumber('');
          setLogoImage('/logo-arretado.png');
          setBackgroundImage('/hero-arretado.jpg');
          setAddress('Terezinha Nunes');
          setOpeningHours('15:00 - 23:00');
          setDeliveryFees([
            { name: 'Lagoa Grande', fee: 4 },
            { name: 'Izacolândia', fee: 5 }
          ]);
          
          // Salvar dados padrão no Firebase
          const defaultData = {
            products: defaultProducts,
            dailyOffer: null,
            pixKey: '',
            pixName: '',
            whatsappNumber: ''
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
        console.log('MenuContext: Timestamp da mudança:', data.lastUpdate);
        
        // Debounce para evitar múltiplas atualizações
        if (syncTimeout) {
          clearTimeout(syncTimeout);
        }
        
        const timeout = setTimeout(() => {
          // Sempre atualizar todos os dados para evitar inconsistências
          console.log('🔄 Atualizando todos os dados do Firebase...');
          setProducts(data.products || []);
          setDailyOffer(data.dailyOffer || null);
          setPixKey(data.pixKey || '');
          setPixName(data.pixName || '');
          setWhatsappNumber(data.whatsappNumber || '');
          setLogoImage(data.logoImage || '/logo-arretado.png');
          setBackgroundImage(data.backgroundImage || '/hero-arretado.jpg');
          setAddress(data.address || 'Terezinha Nunes');
          setOpeningHours(data.openingHours || '15:00 - 23:00');
          setDeliveryFees(normalizeDeliveryFees(data.deliveryFees));
          setAddOns(data.addOns || []);
          setEspetinhoCombos(data.espetinhoCombos || []);
          setCategories(data.categories || []);
          setLastUpdate(new Date(data.lastUpdate).getTime());
          
          console.log('✅ Dados atualizados com sucesso');
        }, 200); // Aumentado para 200ms para mais estabilidade
        
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
      pixName,
      whatsappNumber,
      deliveryFees,
      addOns,
      espetinhoCombos,
      categories
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

  // Função para remover oferta do dia
  const removeOffer = async () => {
    try {
      await firebaseSetDailyOffer(null);
      console.log('MenuContext: Oferta removida do Firebase com sucesso');
    } catch (error) {
      console.error('MenuContext: Erro ao remover oferta:', error);
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

  // Função para atualizar número do WhatsApp
  const updateWhatsapp = async (number) => {
    try {
      await firebaseUpdateWhatsAppNumber(number);
      console.log('MenuContext: WhatsApp salvo no Firebase com sucesso');
    } catch (error) {
      console.error('MenuContext: Erro ao salvar WhatsApp:', error);
      throw error;
    }
  };

  // Função para atualizar taxas de entrega
  const updateFees = async (fees) => {
    try {
      await firebaseUpdateDeliveryFees(fees);
      console.log('MenuContext: Taxas salvas no Firebase com sucesso');
    } catch (error) {
      console.error('MenuContext: Erro ao salvar taxas:', error);
      throw error;
    }
  };

  // Função para atualizar adicionais
  const updateAddOns = async (newAddOns) => {
    try {
      await firebaseUpdateAddOns(newAddOns);
      console.log('MenuContext: Adicionais salvos no Firebase com sucesso');
    } catch (error) {
      console.error('MenuContext: Erro ao salvar adicionais:', error);
      throw error;
    }
  };

  // Função para atualizar categorias
  const updateCategories = async (newCategories) => {
    try {
      await firebaseUpdateCategories(newCategories);
      console.log('MenuContext: Categorias salvas no Firebase com sucesso');
    } catch (error) {
      console.error('MenuContext: Erro ao salvar categorias:', error);
      throw error;
    }
  };

  // Função para atualizar configurações do site
  const updateSiteConfig = async (logoImage, backgroundImage, address, openingHours, tagline, logoSize) => {
    try {
      await firebaseUpdateSiteConfig(logoImage, backgroundImage, address, openingHours, tagline, logoSize);
      setLogoImage(logoImage || '/logo-arretado.png');
      setBackgroundImage(backgroundImage || '/hero-arretado.jpg');
      setAddress(address || 'Terezinha Nunes');
      setOpeningHours(openingHours || '15:00 - 23:00');
      setTagline(tagline || 'Sabores autênticos que conquistam corações');
      setLogoSize(Number(logoSize || 720));
      setLastUpdate(new Date(data.lastUpdate).getTime());
      console.log('MenuContext: Configurações do site salvas no Firebase com sucesso');
    } catch (error) {
      console.error('MenuContext: Erro ao salvar configurações do site:', error);
      throw error;
    }
  };

  // Função para atualizar combos espetinho
  const updateEspetinhoCombos = async (newCombos) => {
    try {
      const dataToSave = {
        products,
        dailyOffer,
        pixKey,
        pixName,
        whatsappNumber,
        deliveryFees,
        addOns,
        espetinhoCombos: newCombos,
        categories
      };
      await saveToFirebase(dataToSave);
      console.log('MenuContext: Combos espetinho salvos no Firebase com sucesso');
    } catch (error) {
      console.error('MenuContext: Erro ao salvar combos espetinho:', error);
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
        setWhatsappNumber(firebaseData.whatsappNumber || '');
        setLogoImage(firebaseData.logoImage || '/logo-arretado.png');
        setBackgroundImage(firebaseData.backgroundImage || '/hero-arretado.jpg');
        setAddress(firebaseData.address || 'Terezinha Nunes');
        setOpeningHours(firebaseData.openingHours || '15:00 - 23:00');
        setDeliveryFees(normalizeDeliveryFees(firebaseData.deliveryFees));
        setAddOns(firebaseData.addOns || []);
        setEspetinhoCombos(firebaseData.espetinhoCombos || []);
        setCategories(firebaseData.categories || [
          { name: 'Hambúrgueres', icon: '🍔', enabled: true },
          { name: 'Petiscos', icon: '🍟', enabled: true },
          { name: 'Bebidas', icon: '🥤', enabled: true },
          { name: 'Hot Dog', icon: '🌭', enabled: true },
          { name: 'Bolos', icon: '🍰', enabled: true },
          { name: 'Batata', icon: '🥔', enabled: true },
          { name: 'Cuscuz', icon: '🌽', enabled: true }
        ]);
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
      whatsappNumber,
      deliveryFees,
      addOns,
      espetinhoCombos,
      categories,
      logoImage,
      backgroundImage,
      address,
      openingHours,
      tagline,
      logoSize,
      isLoading,
      isSaving,
      lastUpdate,
      addProduct,
      updateProduct,
      deleteProduct,
      setOffer,
      removeOffer,
      updatePixConfig,
      updateWhatsapp,
      updateFees,
      updateAddOns,
      updateEspetinhoCombos,
      updateCategories,
      updateSiteConfig,
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
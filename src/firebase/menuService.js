import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot,
  collection,
  query,
  orderBy,
  addDoc,
  deleteDoc,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from './config';

// Referências para os documentos
const MENU_DOC_ID = 'menu_data'; // Voltar para estrutura antiga temporariamente
const MENU_CONFIG_DOC_ID = 'menu_config';
const PRODUCTS_COLLECTION = 'products';

// Função para obter dados do menu (estrutura antiga temporária)
export const getMenuData = async () => {
  try {
    const docRef = doc(db, 'menu', MENU_DOC_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('Firebase: Dados carregados (estrutura antiga):', data);
      return data;
    } else {
      console.log('Firebase: Documento não existe, criando padrão...');
      const defaultData = {
        products: [
          {
            id: 1,
            name: 'Hot Dog Tradicional',
            price: 8.50,
            image: 'https://images.pexels.com/photos/4676401/pexels-photo-4676401.jpeg?auto=compress&cs=tinysrgb&w=400',
            category: 'Lanches',
            available: true,
            createdAt: new Date().toISOString()
          },
          {
            id: 2,
            name: 'Hot Dog Especial',
            price: 12.00,
            image: 'https://images.pexels.com/photos/1633525/pexels-photo-1633525.jpeg?auto=compress&cs=tinysrgb&w=400',
            category: 'Lanches',
            available: true,
            createdAt: new Date().toISOString()
          }
        ],
        dailyOffer: null,
        pixKey: '',
        pixName: '',
        lastUpdate: new Date().toISOString()
      };
      
      await setDoc(docRef, defaultData);
      return defaultData;
    }
  } catch (error) {
    console.error('Firebase: Erro ao carregar dados:', error);
    throw error;
  }
};

// Função para salvar dados do menu (estrutura antiga)
export const saveMenuData = async (data) => {
  try {
    const docRef = doc(db, 'menu', MENU_DOC_ID);
    const dataToSave = {
      ...data,
      lastUpdate: new Date().toISOString()
    };
    
    await setDoc(docRef, dataToSave);
    console.log('Firebase: Dados salvos com sucesso (estrutura antiga)');
    return true;
  } catch (error) {
    console.error('Firebase: Erro ao salvar dados:', error);
    throw error;
  }
};

// Função para salvar configurações do menu (nova estrutura - comentada)
export const saveMenuConfig = async (config) => {
  try {
    const configRef = doc(db, 'menu', MENU_CONFIG_DOC_ID);
    const dataToSave = {
      ...config,
      lastUpdate: new Date().toISOString()
    };
    
    await setDoc(configRef, dataToSave);
    console.log('Firebase: Configurações salvas com sucesso');
    return true;
  } catch (error) {
    console.error('Firebase: Erro ao salvar configurações:', error);
    throw error;
  }
};

// Função para adicionar produto (estrutura antiga)
export const addProduct = async (product) => {
  try {
    const newProduct = {
      ...product,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    
    const currentData = await getMenuData();
    const updatedProducts = [...currentData.products, newProduct];
    
    await saveMenuData({
      ...currentData,
      products: updatedProducts
    });
    
    console.log('Firebase: Produto adicionado (estrutura antiga):', newProduct.name);
    return newProduct;
  } catch (error) {
    console.error('Firebase: Erro ao adicionar produto:', error);
    throw error;
  }
};

// Função para atualizar produto (estrutura antiga)
export const updateProduct = async (productId, updates) => {
  try {
    const currentData = await getMenuData();
    const updatedProducts = currentData.products.map(product => 
      product.id === productId 
        ? { ...product, ...updates, updatedAt: new Date().toISOString() }
        : product
    );
    
    await saveMenuData({
      ...currentData,
      products: updatedProducts
    });
    
    console.log('Firebase: Produto atualizado (estrutura antiga):', productId);
    return true;
  } catch (error) {
    console.error('Firebase: Erro ao atualizar produto:', error);
    throw error;
  }
};

// Função para deletar produto (estrutura antiga)
export const deleteProduct = async (productId) => {
  try {
    const currentData = await getMenuData();
    const updatedProducts = currentData.products.filter(product => product.id !== productId);
    
    await saveMenuData({
      ...currentData,
      products: updatedProducts
    });
    
    console.log('Firebase: Produto deletado (estrutura antiga):', productId);
    return true;
  } catch (error) {
    console.error('Firebase: Erro ao deletar produto:', error);
    throw error;
  }
};

// Função para definir oferta do dia (estrutura antiga)
export const setDailyOffer = async (offer) => {
  try {
    const currentData = await getMenuData();
    await saveMenuData({
      ...currentData,
      dailyOffer: offer
    });
    console.log('Firebase: Oferta do dia definida (estrutura antiga):', offer?.name || 'removida');
    return true;
  } catch (error) {
    console.error('Firebase: Erro ao definir oferta:', error);
    throw error;
  }
};

// Função para atualizar configuração Pix (estrutura antiga)
export const updatePixConfig = async (pixKey, pixName) => {
  try {
    const currentData = await getMenuData();
    await saveMenuData({
      ...currentData,
      pixKey,
      pixName
    });
    console.log('Firebase: Configuração Pix atualizada (estrutura antiga)');
    return true;
  } catch (error) {
    console.error('Firebase: Erro ao atualizar Pix:', error);
    throw error;
  }
};

// Função para limpar todos os dados (estrutura antiga)
export const clearAllData = async () => {
  try {
    const emptyData = {
      products: [],
      dailyOffer: null,
      pixKey: '',
      pixName: '',
      lastUpdate: new Date().toISOString()
    };
    
    await saveMenuData(emptyData);
    console.log('Firebase: Todos os dados foram limpos (estrutura antiga)');
    return true;
  } catch (error) {
    console.error('Firebase: Erro ao limpar dados:', error);
    throw error;
  }
};

// Função para restaurar dados padrão (estrutura antiga)
export const restoreDefaultData = async () => {
  try {
    const defaultData = {
      products: [
        {
          id: 1,
          name: 'Hot Dog Tradicional',
          price: 8.50,
          image: 'https://images.pexels.com/photos/4676401/pexels-photo-4676401.jpeg?auto=compress&cs=tinysrgb&w=400',
          category: 'Lanches',
          available: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Hot Dog Especial',
          price: 12.00,
          image: 'https://images.pexels.com/photos/1633525/pexels-photo-1633525.jpeg?auto=compress&cs=tinysrgb&w=400',
          category: 'Lanches',
          available: true,
          createdAt: new Date().toISOString()
        }
      ],
      dailyOffer: null,
      pixKey: '',
      pixName: '',
      lastUpdate: new Date().toISOString()
    };
    
    await saveMenuData(defaultData);
    console.log('Firebase: Dados padrão restaurados (estrutura antiga)');
    return true;
  } catch (error) {
    console.error('Firebase: Erro ao restaurar dados padrão:', error);
    throw error;
  }
};

// Função para escutar mudanças em tempo real (estrutura antiga)
export const subscribeToMenuChanges = (callback) => {
  const docRef = doc(db, 'menu', MENU_DOC_ID);
  
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      console.log('Firebase: Mudança detectada (estrutura antiga):', data.lastUpdate);
      callback(data);
    } else {
      console.log('Firebase: Documento não existe');
      callback(null);
    }
  }, (error) => {
    console.error('Firebase: Erro ao escutar mudanças:', error);
  });
}; 
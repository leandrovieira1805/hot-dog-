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
  deleteDoc
} from 'firebase/firestore';
import { db } from './config';

// Referência para o documento principal
const MENU_DOC_ID = 'menu_data';

// Função para obter dados do menu
export const getMenuData = async () => {
  try {
    const docRef = doc(db, 'menu', MENU_DOC_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log('Firebase: Dados carregados:', docSnap.data());
      return docSnap.data();
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
          },
          {
            id: 3,
            name: 'X-Burguer',
            price: 15.00,
            image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400',
            category: 'Lanches',
            available: true,
            createdAt: new Date().toISOString()
          },
          {
            id: 4,
            name: 'Batata Frita',
            price: 6.00,
            image: 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=400',
            category: 'Lanches',
            available: true,
            createdAt: new Date().toISOString()
          },
          {
            id: 5,
            name: 'Refrigerante',
            price: 4.00,
            image: 'https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=400',
            category: 'Bebidas',
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

// Função para salvar dados do menu
export const saveMenuData = async (data) => {
  try {
    const docRef = doc(db, 'menu', MENU_DOC_ID);
    const dataToSave = {
      ...data,
      lastUpdate: new Date().toISOString()
    };
    
    await setDoc(docRef, dataToSave);
    console.log('Firebase: Dados salvos com sucesso');
    return true;
  } catch (error) {
    console.error('Firebase: Erro ao salvar dados:', error);
    throw error;
  }
};

// Função para atualizar dados do menu
export const updateMenuData = async (updates) => {
  try {
    const docRef = doc(db, 'menu', MENU_DOC_ID);
    const dataToUpdate = {
      ...updates,
      lastUpdate: new Date().toISOString()
    };
    
    await updateDoc(docRef, dataToUpdate);
    console.log('Firebase: Dados atualizados com sucesso');
    return true;
  } catch (error) {
    console.error('Firebase: Erro ao atualizar dados:', error);
    throw error;
  }
};

// Função para adicionar produto
export const addProduct = async (product) => {
  try {
    const newProduct = {
      ...product,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    
    const currentData = await getMenuData();
    const updatedProducts = [...currentData.products, newProduct];
    
    await updateMenuData({ products: updatedProducts });
    console.log('Firebase: Produto adicionado:', newProduct.name);
    return newProduct;
  } catch (error) {
    console.error('Firebase: Erro ao adicionar produto:', error);
    throw error;
  }
};

// Função para atualizar produto
export const updateProduct = async (productId, updates) => {
  try {
    const currentData = await getMenuData();
    const updatedProducts = currentData.products.map(product => 
      product.id === productId 
        ? { ...product, ...updates, updatedAt: new Date().toISOString() }
        : product
    );
    
    await updateMenuData({ products: updatedProducts });
    console.log('Firebase: Produto atualizado:', productId);
    return true;
  } catch (error) {
    console.error('Firebase: Erro ao atualizar produto:', error);
    throw error;
  }
};

// Função para deletar produto
export const deleteProduct = async (productId) => {
  try {
    const currentData = await getMenuData();
    const updatedProducts = currentData.products.filter(product => product.id !== productId);
    
    await updateMenuData({ products: updatedProducts });
    console.log('Firebase: Produto deletado:', productId);
    return true;
  } catch (error) {
    console.error('Firebase: Erro ao deletar produto:', error);
    throw error;
  }
};

// Função para definir oferta do dia
export const setDailyOffer = async (offer) => {
  try {
    await updateMenuData({ dailyOffer: offer });
    console.log('Firebase: Oferta do dia definida:', offer?.name || 'removida');
    return true;
  } catch (error) {
    console.error('Firebase: Erro ao definir oferta:', error);
    throw error;
  }
};

// Função para atualizar configuração Pix
export const updatePixConfig = async (pixKey, pixName) => {
  try {
    await updateMenuData({ pixKey, pixName });
    console.log('Firebase: Configuração Pix atualizada');
    return true;
  } catch (error) {
    console.error('Firebase: Erro ao atualizar Pix:', error);
    throw error;
  }
};

// Função para limpar todos os dados
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
    console.log('Firebase: Todos os dados foram limpos');
    return true;
  } catch (error) {
    console.error('Firebase: Erro ao limpar dados:', error);
    throw error;
  }
};

// Função para restaurar dados padrão
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
    console.log('Firebase: Dados padrão restaurados');
    return true;
  } catch (error) {
    console.error('Firebase: Erro ao restaurar dados padrão:', error);
    throw error;
  }
};

// Função para escutar mudanças em tempo real
export const subscribeToMenuChanges = (callback) => {
  const docRef = doc(db, 'menu', MENU_DOC_ID);
  
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      console.log('Firebase: Mudança detectada:', data.lastUpdate);
      callback(data);
    } else {
      console.log('Firebase: Documento não existe');
      callback(null);
    }
  }, (error) => {
    console.error('Firebase: Erro ao escutar mudanças:', error);
  });
}; 
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
const MENU_CONFIG_DOC_ID = 'menu_config';
const PRODUCTS_COLLECTION = 'products';

// Função para obter dados do menu (configurações)
export const getMenuData = async () => {
  try {
    const configRef = doc(db, 'menu', MENU_CONFIG_DOC_ID);
    const configSnap = await getDoc(configRef);
    
    // Obter produtos da coleção separada
    const productsQuery = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
    const productsSnap = await getDocs(productsQuery);
    const products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (configSnap.exists()) {
      const configData = configSnap.data();
      const result = {
        ...configData,
        products: products
      };
      console.log('Firebase: Dados carregados:', { 
        config: configData, 
        productsCount: products.length 
      });
      return result;
    } else {
      console.log('Firebase: Configuração não existe, criando padrão...');
      const defaultConfig = {
        dailyOffer: null,
        pixKey: '',
        pixName: '',
        lastUpdate: new Date().toISOString()
      };
      
      await setDoc(configRef, defaultConfig);
      
      // Criar produtos padrão
      const defaultProducts = [
        {
          name: 'Hot Dog Tradicional',
          price: 8.50,
          image: 'https://images.pexels.com/photos/4676401/pexels-photo-4676401.jpeg?auto=compress&cs=tinysrgb&w=400',
          category: 'Lanches',
          available: true,
          createdAt: new Date().toISOString()
        },
        {
          name: 'Hot Dog Especial',
          price: 12.00,
          image: 'https://images.pexels.com/photos/1633525/pexels-photo-1633525.jpeg?auto=compress&cs=tinysrgb&w=400',
          category: 'Lanches',
          available: true,
          createdAt: new Date().toISOString()
        }
      ];
      
      const batch = writeBatch(db);
      defaultProducts.forEach(product => {
        const productRef = doc(collection(db, PRODUCTS_COLLECTION));
        batch.set(productRef, product);
      });
      await batch.commit();
      
      return {
        ...defaultConfig,
        products: defaultProducts.map((product, index) => ({ 
          id: `default_${index + 1}`, 
          ...product 
        }))
      };
    }
  } catch (error) {
    console.error('Firebase: Erro ao carregar dados:', error);
    throw error;
  }
};

// Função para salvar configurações do menu
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

// Função para adicionar produto
export const addProduct = async (product) => {
  try {
    const newProduct = {
      ...product,
      createdAt: new Date().toISOString()
    };
    
    const productRef = doc(collection(db, PRODUCTS_COLLECTION));
    await setDoc(productRef, newProduct);
    
    console.log('Firebase: Produto adicionado:', newProduct.name);
    return { id: productRef.id, ...newProduct };
  } catch (error) {
    console.error('Firebase: Erro ao adicionar produto:', error);
    throw error;
  }
};

// Função para atualizar produto
export const updateProduct = async (productId, updates) => {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
    const dataToUpdate = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await updateDoc(productRef, dataToUpdate);
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
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
    await deleteDoc(productRef);
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
    const configRef = doc(db, 'menu', MENU_CONFIG_DOC_ID);
    await updateDoc(configRef, { 
      dailyOffer: offer,
      lastUpdate: new Date().toISOString()
    });
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
    const configRef = doc(db, 'menu', MENU_CONFIG_DOC_ID);
    await updateDoc(configRef, {
      pixKey,
      pixName,
      lastUpdate: new Date().toISOString()
    });
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
    // Limpar configurações
    const configRef = doc(db, 'menu', MENU_CONFIG_DOC_ID);
    await setDoc(configRef, {
      dailyOffer: null,
      pixKey: '',
      pixName: '',
      lastUpdate: new Date().toISOString()
    });
    
    // Limpar produtos
    const productsQuery = query(collection(db, PRODUCTS_COLLECTION));
    const productsSnap = await getDocs(productsQuery);
    const batch = writeBatch(db);
    productsSnap.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    
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
    await clearAllData();
    
    // Criar produtos padrão
    const defaultProducts = [
      {
        name: 'Hot Dog Tradicional',
        price: 8.50,
        image: 'https://images.pexels.com/photos/4676401/pexels-photo-4676401.jpeg?auto=compress&cs=tinysrgb&w=400',
        category: 'Lanches',
        available: true,
        createdAt: new Date().toISOString()
      },
      {
        name: 'Hot Dog Especial',
        price: 12.00,
        image: 'https://images.pexels.com/photos/1633525/pexels-photo-1633525.jpeg?auto=compress&cs=tinysrgb&w=400',
        category: 'Lanches',
        available: true,
        createdAt: new Date().toISOString()
      }
    ];
    
    const batch = writeBatch(db);
    defaultProducts.forEach(product => {
      const productRef = doc(collection(db, PRODUCTS_COLLECTION));
      batch.set(productRef, product);
    });
    await batch.commit();
    
    console.log('Firebase: Dados padrão restaurados');
    return true;
  } catch (error) {
    console.error('Firebase: Erro ao restaurar dados padrão:', error);
    throw error;
  }
};

// Função para escutar mudanças em tempo real
export const subscribeToMenuChanges = (callback) => {
  const configRef = doc(db, 'menu', MENU_CONFIG_DOC_ID);
  const productsQuery = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
  
  let configData = null;
  let productsData = [];
  
  // Escutar mudanças na configuração
  const configUnsubscribe = onSnapshot(configRef, (doc) => {
    if (doc.exists()) {
      configData = doc.data();
      console.log('Firebase: Configuração atualizada:', configData.lastUpdate);
      if (configData && productsData.length >= 0) {
        callback({ ...configData, products: productsData });
      }
    }
  }, (error) => {
    console.error('Firebase: Erro ao escutar configuração:', error);
  });
  
  // Escutar mudanças nos produtos
  const productsUnsubscribe = onSnapshot(productsQuery, (snapshot) => {
    productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Firebase: Produtos atualizados:', productsData.length);
    if (configData && productsData.length >= 0) {
      callback({ ...configData, products: productsData });
    }
  }, (error) => {
    console.error('Firebase: Erro ao escutar produtos:', error);
  });
  
  // Retornar função para cancelar ambos os listeners
  return () => {
    configUnsubscribe();
    productsUnsubscribe();
  };
}; 
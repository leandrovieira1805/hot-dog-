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
const MENU_DATA_DOC_ID = 'menu_data'; // Estrutura antiga
const PRODUCTS_COLLECTION = 'products';

// Função para obter dados do menu (com fallback para estrutura antiga)
export const getMenuData = async () => {
  try {
    console.log('Firebase: Tentando carregar dados (nova estrutura)...');
    
    const configRef = doc(db, 'menu', MENU_CONFIG_DOC_ID);
    const configSnap = await getDoc(configRef);
    
    // Tentar obter produtos da coleção separada
    try {
      const productsQuery = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
      const productsSnap = await getDocs(productsQuery);
      const products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (configSnap.exists()) {
        const configData = configSnap.data();
        const result = {
          ...configData,
          products: products
        };
        console.log('Firebase: Dados carregados (nova estrutura):', { 
          config: configData, 
          productsCount: products.length 
        });
        return result;
      }
    } catch (productsError) {
      console.log('Firebase: Erro ao carregar produtos (nova estrutura), tentando estrutura antiga...');
      console.log('Erro:', productsError.message);
    }
    
    // Fallback para estrutura antiga
    console.log('Firebase: Tentando estrutura antiga...');
    const oldRef = doc(db, 'menu', MENU_DATA_DOC_ID);
    const oldSnap = await getDoc(oldRef);
    
    if (oldSnap.exists()) {
      const oldData = oldSnap.data();
      console.log('Firebase: Dados carregados (estrutura antiga):', { 
        productsCount: oldData.products?.length || 0 
      });
      return oldData;
    }
    
    // Se nada existir, criar configuração padrão
    console.log('Firebase: Nenhum dado encontrado, criando padrão...');
    const defaultConfig = {
      dailyOffer: null,
      pixKey: '',
      pixName: '',
      lastUpdate: new Date().toISOString()
    };
    
    await setDoc(configRef, defaultConfig);
    
    return {
      ...defaultConfig,
      products: []
    };
    
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

// Função para salvar dados do menu (compatibilidade)
export const saveMenuData = async (data) => {
  try {
    // Tentar salvar na nova estrutura primeiro
    try {
      // Salvar configurações
      const configData = {
        dailyOffer: data.dailyOffer,
        pixKey: data.pixKey,
        pixName: data.pixName
      };
      await saveMenuConfig(configData);
      
      // Tentar salvar produtos na nova estrutura
      if (data.products && data.products.length > 0) {
        const batch = writeBatch(db);
        data.products.forEach(product => {
          const productRef = doc(collection(db, PRODUCTS_COLLECTION));
          batch.set(productRef, {
            ...product,
            createdAt: product.createdAt || new Date().toISOString()
          });
        });
        await batch.commit();
        console.log('Firebase: Dados salvos com sucesso (nova estrutura)');
        return true;
      }
    } catch (newStructureError) {
      console.log('Firebase: Erro na nova estrutura, usando estrutura antiga:', newStructureError.message);
    }
    
    // Fallback para estrutura antiga
    const oldRef = doc(db, 'menu', MENU_DATA_DOC_ID);
    await setDoc(oldRef, {
      ...data,
      lastUpdate: new Date().toISOString()
    });
    console.log('Firebase: Dados salvos com sucesso (estrutura antiga)');
    return true;
    
  } catch (error) {
    console.error('Firebase: Erro ao salvar dados:', error);
    throw error;
  }
};

// Função para adicionar produto (com fallback)
export const addProduct = async (product) => {
  try {
    const newProduct = {
      ...product,
      createdAt: new Date().toISOString()
    };
    
    // Tentar nova estrutura primeiro
    try {
      const productRef = doc(collection(db, PRODUCTS_COLLECTION));
      await setDoc(productRef, newProduct);
      console.log('Firebase: Produto adicionado (nova estrutura):', newProduct.name);
      return { id: productRef.id, ...newProduct };
    } catch (newStructureError) {
      console.log('Firebase: Erro na nova estrutura, usando estrutura antiga:', newStructureError.message);
    }
    
    // Fallback para estrutura antiga
    const oldRef = doc(db, 'menu', MENU_DATA_DOC_ID);
    const oldSnap = await getDoc(oldRef);
    
    let currentData = { products: [], dailyOffer: null, pixKey: '', pixName: '' };
    if (oldSnap.exists()) {
      currentData = oldSnap.data();
    }
    
    const newId = Date.now();
    const productWithId = { id: newId, ...newProduct };
    currentData.products.push(productWithId);
    currentData.lastUpdate = new Date().toISOString();
    
    await setDoc(oldRef, currentData);
    console.log('Firebase: Produto adicionado (estrutura antiga):', newProduct.name);
    return productWithId;
    
  } catch (error) {
    console.error('Firebase: Erro ao adicionar produto:', error);
    throw error;
  }
};

// Função para atualizar produto (nova estrutura)
export const updateProduct = async (productId, updates) => {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
    const dataToUpdate = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await updateDoc(productRef, dataToUpdate);
    console.log('Firebase: Produto atualizado (nova estrutura):', productId);
    return true;
  } catch (error) {
    console.error('Firebase: Erro ao atualizar produto:', error);
    throw error;
  }
};

// Função para deletar produto (nova estrutura)
export const deleteProduct = async (productId) => {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
    await deleteDoc(productRef);
    console.log('Firebase: Produto deletado (nova estrutura):', productId);
    return true;
  } catch (error) {
    console.error('Firebase: Erro ao deletar produto:', error);
    throw error;
  }
};

// Função para definir oferta do dia (nova estrutura)
export const setDailyOffer = async (offer) => {
  try {
    const configRef = doc(db, 'menu', MENU_CONFIG_DOC_ID);
    await updateDoc(configRef, { 
      dailyOffer: offer,
      lastUpdate: new Date().toISOString()
    });
    console.log('Firebase: Oferta do dia definida (nova estrutura):', offer?.name || 'removida');
    return true;
  } catch (error) {
    console.error('Firebase: Erro ao definir oferta:', error);
    throw error;
  }
};

// Função para atualizar configuração Pix (nova estrutura)
export const updatePixConfig = async (pixKey, pixName) => {
  try {
    const configRef = doc(db, 'menu', MENU_CONFIG_DOC_ID);
    await updateDoc(configRef, {
      pixKey,
      pixName,
      lastUpdate: new Date().toISOString()
    });
    console.log('Firebase: Configuração Pix atualizada (nova estrutura)');
    return true;
  } catch (error) {
    console.error('Firebase: Erro ao atualizar Pix:', error);
    throw error;
  }
};

// Função para limpar todos os dados (nova estrutura)
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
    
    console.log('Firebase: Todos os dados foram limpos (nova estrutura)');
    return true;
  } catch (error) {
    console.error('Firebase: Erro ao limpar dados:', error);
    throw error;
  }
};

// Função para restaurar dados padrão (nova estrutura)
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
    
    console.log('Firebase: Dados padrão restaurados (nova estrutura)');
    return true;
  } catch (error) {
    console.error('Firebase: Erro ao restaurar dados padrão:', error);
    throw error;
  }
};

// Função para escutar mudanças em tempo real (com fallback)
export const subscribeToMenuChanges = (callback) => {
  let configData = null;
  let productsData = [];
  let isUsingOldStructure = false;
  
  // Tentar nova estrutura primeiro
  const configRef = doc(db, 'menu', MENU_CONFIG_DOC_ID);
  const productsQuery = query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'));
  
  // Escutar mudanças na configuração
  const configUnsubscribe = onSnapshot(configRef, (doc) => {
    if (doc.exists()) {
      configData = doc.data();
      console.log('Firebase: Configuração atualizada (nova estrutura):', configData.lastUpdate);
      if (configData && productsData.length >= 0 && !isUsingOldStructure) {
        callback({ ...configData, products: productsData });
      }
    }
  }, (error) => {
    console.error('Firebase: Erro ao escutar configuração:', error);
  });
  
  // Escutar mudanças nos produtos
  let productsUnsubscribe = null;
  try {
    productsUnsubscribe = onSnapshot(productsQuery, (snapshot) => {
      productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Firebase: Produtos atualizados (nova estrutura):', productsData.length);
      if (configData && productsData.length >= 0 && !isUsingOldStructure) {
        callback({ ...configData, products: productsData });
      }
    }, (error) => {
      console.error('Firebase: Erro ao escutar produtos (nova estrutura), usando estrutura antiga:', error);
      isUsingOldStructure = true;
      
      // Fallback para estrutura antiga
      const oldRef = doc(db, 'menu', MENU_DATA_DOC_ID);
      const oldUnsubscribe = onSnapshot(oldRef, (doc) => {
        if (doc.exists()) {
          const oldData = doc.data();
          console.log('Firebase: Dados atualizados (estrutura antiga):', oldData.lastUpdate);
          callback(oldData);
        }
      }, (oldError) => {
        console.error('Firebase: Erro ao escutar estrutura antiga:', oldError);
      });
      
      // Substituir unsubscribe
      productsUnsubscribe = oldUnsubscribe;
    });
  } catch (error) {
    console.log('Firebase: Erro ao configurar listener de produtos, usando estrutura antiga:', error);
    isUsingOldStructure = true;
    
    // Fallback para estrutura antiga
    const oldRef = doc(db, 'menu', MENU_DATA_DOC_ID);
    productsUnsubscribe = onSnapshot(oldRef, (doc) => {
      if (doc.exists()) {
        const oldData = doc.data();
        console.log('Firebase: Dados atualizados (estrutura antiga):', oldData.lastUpdate);
        callback(oldData);
      }
    }, (oldError) => {
      console.error('Firebase: Erro ao escutar estrutura antiga:', oldError);
    });
  }
  
  // Retornar função para cancelar ambos os listeners
  return () => {
    configUnsubscribe();
    if (productsUnsubscribe) {
      productsUnsubscribe();
    }
  };
}; 
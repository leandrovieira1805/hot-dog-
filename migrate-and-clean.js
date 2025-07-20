const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  writeBatch,
  deleteDoc 
} = require('firebase/firestore');

// Configuração do Firebase (substitua pelas suas credenciais)
const firebaseConfig = {
  apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "device-streaming-77144326.firebaseapp.com",
  projectId: "device-streaming-77144326",
  storageBucket: "device-streaming-77144326.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const MENU_CONFIG_DOC_ID = 'menu_config';
const MENU_DATA_DOC_ID = 'menu_data';
const PRODUCTS_COLLECTION = 'products';

async function migrateAndClean() {
  console.log('🚀 Iniciando migração e limpeza...');
  
  try {
    // 1. Verificar se existe dados na estrutura antiga
    console.log('📋 Verificando estrutura antiga...');
    const oldRef = doc(db, 'menu', MENU_DATA_DOC_ID);
    const oldSnap = await getDoc(oldRef);
    
    if (!oldSnap.exists()) {
      console.log('✅ Nenhum dado na estrutura antiga encontrado');
      return;
    }
    
    const oldData = oldSnap.data();
    console.log(`📦 Encontrados ${oldData.products?.length || 0} produtos na estrutura antiga`);
    
    if (!oldData.products || oldData.products.length === 0) {
      console.log('✅ Nenhum produto para migrar');
      return;
    }
    
    // 2. Verificar se já existe configuração na nova estrutura
    console.log('⚙️ Verificando configuração existente...');
    const configRef = doc(db, 'menu', MENU_CONFIG_DOC_ID);
    const configSnap = await getDoc(configRef);
    
    let configData = {
      dailyOffer: oldData.dailyOffer || null,
      pixKey: oldData.pixKey || '',
      pixName: oldData.pixName || '',
      lastUpdate: new Date().toISOString()
    };
    
    if (configSnap.exists()) {
      console.log('⚠️ Configuração já existe, mantendo dados existentes');
      const existingConfig = configSnap.data();
      configData = {
        ...existingConfig,
        dailyOffer: oldData.dailyOffer || existingConfig.dailyOffer,
        pixKey: oldData.pixKey || existingConfig.pixKey,
        pixName: oldData.pixName || existingConfig.pixName,
        lastUpdate: new Date().toISOString()
      };
    }
    
    // 3. Salvar configuração na nova estrutura
    console.log('💾 Salvando configuração na nova estrutura...');
    await setDoc(configRef, configData);
    console.log('✅ Configuração salva');
    
    // 4. Verificar se já existem produtos na nova estrutura
    console.log('🔍 Verificando produtos existentes na nova estrutura...');
    const productsQuery = collection(db, PRODUCTS_COLLECTION);
    const productsSnap = await getDocs(productsQuery);
    const existingProducts = productsSnap.docs.map(doc => doc.id);
    
    if (existingProducts.length > 0) {
      console.log(`⚠️ Já existem ${existingProducts.length} produtos na nova estrutura`);
      console.log('⚠️ Migração não será feita para evitar duplicação');
      return;
    }
    
    // 5. Migrar produtos para a nova estrutura
    console.log('📤 Migrando produtos para nova estrutura...');
    const batch = writeBatch(db);
    
    oldData.products.forEach((product, index) => {
      const productRef = doc(collection(db, PRODUCTS_COLLECTION));
      const productData = {
        ...product,
        createdAt: product.createdAt || new Date().toISOString(),
        migratedFrom: 'old_structure'
      };
      batch.set(productRef, productData);
      
      if ((index + 1) % 10 === 0) {
        console.log(`📦 Migrados ${index + 1}/${oldData.products.length} produtos`);
      }
    });
    
    await batch.commit();
    console.log(`✅ ${oldData.products.length} produtos migrados com sucesso`);
    
    // 6. Verificar se a migração foi bem-sucedida
    console.log('🔍 Verificando migração...');
    const verifySnap = await getDocs(productsQuery);
    const migratedProducts = verifySnap.docs.length;
    
    if (migratedProducts === oldData.products.length) {
      console.log('✅ Migração verificada com sucesso');
      
      // 7. Limpar estrutura antiga
      console.log('🗑️ Limpando estrutura antiga...');
      await deleteDoc(oldRef);
      console.log('✅ Estrutura antiga removida');
      
      console.log('🎉 Migração e limpeza concluídas com sucesso!');
      console.log(`📊 Resumo:`);
      console.log(`   - Produtos migrados: ${migratedProducts}`);
      console.log(`   - Configuração: Atualizada`);
      console.log(`   - Estrutura antiga: Removida`);
      
    } else {
      console.error('❌ Erro na verificação da migração');
      console.error(`   - Esperado: ${oldData.products.length} produtos`);
      console.error(`   - Encontrado: ${migratedProducts} produtos`);
    }
    
  } catch (error) {
    console.error('❌ Erro durante migração:', error);
    throw error;
  }
}

// Executar migração
migrateAndClean()
  .then(() => {
    console.log('✅ Script concluído');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script falhou:', error);
    process.exit(1);
  }); 
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

async function forceMigrate() {
  console.log('🚀 FORÇANDO MIGRAÇÃO DOS DADOS...');
  
  try {
    // 1. Verificar dados na estrutura antiga
    console.log('\n📋 Verificando estrutura antiga...');
    const oldRef = doc(db, 'menu', MENU_DATA_DOC_ID);
    const oldSnap = await getDoc(oldRef);
    
    if (!oldSnap.exists()) {
      console.log('✅ Nenhum dado na estrutura antiga encontrado');
      return;
    }
    
    const oldData = oldSnap.data();
    const productCount = oldData.products?.length || 0;
    const dataSize = JSON.stringify(oldData).length;
    
    console.log(`📦 Dados encontrados:`);
    console.log(`   - Produtos: ${productCount}`);
    console.log(`   - Tamanho: ${dataSize} bytes (${(dataSize / 1024 / 1024).toFixed(2)} MB)`);
    console.log(`   - Limite: 1,048,576 bytes (1 MB)`);
    
    if (dataSize > 1000000) {
      console.log('🚨 DADOS EXCEDEM O LIMITE! Migração URGENTE necessária!');
    }
    
    if (productCount === 0) {
      console.log('✅ Nenhum produto para migrar');
      return;
    }
    
    // 2. Verificar se já existem produtos na nova estrutura
    console.log('\n🔍 Verificando produtos existentes na nova estrutura...');
    const productsQuery = collection(db, PRODUCTS_COLLECTION);
    const productsSnap = await getDocs(productsQuery);
    const existingProducts = productsSnap.docs.length;
    
    if (existingProducts > 0) {
      console.log(`⚠️ Já existem ${existingProducts} produtos na nova estrutura`);
      console.log('⚠️ Limpando produtos existentes para evitar duplicação...');
      
      // Limpar produtos existentes
      const batch = writeBatch(db);
      productsSnap.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log('✅ Produtos existentes removidos');
    }
    
    // 3. Salvar configuração na nova estrutura
    console.log('\n⚙️ Salvando configuração na nova estrutura...');
    const configRef = doc(db, 'menu', MENU_CONFIG_DOC_ID);
    const configData = {
      dailyOffer: oldData.dailyOffer || null,
      pixKey: oldData.pixKey || '',
      pixName: oldData.pixName || '',
      lastUpdate: new Date().toISOString(),
      migratedFrom: 'old_structure',
      migrationDate: new Date().toISOString()
    };
    
    await setDoc(configRef, configData);
    console.log('✅ Configuração salva');
    
    // 4. Migrar produtos para a nova estrutura
    console.log('\n📤 Migrando produtos para nova estrutura...');
    const batch = writeBatch(db);
    
    oldData.products.forEach((product, index) => {
      const productRef = doc(collection(db, PRODUCTS_COLLECTION));
      const productData = {
        ...product,
        createdAt: product.createdAt || new Date().toISOString(),
        migratedFrom: 'old_structure',
        migrationDate: new Date().toISOString()
      };
      batch.set(productRef, productData);
      
      if ((index + 1) % 5 === 0) {
        console.log(`📦 Migrados ${index + 1}/${productCount} produtos`);
      }
    });
    
    await batch.commit();
    console.log(`✅ ${productCount} produtos migrados com sucesso`);
    
    // 5. Verificar migração
    console.log('\n🔍 Verificando migração...');
    const verifySnap = await getDocs(productsQuery);
    const migratedCount = verifySnap.docs.length;
    
    if (migratedCount === productCount) {
      console.log('✅ Migração verificada com sucesso');
      
      // 6. Limpar estrutura antiga
      console.log('\n🗑️ Limpando estrutura antiga...');
      await deleteDoc(oldRef);
      console.log('✅ Estrutura antiga removida');
      
      console.log('\n🎉 MIGRAÇÃO FORÇADA CONCLUÍDA COM SUCESSO!');
      console.log(`📊 Resumo:`);
      console.log(`   - Produtos migrados: ${migratedCount}`);
      console.log(`   - Configuração: Atualizada`);
      console.log(`   - Estrutura antiga: Removida`);
      console.log(`   - Problema de tamanho: RESOLVIDO`);
      
    } else {
      console.error('❌ Erro na verificação da migração');
      console.error(`   - Esperado: ${productCount} produtos`);
      console.error(`   - Encontrado: ${migratedCount} produtos`);
    }
    
  } catch (error) {
    console.error('❌ Erro durante migração forçada:', error);
    throw error;
  }
}

// Executar migração forçada
forceMigrate()
  .then(() => {
    console.log('\n✅ Script concluído');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script falhou:', error);
    process.exit(1);
  }); 
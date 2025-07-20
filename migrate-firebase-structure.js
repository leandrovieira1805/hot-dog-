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

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAuZ1SJWxlwWtgVhV3qnBafoytho59WE4I",
  authDomain: "device-streaming-77144326.firebaseapp.com",
  databaseURL: "https://device-streaming-77144326-default-rtdb.firebaseio.com",
  projectId: "device-streaming-77144326",
  storageBucket: "device-streaming-77144326.firebasestorage.app",
  messagingSenderId: "375948005973",
  appId: "1:375948005973:web:99b7ff4736d6c17f927adc"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// IDs dos documentos
const OLD_MENU_DOC_ID = 'menu_data';
const NEW_MENU_CONFIG_DOC_ID = 'menu_config';
const PRODUCTS_COLLECTION = 'products';

console.log('🔄 Iniciando migração da estrutura do Firebase...\n');

async function migrateFirebaseStructure() {
  try {
    console.log('📋 Verificando dados antigos...');
    
    // Verificar se existe documento antigo
    const oldDocRef = doc(db, 'menu', OLD_MENU_DOC_ID);
    const oldDocSnap = await getDoc(oldDocRef);
    
    if (!oldDocSnap.exists()) {
      console.log('✅ Nenhum dado antigo encontrado. Migração não necessária.');
      return;
    }
    
    const oldData = oldDocSnap.data();
    console.log(`📦 Dados antigos encontrados:`);
    console.log(`   - Produtos: ${oldData.products?.length || 0}`);
    console.log(`   - Pix Key: ${oldData.pixKey || 'Não configurado'}`);
    console.log(`   - Pix Name: ${oldData.pixName || 'Não configurado'}`);
    console.log(`   - Última atualização: ${oldData.lastUpdate || 'N/A'}`);
    
    // Verificar se já existe nova estrutura
    const newConfigRef = doc(db, 'menu', NEW_MENU_CONFIG_DOC_ID);
    const newConfigSnap = await getDoc(newConfigRef);
    
    if (newConfigSnap.exists()) {
      console.log('⚠️  Nova estrutura já existe. Verificando se precisa atualizar...');
      
      // Verificar produtos na nova estrutura
      const productsQuery = collection(db, PRODUCTS_COLLECTION);
      const productsSnap = await getDocs(productsQuery);
      
      if (productsSnap.size > 0) {
        console.log(`✅ Nova estrutura já tem ${productsSnap.size} produtos. Migração já foi feita.`);
        return;
      }
    }
    
    console.log('\n🔄 Iniciando migração...');
    
    // Criar configuração
    const configData = {
      dailyOffer: oldData.dailyOffer || null,
      pixKey: oldData.pixKey || '',
      pixName: oldData.pixName || '',
      lastUpdate: new Date().toISOString()
    };
    
    await setDoc(newConfigRef, configData);
    console.log('✅ Configuração migrada');
    
    // Migrar produtos
    if (oldData.products && oldData.products.length > 0) {
      console.log(`📦 Migrando ${oldData.products.length} produtos...`);
      
      const batch = writeBatch(db);
      let migratedCount = 0;
      
      for (const product of oldData.products) {
        try {
          // Remover ID antigo se existir
          const { id, ...productData } = product;
          
          // Criar novo documento de produto
          const productRef = doc(collection(db, PRODUCTS_COLLECTION));
          batch.set(productRef, {
            ...productData,
            createdAt: product.createdAt || new Date().toISOString()
          });
          
          migratedCount++;
          
          // Commit a cada 500 produtos para evitar limite de batch
          if (migratedCount % 500 === 0) {
            await batch.commit();
            console.log(`   ✅ ${migratedCount} produtos migrados...`);
          }
        } catch (error) {
          console.error(`   ❌ Erro ao migrar produto ${product.name}:`, error.message);
        }
      }
      
      // Commit final
      if (migratedCount % 500 !== 0) {
        await batch.commit();
      }
      
      console.log(`✅ ${migratedCount} produtos migrados com sucesso`);
    }
    
    // Verificar migração
    console.log('\n🔍 Verificando migração...');
    
    const finalConfigSnap = await getDoc(newConfigRef);
    const finalProductsSnap = await getDocs(collection(db, PRODUCTS_COLLECTION));
    
    if (finalConfigSnap.exists() && finalProductsSnap.size > 0) {
      console.log('✅ Migração concluída com sucesso!');
      console.log(`📊 Resultado:`);
      console.log(`   - Configuração: ✅`);
      console.log(`   - Produtos: ${finalProductsSnap.size} migrados`);
      console.log(`   - Pix Key: ${finalConfigSnap.data().pixKey || 'Não configurado'}`);
      console.log(`   - Pix Name: ${finalConfigSnap.data().pixName || 'Não configurado'}`);
      
      // Perguntar se deve remover dados antigos
      console.log('\n🗑️  Dados antigos ainda existem.');
      console.log('💡 Recomendação: Manter dados antigos por segurança por 24h');
      console.log('   Depois pode remover manualmente se tudo estiver funcionando');
      
    } else {
      console.log('❌ Erro na migração. Verificar logs acima.');
    }
    
  } catch (error) {
    console.error('❌ Erro durante migração:', error);
    console.error('❌ Detalhes:', error.message);
    console.error('❌ Código:', error.code);
  }
}

async function cleanupOldData() {
  try {
    console.log('\n🗑️  Removendo dados antigos...');
    
    const oldDocRef = doc(db, 'menu', OLD_MENU_DOC_ID);
    const oldDocSnap = await getDoc(oldDocRef);
    
    if (oldDocSnap.exists()) {
      await deleteDoc(oldDocRef);
      console.log('✅ Dados antigos removidos');
    } else {
      console.log('✅ Dados antigos já foram removidos');
    }
    
  } catch (error) {
    console.error('❌ Erro ao remover dados antigos:', error);
  }
}

async function main() {
  console.log('🚀 Script de Migração Firebase');
  console.log('================================\n');
  
  // Verificar argumentos
  const args = process.argv.slice(2);
  const shouldCleanup = args.includes('--cleanup');
  
  if (shouldCleanup) {
    console.log('🧹 Modo limpeza ativado');
    await cleanupOldData();
  } else {
    await migrateFirebaseStructure();
  }
  
  console.log('\n🎯 Migração concluída!');
}

// Executar migração
main().catch(console.error); 
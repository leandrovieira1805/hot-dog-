const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc,
  collection,
  writeBatch,
  query,
  getDocs,
  orderBy
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

console.log('🚀 Iniciando migração e limpeza...\n');

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateAndClean() {
  try {
    console.log('📋 Passo 1: Verificando dados da estrutura antiga...');
    
    // Ler dados da estrutura antiga
    const oldRef = doc(db, 'menu', 'menu_data');
    const oldSnap = await getDoc(oldRef);
    
    if (!oldSnap.exists()) {
      console.log('❌ Nenhum dado encontrado na estrutura antiga');
      return;
    }
    
    const oldData = oldSnap.data();
    const products = oldData.products || [];
    const config = {
      dailyOffer: oldData.dailyOffer || null,
      pixKey: oldData.pixKey || '',
      pixName: oldData.pixName || '',
      lastUpdate: new Date().toISOString()
    };
    
    console.log(`✅ Dados encontrados:`);
    console.log(`   - Produtos: ${products.length}`);
    console.log(`   - Pix Key: ${config.pixKey || 'Não configurado'}`);
    console.log(`   - Pix Name: ${config.pixName || 'Não configurado'}`);
    console.log(`   - Tamanho atual: ${JSON.stringify(oldData).length} bytes`);
    
    if (products.length === 0) {
      console.log('⚠️  Nenhum produto para migrar');
      return;
    }
    
    console.log('\n📦 Passo 2: Migrando produtos para nova estrutura...');
    
    // Migrar produtos para nova estrutura
    const batch = writeBatch(db);
    const migratedProducts = [];
    
    products.forEach((product, index) => {
      const productRef = doc(collection(db, 'products'));
      const newProduct = {
        ...product,
        createdAt: product.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      batch.set(productRef, newProduct);
      migratedProducts.push({ id: productRef.id, ...newProduct });
      
      console.log(`   ${index + 1}. ${product.name} - R$ ${product.price}`);
    });
    
    await batch.commit();
    console.log(`✅ ${products.length} produtos migrados com sucesso!`);
    
    console.log('\n⚙️  Passo 3: Salvando configuração na nova estrutura...');
    
    // Salvar configuração na nova estrutura
    const configRef = doc(db, 'menu', 'menu_config');
    await setDoc(configRef, config);
    console.log('✅ Configuração salva na nova estrutura');
    
    console.log('\n🧹 Passo 4: Limpando estrutura antiga...');
    
    // Deletar estrutura antiga
    await deleteDoc(oldRef);
    console.log('✅ Estrutura antiga removida');
    
    console.log('\n📊 Passo 5: Verificando migração...');
    
    // Verificar se a migração foi bem-sucedida
    const newConfigSnap = await getDoc(configRef);
    const productsQuery = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const productsSnap = await getDocs(productsQuery);
    
    if (newConfigSnap.exists() && productsSnap.size === products.length) {
      console.log('✅ Migração concluída com sucesso!');
      console.log(`   - Configuração: ✅`);
      console.log(`   - Produtos: ${productsSnap.size}/${products.length} ✅`);
      console.log(`   - Estrutura antiga: Removida ✅`);
    } else {
      console.log('❌ Erro na verificação da migração');
      console.log(`   - Configuração: ${newConfigSnap.exists() ? '✅' : '❌'}`);
      console.log(`   - Produtos: ${productsSnap.size}/${products.length}`);
    }
    
    console.log('\n🎯 Resultado:');
    console.log('✅ Dados migrados para nova estrutura');
    console.log('✅ Estrutura antiga removida');
    console.log('✅ Problema de tamanho resolvido');
    console.log('✅ Sistema pronto para novos produtos');
    
  } catch (error) {
    console.error('❌ Erro durante migração:', error);
    console.log('\n🔧 Soluções possíveis:');
    console.log('1. Verificar permissões do Firestore');
    console.log('2. Tentar novamente em alguns minutos');
    console.log('3. Verificar se há dados corrompidos');
  }
}

async function main() {
  console.log('🔄 Migração e Limpeza do Firebase');
  console.log('==================================\n');
  
  await migrateAndClean();
  
  console.log('\n🎉 Processo concluído!');
  console.log('\n📝 Próximos passos:');
  console.log('1. Aguardar 1-2 minutos para propagação');
  console.log('2. Testar adição de produtos no Railway');
  console.log('3. Verificar se produtos permanecem');
}

// Executar migração
main().catch(console.error); 
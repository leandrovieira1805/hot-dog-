const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  doc, 
  getDoc, 
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

console.log('🧹 Limpando estrutura antiga...\n');

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanOldStructure() {
  try {
    console.log('📋 Verificando estrutura antiga...');
    
    // Verificar se existe estrutura antiga
    const oldRef = doc(db, 'menu', 'menu_data');
    const oldSnap = await getDoc(oldRef);
    
    if (!oldSnap.exists()) {
      console.log('✅ Estrutura antiga já não existe');
      return;
    }
    
    const oldData = oldSnap.data();
    console.log(`⚠️  Estrutura antiga encontrada:`);
    console.log(`   - Produtos: ${oldData.products?.length || 0}`);
    console.log(`   - Tamanho: ${JSON.stringify(oldData).length} bytes`);
    console.log(`   - Pix Key: ${oldData.pixKey || 'Não configurado'}`);
    
    console.log('\n🗑️  Removendo estrutura antiga...');
    
    // Deletar estrutura antiga
    await deleteDoc(oldRef);
    console.log('✅ Estrutura antiga removida com sucesso!');
    
    console.log('\n🎯 Resultado:');
    console.log('✅ Documento grande removido');
    console.log('✅ Sistema vai usar nova estrutura');
    console.log('✅ Problema de tamanho resolvido');
    
  } catch (error) {
    console.error('❌ Erro ao limpar estrutura antiga:', error);
    console.log('\n🔧 Soluções:');
    console.log('1. Atualizar regras do Firestore primeiro');
    console.log('2. Tentar novamente em alguns minutos');
    console.log('3. Usar console do Firebase manualmente');
  }
}

async function main() {
  console.log('🧹 Limpeza da Estrutura Antiga');
  console.log('===============================\n');
  
  await cleanOldStructure();
  
  console.log('\n🎉 Limpeza concluída!');
  console.log('\n📝 Próximos passos:');
  console.log('1. Aguardar 1-2 minutos para propagação');
  console.log('2. Testar adição de produtos no Railway');
  console.log('3. Verificar se produtos permanecem');
}

// Executar limpeza
main().catch(console.error); 
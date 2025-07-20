const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs,
  query,
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

console.log('🧪 Testando permissões do Firebase...\n');

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testFirebasePermissions() {
  try {
    console.log('🔍 Testando acesso ao Firestore...');
    
    // Teste 1: Ler configuração
    console.log('\n📋 Teste 1: Ler configuração (menu/menu_config)');
    try {
      const configRef = doc(db, 'menu', 'menu_config');
      const configSnap = await getDoc(configRef);
      
      if (configSnap.exists()) {
        console.log('✅ Configuração lida com sucesso');
        console.log('   - Pix Key:', configSnap.data().pixKey || 'Não configurado');
        console.log('   - Pix Name:', configSnap.data().pixName || 'Não configurado');
        console.log('   - Last Update:', configSnap.data().lastUpdate || 'N/A');
      } else {
        console.log('⚠️  Configuração não existe (será criada)');
      }
    } catch (error) {
      console.log('❌ Erro ao ler configuração:', error.message);
      console.log('   Código:', error.code);
    }
    
    // Teste 2: Ler produtos
    console.log('\n📦 Teste 2: Ler produtos (products collection)');
    try {
      const productsQuery = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const productsSnap = await getDocs(productsQuery);
      
      console.log(`✅ Produtos lidos com sucesso: ${productsSnap.size} produtos`);
      
      if (productsSnap.size > 0) {
        productsSnap.docs.slice(0, 3).forEach((doc, index) => {
          const product = doc.data();
          console.log(`   ${index + 1}. ${product.name} - R$ ${product.price}`);
        });
      }
    } catch (error) {
      console.log('❌ Erro ao ler produtos:', error.message);
      console.log('   Código:', error.code);
    }
    
    // Teste 3: Escrever configuração
    console.log('\n✏️  Teste 3: Escrever configuração');
    try {
      const configRef = doc(db, 'menu', 'menu_config');
      await setDoc(configRef, {
        pixKey: 'teste@permissao.com',
        pixName: 'Teste de Permissão',
        dailyOffer: null,
        lastUpdate: new Date().toISOString()
      });
      console.log('✅ Configuração escrita com sucesso');
    } catch (error) {
      console.log('❌ Erro ao escrever configuração:', error.message);
      console.log('   Código:', error.code);
    }
    
    // Teste 4: Escrever produto
    console.log('\n➕ Teste 4: Escrever produto');
    try {
      const productRef = doc(collection(db, 'products'));
      await setDoc(productRef, {
        name: 'Produto Teste Permissão',
        price: 25.00,
        image: 'https://via.placeholder.com/150',
        category: 'Teste',
        available: true,
        createdAt: new Date().toISOString()
      });
      console.log('✅ Produto escrito com sucesso');
    } catch (error) {
      console.log('❌ Erro ao escrever produto:', error.message);
      console.log('   Código:', error.code);
    }
    
    // Teste 5: Verificar estrutura antiga
    console.log('\n📄 Teste 5: Verificar estrutura antiga (menu/menu_data)');
    try {
      const oldRef = doc(db, 'menu', 'menu_data');
      const oldSnap = await getDoc(oldRef);
      
      if (oldSnap.exists()) {
        const data = oldSnap.data();
        console.log('⚠️  Estrutura antiga ainda existe');
        console.log(`   - Produtos: ${data.products?.length || 0}`);
        console.log(`   - Tamanho estimado: ${JSON.stringify(data).length} bytes`);
        
        if (data.products?.length > 20) {
          console.log('🚨 PROBLEMA: Documento muito grande!');
          console.log('💡 Solução: Migrar para nova estrutura');
        }
      } else {
        console.log('✅ Estrutura antiga não existe (bom!)');
      }
    } catch (error) {
      console.log('❌ Erro ao verificar estrutura antiga:', error.message);
    }
    
    console.log('\n📊 Resumo dos Testes:');
    console.log('✅ Se todos os testes passaram: Regras estão corretas');
    console.log('❌ Se algum teste falhou: Verificar regras novamente');
    console.log('💡 Se estrutura antiga existe: Considerar migração');
    
  } catch (error) {
    console.error('❌ Erro geral nos testes:', error);
  }
}

async function main() {
  console.log('🚀 Teste de Permissões do Firebase');
  console.log('==================================\n');
  
  await testFirebasePermissions();
  
  console.log('\n🎯 Teste concluído!');
  console.log('\n🔧 Se houver problemas:');
  console.log('1. Verificar regras: https://console.firebase.google.com/project/device-streaming-77144326/firestore/rules');
  console.log('2. Aguardar 1-2 minutos após atualizar regras');
  console.log('3. Limpar cache do navegador');
  console.log('4. Testar novamente');
}

// Executar teste
main().catch(console.error); 
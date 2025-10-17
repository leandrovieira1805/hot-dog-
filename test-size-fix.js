const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs 
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

async function testSizeFix() {
  console.log('🧪 Testando correção do problema de tamanho...');
  
  try {
    // 1. Verificar estrutura antiga
    console.log('\n📋 Verificando estrutura antiga...');
    const oldRef = doc(db, 'menu', MENU_DATA_DOC_ID);
    const oldSnap = await getDoc(oldRef);
    
    if (oldSnap.exists()) {
      const oldData = oldSnap.data();
      const oldSize = JSON.stringify(oldData).length;
      console.log(`📦 Estrutura antiga:`);
      console.log(`   - Produtos: ${oldData.products?.length || 0}`);
      console.log(`   - Tamanho: ${oldSize} bytes (${(oldSize / 1024 / 1024).toFixed(2)} MB)`);
      console.log(`   - Limite: 1,048,576 bytes (1 MB)`);
      
      if (oldSize > 1000000) {
        console.log('⚠️ Estrutura antiga ainda está grande!');
      } else {
        console.log('✅ Estrutura antiga está dentro do limite');
      }
    } else {
      console.log('✅ Estrutura antiga não existe');
    }
    
    // 2. Verificar nova estrutura
    console.log('\n🆕 Verificando nova estrutura...');
    const configRef = doc(db, 'menu', MENU_CONFIG_DOC_ID);
    const configSnap = await getDoc(configRef);
    
    if (configSnap.exists()) {
      const configData = configSnap.data();
      const configSize = JSON.stringify(configData).length;
      console.log(`⚙️ Configuração:`);
      console.log(`   - Tamanho: ${configSize} bytes (${(configSize / 1024).toFixed(2)} KB)`);
      console.log(`   - Pix Key: ${configData.pixKey || 'Não configurado'}`);
      console.log(`   - Pix Name: ${configData.pixName || 'Não configurado'}`);
    } else {
      console.log('⚠️ Configuração não existe');
    }
    
    // 3. Verificar produtos na nova estrutura
    console.log('\n📦 Verificando produtos na nova estrutura...');
    const productsQuery = collection(db, PRODUCTS_COLLECTION);
    const productsSnap = await getDocs(productsQuery);
    const products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(`🆕 Produtos na nova estrutura:`);
    console.log(`   - Quantidade: ${products.length}`);
    
    if (products.length > 0) {
      const sampleProduct = products[0];
      const productSize = JSON.stringify(sampleProduct).length;
      console.log(`   - Tamanho por produto: ~${productSize} bytes`);
      console.log(`   - Tamanho total estimado: ~${productSize * products.length} bytes`);
      
      console.log('\n📋 Primeiros 3 produtos:');
      products.slice(0, 3).forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - R$ ${product.price}`);
      });
    }
    
    // 4. Teste de simulação
    console.log('\n🧪 Teste de simulação...');
    
    // Simular tentativa de salvar muitos produtos na estrutura antiga
    const testProducts = Array.from({ length: 15 }, (_, i) => ({
      id: Date.now() + i,
      name: `Produto Teste ${i + 1}`,
      price: 10 + i,
      image: 'https://example.com/image.jpg',
      category: 'Teste',
      available: true,
      description: 'Produto de teste para verificar tamanho do documento'
    }));
    
    const testData = {
      products: testProducts,
      dailyOffer: null,
      pixKey: 'teste',
      pixName: 'Teste',
      lastUpdate: new Date().toISOString()
    };
    
    const testSize = JSON.stringify(testData).length;
    console.log(`📊 Simulação de 15 produtos:`);
    console.log(`   - Tamanho: ${testSize} bytes (${(testSize / 1024 / 1024).toFixed(2)} MB)`);
    console.log(`   - Limite: 1,048,576 bytes (1 MB)`);
    
    if (testSize > 1000000) {
      console.log('⚠️ 15 produtos excederiam o limite!');
      console.log('✅ Correção está funcionando - sistema deve usar nova estrutura');
    } else {
      console.log('✅ 15 produtos cabem no limite');
    }
    
    // 5. Recomendações
    console.log('\n💡 Recomendações:');
    
    if (oldSnap.exists() && oldData.products?.length > 10) {
      console.log('🔧 AÇÃO NECESSÁRIA:');
      console.log('   1. Executar script de migração: node migrate-and-clean.js');
      console.log('   2. Atualizar regras do Firestore para nova estrutura');
      console.log('   3. Testar adição de produtos após migração');
    } else if (products.length > 0) {
      console.log('✅ Sistema está usando nova estrutura');
      console.log('✅ Pode adicionar produtos sem problemas');
    } else {
      console.log('⚠️ Nenhum produto encontrado');
      console.log('   - Teste adicionando um produto');
      console.log('   - Sistema deve usar nova estrutura automaticamente');
    }
    
  } catch (error) {
    console.error('❌ Erro durante teste:', error);
    throw error;
  }
}

// Executar teste
testSizeFix()
  .then(() => {
    console.log('\n✅ Teste concluído');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Teste falhou:', error);
    process.exit(1);
  }); 
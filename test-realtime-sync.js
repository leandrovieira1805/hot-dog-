const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc, onSnapshot } = require('firebase/firestore');

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

const MENU_DOC_ID = 'menu_data';

async function testRealTimeSync() {
  console.log('🔄 Testando sincronização em tempo real...\n');
  
  const docRef = doc(db, 'menu', MENU_DOC_ID);
  let changeCount = 0;
  let lastProductCount = 0;
  
  // Escutar mudanças
  const unsubscribe = onSnapshot(docRef, (doc) => {
    changeCount++;
    if (doc.exists()) {
      const data = doc.data();
      const productCount = data.products?.length || 0;
      
      console.log(`📡 Mudança #${changeCount}: ${productCount} produtos`);
      console.log(`   🕒 Timestamp: ${data.lastUpdate}`);
      
      if (lastProductCount !== productCount) {
        console.log(`   📈 Mudança de produtos: ${lastProductCount} → ${productCount}`);
        lastProductCount = productCount;
      }
      
      // Mostrar alguns produtos para verificar
      if (data.products && data.products.length > 0) {
        console.log(`   📦 Últimos produtos:`);
        data.products.slice(-3).forEach((product, index) => {
          console.log(`      ${index + 1}. ${product.name} (ID: ${product.id})`);
        });
      }
    } else {
      console.log('📡 Documento removido');
    }
    console.log(''); // Linha em branco
  }, (error) => {
    console.error('❌ Erro na sincronização:', error);
  });
  
  // Aguardar um pouco e adicionar produtos de teste
  setTimeout(async () => {
    try {
      console.log('➕ Adicionando produtos de teste...\n');
      
      const currentData = await getDoc(docRef);
      if (currentData.exists()) {
        const data = currentData.data();
        
        // Adicionar 3 produtos de teste
        for (let i = 1; i <= 3; i++) {
          const newProduct = {
            id: Date.now() + i,
            name: `Produto Teste ${i} - ${new Date().toLocaleTimeString()}`,
            price: 10.00 + i,
            image: 'https://via.placeholder.com/150',
            category: 'Teste',
            available: true,
            createdAt: new Date().toISOString()
          };
          
          const updatedProducts = [...data.products, newProduct];
          await setDoc(docRef, {
            ...data,
            products: updatedProducts,
            lastUpdate: new Date().toISOString()
          });
          
          console.log(`✅ Produto ${i} adicionado: ${newProduct.name}`);
          
          // Aguardar 1 segundo entre adições
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log('\n⏳ Aguardando 5 segundos para verificar se os produtos permanecem...\n');
        
        // Verificar se os produtos permanecem após 5 segundos
        setTimeout(async () => {
          const finalCheck = await getDoc(docRef);
          if (finalCheck.exists()) {
            const finalData = finalCheck.data();
            console.log(`📊 Verificação final: ${finalData.products?.length || 0} produtos`);
            
            const testProducts = finalData.products?.filter(p => p.name.includes('Produto Teste')) || [];
            console.log(`🔍 Produtos de teste encontrados: ${testProducts.length}`);
            
            if (testProducts.length > 0) {
              console.log('✅ Sincronização funcionando corretamente!');
            } else {
              console.log('❌ Produtos de teste não foram mantidos');
            }
          }
          
          // Parar de escutar
          unsubscribe();
          console.log('🛑 Teste concluído');
        }, 5000);
        
      }
    } catch (error) {
      console.error('❌ Erro ao adicionar produtos de teste:', error);
      unsubscribe();
    }
  }, 2000);
}

async function main() {
  console.log('🚀 Iniciando teste de sincronização em tempo real...\n');
  
  // Verificar estado inicial
  const docRef = doc(db, 'menu', MENU_DOC_ID);
  const initialDoc = await getDoc(docRef);
  
  if (initialDoc.exists()) {
    const initialData = initialDoc.data();
    console.log(`📦 Estado inicial: ${initialData.products?.length || 0} produtos`);
  } else {
    console.log('❌ Documento não existe');
    return;
  }
  
  // Executar teste
  await testRealTimeSync();
}

// Executar teste
main().catch(console.error); 
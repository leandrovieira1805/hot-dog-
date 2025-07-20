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

async function testFirebaseConnection() {
  console.log('🔍 Testando conexão com Firebase...');
  
  try {
    const docRef = doc(db, 'menu', MENU_DOC_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('✅ Conexão OK - Dados encontrados:');
      console.log(`   📦 Produtos: ${data.products?.length || 0}`);
      console.log(`   🕒 Última atualização: ${data.lastUpdate}`);
      return data;
    } else {
      console.log('⚠️ Documento não existe, criando dados de teste...');
      const testData = {
        products: [
          {
            id: Date.now(),
            name: 'Teste de Sincronização',
            price: 10.00,
            image: 'https://via.placeholder.com/150',
            category: 'Teste',
            available: true,
            createdAt: new Date().toISOString()
          }
        ],
        dailyOffer: null,
        pixKey: '',
        pixName: '',
        lastUpdate: new Date().toISOString()
      };
      
      await setDoc(docRef, testData);
      console.log('✅ Dados de teste criados');
      return testData;
    }
  } catch (error) {
    console.error('❌ Erro na conexão:', error);
    return null;
  }
}

async function testRealTimeSync() {
  console.log('\n🔄 Testando sincronização em tempo real...');
  
  const docRef = doc(db, 'menu', MENU_DOC_ID);
  
  // Escutar mudanças
  const unsubscribe = onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      console.log(`📡 Mudança detectada: ${data.products?.length || 0} produtos`);
      console.log(`   🕒 Timestamp: ${data.lastUpdate}`);
    } else {
      console.log('📡 Documento removido');
    }
  }, (error) => {
    console.error('❌ Erro na sincronização:', error);
  });
  
  // Aguardar um pouco e adicionar produto de teste
  setTimeout(async () => {
    try {
      const currentData = await getDoc(docRef);
      if (currentData.exists()) {
        const data = currentData.data();
        const newProduct = {
          id: Date.now() + 1,
          name: 'Produto Teste Sincronização',
          price: 15.00,
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
        
        console.log('✅ Produto de teste adicionado');
      }
    } catch (error) {
      console.error('❌ Erro ao adicionar produto de teste:', error);
    }
    
    // Parar de escutar após 5 segundos
    setTimeout(() => {
      unsubscribe();
      console.log('🛑 Teste de sincronização concluído');
    }, 5000);
  }, 2000);
}

async function checkForSyncIssues() {
  console.log('\n🔍 Verificando possíveis problemas...');
  
  try {
    const docRef = doc(db, 'menu', MENU_DOC_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // Verificar se há produtos duplicados
      const productIds = data.products?.map(p => p.id) || [];
      const uniqueIds = [...new Set(productIds)];
      
      if (productIds.length !== uniqueIds.length) {
        console.log('⚠️ PROBLEMA: Produtos com IDs duplicados detectados!');
        console.log(`   Total: ${productIds.length}, Únicos: ${uniqueIds.length}`);
      } else {
        console.log('✅ IDs de produtos únicos');
      }
      
      // Verificar se há produtos sem ID
      const productsWithoutId = data.products?.filter(p => !p.id) || [];
      if (productsWithoutId.length > 0) {
        console.log('⚠️ PROBLEMA: Produtos sem ID encontrados:', productsWithoutId.length);
      } else {
        console.log('✅ Todos os produtos têm ID');
      }
      
      // Verificar timestamp
      if (!data.lastUpdate) {
        console.log('⚠️ PROBLEMA: Sem timestamp de última atualização');
      } else {
        console.log('✅ Timestamp presente');
      }
      
    } else {
      console.log('⚠️ PROBLEMA: Documento não existe');
    }
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
  }
}

async function main() {
  console.log('🚀 Iniciando diagnóstico de sincronização...\n');
  
  // Teste 1: Conexão
  const data = await testFirebaseConnection();
  
  if (data) {
    // Teste 2: Verificar problemas
    await checkForSyncIssues();
    
    // Teste 3: Sincronização em tempo real
    await testRealTimeSync();
  } else {
    console.log('❌ Não foi possível conectar ao Firebase');
  }
}

// Executar diagnóstico
main().catch(console.error); 
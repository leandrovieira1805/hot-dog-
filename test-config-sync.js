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

async function testConfigSync() {
  console.log('🔧 Testando sincronização de configurações...\n');
  
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
      console.log(`   💳 Pix Key: ${data.pixKey || 'Não configurado'}`);
      console.log(`   👤 Pix Name: ${data.pixName || 'Não configurado'}`);
      
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
  
  // Aguardar um pouco e alterar configurações
  setTimeout(async () => {
    try {
      console.log('⚙️ Alterando configurações Pix...\n');
      
      const currentData = await getDoc(docRef);
      if (currentData.exists()) {
        const data = currentData.data();
        
        // Alterar configurações Pix
        const updatedData = {
          ...data,
          pixKey: 'teste@configuracao.com',
          pixName: 'Teste de Configuração',
          lastUpdate: new Date().toISOString()
        };
        
        await setDoc(docRef, updatedData);
        console.log('✅ Configurações Pix alteradas');
        
        // Aguardar 2 segundos e adicionar produto
        setTimeout(async () => {
          console.log('\n➕ Adicionando produto após alterar configurações...\n');
          
          const newData = await getDoc(docRef);
          if (newData.exists()) {
            const currentData = newData.data();
            const newProduct = {
              id: Date.now(),
              name: 'Produto Teste Configuração',
              price: 20.00,
              image: 'https://via.placeholder.com/150',
              category: 'Teste',
              available: true,
              createdAt: new Date().toISOString()
            };
            
            const updatedProducts = [...currentData.products, newProduct];
            await setDoc(docRef, {
              ...currentData,
              products: updatedProducts,
              lastUpdate: new Date().toISOString()
            });
            
            console.log('✅ Produto adicionado após alterar configurações');
            
            // Verificar se o produto permanece após 5 segundos
            setTimeout(async () => {
              const finalCheck = await getDoc(docRef);
              if (finalCheck.exists()) {
                const finalData = finalCheck.data();
                console.log(`\n📊 Verificação final:`);
                console.log(`   📦 Produtos: ${finalData.products?.length || 0}`);
                console.log(`   💳 Pix Key: ${finalData.pixKey || 'Não configurado'}`);
                console.log(`   👤 Pix Name: ${finalData.pixName || 'Não configurado'}`);
                
                const testProduct = finalData.products?.find(p => p.name === 'Produto Teste Configuração');
                if (testProduct) {
                  console.log('✅ Produto permaneceu após alterar configurações!');
                } else {
                  console.log('❌ Produto desapareceu após alterar configurações');
                }
              }
              
              // Parar de escutar
              unsubscribe();
              console.log('🛑 Teste concluído');
            }, 5000);
          }
        }, 2000);
        
      }
    } catch (error) {
      console.error('❌ Erro ao alterar configurações:', error);
      unsubscribe();
    }
  }, 2000);
}

async function main() {
  console.log('🚀 Iniciando teste de sincronização de configurações...\n');
  
  // Verificar estado inicial
  const docRef = doc(db, 'menu', MENU_DOC_ID);
  const initialDoc = await getDoc(docRef);
  
  if (initialDoc.exists()) {
    const initialData = initialDoc.data();
    console.log(`📦 Estado inicial: ${initialData.products?.length || 0} produtos`);
    console.log(`💳 Pix Key: ${initialData.pixKey || 'Não configurado'}`);
    console.log(`👤 Pix Name: ${initialData.pixName || 'Não configurado'}`);
  } else {
    console.log('❌ Documento não existe');
    return;
  }
  
  // Executar teste
  await testConfigSync();
}

// Executar teste
main().catch(console.error); 
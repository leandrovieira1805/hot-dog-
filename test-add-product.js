const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc } = require('firebase/firestore');

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

async function getCurrentProducts() {
  try {
    const docRef = doc(db, 'menu', MENU_DOC_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.products || [];
    }
    return [];
  } catch (error) {
    console.error('Erro ao obter produtos:', error);
    return [];
  }
}

async function addTestProduct() {
  try {
    const currentProducts = await getCurrentProducts();
    console.log(`📦 Produtos atuais: ${currentProducts.length}`);
    
    // Criar novo produto
    const newProduct = {
      id: Date.now(),
      name: `Produto Teste ${Date.now()}`,
      price: 15.00,
      image: 'https://via.placeholder.com/150',
      category: 'Teste',
      available: true,
      createdAt: new Date().toISOString()
    };
    
    console.log(`➕ Adicionando produto: ${newProduct.name}`);
    
    // Obter dados completos
    const docRef = doc(db, 'menu', MENU_DOC_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const currentData = docSnap.data();
      const updatedProducts = [...currentData.products, newProduct];
      
      // Salvar dados atualizados
      await setDoc(docRef, {
        ...currentData,
        products: updatedProducts,
        lastUpdate: new Date().toISOString()
      });
      
      console.log('✅ Produto adicionado com sucesso');
      
      // Verificar se foi salvo
      const verifyProducts = await getCurrentProducts();
      console.log(`📦 Produtos após adição: ${verifyProducts.length}`);
      
      const addedProduct = verifyProducts.find(p => p.id === newProduct.id);
      if (addedProduct) {
        console.log('✅ Produto encontrado na verificação');
        return true;
      } else {
        console.log('❌ Produto não encontrado na verificação');
        return false;
      }
    } else {
      console.log('❌ Documento não existe');
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao adicionar produto:', error);
    return false;
  }
}

async function testMultipleAdditions() {
  console.log('🧪 Testando múltiplas adições...\n');
  
  for (let i = 1; i <= 5; i++) {
    console.log(`\n--- Teste ${i}/5 ---`);
    const success = await addTestProduct();
    
    if (success) {
      console.log(`✅ Teste ${i} passou`);
    } else {
      console.log(`❌ Teste ${i} falhou`);
    }
    
    // Aguardar 2 segundos entre testes
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

async function main() {
  console.log('🚀 Iniciando teste de adição de produtos...\n');
  
  // Verificar estado inicial
  const initialProducts = await getCurrentProducts();
  console.log(`📦 Estado inicial: ${initialProducts.length} produtos`);
  
  // Executar testes
  await testMultipleAdditions();
  
  // Verificar estado final
  const finalProducts = await getCurrentProducts();
  console.log(`\n📦 Estado final: ${finalProducts.length} produtos`);
  console.log(`📈 Diferença: +${finalProducts.length - initialProducts.length} produtos`);
  
  if (finalProducts.length > initialProducts.length) {
    console.log('✅ Teste concluído com sucesso!');
  } else {
    console.log('❌ Teste falhou - produtos não foram adicionados');
  }
}

// Executar teste
main().catch(console.error); 
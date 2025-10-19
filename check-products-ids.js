const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, orderBy, doc, deleteDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq",
  authDomain: "device-streaming-77144326.firebaseapp.com",
  projectId: "device-streaming-77144326",
  storageBucket: "device-streaming-77144326.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456789"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkProducts() {
  try {
    console.log('🔍 Verificando produtos no Firebase...\n');
    
    const productsQuery = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const productsSnap = await getDocs(productsQuery);
    
    console.log(`📦 Total de produtos: ${productsSnap.docs.length}\n`);
    
    productsSnap.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. ${data.name}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Preço: R$ ${data.price}`);
      console.log(`   Categoria: ${data.category}`);
      console.log('');
    });
    
    if (productsSnap.docs.length > 0) {
      console.log('\n🧪 Testando exclusão do primeiro produto...');
      const firstProduct = productsSnap.docs[0];
      console.log(`Tentando deletar: ${firstProduct.data().name} (ID: ${firstProduct.id})`);
      
      try {
        await deleteDoc(doc(db, 'products', firstProduct.id));
        console.log('✅ Produto deletado com sucesso!');
        console.log('⚠️ ATENÇÃO: O produto foi realmente deletado. Execute o script restore-defaults.js para restaurar.');
      } catch (error) {
        console.error('❌ Erro ao deletar:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

checkProducts();

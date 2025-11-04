const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, collection, getDocs, writeBatch, deleteDoc } = require('firebase/firestore');

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

async function fixProductsAndCategories() {
  try {
    console.log('🔧 Corrigindo produtos e categorias...\n');
    
    // 1. Limpar todos os produtos existentes
    console.log('🗑️ Limpando produtos existentes...');
    const productsQuery = collection(db, 'products');
    const productsSnap = await getDocs(productsQuery);
    const batch = writeBatch(db);
    
    productsSnap.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log(`✅ ${productsSnap.docs.length} produtos removidos`);
    
    // 2. Adicionar apenas 2 produtos
    console.log('\n➕ Adicionando 2 produtos...');
    const newProducts = [
      {
        name: 'Hot Dog Tradicional',
        price: 8.50,
        image: 'https://images.pexels.com/photos/4676401/pexels-photo-4676401.jpeg?auto=compress&cs=tinysrgb&w=400',
        category: 'Hot Dog',
        available: true,
        createdAt: new Date().toISOString()
      },
      {
        name: 'X-Burguer',
        price: 15.00,
        image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400',
        category: 'Hambúrgueres',
        subcategory: 'Tradicional',
        available: true,
        createdAt: new Date().toISOString()
      }
    ];
    
    const addBatch = writeBatch(db);
    newProducts.forEach(product => {
      const productRef = doc(collection(db, 'products'));
      addBatch.set(productRef, product);
    });
    await addBatch.commit();
    console.log('✅ 2 produtos adicionados');
    
    // 3. Restaurar categorias
    console.log('\n📂 Restaurando categorias...');
    const categories = [
      { name: 'Hambúrgueres', icon: '🍔', enabled: true },
      { name: 'Petiscos', icon: '🍟', enabled: true },
      { name: 'Bebidas', icon: '🥤', enabled: true },
      { name: 'Hot Dog', icon: '🌭', enabled: true },
      { name: 'Bolos', icon: '🍰', enabled: true },
      { name: 'Batata', icon: '🥔', enabled: true },
      { name: 'Cuscuz', icon: '🌽', enabled: true }
    ];
    
    const configRef = doc(db, 'menu', 'menu_config');
    await setDoc(configRef, {
      categories: categories,
      lastUpdate: new Date().toISOString()
    }, { merge: true });
    console.log('✅ Categorias restauradas');
    
    console.log('\n🎉 Correção concluída!');
    console.log('📋 Resumo:');
    console.log('   - Produtos: 2 (Hot Dog Tradicional, X-Burguer)');
    console.log('   - Categorias: 7 (todas ativas)');
    console.log('   - Ambos podem ser excluídos no admin');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

fixProductsAndCategories();

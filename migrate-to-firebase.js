// Script para migrar produtos do localStorage para Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, getDocs } from 'firebase/firestore';

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

// Função para migrar dados do localStorage para Firebase
async function migrateToFirebase() {
  try {
    console.log('🔄 Iniciando migração para Firebase...');
    
    // Verificar se estamos no navegador
    if (typeof window === 'undefined') {
      console.log('❌ Este script deve ser executado no navegador');
      return;
    }
    
    // Obter dados do localStorage
    const menuData = localStorage.getItem('menuData');
    const pixConfig = localStorage.getItem('pixConfig');
    const dailyOffer = localStorage.getItem('dailyOffer');
    
    if (!menuData) {
      console.log('❌ Nenhum dado encontrado no localStorage');
      return;
    }
    
    // Parsear dados
    const products = JSON.parse(menuData);
    const pix = pixConfig ? JSON.parse(pixConfig) : null;
    const offer = dailyOffer ? JSON.parse(dailyOffer) : null;
    
    console.log('📦 Produtos encontrados:', products.length);
    console.log('💳 Configuração PIX:', pix ? 'Sim' : 'Não');
    console.log('🎯 Oferta diária:', offer ? 'Sim' : 'Não');
    
    // Preparar dados para Firebase
    const firebaseData = {
      products: products,
      pixConfig: pix || {
        pixKey: "",
        pixKeyType: "email",
        recipientName: ""
      },
      dailyOffer: offer || {
        title: "",
        description: "",
        discount: 0,
        active: false
      },
      lastUpdated: new Date().toISOString()
    };
    
    // Salvar no Firebase
    console.log('💾 Salvando no Firebase...');
    await setDoc(doc(db, 'menu', 'menu_data'), firebaseData);
    
    console.log('✅ Migração concluída com sucesso!');
    console.log('📊 Dados migrados:');
    console.log('   - Produtos:', products.length);
    console.log('   - PIX Config:', !!pix);
    console.log('   - Oferta:', !!offer);
    
    // Verificar se foi salvo
    console.log('🔍 Verificando dados salvos...');
    const docRef = doc(db, 'menu', 'menu_data');
    const docSnap = await getDocs(collection(db, 'menu'));
    
    if (docSnap.size > 0) {
      console.log('✅ Dados confirmados no Firebase!');
      console.log('🌐 Acesse: https://console.firebase.google.com/project/device-streaming-77144326/firestore');
    } else {
      console.log('❌ Erro ao verificar dados no Firebase');
    }
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
  }
}

// Função para mostrar dados atuais
function showCurrentData() {
  console.log('📋 Dados atuais no localStorage:');
  
  const menuData = localStorage.getItem('menuData');
  const pixConfig = localStorage.getItem('pixConfig');
  const dailyOffer = localStorage.getItem('dailyOffer');
  
  if (menuData) {
    const products = JSON.parse(menuData);
    console.log('🍔 Produtos:', products.length);
    products.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} - R$ ${product.price}`);
    });
  } else {
    console.log('❌ Nenhum produto encontrado');
  }
  
  if (pixConfig) {
    const pix = JSON.parse(pixConfig);
    console.log('💳 PIX:', pix.pixKey || 'Não configurado');
  }
  
  if (dailyOffer) {
    const offer = JSON.parse(dailyOffer);
    console.log('🎯 Oferta:', offer.title || 'Não configurada');
  }
}

// Exportar funções para uso no console
window.migrateToFirebase = migrateToFirebase;
window.showCurrentData = showCurrentData;

console.log('🚀 Script de migração carregado!');
console.log('📝 Comandos disponíveis:');
console.log('   - showCurrentData() - Mostrar dados atuais');
console.log('   - migrateToFirebase() - Migrar para Firebase'); 
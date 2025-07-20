const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');

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

console.log('🔐 Atualizando regras do Firestore...\n');

// Regras que permitem acesso total (apenas para desenvolvimento)
const firestoreRules = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir acesso total (apenas para desenvolvimento)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
`;

async function updateFirestoreRules() {
  try {
    console.log('📋 Regras a serem aplicadas:');
    console.log(firestoreRules);
    console.log('\n⚠️  ATENÇÃO: Estas regras permitem acesso total ao Firestore!');
    console.log('💡 Use apenas para desenvolvimento ou teste.');
    console.log('🔒 Para produção, configure regras mais restritivas.\n');
    
    console.log('🚀 Para aplicar estas regras:');
    console.log('1. Acesse: https://console.firebase.google.com/project/device-streaming-77144326/firestore/rules');
    console.log('2. Substitua o conteúdo atual pelas regras acima');
    console.log('3. Clique em "Publish"');
    console.log('4. Aguarde a confirmação');
    console.log('\n✅ Após publicar, o sistema funcionará corretamente!');
    
    console.log('\n🔍 URLs Importantes:');
    console.log('- Firebase Console: https://console.firebase.google.com/project/device-streaming-77144326');
    console.log('- Firestore Rules: https://console.firebase.google.com/project/device-streaming-77144326/firestore/rules');
    console.log('- Railway: https://hotdog-praca-production.up.railway.app');
    
    console.log('\n🧪 Após atualizar as regras:');
    console.log('1. Recarregar página do Railway');
    console.log('2. Tentar adicionar produto');
    console.log('3. Verificar se não há mais erros de permissão');
    
  } catch (error) {
    console.error('❌ Erro ao preparar atualização:', error);
  }
}

// Função para verificar se as regras estão corretas
async function checkFirestoreRules() {
  try {
    console.log('🔍 Verificando regras atuais do Firestore...');
    console.log('💡 Esta verificação requer acesso ao console do Firebase.');
    console.log('📱 Acesse: https://console.firebase.google.com/project/device-streaming-77144326/firestore/rules');
    
    console.log('\n📋 Regras esperadas:');
    console.log('✅ Permitir leitura e escrita em todos os documentos');
    console.log('✅ Incluir acesso à coleção "products"');
    console.log('✅ Incluir acesso ao documento "menu/menu_config"');
    
  } catch (error) {
    console.error('❌ Erro ao verificar regras:', error);
  }
}

// Função principal
async function main() {
  console.log('🚀 Script de Atualização do Firestore');
  console.log('=====================================\n');
  
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === 'check') {
    await checkFirestoreRules();
  } else {
    await updateFirestoreRules();
  }
  
  console.log('\n🎯 Processo concluído!');
}

// Executar script
main().catch(console.error); 
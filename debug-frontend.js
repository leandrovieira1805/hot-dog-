// Script para debugar conexão do frontend com a API
console.log('🔍 Debugando conexão frontend -> API...');

// Simular as chamadas que o frontend faz
async function testFrontendConnection() {
  try {
    console.log('📡 Testando /api/data...');
    const response = await fetch('/api/data');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Frontend conectou com API!');
      console.log('📝 Produtos:', data.products ? data.products.length : 0);
      return true;
    } else {
      console.log('❌ Erro na resposta:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Erro de conexão:', error.message);
    return false;
  }
}

// Testar com URL completa
async function testDirectConnection() {
  try {
    console.log('📡 Testando http://localhost:3001/api/data...');
    const response = await fetch('http://localhost:3001/api/data');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Conexão direta funcionou!');
      console.log('📝 Produtos:', data.products ? data.products.length : 0);
      return true;
    } else {
      console.log('❌ Erro na resposta direta:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Erro de conexão direta:', error.message);
    return false;
  }
}

// Executar testes
console.log('🚀 Iniciando debug...\n');

// Testar conexão direta primeiro
testDirectConnection().then(success => {
  if (success) {
    console.log('\n✅ API está funcionando!');
    console.log('💡 Se o frontend não está sincronizando, pode ser problema de CORS ou proxy.');
  } else {
    console.log('\n❌ API não está acessível!');
    console.log('💡 Verifique se o servidor está rodando na porta 3001.');
  }
}); 
const http = require('http');

// Testar status da API
function testAPIStatus() {
  console.log('🧪 Testando API...');
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/status',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Status da API: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('📡 Resposta da API:', data);
      testAPIData();
    });
  });

  req.on('error', (error) => {
    console.error('❌ Erro ao testar API:', error.message);
  });

  req.end();
}

// Testar dados da API
function testAPIData() {
  console.log('\n📊 Testando dados da API...');
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/data',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Dados da API: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log('📝 Produtos encontrados:', jsonData.products ? jsonData.products.length : 0);
        console.log('🎯 Oferta do dia:', jsonData.dailyOffer ? 'Ativa' : 'Nenhuma');
        console.log('💳 Pix configurado:', jsonData.pixKey ? 'Sim' : 'Não');
        
        if (jsonData.products && jsonData.products.length > 0) {
          console.log('📋 Lista de produtos:');
          jsonData.products.forEach((product, index) => {
            console.log(`  ${index + 1}. ${product.name} - R$ ${product.price}`);
          });
        }
      } catch (error) {
        console.error('❌ Erro ao parsear dados:', error.message);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Erro ao testar dados:', error.message);
  });

  req.end();
}

// Executar testes
console.log('🚀 Iniciando testes da API...\n');
testAPIStatus(); 
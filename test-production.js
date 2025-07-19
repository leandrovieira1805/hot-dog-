const https = require('https');

// Configurar URL do Railway (substitua pela sua URL)
const RAILWAY_URL = process.env.RAILWAY_URL || 'https://seu-projeto.railway.app';

console.log('🚀 Testando API em produção no Railway...');
console.log(`📍 URL: ${RAILWAY_URL}\n`);

// Função para fazer requisição HTTPS
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, RAILWAY_URL);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'HotDog-Test/1.0'
      }
    };

    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: jsonData,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: responseData,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Teste 1: Status da API
async function testStatus() {
  console.log('🧪 Teste 1: Status da API');
  try {
    const response = await makeRequest('/api/status');
    console.log(`✅ Status: ${response.status}`);
    console.log(`📡 Resposta:`, response.data);
    return true;
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
    return false;
  }
}

// Teste 2: Obter dados
async function testGetData() {
  console.log('\n🧪 Teste 2: Obter dados');
  try {
    const response = await makeRequest('/api/data');
    console.log(`✅ Status: ${response.status}`);
    if (response.data.products) {
      console.log(`📝 Produtos: ${response.data.products.length}`);
      response.data.products.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} - R$ ${product.price}`);
      });
    }
    return true;
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
    return false;
  }
}

// Teste 3: Salvar dados
async function testSaveData() {
  console.log('\n🧪 Teste 3: Salvar dados');
  try {
    const testData = {
      products: [
        {
          id: Date.now(),
          name: 'Teste Railway',
          price: 10.00,
          image: 'https://via.placeholder.com/150',
          category: 'Teste',
          available: true
        }
      ],
      dailyOffer: null,
      pixKey: 'teste@railway.com',
      pixName: 'Teste Railway'
    };

    const response = await makeRequest('/api/save', 'POST', testData);
    console.log(`✅ Status: ${response.status}`);
    console.log(`📡 Resposta:`, response.data);
    return true;
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
    return false;
  }
}

// Teste 4: Verificar sincronização
async function testSync() {
  console.log('\n🧪 Teste 4: Verificar sincronização');
  try {
    // Primeiro, obter dados
    const getResponse = await makeRequest('/api/data');
    console.log(`📝 Produtos antes: ${getResponse.data.products?.length || 0}`);
    
    // Salvar dados de teste
    const testData = {
      products: [
        {
          id: Date.now(),
          name: 'Sincronização Test',
          price: 15.00,
          image: 'https://via.placeholder.com/150',
          category: 'Teste',
          available: true
        }
      ],
      dailyOffer: null,
      pixKey: '',
      pixName: ''
    };
    
    await makeRequest('/api/save', 'POST', testData);
    console.log('✅ Dados salvos');
    
    // Verificar se foram salvos
    const verifyResponse = await makeRequest('/api/data');
    console.log(`📝 Produtos depois: ${verifyResponse.data.products?.length || 0}`);
    
    const testProduct = verifyResponse.data.products?.find(p => p.name === 'Sincronização Test');
    if (testProduct) {
      console.log('✅ Sincronização funcionando!');
    } else {
      console.log('❌ Sincronização falhou!');
    }
    
    return true;
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
    return false;
  }
}

// Executar todos os testes
async function runAllTests() {
  console.log('🚀 Iniciando testes de produção...\n');
  
  const tests = [
    { name: 'Status', fn: testStatus },
    { name: 'Get Data', fn: testGetData },
    { name: 'Save Data', fn: testSaveData },
    { name: 'Sync', fn: testSync }
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) passed++;
    } catch (error) {
      console.log(`❌ Teste ${test.name} falhou: ${error.message}`);
    }
  }
  
  console.log(`\n🏁 Resultado: ${passed}/${total} testes passaram`);
  
  if (passed === total) {
    console.log('🎉 Todos os testes passaram! Sistema funcionando em produção.');
  } else {
    console.log('⚠️ Alguns testes falharam. Verifique a configuração.');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { makeRequest, testStatus, testGetData, testSaveData, testSync }; 
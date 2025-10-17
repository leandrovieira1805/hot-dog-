const https = require('https');

// Configurar URL do Railway (substitua pela sua URL)
const RAILWAY_URL = process.env.RAILWAY_URL || 'https://seu-projeto.railway.app';

console.log('🚂 Verificando deploy no Railway...');
console.log(`📍 URL: ${RAILWAY_URL}\n`);

// Função para verificar se o Railway está funcionando
function checkRailway() {
  return new Promise((resolve, reject) => {
    const url = new URL(RAILWAY_URL);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: '/api/status',
      method: 'GET',
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: jsonData,
            working: res.statusCode === 200
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data,
            working: res.statusCode === 200
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

// Função para verificar dados da API
function checkRailwayData() {
  return new Promise((resolve, reject) => {
    const url = new URL(RAILWAY_URL);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: '/api/data',
      method: 'GET',
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: jsonData,
            working: res.statusCode === 200
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data,
            working: res.statusCode === 200
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

// Executar verificações
async function runChecks() {
  console.log('🧪 Verificando status do Railway...');
  
  try {
    // Verificar status
    const statusResult = await checkRailway();
    console.log(`✅ Status: ${statusResult.status}`);
    console.log(`📡 Resposta:`, statusResult.data);
    
    if (statusResult.working) {
      console.log('🎉 Railway está funcionando!');
      
      // Verificar dados
      console.log('\n🧪 Verificando dados da API...');
      const dataResult = await checkRailwayData();
      console.log(`✅ Status: ${dataResult.status}`);
      
      if (dataResult.working && dataResult.data.products) {
        console.log(`📝 Produtos: ${dataResult.data.products.length}`);
        dataResult.data.products.forEach((product, index) => {
          console.log(`  ${index + 1}. ${product.name} - R$ ${product.price}`);
        });
      }
      
      console.log('\n🎯 Railway está pronto para uso!');
      console.log(`🌐 Site: ${RAILWAY_URL}`);
      console.log(`🔧 Admin: ${RAILWAY_URL}/admin`);
      
    } else {
      console.log('❌ Railway não está respondendo corretamente');
      console.log('💡 Verifique se o deploy foi bem-sucedido');
    }
    
  } catch (error) {
    console.log('❌ Erro ao verificar Railway:', error.message);
    console.log('💡 Possíveis causas:');
    console.log('   - Railway não foi conectado ao repositório');
    console.log('   - Deploy falhou');
    console.log('   - URL incorreta');
    console.log('   - Servidor não está rodando');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runChecks().catch(console.error);
}

module.exports = { checkRailway, checkRailwayData }; 
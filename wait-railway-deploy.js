const https = require('https');

// Configurar URL do Railway (substitua pela sua URL)
const RAILWAY_URL = process.env.RAILWAY_URL || 'https://hotdog-praca-production.up.railway.app';

console.log('🚂 Aguardando deploy no Railway...');
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

// Função para aguardar deploy
async function waitForDeploy() {
  const maxAttempts = 30; // 5 minutos (10 segundos cada)
  let attempts = 0;
  
  console.log('⏳ Aguardando Railway ficar online...');
  console.log('💡 O deploy pode levar 2-5 minutos\n');
  
  while (attempts < maxAttempts) {
    attempts++;
    
    try {
      console.log(`🔄 Tentativa ${attempts}/${maxAttempts}...`);
      
      const result = await checkRailway();
      
      if (result.working) {
        console.log('🎉 Railway está online!');
        console.log(`✅ Status: ${result.status}`);
        console.log(`📡 Resposta:`, result.data);
        console.log(`\n🌐 Site: ${RAILWAY_URL}`);
        console.log(`🔧 Admin: ${RAILWAY_URL}/admin`);
        console.log(`📊 API: ${RAILWAY_URL}/api/status`);
        
        // Testar dados
        console.log('\n🧪 Testando dados...');
        const dataResult = await checkRailwayData();
        if (dataResult.working && dataResult.data.products) {
          console.log(`📦 Produtos: ${dataResult.data.products.length}`);
          console.log(`💳 Pix Key: ${dataResult.data.pixKey || 'Não configurado'}`);
          console.log(`👤 Pix Name: ${dataResult.data.pixName || 'Não configurado'}`);
        }
        
        console.log('\n🎯 Railway está pronto para uso!');
        return true;
      } else {
        console.log(`❌ Status: ${result.status} - ${result.data}`);
      }
      
    } catch (error) {
      console.log(`❌ Erro: ${error.message}`);
    }
    
    // Aguardar 10 segundos antes da próxima tentativa
    if (attempts < maxAttempts) {
      console.log('⏳ Aguardando 10 segundos...\n');
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
  
  console.log('❌ Timeout: Railway não ficou online em 5 minutos');
  console.log('💡 Verifique:');
  console.log('   - Se o Railway está conectado ao repositório correto');
  console.log('   - Se o deploy foi iniciado');
  console.log('   - Se há erros nos logs do Railway');
  console.log('   - Se a URL está correta');
  
  return false;
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

// Executar verificação
waitForDeploy().catch(console.error); 
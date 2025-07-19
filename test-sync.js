const http = require('http');

// Função para testar exclusão de produto
async function testProductDeletion() {
  console.log('🧪 Testando exclusão de produto...');
  
  // 1. Verificar produtos atuais
  console.log('\n📋 1. Produtos atuais:');
  const currentProducts = await getProducts();
  console.log(`   Total: ${currentProducts.length} produtos`);
  currentProducts.forEach((product, index) => {
    console.log(`   ${index + 1}. ${product.name} (ID: ${product.id})`);
  });
  
  if (currentProducts.length === 0) {
    console.log('❌ Nenhum produto para testar exclusão');
    return;
  }
  
  // 2. Excluir primeiro produto
  const productToDelete = currentProducts[0];
  console.log(`\n🗑️ 2. Excluindo produto: ${productToDelete.name} (ID: ${productToDelete.id})`);
  
  const success = await deleteProduct(productToDelete.id);
  if (!success) {
    console.log('❌ Erro ao excluir produto');
    return;
  }
  
  // 3. Verificar se foi excluído
  console.log('\n✅ 3. Verificando exclusão:');
  const updatedProducts = await getProducts();
  console.log(`   Total após exclusão: ${updatedProducts.length} produtos`);
  
  const stillExists = updatedProducts.find(p => p.id === productToDelete.id);
  if (stillExists) {
    console.log('❌ Produto ainda existe! Sincronização falhou');
  } else {
    console.log('✅ Produto excluído com sucesso! Sincronização funcionou');
  }
  
  // 4. Listar produtos restantes
  console.log('\n📋 4. Produtos restantes:');
  updatedProducts.forEach((product, index) => {
    console.log(`   ${index + 1}. ${product.name} (ID: ${product.id})`);
  });
}

// Função para obter produtos
function getProducts() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/data',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData.products || []);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// Função para excluir produto (simulando o que o frontend faz)
function deleteProduct(productId) {
  return new Promise((resolve, reject) => {
    // Primeiro, obter dados atuais
    getProducts().then(products => {
      // Filtrar o produto a ser excluído
      const updatedProducts = products.filter(p => p.id !== productId);
      
      // Salvar dados atualizados
      const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/save',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const dataToSave = {
        products: updatedProducts,
        dailyOffer: null,
        pixKey: '',
        pixName: ''
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            console.log('   ✅ Dados salvos no servidor');
            resolve(true);
          } else {
            console.log(`   ❌ Erro ao salvar: ${res.statusCode}`);
            resolve(false);
          }
        });
      });

      req.on('error', (error) => {
        console.log(`   ❌ Erro de conexão: ${error.message}`);
        resolve(false);
      });

      req.write(JSON.stringify(dataToSave));
      req.end();
    }).catch(error => {
      console.log(`   ❌ Erro ao obter produtos: ${error.message}`);
      resolve(false);
    });
  });
}

// Executar teste
console.log('🚀 Iniciando teste de sincronização...\n');
testProductDeletion().then(() => {
  console.log('\n🏁 Teste concluído!');
}).catch(error => {
  console.error('❌ Erro no teste:', error.message);
}); 
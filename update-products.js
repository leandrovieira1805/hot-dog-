const fs = require('fs');
const path = require('path');

// Função para atualizar o arquivo products.json
function updateProductsFile(products, dailyOffer, pixKey, pixName) {
  const data = {
    products: products || [],
    dailyOffer: dailyOffer || null,
    pixKey: pixKey || '',
    pixName: pixName || ''
  };

  const filePath = path.join(__dirname, 'public', 'data', 'products.json');
  
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log('✅ Arquivo products.json atualizado com sucesso!');
    console.log('📝 Produtos:', data.products.length);
    console.log('🎯 Oferta do dia:', data.dailyOffer ? 'Ativa' : 'Nenhuma');
    console.log('💳 Pix configurado:', data.pixKey ? 'Sim' : 'Não');
    return true;
  } catch (error) {
    console.error('❌ Erro ao atualizar arquivo:', error);
    return false;
  }
}

// Função para ler dados do localStorage (simulado)
function getLocalStorageData() {
  try {
    const products = JSON.parse(localStorage.getItem('hotdog_products') || '[]');
    const dailyOffer = JSON.parse(localStorage.getItem('hotdog_daily_offer') || 'null');
    const pixKey = localStorage.getItem('pixKey') || '';
    const pixName = localStorage.getItem('pixName') || '';
    
    return { products, dailyOffer, pixKey, pixName };
  } catch (error) {
    console.error('Erro ao ler dados do localStorage:', error);
    return { products: [], dailyOffer: null, pixKey: '', pixName: '' };
  }
}

// Função principal
function main() {
  console.log('🔄 Iniciando atualização do arquivo products.json...');
  
  const { products, dailyOffer, pixKey, pixName } = getLocalStorageData();
  
  const success = updateProductsFile(products, dailyOffer, pixKey, pixName);
  
  if (success) {
    console.log('🚀 Arquivo atualizado! Faça commit e push para sincronizar.');
    console.log('💡 Comandos:');
    console.log('   git add public/data/products.json');
    console.log('   git commit -m "Atualizar produtos"');
    console.log('   git push origin main');
  } else {
    console.log('❌ Falha na atualização');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { updateProductsFile }; 
const fs = require('fs');
const path = require('path');

// Função para atualizar o arquivo products.json com dados do localStorage
function updateJSONFromLocalStorage() {
  try {
    // Simular dados do localStorage (em produção, isso viria do navegador)
    const localStorageData = {
      products: JSON.parse(localStorage.getItem('hotdog_products') || '[]'),
      dailyOffer: JSON.parse(localStorage.getItem('hotdog_daily_offer') || 'null'),
      pixKey: localStorage.getItem('pixKey') || '',
      pixName: localStorage.getItem('pixName') || ''
    };

    const filePath = path.join(__dirname, 'public', 'data', 'products.json');
    
    // Criar dados para salvar
    const dataToSave = {
      products: localStorageData.products,
      dailyOffer: localStorageData.dailyOffer,
      pixKey: localStorageData.pixKey,
      pixName: localStorageData.pixName
    };

    // Salvar no arquivo
    fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2));
    
    console.log('✅ Arquivo products.json atualizado com sucesso!');
    console.log(`📝 Produtos: ${dataToSave.products.length}`);
    console.log(`🎯 Oferta do dia: ${dataToSave.dailyOffer ? 'Ativa' : 'Nenhuma'}`);
    console.log(`💳 Pix configurado: ${dataToSave.pixKey ? 'Sim' : 'Não'}`);
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao atualizar arquivo:', error);
    return false;
  }
}

// Função para ler dados do localStorage (simulado)
function getLocalStorageData() {
  // Em um ambiente real, isso seria lido do navegador
  // Por enquanto, vamos simular com dados padrão
  return {
    products: [
      {
        id: 1,
        name: 'Hot Dog Tradicional',
        price: 8.50,
        image: 'https://images.pexels.com/photos/4676401/pexels-photo-4676401.jpeg?auto=compress&cs=tinysrgb&w=400',
        category: 'Lanches',
        available: true
      },
      {
        id: 2,
        name: 'Hot Dog Especial',
        price: 12.00,
        image: 'https://images.pexels.com/photos/1633525/pexels-photo-1633525.jpeg?auto=compress&cs=tinysrgb&w=400',
        category: 'Lanches',
        available: true
      }
    ],
    dailyOffer: null,
    pixKey: '',
    pixName: ''
  };
}

// Função principal
function main() {
  console.log('🔄 Atualizando arquivo products.json com dados locais...');
  
  const success = updateJSONFromLocalStorage();
  
  if (success) {
    console.log('🚀 Arquivo atualizado! Agora faça commit e push:');
    console.log('   git add public/data/products.json');
    console.log('   git commit -m "Atualizar produtos com mudanças locais"');
    console.log('   git push origin main');
  } else {
    console.log('❌ Falha na atualização');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { updateJSONFromLocalStorage }; 
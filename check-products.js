// Script para verificar produtos no localStorage
console.log('=== VERIFICAÇÃO DE PRODUTOS ===');

// Verificar produtos salvos
const savedProducts = localStorage.getItem('hotdog_products');
console.log('Produtos salvos:', savedProducts);

if (savedProducts) {
  try {
    const products = JSON.parse(savedProducts);
    console.log('Produtos parseados:', products);
    console.log('Quantidade de produtos:', products.length);
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - R$ ${product.price} - Categoria: ${product.category} - Disponível: ${product.available}`);
    });
  } catch (error) {
    console.error('Erro ao parsear produtos:', error);
  }
} else {
  console.log('Nenhum produto salvo encontrado');
}

// Verificar oferta do dia
const savedOffer = localStorage.getItem('hotdog_daily_offer');
console.log('Oferta do dia:', savedOffer);

// Verificar configuração Pix
const pixKey = localStorage.getItem('pixKey');
const pixName = localStorage.getItem('pixName');
console.log('Chave Pix:', pixKey);
console.log('Nome Pix:', pixName); 
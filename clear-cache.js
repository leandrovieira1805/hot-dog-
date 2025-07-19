// Script para limpar cache e localStorage
console.log('🧹 Limpando cache e localStorage...');

// Limpar localStorage
if (typeof localStorage !== 'undefined') {
  localStorage.removeItem('hotdog_products');
  localStorage.removeItem('hotdog_daily_offer');
  localStorage.removeItem('pixKey');
  localStorage.removeItem('pixName');
  localStorage.removeItem('hotdog_last_update');
  localStorage.removeItem('hotdog_has_local_changes');
  console.log('✅ localStorage limpo');
}

// Limpar cache do navegador (se possível)
if (typeof caches !== 'undefined') {
  caches.keys().then(names => {
    names.forEach(name => {
      caches.delete(name);
    });
    console.log('✅ Cache limpo');
  });
}

// Forçar recarregamento da página
console.log('🔄 Recarregando página...');
window.location.reload(true); 
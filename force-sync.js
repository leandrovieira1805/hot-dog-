// Script para forçar sincronização e limpar cache
console.log('🔄 Forçando sincronização...');

// 1. Limpar localStorage
console.log('🗑️ Limpando cache local...');
localStorage.removeItem('hotdog_products');
localStorage.removeItem('hotdog_daily_offer');
localStorage.removeItem('pixKey');
localStorage.removeItem('pixName');
localStorage.removeItem('hotdog_last_update');

// 2. Forçar reload da página
console.log('🔄 Recarregando página...');
window.location.reload(true);

// 3. Disparar evento de atualização
console.log('📡 Disparando evento de atualização...');
window.dispatchEvent(new CustomEvent('hotdog-data-updated', {
  detail: { timestamp: new Date().getTime() }
}));

console.log('✅ Sincronização forçada concluída!'); 
// Utilitário para sincronização de dados
class SyncManager {
  constructor() {
    this.lastSync = localStorage.getItem('hotdog_last_sync') || 0;
    this.syncInterval = null;
  }

  // Iniciar sincronização automática
  startAutoSync() {
    // Verificar atualizações a cada 30 segundos
    this.syncInterval = setInterval(() => {
      this.checkForUpdates();
    }, 30000);
  }

  // Parar sincronização automática
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Verificar se há atualizações no arquivo
  async checkForUpdates() {
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`/data/products.json?t=${timestamp}`);
      
      if (response.ok) {
        const data = await response.json();
        const fileLastModified = response.headers.get('last-modified');
        
        if (fileLastModified) {
          const fileTime = new Date(fileLastModified).getTime();
          
          if (fileTime > this.lastSync) {
            console.log('🔄 Atualização detectada! Sincronizando...');
            this.updateLocalData(data);
            this.lastSync = fileTime;
            localStorage.setItem('hotdog_last_sync', this.lastSync.toString());
            
            // Disparar evento de atualização
            window.dispatchEvent(new CustomEvent('productsUpdated', { detail: data }));
          }
        }
      }
    } catch (error) {
      console.log('Erro ao verificar atualizações:', error);
    }
  }

  // Atualizar dados locais
  updateLocalData(data) {
    if (data.products) {
      localStorage.setItem('hotdog_products', JSON.stringify(data.products));
    }
    if (data.dailyOffer !== undefined) {
      if (data.dailyOffer) {
        localStorage.setItem('hotdog_daily_offer', JSON.stringify(data.dailyOffer));
      } else {
        localStorage.removeItem('hotdog_daily_offer');
      }
    }
    if (data.pixKey !== undefined) {
      localStorage.setItem('pixKey', data.pixKey || '');
    }
    if (data.pixName !== undefined) {
      localStorage.setItem('pixName', data.pixName || '');
    }
  }

  // Forçar sincronização manual
  async forceSync() {
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`/data/products.json?t=${timestamp}`);
      
      if (response.ok) {
        const data = await response.json();
        this.updateLocalData(data);
        this.lastSync = timestamp;
        localStorage.setItem('hotdog_last_sync', this.lastSync.toString());
        
        console.log('✅ Sincronização forçada concluída');
        return data;
      }
    } catch (error) {
      console.error('Erro na sincronização forçada:', error);
    }
    return null;
  }

  // Marcar que houve mudança local
  markLocalChange() {
    const timestamp = new Date().getTime();
    localStorage.setItem('hotdog_last_update', timestamp.toString());
    console.log('📝 Mudança local marcada para sincronização');
  }

  // Obter timestamp da última mudança
  getLastUpdate() {
    return localStorage.getItem('hotdog_last_update');
  }
}

// Instância global
const syncManager = new SyncManager();

export default syncManager; 
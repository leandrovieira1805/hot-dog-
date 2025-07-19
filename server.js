const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Caminho para o arquivo de dados
const dataPath = path.join(__dirname, 'public', 'data', 'products.json');

// Função para ler dados
function readData() {
  try {
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler dados:', error);
    return {
      products: [],
      dailyOffer: null,
      pixKey: '',
      pixName: ''
    };
  }
}

// Função para salvar dados
function saveData(data) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    console.log('✅ Dados salvos com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao salvar dados:', error);
    return false;
  }
}

// Rota para obter dados
app.get('/api/data', (req, res) => {
  try {
    const data = readData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar dados' });
  }
});

// Rota para salvar dados
app.post('/api/save', (req, res) => {
  try {
    const { products, dailyOffer, pixKey, pixName } = req.body;
    
    const data = {
      products: products || [],
      dailyOffer: dailyOffer || null,
      pixKey: pixKey || '',
      pixName: pixName || ''
    };
    
    const success = saveData(data);
    
    if (success) {
      console.log(`📝 Produtos salvos: ${data.products.length}`);
      console.log(`🎯 Oferta do dia: ${data.dailyOffer ? 'Ativa' : 'Nenhuma'}`);
      console.log(`💳 Pix configurado: ${data.pixKey ? 'Sim' : 'Não'}`);
      
      res.json({ 
        success: true, 
        message: 'Dados salvos com sucesso',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({ error: 'Erro ao salvar dados' });
    }
  } catch (error) {
    console.error('Erro na rota /api/save:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para verificar status
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'online', 
    timestamp: new Date().toISOString(),
    message: 'Backend funcionando corretamente'
  });
});

// Rota para limpar dados
app.post('/api/clear', (req, res) => {
  try {
    const defaultData = {
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
    
    const success = saveData(defaultData);
    
    if (success) {
      res.json({ 
        success: true, 
        message: 'Dados limpos com sucesso',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({ error: 'Erro ao limpar dados' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 API disponível em: http://localhost:${PORT}/api`);
  console.log(`🌐 Site disponível em: http://localhost:${PORT}`);
});

module.exports = app; 
# 🚀 Deploy no Railway - Guia Completo

## 📋 Pré-requisitos

- Conta no [Railway](https://railway.app)
- Projeto no GitHub
- Node.js 18+ configurado

## 🔧 Configuração do Projeto

### **1. Estrutura de Arquivos**
```
project/
├── server.js              # Servidor Express
├── package.json           # Dependências e scripts
├── railway.json           # Configuração Railway
├── railway.toml           # Configuração alternativa
├── dist/                  # Build do React (gerado)
└── src/                   # Código fonte React
```

### **2. Scripts Configurados**
```json
{
  "scripts": {
    "start": "npm run build && node server.js",
    "build": "vite build",
    "postinstall": "npm run build"
  }
}
```

## 🚀 Deploy no Railway

### **Passo 1: Conectar GitHub**
1. Acesse [Railway Dashboard](https://railway.app/dashboard)
2. Clique em "New Project"
3. Selecione "Deploy from GitHub repo"
4. Escolha o repositório `hot-dog-`

### **Passo 2: Configurar Variáveis**
```bash
NODE_ENV=production
PORT=3001
```

### **Passo 3: Deploy Automático**
- Railway detecta automaticamente o `package.json`
- Executa `npm install` e `npm run build`
- Inicia com `npm start`

## 🔍 Verificar Deploy

### **1. Logs do Railway**
```bash
# No dashboard do Railway
railway logs
```

### **2. Health Check**
```bash
# URL do seu projeto + /api/status
https://seu-projeto.railway.app/api/status
```

### **3. Testar API**
```bash
# Obter dados
curl https://seu-projeto.railway.app/api/data

# Verificar status
curl https://seu-projeto.railway.app/api/status
```

## 🌐 URLs de Produção

### **URLs do Sistema:**
- **Site:** `https://seu-projeto.railway.app`
- **Admin:** `https://seu-projeto.railway.app/admin`
- **API:** `https://seu-projeto.railway.app/api`

### **Endpoints da API:**
- `GET /api/data` - Obter produtos
- `POST /api/save` - Salvar produtos
- `GET /api/status` - Status do servidor
- `POST /api/clear` - Limpar dados

## 🔧 Configurações Específicas

### **1. CORS em Produção**
```javascript
// server.js
app.use(cors({
  origin: ['https://seu-projeto.railway.app', 'http://localhost:3000'],
  credentials: true
}));
```

### **2. Servir React Build**
```javascript
// server.js
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
}
```

### **3. URLs Relativas**
```javascript
// MenuContext.jsx
const apiUrl = process.env.NODE_ENV === 'production' ? '/api/data' : '/api/data';
```

## 🧪 Testar Sincronização em Produção

### **1. Teste Local vs Produção**
```bash
# Local
http://localhost:3001/admin

# Produção
https://seu-projeto.railway.app/admin
```

### **2. Teste Entre Dispositivos**
1. **Admin:** Acesse admin em produção
2. **Exclua produto** e clique "Sincronizar"
3. **Cliente:** Acesse site em outro dispositivo
4. **Verifique:** Produto deve ter sido excluído

### **3. Teste API Direto**
```bash
# Obter produtos
curl https://seu-projeto.railway.app/api/data

# Excluir produto (via admin)
# Verificar novamente
curl https://seu-projeto.railway.app/api/data
```

## 🚨 Solução de Problemas

### **1. Build Falha**
```bash
# Verificar logs
railway logs

# Verificar Node.js version
node --version
```

### **2. API Não Responde**
```bash
# Verificar health check
curl https://seu-projeto.railway.app/api/status

# Verificar variáveis de ambiente
railway variables
```

### **3. Sincronização Não Funciona**
```javascript
// No console do navegador
fetch('/api/data').then(r => r.json()).then(console.log)
```

### **4. CORS Errors**
```javascript
// Verificar se CORS está configurado
// Verificar URLs permitidas
```

## 📊 Monitoramento

### **1. Logs em Tempo Real**
```bash
railway logs --follow
```

### **2. Métricas**
- Railway Dashboard → Métricas
- CPU, Memória, Rede

### **3. Health Checks**
- `/api/status` deve retornar 200
- Railway monitora automaticamente

## 🔄 Atualizações

### **1. Deploy Automático**
- Push para `main` = deploy automático
- Railway detecta mudanças

### **2. Deploy Manual**
```bash
railway up
```

### **3. Rollback**
```bash
railway rollback
```

## 💰 Custos

### **Free Tier:**
- 500 horas/mês
- 512MB RAM
- 1GB storage

### **Pro Tier:**
- $5/mês por projeto
- Recursos ilimitados

---

**🎯 Dica:** Sempre teste localmente antes do deploy! 
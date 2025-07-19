# 🚂 Railway Deploy - Guia Completo

## 🎯 Problema: Railway não recebeu o push

O Railway precisa ser conectado ao repositório GitHub para receber as atualizações automaticamente.

## 🚀 Como Conectar o Railway

### **Passo 1: Acessar Railway**
1. Acesse [Railway Dashboard](https://railway.app/dashboard)
2. Faça login com sua conta GitHub

### **Passo 2: Criar Novo Projeto**
1. Clique em **"New Project"**
2. Selecione **"Deploy from GitHub repo"**
3. Escolha o repositório: `leandrovieira1805/hot-dog-`
4. Clique **"Deploy Now"**

### **Passo 3: Configurar Variáveis de Ambiente**
No projeto Railway, vá em **"Variables"** e adicione:
```bash
NODE_ENV=production
PORT=3001
```

### **Passo 4: Verificar Deploy**
1. **Logs:** Verifique se o build foi bem-sucedido
2. **URL:** Railway fornecerá uma URL (ex: `https://hotdog-praca-production.up.railway.app`)
3. **Health Check:** Acesse `/api/status` para verificar se está funcionando

## 🔧 Configuração Alternativa

### **Se não conseguir conectar automaticamente:**

#### **Opção 1: Deploy Manual**
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Inicializar projeto
railway init

# Deploy
railway up
```

#### **Opção 2: Via GitHub Actions**
Criar arquivo `.github/workflows/railway.yml`:
```yaml
name: Deploy to Railway
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: railway/deploy@v1
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
```

## 🧪 Testar Deploy

### **1. Verificar URL do Railway**
- Acesse a URL fornecida pelo Railway
- Teste: `https://seu-projeto.railway.app/api/status`

### **2. Testar Sincronização**
1. **Admin:** `https://seu-projeto.railway.app/admin`
2. **Login:** admin / hotdog123
3. **Exclua produto** → Deve sincronizar instantaneamente
4. **Abra guia anônima** → Produto deve ter sido excluído

### **3. Verificar Logs**
No Railway Dashboard:
- **Deployments** → Ver histórico de deploys
- **Logs** → Ver logs em tempo real
- **Metrics** → Ver uso de recursos

## 🚨 Solução de Problemas

### **1. Build Falha**
```bash
# Verificar logs no Railway
# Verificar se todas as dependências estão no package.json
npm install
npm run build
```

### **2. Erro de Porta**
```bash
# Verificar se PORT está configurado
# Railway usa variável PORT automaticamente
```

### **3. Erro de Firebase**
```bash
# Verificar se Firebase está configurado
# Verificar credenciais no console
```

## 📊 URLs Importantes

### **Repositórios:**
- **hot-dog-:** https://github.com/leandrovieira1805/hot-dog-
- **NOVO01:** https://github.com/leandrovieira1805/NOVO01

### **Railway:**
- **Dashboard:** https://railway.app/dashboard
- **Projeto:** (será criado após conectar)

### **Firebase:**
- **Console:** https://console.firebase.google.com/project/device-streaming-77144326/overview?hl=pt-br

## 🎯 Checklist de Deploy

- [ ] Conectar repositório no Railway
- [ ] Configurar variáveis de ambiente
- [ ] Verificar build bem-sucedido
- [ ] Testar URL do Railway
- [ ] Configurar Firebase
- [ ] Testar sincronização
- [ ] Verificar logs

## 💡 Dicas Importantes

### **1. Deploy Automático**
- Railway detecta pushes para `main`
- Deploy automático a cada push
- Rollback automático se falhar

### **2. Variáveis de Ambiente**
- `NODE_ENV=production` - Modo produção
- `PORT=3001` - Porta do servidor
- Firebase config via código

### **3. Monitoramento**
- Logs em tempo real
- Métricas de uso
- Health checks automáticos

---

**🎉 Após conectar o Railway, cada push será deployado automaticamente!** 
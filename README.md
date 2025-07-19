# 🌭 Hot Dog Delivery - Sistema Completo

Sistema de delivery de hot dogs com backend em tempo real para sincronização de dados.

## 🚀 Como usar

### 1. Instalar dependências
```bash
npm install
```

### 2. Iniciar o backend
```bash
# Opção 1: Usando npm
npm run server

# Opção 2: Usando o script batch (Windows)
start-backend.bat

# Opção 3: Iniciar tudo junto (backend + frontend)
npm run dev:full
```

### 3. Acessar o sistema
- **Site:** http://localhost:3001
- **Admin:** http://localhost:3001/admin
- **API:** http://localhost:3001/api

## 📡 API Endpoints

### GET /api/data
Obtém todos os dados (produtos, ofertas, configurações Pix)

### POST /api/save
Salva dados no servidor
```json
{
  "products": [...],
  "dailyOffer": {...},
  "pixKey": "chave-pix",
  "pixName": "nome-recebedor"
}
```

### GET /api/status
Verifica se o servidor está online

### POST /api/clear
Limpa todos os dados e volta ao padrão

## 🔄 Sincronização em Tempo Real

### Como funciona:
1. **Admin faz mudanças** → Dados são salvos no servidor
2. **Servidor atualiza** → Arquivo JSON é modificado
3. **Usuários acessam** → Carregam dados do servidor
4. **Sincronização automática** → Todos veem as mesmas mudanças

### Fluxo de dados:
```
Admin (localhost:3001) 
    ↓ POST /api/save
Servidor (localhost:3001)
    ↓ Salva em products.json
Arquivo JSON
    ↓ GET /api/data
Usuários (qualquer lugar)
```

## 🛠️ Estrutura do Projeto

```
project/
├── server.js              # Backend Express
├── public/
│   ├── data/
│   │   └── products.json  # Dados sincronizados
│   └── index.html         # Frontend
├── src/
│   ├── components/        # Componentes React
│   ├── context/          # Context API
│   └── App.jsx           # App principal
└── package.json
```

## 🔧 Configuração

### Variáveis de ambiente:
- `PORT`: Porta do servidor (padrão: 3001)

### Scripts disponíveis:
- `npm run dev`: Inicia apenas o frontend
- `npm run server`: Inicia apenas o backend
- `npm run dev:full`: Inicia backend + frontend
- `npm run build`: Build para produção

## 📱 Funcionalidades

### Para Clientes:
- ✅ Visualizar produtos
- ✅ Filtrar por categoria
- ✅ Adicionar ao carrinho
- ✅ Personalizar produtos
- ✅ Finalizar pedido via WhatsApp

### Para Admin:
- ✅ Gerenciar produtos
- ✅ Configurar ofertas do dia
- ✅ Configurar Pix
- ✅ Sincronização automática
- ✅ Upload de imagens

## 🌐 Deploy

### Local:
```bash
npm run dev:full
```

### Produção:
1. Build do frontend: `npm run build`
2. Iniciar servidor: `npm run server`
3. Configurar proxy reverso (nginx/apache)

## 🔒 Segurança

- Admin protegido por senha
- Validação de dados no servidor
- CORS configurado
- Sanitização de inputs

## 📞 Suporte

Para problemas ou dúvidas:
1. Verificar se o servidor está rodando
2. Verificar logs no console
3. Testar endpoints da API
4. Verificar arquivo products.json

---

**Desenvolvido com ❤️ para delivery de hot dogs** 
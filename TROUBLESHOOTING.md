# 🔧 Guia de Solução de Problemas

## 🚨 Problemas Comuns e Soluções

### 1. Servidor não inicia
**Erro:** `require is not defined in ES module scope`

**Solução:**
```bash
# Verificar se package.json tem "type": "commonjs"
# Se não tiver, adicionar:
"type": "commonjs"
```

### 2. API não responde
**Erro:** `Cannot connect to server`

**Solução:**
```bash
# 1. Parar todos os processos
Ctrl+C

# 2. Iniciar apenas o servidor
npm run server

# 3. Testar API
node test-api.js
```

### 3. Frontend não sincroniza
**Problema:** Mudanças não aparecem em outros dispositivos

**Solução:**
```bash
# 1. Verificar se servidor está rodando
npm run server

# 2. Em outro terminal, iniciar frontend
npm run dev

# 3. Ou usar tudo junto
npm run dev:full
```

### 4. Cache antigo
**Problema:** Produtos antigos aparecem

**Solução:**
```javascript
// No console do navegador (F12):
localStorage.clear();
window.location.reload(true);
```

### 5. CORS errors
**Erro:** `Access to fetch at 'http://localhost:3001' from origin 'http://localhost:5173' has been blocked by CORS policy`

**Solução:**
- Usar `npm run dev:full` (usa proxy do Vite)
- Ou acessar diretamente: http://localhost:3001

## 🧪 Testes de Diagnóstico

### Testar API:
```bash
node test-api.js
```

### Testar Frontend:
```bash
# Abrir console do navegador (F12) e executar:
fetch('/api/data').then(r => r.json()).then(console.log)
```

### Verificar URLs:
- **Backend:** http://localhost:3001/api/status
- **Frontend:** http://localhost:3001 (se usando proxy)
- **Frontend direto:** http://localhost:5173 (se usando dev separado)

## 🔄 Fluxo de Sincronização

### Como deve funcionar:
1. **Admin faz mudança** → Frontend envia para `/api/save`
2. **Servidor salva** → Arquivo JSON é atualizado
3. **Outros dispositivos** → Carregam de `/api/data`
4. **Sincronização** → Todos veem as mesmas mudanças

### Se não funciona:
1. **Verificar servidor** → `npm run server`
2. **Verificar API** → `node test-api.js`
3. **Verificar frontend** → Console do navegador
4. **Limpar cache** → `localStorage.clear()`

## 📞 Comandos Úteis

```bash
# Iniciar tudo
npm run dev:full

# Apenas servidor
npm run server

# Apenas frontend
npm run dev

# Testar API
node test-api.js

# Limpar cache
node clear-cache.js
```

## 🎯 Checklist de Verificação

- [ ] Servidor rodando na porta 3001
- [ ] API respondendo (test-api.js)
- [ ] Frontend conectando com API
- [ ] localStorage limpo
- [ ] Mudanças sendo salvas no servidor
- [ ] Outros dispositivos carregando do servidor

---

**Se ainda não funcionar, verifique os logs no console do navegador e do servidor!** 
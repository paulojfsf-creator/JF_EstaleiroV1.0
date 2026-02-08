# Guia de Deploy - José Firmino Gestão de Armazém

Este guia explica como fazer deploy da aplicação em produção.

## Arquitetura

A aplicação está dividida em duas partes:
- **Frontend (React)**: Hospedado no Netlify
- **Backend (FastAPI)**: Hospedado no Render
- **Base de Dados (MongoDB)**: MongoDB Atlas (gratuito)

---

## 1. Configurar MongoDB Atlas (Base de Dados)

### Passo 1: Criar conta
1. Aceda a [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crie uma conta gratuita
3. Crie um novo cluster (escolha "FREE" - M0 Sandbox)

### Passo 2: Configurar acesso
1. Em "Database Access", crie um utilizador com password
2. Em "Network Access", adicione `0.0.0.0/0` para permitir acesso de qualquer IP
3. Em "Connect", escolha "Connect your application" e copie a connection string

### Passo 3: Guardar Connection String
A connection string será algo como:
```
mongodb+srv://utilizador:password@cluster.xxxxx.mongodb.net/josefirmino?retryWrites=true&w=majority
```

---

## 2. Deploy do Backend no Render

### Passo 1: Criar conta
1. Aceda a [Render](https://render.com)
2. Crie uma conta (pode usar GitHub)

### Passo 2: Criar Web Service
1. Clique em "New" → "Web Service"
2. Conecte o seu repositório GitHub
3. Configure:
   - **Name**: `josefirmino-api`
   - **Region**: Frankfurt (EU)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`

### Passo 3: Configurar Variáveis de Ambiente
Em "Environment", adicione:

| Variável | Valor |
|----------|-------|
| `MONGO_URL` | `mongodb+srv://...` (connection string do MongoDB Atlas) |
| `DB_NAME` | `josefirmino` |
| `JWT_SECRET` | (gerar uma string aleatória segura) |
| `CORS_ORIGINS` | `https://seu-site.netlify.app` |
| `RESEND_API_KEY` | (opcional - para emails) |
| `ALERT_EMAIL` | (opcional - email para alertas) |

### Passo 4: Deploy
1. Clique em "Create Web Service"
2. Aguarde o deploy (pode demorar alguns minutos)
3. Copie o URL do serviço (ex: `https://josefirmino-api.onrender.com`)

---

## 3. Deploy do Frontend no Netlify

### Passo 1: Criar conta
1. Aceda a [Netlify](https://netlify.com)
2. Crie uma conta (pode usar GitHub)

### Passo 2: Importar Projeto
1. Clique em "Add new site" → "Import an existing project"
2. Conecte o seu repositório GitHub
3. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/build`

### Passo 3: Configurar Variáveis de Ambiente
Em "Site settings" → "Environment variables", adicione:

| Variável | Valor |
|----------|-------|
| `REACT_APP_BACKEND_URL` | `https://josefirmino-api.onrender.com` (URL do Render) |

### Passo 4: Deploy
1. Clique em "Deploy site"
2. Aguarde o build (pode demorar alguns minutos)
3. O site estará disponível em `https://seu-site.netlify.app`

---

## 4. Atualizar CORS no Backend

Após obter o URL do Netlify, volte ao Render e atualize a variável `CORS_ORIGINS`:
```
CORS_ORIGINS=https://seu-site.netlify.app
```

---

## 5. Testar

1. Aceda ao seu site no Netlify
2. Faça login com as credenciais de teste:
   - Email: `test@test.com`
   - Password: `test123`
3. Verifique se todas as funcionalidades estão a funcionar

---

## Troubleshooting

### Backend não inicia
- Verifique os logs no Render
- Confirme que `MONGO_URL` está correta
- Verifique se o IP do Render está permitido no MongoDB Atlas

### Frontend não conecta ao backend
- Verifique se `REACT_APP_BACKEND_URL` está correta
- Confirme que `CORS_ORIGINS` inclui o URL do Netlify
- Verifique a consola do browser para erros

### Erro de CORS
- Adicione o URL completo do frontend em `CORS_ORIGINS`
- Faça redeploy do backend no Render

---

## Custos Estimados

| Serviço | Plano | Custo |
|---------|-------|-------|
| Netlify | Free | €0/mês |
| Render | Free | €0/mês (spin down após 15min inatividade) |
| MongoDB Atlas | M0 Free | €0/mês (512MB) |
| **Total** | | **€0/mês** |

**Nota**: O plano gratuito do Render faz "spin down" após 15 minutos de inatividade, o que causa um delay de ~30s no primeiro request. Para produção, considere o plano pago (~$7/mês).

---

## Estrutura de Ficheiros para Deploy

```
/
├── frontend/           # Deploy no Netlify
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env.example
├── backend/            # Deploy no Render
│   ├── server.py
│   ├── requirements.txt
│   └── .env.example
├── netlify.toml        # Configuração Netlify
├── render.yaml         # Configuração Render
└── DEPLOY.md           # Este ficheiro
```

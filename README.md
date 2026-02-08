# José Firmino - Gestão de Armazém

Sistema de gestão de armazém para construção civil desenvolvido com React e FastAPI.

![Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![License](https://img.shields.io/badge/License-Private-red)

## Funcionalidades

### Gestão de Recursos
- **Equipamentos**: CRUD completo, documentação PDF, estado de manutenção
- **Viaturas**: Gestão de frota, documentos (DUA, Seguro, IPO), alertas de expiração
- **Materiais**: Controlo de stock, movimentação por obra
- **Obras**: Projetos de construção com atribuição de recursos

### Relatórios Avançados
- Movimentos de ativos
- Consumo de materiais
- Recursos em manutenção
- Alertas de documentos a expirar
- Utilização por recurso
- Relatório por obra

### Outras Funcionalidades
- 🔐 Autenticação JWT
- 📧 Notificações por email (Resend)
- 📱 Design responsivo (PWA)
- 🌙 Tema claro/escuro
- 📊 Exportação PDF/Excel
- 📥 Importação de dados Excel

## Tecnologias

### Frontend
- React 18
- TailwindCSS
- Shadcn/UI
- React Router
- Axios

### Backend
- FastAPI
- MongoDB (Motor)
- JWT Authentication
- Resend (emails)

## Instalação Local

### Requisitos
- Node.js 18+
- Python 3.11+
- MongoDB

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Editar .env com as suas configurações
uvicorn server:app --reload --port 8001
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Editar .env com o URL do backend
npm start
```

## Deploy

Consulte o ficheiro [DEPLOY.md](DEPLOY.md) para instruções detalhadas de deploy no Netlify (frontend) e Render (backend).

## Credenciais de Teste

- **Email**: test@test.com
- **Password**: test123

## Estrutura do Projeto

```
├── frontend/           # Aplicação React
│   ├── src/
│   │   ├── components/ # Componentes reutilizáveis
│   │   ├── pages/      # Páginas da aplicação
│   │   └── App.js      # Routing e providers
│   └── public/         # Assets estáticos
├── backend/            # API FastAPI
│   ├── server.py       # Endpoints da API
│   ├── uploads/        # Ficheiros carregados
│   └── requirements.txt
├── netlify.toml        # Configuração Netlify
├── render.yaml         # Configuração Render
└── DEPLOY.md           # Guia de deploy
```

## API Endpoints

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/auth/login` | POST | Autenticação |
| `/api/equipamentos` | GET/POST | Listar/Criar equipamentos |
| `/api/viaturas` | GET/POST | Listar/Criar viaturas |
| `/api/materiais` | GET/POST | Listar/Criar materiais |
| `/api/obras` | GET/POST | Listar/Criar obras |
| `/api/relatorios/*` | GET | Relatórios avançados |
| `/api/export/pdf` | GET | Exportar PDF |
| `/api/export/excel` | GET | Exportar Excel |

## Licença

Projeto privado - José Firmino © 2024-2026
